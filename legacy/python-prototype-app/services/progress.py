"""Progress, notes and bookmarks service."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.catalogue import Lesson, Module
from app.models.learning import Enrollment, EnrollmentStatus, LessonBookmark, LessonProgress, LearnerNote
from app.models.identity import User
from app.core.errors import NotFoundError


def lesson_completed(db: Session, enrollment: Enrollment, lesson: Lesson) -> bool:
    progress = (
        db.query(LessonProgress)
        .filter(LessonProgress.enrollment_id == enrollment.id, LessonProgress.lesson_id == lesson.id)
        .first()
    )
    return bool(progress and progress.completed)


def set_progress(
    db: Session,
    enrollment: Enrollment,
    lesson: Lesson,
    *,
    completed: bool = False,
    position_seconds: int = 0,
) -> LessonProgress:
    progress = (
        db.query(LessonProgress)
        .filter(LessonProgress.enrollment_id == enrollment.id, LessonProgress.lesson_id == lesson.id)
        .first()
    )
    if progress is None:
        progress = LessonProgress(enrollment_id=enrollment.id, lesson_id=lesson.id)
        db.add(progress)
    if position_seconds:
        progress.position_seconds = max(0, position_seconds)
    if completed:
        progress.completed = True
        progress.completed_at = progress.completed_at or datetime.now(timezone.utc)
    db.commit()
    _maybe_complete_course(db, enrollment)
    return progress


def course_completion_percent(db: Session, enrollment: Enrollment) -> int:
    from app.models.catalogue import Course

    course = db.query(Course).filter(Course.id == enrollment.course_id).first()
    if not course:
        return 0
    total = sum(len(m.lessons) for m in course.modules)
    if total == 0:
        return 0
    done = (
        db.query(func.count(LessonProgress.id))
        .filter(LessonProgress.enrollment_id == enrollment.id, LessonProgress.completed.is_(True))
        .scalar()
        or 0
    )
    return min(100, round(100 * done / total))


def _maybe_complete_course(db: Session, enrollment: Enrollment) -> bool:
    """Mark the course completed when every lesson is completed (and quizzes passed)."""
    if enrollment.status == EnrollmentStatus.COMPLETED:
        return True
    from app.models.catalogue import Course

    course = db.query(Course).filter(Course.id == enrollment.course_id).first()
    if not course:
        return False
    all_lesson_ids = [lesson.id for module in course.modules for lesson in module.lessons]
    if not all_lesson_ids:
        return False
    completed_ids = {
        row[0]
        for row in db.query(LessonProgress.lesson_id)
        .filter(
            LessonProgress.enrollment_id == enrollment.id,
            LessonProgress.lesson_id.in_(all_lesson_ids),
            LessonProgress.completed.is_(True),
        )
        .all()
    }
    if set(all_lesson_ids).issubset(completed_ids):
        enrollment.status = EnrollmentStatus.COMPLETED
        enrollment.completed_at = datetime.now(timezone.utc)
        db.commit()
        return True
    return False


def resume_lesson(db: Session, enrollment: Enrollment) -> Optional[Lesson]:
    """The next incomplete lesson, or the last accessed one."""
    from app.models.catalogue import Course

    course = db.query(Course).filter(Course.id == enrollment.course_id).first()
    if not course:
        return None
    for module in course.modules:
        for lesson in module.lessons:
            if not lesson_completed(db, enrollment, lesson):
                return lesson
    return course.modules[-1].lessons[-1] if course.modules else None


def save_note(
    db: Session,
    user: User,
    *,
    lesson_id: Optional[int] = None,
    content: str,
    tags: list | None = None,
    video_timestamp: Optional[int] = None,
    note_id: Optional[int] = None,
) -> LearnerNote:
    if not content.strip():
        raise NotFoundError("Note content is required")
    if note_id:
        note = db.query(LearnerNote).filter(LearnerNote.id == note_id, LearnerNote.user_id == user.id).first()
        if not note:
            raise NotFoundError("Note not found")
        note.content = content.strip()
        note.tags = tags or []
        note.video_timestamp = video_timestamp
        note.updated_at = datetime.now(timezone.utc)
    else:
        note = LearnerNote(
            user_id=user.id,
            lesson_id=lesson_id,
            content=content.strip(),
            tags=tags or [],
            video_timestamp=video_timestamp,
        )
        db.add(note)
    db.commit()
    return note


def delete_note(db: Session, user: User, note_id: int) -> bool:
    note = db.query(LearnerNote).filter(LearnerNote.id == note_id, LearnerNote.user_id == user.id).first()
    if not note:
        return False
    db.delete(note)
    db.commit()
    return True


def list_notes(db: Session, user: User, q: Optional[str] = None) -> list[LearnerNote]:
    query = db.query(LearnerNote).filter(LearnerNote.user_id == user.id)
    if q:
        query = query.filter(LearnerNote.content.ilike(f"%{q}%"))
    return query.order_by(LearnerNote.updated_at.desc()).all()


def toggle_bookmark(db: Session, user: User, lesson_id: int, note: str = "") -> bool:
    existing = (
        db.query(LessonBookmark)
        .filter(LessonBookmark.user_id == user.id, LessonBookmark.lesson_id == lesson_id)
        .first()
    )
    if existing:
        db.delete(existing)
        db.commit()
        return False
    db.add(LessonBookmark(user_id=user.id, lesson_id=lesson_id, note=note))
    db.commit()
    return True


def is_bookmarked(db: Session, user: User, lesson_id: int) -> bool:
    return (
        db.query(LessonBookmark)
        .filter(LessonBookmark.user_id == user.id, LessonBookmark.lesson_id == lesson_id)
        .first()
        is not None
    )
