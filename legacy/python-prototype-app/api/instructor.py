"""Instructor studio: dashboard, grading, analytics, sessions."""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, RedirectResponse

from app.core.errors import ForbiddenError, NotFoundError, ValidationError
from app.core.rbac import is_instructor
from app.main import templates
from app.models.catalogue import Course, Lesson
from app.models.learning import (
    AssessmentAttempt,
    Enrollment,
    EnrollmentStatus,
    GradingRecord,
    LessonProgress,
    Submission,
)
from app.services import assessments as assessment_service

instructor_router = APIRouter(tags=["instructor"])


def _user(request: Request):
    return getattr(request.state, "user", None)


def _db(request: Request):
    return request.state.db


def _require_instructor(request: Request):
    user = _user(request)
    if user is None:
        return None
    db = _db(request)
    if not is_instructor(db, user):
        raise ForbiddenError("Instructor access required")
    return user


@instructor_router.get("/instructor", response_class=HTMLResponse)
def instructor_dashboard(request: Request):
    user = _require_instructor(request)
    if user is None:
        return RedirectResponse("/auth/sign-in", status_code=302)
    db = _db(request)
    courses = db.query(Course).filter(Course.instructor_id == user.id).order_by(Course.updated_at.desc()).limit(10).all()
    course_ids = [c.id for c in courses]
    grading_queue = []
    if course_ids:
        lesson_ids = _lesson_ids_for_courses(db, course_ids)
        grading_queue = (
            db.query(Submission)
            .filter(Submission.lesson_id.in_(lesson_ids), Submission.status == "submitted")
            .order_by(Submission.submitted_at.desc())
            .limit(20)
            .all()
        )
    stats = _instructor_stats(db, user, course_ids)
    return templates.TemplateResponse(
        "instructor/dashboard.html",
        {"request": request, "courses": courses, "grading_queue": grading_queue, "stats": stats},
    )


def _lesson_ids_for_courses(db, course_ids: list[int]) -> list[int]:
    from sqlalchemy import and_

    from app.models.catalogue import Module

    return [
        row[0]
        for row in db.query(Lesson.id)
        .join(Module, Module.id == Lesson.module_id)
        .filter(Module.course_id.in_(course_ids))
        .all()
    ]


def _instructor_stats(db, user, course_ids: list[int]) -> dict:
    if not course_ids:
        return {"courses": 0, "enrolments": 0, "grading_pending": 0, "completion_avg": 0}
    from sqlalchemy import func

    enrolments = db.query(Enrollment).filter(Enrollment.course_id.in_(course_ids)).count()
    lesson_ids = _lesson_ids_for_courses(db, course_ids)
    grading_pending = db.query(Submission).filter(Submission.lesson_id.in_(lesson_ids), Submission.status == "submitted").count() if lesson_ids else 0
    return {
        "courses": len(course_ids),
        "enrolments": enrolments,
        "grading_pending": grading_pending,
    }


@instructor_router.get("/instructor/courses", response_class=HTMLResponse)
def instructor_courses(request: Request):
    user = _require_instructor(request)
    if user is None:
        return RedirectResponse("/auth/sign-in", status_code=302)
    db = _db(request)
    courses = db.query(Course).filter(Course.instructor_id == user.id).order_by(Course.updated_at.desc()).all()
    return templates.TemplateResponse("instructor/courses.html", {"request": request, "courses": courses})


@instructor_router.get("/instructor/courses/new", response_class=HTMLResponse)
def new_course_page(request: Request):
    user = _require_instructor(request)
    if user is None:
        return RedirectResponse("/auth/sign-in", status_code=302)
    return templates.TemplateResponse("instructor/course_new.html", {"request": request})


@instructor_router.get("/instructor/grading", response_class=HTMLResponse)
def grading_queue_page(request: Request, course_id: Optional[int] = None):
    user = _require_instructor(request)
    if user is None:
        return RedirectResponse("/auth/sign-in", status_code=302)
    db = _db(request)
    courses = db.query(Course).filter(Course.instructor_id == user.id).all()
    course_ids = [c.id for c in courses]
    query = db.query(Submission)
    if course_id:
        lesson_ids = _lesson_ids_for_courses(db, [course_id])
        query = query.filter(Submission.lesson_id.in_(lesson_ids))
    elif course_ids:
        lesson_ids = _lesson_ids_for_courses(db, course_ids)
        if lesson_ids:
            query = query.filter(Submission.lesson_id.in_(lesson_ids))
    submissions = query.order_by(Submission.submitted_at.desc()).limit(50).all()
    return templates.TemplateResponse(
        "instructor/grading.html",
        {"request": request, "submissions": submissions, "courses": courses, "course_id": course_id},
    )


@instructor_router.get("/instructor/learners", response_class=HTMLResponse)
def instructor_learners(request: Request, course_id: Optional[int] = None):
    user = _require_instructor(request)
    if user is None:
        return RedirectResponse("/auth/sign-in", status_code=302)
    db = _db(request)
    courses = db.query(Course).filter(Course.instructor_id == user.id).all()
    if not course_id and courses:
        course_id = courses[0].id
    learners = []
    if course_id:
        course = db.query(Course).filter(Course.id == course_id, Course.instructor_id == user.id).first()
        if not course:
            raise ForbiddenError("Not your course")
        enrollments = db.query(Enrollment).filter(Enrollment.course_id == course.id).all()
        for e in enrollments:
            learner = db.query(__import__("app.models.identity", fromlist=["User"]).User).filter(
                __import__("app.models.identity", fromlist=["User"]).User.id == e.user_id
            ).first()
            percent = None
            if learner:
                from app.services.progress import course_completion_percent

                percent = course_completion_percent(db, e)
            learners.append({"enrollment": e, "learner": learner, "percent": percent})
    return templates.TemplateResponse(
        "instructor/learners.html",
        {"request": request, "courses": courses, "learners": learners, "course_id": course_id},
    )


@instructor_router.get("/instructor/analytics", response_class=HTMLResponse)
def instructor_analytics(request: Request, course_id: Optional[int] = None):
    user = _require_instructor(request)
    if user is None:
        return RedirectResponse("/auth/sign-in", status_code=302)
    db = _db(request)
    courses = db.query(Course).filter(Course.instructor_id == user.id).all()
    if not course_id and courses:
        course_id = courses[0].id
    analytics = None
    if course_id:
        course = db.query(Course).filter(Course.id == course_id, Course.instructor_id == user.id).first()
        if not course:
            raise ForbiddenError("Not your course")
        enrollments = db.query(Enrollment).filter(Enrollment.course_id == course.id).all()
        total = len(enrollments)
        completed = sum(1 for e in enrollments if e.status == EnrollmentStatus.COMPLETED)
        lesson_ids = _lesson_ids_for_courses(db, [course.id])
        # Lesson engagement: unique learners per lesson.
        engagement = []
        if lesson_ids:
            for lesson_id in lesson_ids:
                lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
                views = (
                    db.query(LessonProgress)
                    .filter(LessonProgress.lesson_id == lesson_id)
                    .distinct(LessonProgress.enrollment_id)
                    .count()
                )
                engagement.append({"lesson": lesson.title if lesson else str(lesson_id), "views": views})
        attempts = db.query(AssessmentAttempt).filter(
            AssessmentAttempt.assessment_id.in_(
                [row[0] for row in db.query(Lesson.assessment_id).filter(Lesson.id.in_(lesson_ids), Lesson.assessment_id.isnot(None)).all()]
            )
        ).all() if lesson_ids else []
        avg_score = (sum(a.score_percent or 0 for a in attempts) // len(attempts)) if attempts else None
        analytics = {
            "course": course,
            "enrolments": total,
            "completed": completed,
            "completion_rate": round(100 * completed / total) if total else 0,
            "engagement": engagement,
            "avg_score": avg_score,
        }
    return templates.TemplateResponse(
        "instructor/analytics.html",
        {"request": request, "courses": courses, "analytics": analytics, "course_id": course_id},
    )


@instructor_router.post("/api/v1/instructor/submissions/{submission_id}/grade")
async def grade_submission(request: Request, submission_id: int):
    user = _require_instructor(request)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = _db(request)
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise NotFoundError("Submission not found")
    # Verify ownership: the lesson must belong to one of the instructor's courses.
    lesson = db.query(Lesson).filter(Lesson.id == submission.lesson_id).first()
    if not lesson:
        raise NotFoundError("Lesson not found")
    from app.models.catalogue import Module

    module = db.query(Module).filter(Module.id == lesson.module_id).first()
    course = db.query(Course).filter(Course.id == module.course_id).first()
    if not course or (course.instructor_id != user.id and not user.is_superuser):
        raise ForbiddenError("Not your course")
    body = await request.json()
    score = int(body.get("score_percent", 0))
    feedback = str(body.get("feedback", ""))[:4000]
    record = assessment_service.grade_submission(db, user, submission, score_percent=score, feedback=feedback)
    return {"status": "graded", "score": record.score_percent}


@instructor_router.get("/api/v1/instructor/assessments/{assessment_id}/results")
def assessment_results(request: Request, assessment_id: int):
    user = _require_instructor(request)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = _db(request)
    from app.models.learning import Assessment

    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise NotFoundError("Assessment not found")
    attempts = (
        db.query(AssessmentAttempt)
        .filter(AssessmentAttempt.assessment_id == assessment_id)
        .order_by(AssessmentAttempt.id.desc())
        .limit(100)
        .all()
    )
    return {
        "attempts": [
            {
                "id": a.id,
                "user_id": a.user_id,
                "score_percent": a.score_percent,
                "passed": a.passed,
                "submitted_at": a.submitted_at.isoformat() if a.submitted_at else None,
            }
            for a in attempts
        ]
    }
