"""Core security: password hashing, sessions, CSRF, tokens."""
from __future__ import annotations

import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt
from fastapi import Request
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.identity import RecoveryToken, Session as DBSession, User

settings = get_settings()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def generate_token(bytes_length: int = 32) -> str:
    return secrets.token_urlsafe(bytes_length)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def constant_time_compare(a: str, b: str) -> bool:
    return hmac.compare_digest(a, b)


# --- Session management (server-side sessions, revocable) ---

def create_session(db: Session, user: User, user_agent: Optional[str], ip_address: Optional[str]) -> tuple[DBSession, str]:
    token = generate_token(48)
    age = timedelta(days=settings.session_cookie_age_days)
    now = datetime.now(timezone.utc)
    session = DBSession(
        token_hash=hash_token(token),
        user_id=user.id,
        user_agent=(user_agent or "")[:512],
        ip_address=ip_address,
        expires_at=now + age,
    )
    db.add(session)
    db.commit()
    return session, token


def validate_session(db: Session, token: str) -> Optional[User]:
    if not token:
        return None
    token_h = hash_token(token)
    now = datetime.now(timezone.utc)
    session = db.query(DBSession).filter(
        DBSession.token_hash == token_h,
        DBSession.revoked.is_(False),
        DBSession.expires_at > now,
    ).first()
    if not session:
        return None
    user = db.query(User).filter(User.id == session.user_id, User.status != "deleted").first()
    if not user or user.status == "suspended":
        return None
    return user


def revoke_session(db: Session, token: str) -> bool:
    token_h = hash_token(token)
    session = db.query(DBSession).filter(DBSession.token_hash == token_h).first()
    if session:
        session.revoked = True
        db.commit()
        return True
    return False


def revoke_all_sessions(db: Session, user_id: int, except_token: Optional[str] = None) -> None:
    q = db.query(DBSession).filter(DBSession.user_id == user_id, DBSession.revoked.is_(False))
    if except_token:
        q = q.filter(DBSession.token_hash != hash_token(except_token))
    for s in q.all():
        s.revoked = True
    db.commit()


def clean_expired_sessions(db: Session) -> int:
    now = datetime.now(timezone.utc)
    count = db.query(DBSession).filter(DBSession.expires_at <= now).delete(synchronize_session=False)
    db.commit()
    return count


# --- Signed bearer tokens (for API clients that prefer Authorization header) ---

def create_bearer_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes),
    }
    return jwt.encode(payload, settings.app_secret_key or "dev-secret", algorithm="HS256")


def verify_bearer_token(token: str) -> Optional[int]:
    try:
        payload = jwt.decode(token, settings.app_secret_key or "dev-secret", algorithms=["HS256"])
        return int(payload["sub"])
    except jwt.PyJWTError:
        return None


# --- Recovery / verification tokens ---

def create_recovery_token(db: Session, user_id: int, purpose: str, minutes: int = 60) -> str:
    token = generate_token(32)
    expires = datetime.now(timezone.utc) + timedelta(minutes=minutes)
    db.query(RecoveryToken).filter(RecoveryToken.user_id == user_id, RecoveryToken.purpose == purpose).delete()
    db.add(RecoveryToken(user_id=user_id, token_hash=hash_token(token), purpose=purpose, expires_at=expires))
    db.commit()
    return token


def consume_recovery_token(db: Session, token: str, purpose: str) -> Optional[int]:
    token_h = hash_token(token)
    now = datetime.now(timezone.utc)
    record = db.query(RecoveryToken).filter(
        RecoveryToken.token_hash == token_h,
        RecoveryToken.purpose == purpose,
        RecoveryToken.used.is_(False),
        RecoveryToken.expires_at > now,
    ).first()
    if not record:
        return None
    record.used = True
    db.commit()
    return record.user_id


# --- CSRF (double-submit cookie) ---

CSRF_COOKIE = "zcsrftoken"
CSRF_HEADER = "x-csrf-token"


def get_or_create_csrf_token(request: Request) -> str:
    token = request.cookies.get(CSRF_COOKIE)
    if not token:
        token = generate_token(24)
    return token


def validate_csrf(request: Request) -> bool:
    cookie_token = request.cookies.get(CSRF_COOKIE)
    header_token = request.headers.get(CSRF_HEADER)
    form_token = request._form.get("_csrf") if hasattr(request, "_form") else None  # noqa: SLF001
    supplied = header_token or (form_token if isinstance(form_token, str) else None)
    if not cookie_token or not supplied:
        return False
    return constant_time_compare(cookie_token, supplied)
