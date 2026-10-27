"""Enrollment and entitlement service.

Access rules (server-side, enforced everywhere):
- A user may access a course when they have an active entitlement:
  purchase, free enrolment, organization assignment, or subscription grant.
- Preview lessons are visible to everyone.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.models.catalogue import Course, LearningPath, LearningPathItem
from app.models.commerce import Entitlement, Order, OrderItem, OrderStatus, Product
from app.models.learning import Enrollment, EnrollmentStatus
from app.models.identity import User
from app.core.audit import audit
from app.core.errors import ForbiddenError, NotFoundError, ValidationError


def has_course_access(db: Session, user: Optional[User], course: Course) -> bool:
    if user is None:
        return False
    if user.is_superuser:
        return True
    entitlement = (
        db.query(Entitlement)
        .filter(
            Entitlement.user_id == user.id,
            Entitlement.resource_type == "course",
            Entitlement.resource_id == course.id,
        )
        .first()
    )
    if entitlement and (entitlement.expires_at is None or entitlement.expires_at > datetime.now(timezone.utc)):
        return True
    return False


def can_preview(db: Session, user: Optional[User], course: Course) -> bool:
    return has_course_access(db, user, course)


def enroll(db: Session, user: User, course: Course, *, source: str = "direct", actor: Optional[User] = None) -> Enrollment:
    if not course.is_published:
        raise NotFoundError("Course not found")
    existing = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == user.id, Enrollment.course_id == course.id)
        .first()
    )
    if existing:
        if existing.status == EnrollmentStatus.DROPPED:
            existing.status = EnrollmentStatus.ACTIVE
            db.commit()
        return existing
    # Free courses enrol directly; paid courses require an entitlement.
    if course.price_cents > 0 and not has_course_access(db, user, course):
        raise ForbiddenError("Purchase required to access this course")
    enrollment = Enrollment(user_id=user.id, course_id=course.id, source=source)
    db.add(enrollment)
    db.flush()
    db.query(Entitlement).filter(
        Entitlement.user_id == user.id,
        Entitlement.resource_type == "course",
        Entitlement.resource_id == course.id,
    ).delete(synchronize_session=False)
    db.add(Entitlement(user_id=user.id, resource_type="course", resource_id=course.id, source=source))
    db.commit()
    audit(db, "course.enroll", actor=user, entity_type="course", entity_id=course.id, details={"enrollment_id": enrollment.id})
    return enrollment


def get_or_create_enrollment(db: Session, user: User, course: Course) -> Optional[Enrollment]:
    return (
        db.query(Enrollment)
        .filter(Enrollment.user_id == user.id, Enrollment.course_id == course.id)
        .first()
    )


def entitlements_for_user(db: Session, user: User) -> list[Entitlement]:
    return db.query(Entitlement).filter(Entitlement.user_id == user.id).all()


def grant_entitlement(db: Session, user: User, resource_type: str, resource_id: int, source: str) -> Entitlement:
    existing = (
        db.query(Entitlement)
        .filter(
            Entitlement.user_id == user.id,
            Entitlement.resource_type == resource_type,
            Entitlement.resource_id == resource_id,
        )
        .first()
    )
    if existing:
        return existing
    e = Entitlement(user_id=user.id, resource_type=resource_type, resource_id=resource_id, source=source)
    db.add(e)
    db.commit()
    return e


def path_progress(db: Session, user: User, path: LearningPath) -> dict:
    items = path.items
    total = len(items)
    completed = 0
    for item in items:
        enrollment = (
            db.query(Enrollment)
            .filter(Enrollment.user_id == user.id, Enrollment.course_id == item.course_id)
            .first()
        )
        if enrollment and enrollment.status == EnrollmentStatus.COMPLETED:
            completed += 1
    return {
        "total_courses": total,
        "completed_courses": completed,
        "percent": round(100 * completed / total) if total else 0,
    }
