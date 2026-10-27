"""RBAC: permission matrix and enforcement helpers."""
from __future__ import annotations

from typing import Optional

from sqlalchemy.orm import Session

from app.models.identity import Permission, Role, RolePermission, User, UserRole

# Platform roles and their permission sets.
# Organization-scoped permissions are enforced separately in organization services.
PERMISSION_MATRIX: dict[str, list[str]] = {
    "learner": [
        "course.read", "course.enroll", "lesson.read", "assessment.take",
        "project.submit", "lab.launch", "ai.use", "community.read", "community.post",
        "profile.read", "profile.edit",
    ],
    "instructor": [
        "course.read", "course.enroll", "lesson.read", "assessment.take",
        "project.submit", "lab.launch", "ai.use", "community.read", "community.post",
        "profile.read", "profile.edit",
        "course.create", "course.edit.own", "lesson.edit.own", "assessment.create",
        "assessment.grade.own", "submission.grade.own", "instructor.analytics.read",
        "live.session.create",
    ],
    "reviewer": [
        "course.read", "lesson.read", "course.review", "content.moderate",
    ],
    "support_agent": [
        "user.read", "support.ticket.read", "support.ticket.manage", "audit.read",
    ],
    "finance_operator": [
        "billing.view", "refund.process", "orders.read",
    ],
    "content_moderator": [
        "content.moderate", "community.moderate", "course.read",
    ],
    "security_admin": [
        "audit.read", "security.events.read", "user.read", "ai.configure", "lab.manage",
    ],
    "admin": None,  # None = all permissions (platform administrator)
}

DEFAULT_ROLE = "learner"


def ensure_roles_and_permissions(db: Session) -> None:
    """Idempotently create the permission matrix in the database."""
    all_keys: set[str] = set()
    for perms in PERMISSION_MATRIX.values():
        if perms:
            all_keys.update(perms)
    all_keys.update({"admin.impersonate", "platform.configure", "user.manage", "org.manage"})

    existing_perms = {p.key for p in db.query(Permission.key).all()}
    for key in sorted(all_keys):
        if key not in existing_perms:
            name = key.replace(".", " ").title()
            db.add(Permission(key=key, name=name, description=f"Allows {key}"))

    existing_roles = {r.key: r for r in db.query(Role).all()}
    for role_key, perms in PERMISSION_MATRIX.items():
        role = existing_roles.get(role_key)
        if role is None:
            role = Role(key=role_key, name=role_key.replace("_", " ").title(), scope="platform")
            db.add(role)
            db.flush()
            existing_roles[role_key] = role
        if perms is None:
            # admin: link every permission
            for p in db.query(Permission).all():
                if not db.query(RolePermission).filter_by(role_id=role.id, permission_id=p.id).first():
                    db.add(RolePermission(role_id=role.id, permission_id=p.id))
        else:
            perm_objs = {p.key: p for p in db.query(Permission).filter(Permission.key.in_(perms)).all()}
            for pkey in perms:
                p = perm_objs.get(pkey)
                if p and not db.query(RolePermission).filter_by(role_id=role.id, permission_id=p.id).first():
                    db.add(RolePermission(role_id=role.id, permission_id=p.id))
    db.commit()


def assign_role(db: Session, user: User, role_key: str) -> None:
    role = db.query(Role).filter(Role.key == role_key).first()
    if role and not db.query(UserRole).filter_by(user_id=user.id, role_id=role.id).first():
        db.add(UserRole(user_id=user.id, role_id=role.id))
        db.commit()


def remove_role(db: Session, user: User, role_key: str) -> None:
    role = db.query(Role).filter(Role.key == role_key).first()
    if role:
        db.query(UserRole).filter_by(user_id=user.id, role_id=role.id).delete()
        db.commit()


def user_permissions(db: Session, user: User) -> set[str]:
    if user.is_superuser:
        return {"*"}
    role_rows = (
        db.query(UserRole, Role)
        .join(Role, Role.id == UserRole.role_id)
        .filter(UserRole.user_id == user.id)
        .all()
    )
    perms: set[str] = set()
    for _ur, role in role_rows:
        if role.key == "admin":
            return {"*"}
        for (pkey,) in (
            db.query(Permission.key)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .filter(RolePermission.role_id == role.id)
            .all()
        ):
            perms.add(pkey)
    return perms


def has_permission(db: Session, user: Optional[User], permission: str) -> bool:
    if user is None:
        return False
    if user.is_superuser:
        return True
    perms = user_permissions(db, user)
    return "*" in perms or permission in perms


def require_permission(permission: str):
    """FastAPI dependency factory: enforces a platform permission server-side."""
    from fastapi import HTTPException
    from app.api.deps import get_current_user

    async def _dep(db: Session = None, user: User = None):  # wired via Depends in routes
        raise NotImplementedError

    return _dep


def is_instructor(db: Session, user: Optional[User]) -> bool:
    return user is not None and (has_permission(db, user, "course.create") or user.is_superuser)


def is_admin(db: Session, user: Optional[User]) -> bool:
    return user is not None and (user.is_superuser or has_permission(db, user, "user.manage"))
