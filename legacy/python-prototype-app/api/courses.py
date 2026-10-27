"""Course catalogue API: enrolment, curriculum, reviews, instructor CRUD."""
from __future__ import annotations

import re
from typing import Optional

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, RedirectResponse

from app.core.audit import audit
from app.core.errors import ConflictError, ForbiddenError, NotFoundError, ValidationError
from app.core.rbac import is_instructor
from app.main import templates
from app.models.catalogue import Course, CourseReview, CourseStatus, Lesson, LessonType, Module
from app.services import catalogue as catalogue_service
from app.services.enrollment import enroll as enroll_service
from app.services.enrollment import has_course_access
from app.services.progress import course_completion_percent

courses_router = APIRouter(tags=["courses"])


def _user(request: Request):
    return getattr(request.state, "user", None)


def _db(request: Request):
    return request.state.db


# ---------------------------------------------------------------------------
# Learner-facing API
# ---------------------------------------------------------------------------

@courses_router.post("/api/v1/courses/{slug}/enroll")
def enroll(request: Request, slug: str):
    user = _user(request)
    if user is None:
        raise ForbiddenError("Sign in to enrol")
    db = _db(request)
    course = catalogue_service.get_published_course(db, slug)
    if not course:
        raise NotFoundError("Course not found")
    enrollment = enroll_service(db, user, course)
    audit(db, "course.enroll", actor=user, entity_type="course", entity_id=course.id)
    return {"status": "enrolled", "enrollment_id": enrollment.id, "course_id": course.id}


@courses_router.get("/api/v1/courses/{slug}/access")
def check_access(request: Request, slug: str):
    db = _db(request)
    user = _user(request)
    course = catalogue_service.get_published_course(db, slug)
    if not course:
        raise NotFoundError("Course not found")
    return {"has_access": has_course_access(db, user, course), "is_free": course.is_free}


@courses_router.post("/api/v1/courses/{slug}/reviews")
async def create_review(request: Request, slug: str):
    user = _user(request)
    if user is None:
        raise ForbiddenError("Sign in to review")
    db = _db(request)
    course = catalogue_service.get_published_course(db, slug)
    if not course:
        raise NotFoundError("Course not found")
    body = await request.json()
    rating = int(body.get("rating", 0))
    if rating < 1 or rating > 5:
        raise ValidationError("Rating must be between 1 and 5")
    existing = db.query(CourseReview).filter(CourseReview.course_id == course.id, CourseReview.user_id == user.id).first()
    if existing:
        raise ConflictError("You already reviewed this course")
    review = CourseReview(
        course_id=course.id,
        user_id=user.id,
        rating=rating,
        title=str(body.get("title", ""))[:200],
        body=str(body.get("body", ""))[:4000],
    )
    db.add(review)
    db.commit()
    return {"status": "review_created", "rating": rating}


# ---------------------------------------------------------------------------
# Instructor course authoring API
# ---------------------------------------------------------------------------

@courses_router.get("/api/v1/instructor/courses")
def instructor_courses(request: Request):
    user = _user(request)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = _db(request)
    if not is_instructor(db, user):
        raise ForbiddenError("Instructor access required")
    courses = db.query(Course).filter(Course.instructor_id == user.id).order_by(Course.updated_at.desc()).all()
    return {
        "courses": [
            {
                "id": c.id,
                "slug": c.slug,
                "title": c.title,
                "status": c.status.value if hasattr(c.status, "value") else c.status,
                "level": c.level,
                "price_cents": c.price_cents,
                "lesson_count": sum(len(m.lessons) for m in c.modules),
                "updated_at": c.updated_at.isoformat() if c.updated_at else None,
            }
            for c in courses
        ]
    }


@courses_router.post("/api/v1/instructor/courses")
async def create_course(request: Request):
    user = _user(request)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = _db(request)
    if not is_instructor(db, user):
        raise ForbiddenError("Instructor access required")
    body = await request.json()
    title = str(body.get("title", "")).strip()
    if len(title) < 5 or len(title) > 200:
        raise ValidationError("Title must be 5-200 characters")
    slug = str(body.get("slug", "")).strip().lower() or re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:120]
    if db.query(Course).filter(Course.slug == slug).first():
        raise ConflictError("Slug already exists")
    course = Course(
        slug=slug,
        title=title,
        subtitle=str(body.get("subtitle", ""))[:400],
        description=str(body.get("description", "")),
        status=CourseStatus.DRAFT,
        level=str(body.get("level", "beginner")),
        language=str(body.get("language", "en"))[:10],
        estimated_hours=body.get("estimated_hours"),
        price_cents=int(body.get("price_cents", 0)),
        instructor_id=user.id,
    )
    db.add(course)
    db.commit()
    audit(db, "course.created", actor=user, entity_type="course", entity_id=course.id)
    return {"id": course.id, "slug": course.slug, "status": course.status.value}


@courses_router.put("/api/v1/instructor/courses/{course_id}")
async def update_course(request: Request, course_id: int):
    user = _user(request)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = _db(request)
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise NotFoundError("Course not found")
    if course.instructor_id != user.id and not user.is_superuser:
        raise ForbiddenError("Not your course")
    body = await request.json()
    for field in ("title", "subtitle", "description", "level", "language", "estimated_hours"):
        if field in body:
            setattr(course, field, body[field])
    if "price_cents" in body:
        course.price_cents = max(0, int(body["price_cents"]))
    db.commit()
    return {"status": "updated", "id": course.id}


@courses_router.post("/api/v1/instructor/courses/{course_id}/submit-review")
def submit_for_review(request: Request, course_id: int):
    user = _user(request)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = _db(request)
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course or (course.instructor_id != user.id and not user.is_superuser):
        raise NotFoundError("Course not found")
    if not course.modules:
        raise ValidationError("Add at least one module before submitting for review")
    course.status = CourseStatus.IN_REVIEW
    db.commit()
    audit(db, "course.submitted_for_review", actor=user, entity_type="course", entity_id=course.id)
    return {"status": "in_review"}


@courses_router.post("/api/v1/instructor/courses/{course_id}/modules")
async def create_module(request: Request, course_id: int):
    user = _user(request)
    db = _db(request)
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course or (course.instructor_id != user.id and not user.is_superuser):
        raise NotFoundError("Course not found")
    body = await request.json()
    title = str(body.get("title", "")).strip()
    if not title:
        raise ValidationError("Module title is required")
    count = db.query(Module).filter(Module.course_id == course.id).count()
    module = Module(course_id=course.id, title=title, description=body.get("description", ""), order_index=count)
    db.add(module)
    db.commit()
    return {"id": module.id, "title": module.title, "order_index": module.order_index}


@courses_router.post("/api/v1/instructor/modules/{module_id}/lessons")
async def create_lesson(request: Request, module_id: int):
    user = _user(request)
    db = _db(request)
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise NotFoundError("Module not found")
    course = module.course
    if course.instructor_id != user.id and not user.is_superuser:
        raise ForbiddenError("Not your course")
    body = await request.json()
    title = str(body.get("title", "")).strip()
    if not title:
        raise ValidationError("Lesson title is required")
    lesson_type = str(body.get("lesson_type", "text"))
    try:
        lesson_type = LessonType(lesson_type)
    except ValueError:
        raise ValidationError("Invalid lesson type")
    count = db.query(Lesson).filter(Lesson.module_id == module.id).count()
    lesson = Lesson(
        module_id=module.id,
        title=title,
        lesson_type=lesson_type,
        content=body.get("content", ""),
        duration_minutes=body.get("duration_minutes"),
        video_url=body.get("video_url"),
        is_preview=bool(body.get("is_preview", False)),
        order_index=count,
    )
    db.add(lesson)
    db.commit()
    return {"id": lesson.id, "title": lesson.title, "lesson_type": lesson.lesson_type.value}


@courses_router.put("/api/v1/instructor/lessons/{lesson_id}")
async def update_lesson(request: Request, lesson_id: int):
    user = _user(request)
    db = _db(request)
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise NotFoundError("Lesson not found")
    course = lesson.module.course
    if course.instructor_id != user.id and not user.is_superuser:
        raise ForbiddenError("Not your course")
    body = await request.json()
    for field in ("title", "content", "duration_minutes", "video_url"):
        if field in body:
            setattr(lesson, field, body[field])
    if "is_preview" in body:
        lesson.is_preview = bool(body["is_preview"])
    db.commit()
    return {"status": "updated"}


@courses_router.delete("/api/v1/instructor/lessons/{lesson_id}")
def delete_lesson(request: Request, lesson_id: int):
    user = _user(request)
    db = _db(request)
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise NotFoundError("Lesson not found")
    course = lesson.module.course
    if course.instructor_id != user.id and not user.is_superuser:
        raise ForbiddenError("Not your course")
    db.delete(lesson)
    db.commit()
    return {"status": "deleted"}


# ---------------------------------------------------------------------------
# Instructor course editor page
# ---------------------------------------------------------------------------

@courses_router.get("/instructor/courses/{course_id}/edit", response_class=HTMLResponse)
def edit_course_page(request: Request, course_id: int):
    user = _user(request)
    if user is None:
        return RedirectResponse("/auth/sign-in", status_code=302)
    db = _db(request)
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course or (course.instructor_id != user.id and not user.is_superuser):
        raise ForbiddenError("Not your course")
    return templates.TemplateResponse(
        "instructor/course_editor.html",
        {"request": request, "course": course, "modules": course.modules},
    )
