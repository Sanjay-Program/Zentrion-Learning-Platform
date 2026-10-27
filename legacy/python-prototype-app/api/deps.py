"""FastAPI dependencies: authentication and authorization."""
from __future__ import annotations

from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.rbac import has_permission
from app.core.security import create_bearer_token, validate_session
from app.database import get_db
from app.models.identity import User


async def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Resolve the current user from the session cookie or Bearer token."""
    auth = request.headers.get("authorization", "")
    if auth.startswith("Bearer "):
        from app.core.security import verify_bearer_token

        user_id = verify_bearer_token(auth[7:])
        if user_id:
            return db.query(User).filter(User.id == user_id).first()
        return None
    token = request.cookies.get("zsession")
    return validate_session(db, token)


async def get_active_user(
    user: Optional[User] = Depends(get_current_user),
) -> User:
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user


def require_perm(permission: str):
    async def _dep(
        user: User = Depends(get_active_user),
        db: Session = Depends(get_db),
    ) -> User:
        if not has_permission(db, user, permission):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user

    return _dep


def require_admin(user: User = Depends(get_active_user), db: Session = Depends(get_db)) -> User:
    if not (user.is_superuser or has_permission(db, user, "user.manage")):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user


async def get_csrf_token(request: Request) -> str:
    from app.core.security import generate_token

    token = request.cookies.get("zcsrftoken")
    if not token:
        token = generate_token(24)
    return token


def issue_bearer(user_id: int) -> str:
    return create_bearer_token(user_id)
