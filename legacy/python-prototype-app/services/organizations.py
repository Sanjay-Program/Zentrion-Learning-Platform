"""Organization service (multi-tenant)."""
from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.core.audit import audit
from app.core.errors import ConflictError, ForbiddenError, NotFoundError, ValidationError
from app.models.commerce import Entitlement
from app.models.identity import (
    Department,
    Invitation,
    Organization,
    OrganizationMember,
    User,
)
from app.core.email import send_email
from app.config import get_settings

ORG_ROLE_PERMISSIONS = {
    "owner": ["org.manage", "org.member.invite", "org.learning.assign", "org.reports.read", "org.billing.view"],
    "admin": ["org.member.invite", "org.learning.assign", "org.reports.read", "org.billing.view"],
    "manager": ["org.learning.assign", "org.reports.read"],
    "instructor": ["org.learning.assign"],
    "learner": [],
}


def create_organization(db: Session, user: User, *, name: str, slug: str, org_type: str = "college", description: str = "") -> Organization:
    if db.query(Organization).filter(Organization.slug == slug).first():
        raise ConflictError("Organization slug already exists")
    org = Organization(slug=slug, name=name, org_type=org_type, description=description)
    db.add(org)
    db.flush()
    db.add(OrganizationMember(organization_id=org.id, user_id=user.id, org_role="owner"))
    db.commit()
    audit(db, "org.created", actor=user, entity_type="organization", entity_id=org.id)
    return org


def get_organization(db: Session, slug_or_id: str | int) -> Optional[Organization]:
    if isinstance(slug_or_id, int):
        return db.query(Organization).filter(Organization.id == slug_or_id).first()
    return db.query(Organization).filter(Organization.slug == slug_or_id).first()


def get_member(db: Session, org: Organization, user: User) -> Optional[OrganizationMember]:
    return (
        db.query(OrganizationMember)
        .filter(OrganizationMember.organization_id == org.id, OrganizationMember.user_id == user.id)
        .first()
    )


def require_org_role(member: Optional[OrganizationMember], *roles: str) -> None:
    if member is None or member.org_role not in roles and member.org_role != "owner":
        raise ForbiddenError("Organization admin permission required")


def has_org_permission(db: Session, org: Organization, user: User, permission: str) -> bool:
    if user.is_superuser:
        return True
    member = get_member(db, org, user)
    if member is None:
        return False
    if member.org_role == "owner":
        return True
    return permission in ORG_ROLE_PERMISSIONS.get(member.org_role, [])


def invite_member(db: Session, actor: User, org: Organization, *, email: str, role: str) -> Invitation:
    if not has_org_permission(db, org, actor, "org.member.invite"):
        raise ForbiddenError("You cannot invite members to this organization")
    if role not in ORG_ROLE_PERMISSIONS:
        raise ValidationError("Invalid organization role")
    existing_user = db.query(User).filter(User.email == email.lower()).first()
    if existing_user:
        member = get_member(db, org, existing_user)
        if member:
            raise ConflictError("User is already a member of this organization")
        # Directly add existing user as member with the requested role.
        db.add(OrganizationMember(organization_id=org.id, user_id=existing_user.id, org_role=role))
        db.commit()
        # Return a pseudo-invitation record for the response
        invite = Invitation(
            organization_id=org.id,
            email=email,
            org_role=role,
            token_hash=hashlib.sha256(secrets.token_urlsafe(32).encode()).hexdigest(),
            invited_by=actor.id,
            accepted=True,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7),
        )
        db.add(invite)
        db.commit()
        return invite
    token = secrets.token_urlsafe(32)
    invite = Invitation(
        organization_id=org.id,
        email=email.lower(),
        org_role=role,
        token_hash=hashlib.sha256(token.encode()).hexdigest(),
        invited_by=actor.id,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    )
    db.add(invite)
    db.commit()
    settings = get_settings()
    link = f"{settings.app_base_url}/auth/organization-invite?token={token}"
    send_email(
        email,
        f"You were invited to join {org.name} on Zentrion",
        f"<p>You have been invited to join <b>{org.name}</b> as {role}.</p><p><a href='{link}'>Accept invitation</a></p>",
    )
    return invite


def accept_invitation(db: Session, user: User, token: str) -> OrganizationMember:
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    invite = (
        db.query(Invitation)
        .filter(
            Invitation.token_hash == token_hash,
            Invitation.accepted.is_(False),
            Invitation.expires_at > datetime.now(timezone.utc),
        )
        .first()
    )
    if not invite:
        raise NotFoundError("Invitation is invalid or expired")
    if invite.email.lower() != user.email.lower():
        raise ForbiddenError("This invitation belongs to a different email address")
    member = (
        db.query(OrganizationMember)
        .filter(OrganizationMember.organization_id == invite.organization_id, OrganizationMember.user_id == user.id)
        .first()
    )
    if member:
        raise ConflictError("Already a member")
    member = OrganizationMember(
        organization_id=invite.organization_id,
        user_id=user.id,
        org_role=invite.org_role,
    )
    db.add(member)
    invite.accepted = True
    db.commit()
    audit(db, "org.invite.accepted", actor=user, entity_type="organization", entity_id=invite.organization_id)
    return member


def list_members(db: Session, org: Organization) -> list[OrganizationMember]:
    return db.query(OrganizationMember).filter(OrganizationMember.organization_id == org.id).all()


def assign_course_to_organization(db: Session, actor: User, org: Organization, course_id: int, member_ids: list[int]) -> int:
    if not has_org_permission(db, org, actor, "org.learning.assign"):
        raise ForbiddenError("You cannot assign learning in this organization")
    from app.models.catalogue import Course
    from app.services.enrollment import grant_entitlement

    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise NotFoundError("Course not found")
    members = (
        db.query(OrganizationMember)
        .filter(
            OrganizationMember.organization_id == org.id,
            OrganizationMember.user_id.in_(member_ids),
        )
        .all()
    )
    count = 0
    for member in members:
        user = db.query(User).filter(User.id == member.user_id).first()
        if user:
            grant_entitlement(db, user, "course", course.id, "organization")
            count += 1
    db.commit()
    return count


def add_department(db: Session, org: Organization, name: str) -> Department:
    slug = name.lower().replace(" ", "-")
    existing = db.query(Department).filter(Department.organization_id == org.id, Department.slug == slug).first()
    if existing:
        raise ConflictError("Department already exists")
    dept = Department(organization_id=org.id, name=name, slug=slug)
    db.add(dept)
    db.commit()
    return dept
