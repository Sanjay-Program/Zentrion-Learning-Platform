"""Authentication routes: register, login, sessions, MFA, onboarding."""
from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Form, Request, Response
from fastapi.responses import HTMLResponse, RedirectResponse

from app.config import get_settings
from app.core.audit import audit
from app.core.email import send_email
from app.core.errors import ConflictError, ForbiddenError, ValidationError
from app.core.rbac import assign_role, ensure_roles_and_permissions, DEFAULT_ROLE
from app.core.security import (
    create_recovery_token,
    create_session,
    hash_password,
    revoke_all_sessions,
    revoke_session,
    verify_password,
)
from app.main import templates
from app.models.identity import (
    LoginEvent,
    MfaMethod,
    RecoveryToken,
    Session as DBSession,
    User,
    UserProfile,
    UserPreference,
)
from app.services import onboarding as onboarding_service

auth_router = APIRouter(tags=["auth"])

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _render(request: Request, template: str, **ctx):
    data = {"request": request}
    data.update(ctx)
    return templates.TemplateResponse(template, data)


def _set_session_cookie(response: Response, token: str) -> None:
    settings = get_settings()
    response.set_cookie(
        key="zsession",
        value=token,
        httponly=True,
        samesite="lax",
        secure=settings.is_production,
        max_age=60 * 60 * 24 * settings.session_cookie_age_days,
        path="/",
    )


def _clear_session_cookie(response: Response) -> None:
    response.delete_cookie(key="zsession", path="/")


def _fail_login(db, email: Optional[str], ip: str, user_agent: str, reason: str) -> None:
    db.add(LoginEvent(user_id=None, ip_address=ip, user_agent=user_agent[:512], success=False, reason=reason))
    db.commit()


# ---------------------------------------------------------------------------
# Web pages
# ---------------------------------------------------------------------------

@auth_router.get("/auth/sign-in", response_class=HTMLResponse)
def sign_in_page(request: Request, next: Optional[str] = None):
    user = getattr(request.state, "user", None)
    if user:
        return RedirectResponse("/app", status_code=302)
    return _render(request, "auth/signin.html", next=next)


@auth_router.get("/auth/sign-up", response_class=HTMLResponse)
def sign_up_page(request: Request):
    user = getattr(request.state, "user", None)
    if user:
        return RedirectResponse("/app", status_code=302)
    return _render(request, "auth/signup.html")


@auth_router.get("/auth/verify-email", response_class=HTMLResponse)
def verify_email_page(request: Request, token: Optional[str] = None):
    return _render(request, "auth/verify_email.html", token=token)


@auth_router.get("/auth/forgot-password", response_class=HTMLResponse)
def forgot_password_page(request: Request):
    return _render(request, "auth/forgot_password.html")


@auth_router.get("/auth/reset-password", response_class=HTMLResponse)
def reset_password_page(request: Request, token: Optional[str] = None):
    return _render(request, "auth/reset_password.html", token=token)


@auth_router.get("/auth/mfa", response_class=HTMLResponse)
def mfa_page(request: Request):
    return _render(request, "auth/mfa.html")


@auth_router.get("/auth/organization-invite", response_class=HTMLResponse)
def organization_invite_page(request: Request, token: Optional[str] = None):
    return _render(request, "auth/organization_invite.html", token=token)


@auth_router.get("/onboarding", response_class=HTMLResponse)
def onboarding_page(request: Request):
    user = getattr(request.state, "user", None)
    if user is None:
        return RedirectResponse("/auth/sign-in?next=/onboarding", status_code=302)
    profile = user.profile
    return _render(
        request,
        "auth/onboarding.html",
        profile=profile,
        interests=onboarding_service.INTEREST_OPTIONS,
        roles=onboarding_service.ROLE_OPTIONS,
        goals=onboarding_service.GOAL_OPTIONS,
        levels=onboarding_service.LEVEL_OPTIONS,
    )


# ---------------------------------------------------------------------------
# JSON API
# ---------------------------------------------------------------------------

@auth_router.post("/api/v1/auth/register")
async def register(request: Request):
    db = request.state.db
    body = await request.json()
    email = str(body.get("email", "")).strip().lower()
    password = str(body.get("password", ""))
    display_name = str(body.get("display_name", "")).strip()

    if not EMAIL_RE.match(email):
        raise ValidationError("Enter a valid email address")
    if len(password) < 10:
        raise ValidationError("Password must be at least 10 characters")
    if not re.search(r"[A-Za-z]", password) or not re.search(r"[0-9]", password):
        raise ValidationError("Password must contain letters and numbers")
    if not display_name or len(display_name) > 120:
        raise ValidationError("Display name is required (max 120 characters)")
    if db.query(User).filter(User.email == email).first():
        raise ConflictError("An account with this email already exists")

    user = User(
        email=email,
        password_hash=hash_password(password),
        display_name=display_name,
        status="active",
    )
    db.add(user)
    db.flush()
    db.add(UserProfile(user_id=user.id))
    db.add(UserPreference(user_id=user.id))
    assign_role(db, user, DEFAULT_ROLE)
    db.commit()

    token = create_recovery_token(db, user.id, "email_verify", minutes=24 * 60)
    settings = get_settings()
    link = f"{settings.app_base_url}/auth/verify-email?token={token}"
    send_email(
        email,
        "Verify your email address",
        f"<p>Welcome to Zentrion, {display_name}. Verify your email:</p><p><a href='{link}'>Verify email</a></p>",
    )
    audit(db, "user.registered", actor=user, entity_type="user", entity_id=user.id)
    return {"status": "registered", "email": email, "email_verified": False}


@auth_router.post("/api/v1/auth/login")
async def login(request: Request):
    db = request.state.db
    body = await request.json()
    email = str(body.get("email", "")).strip().lower()
    password = str(body.get("password", ""))
    ip = request.client.host if request.client else ""
    user_agent = request.headers.get("user-agent", "")

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        _fail_login(db, email, ip, user_agent, "unknown_email")
        raise ValidationError("Invalid email or password")
    if user.locked_until and user.locked_until > datetime.now(timezone.utc):
        _fail_login(db, email, ip, user_agent, "locked")
        raise ValidationError("Account temporarily locked due to too many failed attempts")
    if not verify_password(password, user.password_hash or ""):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= 5:
            user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=15)
        db.add(LoginEvent(user_id=user.id, ip_address=ip, user_agent=user_agent[:512], success=False, reason="bad_password"))
        db.commit()
        raise ValidationError("Invalid email or password")
    if user.status == "suspended":
        _fail_login(db, email, ip, user_agent, "suspended")
        raise ForbiddenError("This account is suspended")

    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login_at = datetime.now(timezone.utc)
    db.add(LoginEvent(user_id=user.id, ip_address=ip, user_agent=user_agent[:512], success=True))
    db.commit()

    session, token = create_session(db, user, user_agent, ip)
    response = {"status": "logged_in", "user": _public_user(user)}
    request.state.login_token = token
    audit(db, "user.login", actor=user, entity_type="session", entity_id=session.id)
    return response


@auth_router.post("/api/v1/auth/logout")
async def logout(request: Request):
    db = request.state.db
    token = request.cookies.get("zsession")
    if token:
        revoke_session(db, token)
    response = {"status": "logged_out"}
    request.state.logout = True
    return response


@auth_router.post("/api/v1/auth/verify-email")
async def verify_email(request: Request):
    db = request.state.db
    body = await request.json()
    token = str(body.get("token", ""))
    user_id = _consume_token(db, token, "email_verify")
    if user_id is None:
        raise ValidationError("Verification link is invalid or expired")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValidationError("Verification link is invalid or expired")
    user.email_verified = True
    if user.status == "pending_verification":
        user.status = "active"
    db.commit()
    audit(db, "user.email_verified", actor=user, entity_type="user", entity_id=user.id)
    return {"status": "verified"}


@auth_router.post("/api/v1/auth/forgot-password")
async def forgot_password(request: Request):
    db = request.state.db
    body = await request.json()
    email = str(body.get("email", "")).strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if user:
        token = create_recovery_token(db, user.id, "password_reset", minutes=30)
        settings = get_settings()
        link = f"{settings.app_base_url}/auth/reset-password?token={token}"
        send_email(
            email,
            "Reset your password",
            f"<p>Reset your Zentrion password:</p><p><a href='{link}'>Reset password</a></p><p>This link expires in 30 minutes.</p>",
        )
        audit(db, "user.password_reset_requested", actor=user, entity_type="user", entity_id=user.id)
    return {"status": "if_an_account_exists_a_reset_link_was_sent"}


@auth_router.post("/api/v1/auth/reset-password")
async def reset_password(request: Request):
    db = request.state.db
    body = await request.json()
    token = str(body.get("token", ""))
    password = str(body.get("password", ""))
    if len(password) < 10:
        raise ValidationError("Password must be at least 10 characters")
    user_id = _consume_token(db, token, "password_reset")
    if user_id is None:
        raise ValidationError("Reset link is invalid or expired")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValidationError("Reset link is invalid or expired")
    user.password_hash = hash_password(password)
    user.failed_login_attempts = 0
    db.commit()
    revoke_all_sessions(db, user.id)
    audit(db, "user.password_changed", actor=user, entity_type="user", entity_id=user.id)
    return {"status": "password_reset"}


@auth_router.get("/api/v1/auth/sessions")
def list_sessions(request: Request):
    user = getattr(request.state, "user", None)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = request.state.db
    sessions = (
        db.query(DBSession)
        .filter(DBSession.user_id == user.id, DBSession.revoked.is_(False))
        .order_by(DBSession.created_at.desc())
        .all()
    )
    return {
        "sessions": [
            {
                "id": s.id,
                "user_agent": s.user_agent,
                "ip_address": s.ip_address,
                "created_at": s.created_at.isoformat() if s.created_at else None,
                "expires_at": s.expires_at.isoformat() if s.expires_at else None,
            }
            for s in sessions
        ]
    }


@auth_router.delete("/api/v1/auth/sessions/{session_id}")
def revoke_session_route(request: Request, session_id: int):
    user = getattr(request.state, "user", None)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = request.state.db
    session = db.query(DBSession).filter(DBSession.id == session_id, DBSession.user_id == user.id).first()
    if not session:
        raise ValidationError("Session not found")
    session.revoked = True
    db.commit()
    return {"status": "revoked"}


@auth_router.post("/api/v1/auth/sessions/revoke-all")
def revoke_all(request: Request):
    user = getattr(request.state, "user", None)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = request.state.db
    current = request.cookies.get("zsession")
    revoke_all_sessions(db, user.id, except_token=current)
    return {"status": "all_other_sessions_revoked"}


# --- MFA (TOTP) ---

@auth_router.post("/api/v1/auth/mfa/enable")
async def mfa_enable(request: Request):
    import pyotp

    user = getattr(request.state, "user", None)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = request.state.db
    secret = pyotp.random_base32()
    # Store the pending secret encrypted with the app secret (at-rest obfuscation).
    from cryptography.fernet import Fernet

    fernet = Fernet(_derive_fernet_key())
    encrypted = fernet.encrypt(secret.encode()).decode()
    method = MfaMethod(user_id=user.id, method_type="totp", secret_encrypted=encrypted, confirmed=False)
    db.add(method)
    db.commit()
    totp = pyotp.TOTP(secret)
    provisioning = totp.provisioning_uri(name=user.email, issuer_name="Zentrion")
    import qrcode
    import io, base64

    img = qrcode.make(provisioning)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    qr_data_url = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()
    return {"secret": secret, "provisioning_uri": provisioning, "qr_code": qr_data_url}


@auth_router.post("/api/v1/auth/mfa/confirm")
async def mfa_confirm(request: Request):
    import pyotp
    from cryptography.fernet import Fernet

    user = getattr(request.state, "user", None)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = request.state.db
    body = await request.json()
    code = str(body.get("code", ""))
    method = db.query(MfaMethod).filter(MfaMethod.user_id == user.id, MfaMethod.confirmed.is_(False)).first()
    if not method:
        raise ValidationError("No pending MFA setup")
    fernet = Fernet(_derive_fernet_key())
    secret = fernet.decrypt(method.secret_encrypted.encode()).decode()
    totp = pyotp.TOTP(secret)
    if not totp.verify(code, valid_window=1):
        raise ValidationError("Invalid code")
    method.confirmed = True
    db.commit()
    audit(db, "user.mfa_enabled", actor=user, entity_type="user", entity_id=user.id)
    return {"status": "mfa_enabled"}


@auth_router.post("/api/v1/auth/mfa/disable")
async def mfa_disable(request: Request):
    import pyotp
    from cryptography.fernet import Fernet

    user = getattr(request.state, "user", None)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = request.state.db
    body = await request.json()
    code = str(body.get("code", ""))
    method = db.query(MfaMethod).filter(MfaMethod.user_id == user.id, MfaMethod.confirmed.is_(True)).first()
    if not method:
        raise ValidationError("MFA is not enabled")
    fernet = Fernet(_derive_fernet_key())
    secret = fernet.decrypt(method.secret_encrypted.encode()).decode()
    if not pyotp.TOTP(secret).verify(code, valid_window=1):
        raise ValidationError("Invalid code")
    db.delete(method)
    db.commit()
    audit(db, "user.mfa_disabled", actor=user, entity_type="user", entity_id=user.id)
    return {"status": "mfa_disabled"}


@auth_router.get("/api/v1/auth/mfa/status")
def mfa_status(request: Request):
    user = getattr(request.state, "user", None)
    if user is None:
        return {"enabled": False}
    db = request.state.db
    enabled = (
        db.query(MfaMethod)
        .filter(MfaMethod.user_id == user.id, MfaMethod.confirmed.is_(True))
        .first()
        is not None
    )
    return {"enabled": enabled}


# --- onboarding ---

@auth_router.post("/api/v1/onboarding")
async def save_onboarding(request: Request):
    user = getattr(request.state, "user", None)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = request.state.db
    body = await request.json()
    profile = user.profile or UserProfile(user_id=user.id)
    profile.interests = body.get("interests", []) or []
    profile.career_goal = str(body.get("career_goal", ""))[:200]
    profile.experience_level = str(body.get("experience_level", ""))[:40]
    profile.weekly_hours = body.get("weekly_hours")
    profile.onboarding_completed = True
    db.add(profile)
    db.commit()
    recommendations = onboarding_service.generate_recommendations(db, user)
    return {"status": "saved", "recommendations": recommendations}


def _consume_token(db, token: str, purpose: str) -> Optional[int]:
    from app.core.security import consume_recovery_token

    return consume_recovery_token(db, token, purpose)


def _public_user(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "display_name": user.display_name,
        "email_verified": user.email_verified,
        "is_superuser": user.is_superuser,
        "roles": [mr.role.key for mr in user.roles],
    }


def _derive_fernet_key() -> bytes:
    import base64, hashlib

    from app.config import get_settings

    digest = hashlib.sha256((get_settings().app_secret_key or "dev-secret").encode()).digest()
    return base64.urlsafe_b64encode(digest)
