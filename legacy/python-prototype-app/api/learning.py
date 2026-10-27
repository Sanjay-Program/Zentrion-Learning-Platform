"""Learner workspace: dashboard, course player, progress, assessments, certificates."""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, RedirectResponse

from app.core.errors import ConflictError, ForbiddenError, NotFoundError, ValidationError
from app.main import templates
from app.models.catalogue import Course, Lesson
from app.models.learning import (
    Assessment,
    AssessmentAttempt,
    Enrollment,
    EnrollmentStatus,
    LessonProgress,
    Submission,
)
from app.services import assessments as assessment_service
from app.services import progress as progress_service
from app.services.enrollment import has_course_access
from app.services.progress import course_completion_percent

learning_router = APIRouter(tags=["learning"])


def _user(request: Request):
    return getattr(request.state, "user", None)


def _db(request: Request):
    return request.state.db


def _require_user(request: Request, redirect: str = "/auth/sign-in"):
    user = _user(request)
    if user is None:
        return None
    return user


@learning_router.get("/app", response_class=HTMLResponse)
def learner_dashboard(request: Request):
    user = _require_user(request)
    if user is None:
        return RedirectResponse("/auth/sign-in", status_code=302)
    db = _db(request)
    enrollments = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == user.id)
        .order_by(Enrollment.last_accessed_at.desc())
        .limit(10)
        .all()
    )
    active = []
    for e in enrollments:
        course = db.query(Course).filter(Course.id == e.course_id).first()
        if course:
            active.append(
                {
                    "enrollment": e,
                    "course": course,
                    "percent": course_completion_percent(db, e),
                }
            )
    notifications = (
        db.query(__import__("app.models.commerce", fromlist=["Notification"]).Notification)
        .filter(__import__("app.models.commerce", fromlist=["Notification"]).Notification.user_id == user.id)
        .order_by(__import__("app.models.commerce", fromlist=["Notification"]).Notification.id.desc())
        .limit(5)
        .all()
    )
    certificates = db.query(__import__("app.models.learning", fromlist=["Certificate"]).Certificate).filter(
        __import__("app.models.learning", fromlist=["Certificate"]).Certificate.user_id == user.id
    ).all()
    from app.services.onboarding import learning_plan

    plan = learning_plan(db, user) if user.profile and user.profile.onboarding_completed else None
    return templates.TemplateResponse(
        "app/dashboard.html",
        {"request": request, "user": user, "active": active, "notifications": notifications, "certificates": certificates, "plan": plan},
    )


@learning_router.get("/app/learning", response_class=HTMLResponse)
def my_courses(request: Request):
    user = _require_user(request)
    if user is None:
        return RedirectResponse("/auth/sign-in", status_code=302)
    db = _db(request)
    enrollments = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == user.id)
        .order_by(Enrollment.enrolled_at.desc())
        .all()
    )
    rows = []
    for e in enrollments:
        course = db.query(Course).filter(Course.id == e.course_id).first()
        if course:
            rows.append({"enrollment": e, "course": course, "percent": course_completion_percent(db, e)})
    return templates.TemplateResponse("app/my_courses.html", {"request": request, "rows": rows})


@learning_router.get("/app/courses/{course_id}", response_class=HTMLResponse)
def course_overview(request: Request, course_id: int):
    user = _require_user(request)
    if user is None:
        return RedirectResponse("/auth/sign-in", status_code=302)
    db = _db(request)
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise NotFoundError("Course not found")
    if not has_course_access(db, user, course):
        raise ForbiddenError("Enrol or purchase to access this course")
    enrollment = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == user.id, Enrollment.course_id == course.id)
        .first()
    )
    percent = course_completion_percent(db, enrollment) if enrollment else 0
    return templates.TemplateResponse(
        "app/course_overview.html",
        {"request": request, "course": course, "enrollment": enrollment, "percent": percent, "modules": course.modules},
    )


@learning_router.get("/app/learn/{enrollment_id}/{lesson_id}", response_class=HTMLResponse)
def course_player(request: Request, enrollment_id: int, lesson_id: int):
    user = _require_user(request)
    if user is None:
        return RedirectResponse("/auth/sign-in", status_code=302)
    db = _db(request)
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id, Enrollment.user_id == user.id).first()
    if not enrollment:
        raise NotFoundError("Enrollment not found")
    course = db.query(Course).filter(Course.id == enrollment.course_id).first()
    if not course:
        raise NotFoundError("Course not found")
    if not has_course_access(db, user, course):
        raise ForbiddenError("You do not have access to this course")
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise NotFoundError("Lesson not found")
    progress = (
        db.query(LessonProgress)
        .filter(LessonProgress.enrollment_id == enrollment.id, LessonProgress.lesson_id == lesson.id)
        .first()
    )
    # Navigation
    flat = [(m, l) for m in course.modules for l in m.lessons]
    idx = next((i for i, (m, l) in enumerate(flat) if l.id == lesson.id), 0)
    prev_lesson = flat[idx - 1][1] if idx > 0 else None
    next_lesson = flat[idx + 1][1] if idx < len(flat) - 1 else None
    assessment = None
    if lesson.assessment_id:
        assessment = db.query(Assessment).filter(Assessment.id == lesson.assessment_id).first()
    attempt = None
    if assessment:
        attempt = (
            db.query(AssessmentAttempt)
            .filter(AssessmentAttempt.assessment_id == assessment.id, AssessmentAttempt.user_id == user.id, AssessmentAttempt.status == "in_progress")
            .first()
        )
    bookmarked = (
        db.query(__import__("app.models.learning", fromlist=["LessonBookmark"]).LessonBookmark)
        .filter(
            __import__("app.models.learning", fromlist=["LessonBookmark"]).LessonBookmark.user_id == user.id,
            __import__("app.models.learning", fromlist=["LessonBookmark"]).LessonBookmark.lesson_id == lesson.id,
        )
        .first()
        is not None
    )
    submission = None
    if lesson.lesson_type.value == "assignment":
        submission = (
            db.query(Submission)
            .filter(Submission.user_id == user.id, Submission.lesson_id == lesson.id)
            .order_by(Submission.id.desc())
            .first()
        )
    return templates.TemplateResponse(
        "app/player.html",
        {
            "request": request,
            "course": course,
            "enrollment": enrollment,
            "lesson": lesson,
            "progress": progress,
            "prev_lesson": prev_lesson,
            "next_lesson": next_lesson,
            "modules": course.modules,
            "current_lesson_id": lesson.id,
            "assessment": assessment,
            "attempt": attempt,
            "bookmarked": bookmarked,
            "submission": submission,
            "percent": course_completion_percent(db, enrollment),
        },
    )


# ---------------------------------------------------------------------------
# Progress API
# ---------------------------------------------------------------------------

@learning_router.post("/api/v1/enrollments/{enrollment_id}/lessons/{lesson_id}/progress")
async def update_progress(request: Request, enrollment_id: int, lesson_id: int):
    user = _require_user(request)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = _db(request)
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id, Enrollment.user_id == user.id).first()
    if not enrollment:
        raise NotFoundError("Enrollment not found")
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise NotFoundError("Lesson not found")
    body = await request.json()
    completed = bool(body.get("completed", False))
    position = int(body.get("position_seconds", 0) or 0)
    progress = progress_service.set_progress(
        db, enrollment, lesson, completed=completed, position_seconds=position
    )
    enrollment.last_accessed_at = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
    db.commit()
    percent = course_completion_percent(db, enrollment)
    return {
        "status": "saved",
        "completed": progress.completed,
        "course_percent": percent,
        "course_completed": enrollment.status == EnrollmentStatus.COMPLETED,
    }


@learning_router.get("/api/v1/enrollments/{enrollment_id}/progress")
def get_enrollment_progress(request: Request, enrollment_id: int):
    user = _require_user(request)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = _db(request)
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id, Enrollment.user_id == user.id).first()
    if not enrollment:
        raise NotFoundError("Enrollment not found")
    progress_rows = (
        db.query(LessonProgress)
        .filter(LessonProgress.enrollment_id == enrollment.id)
        .all()
    )
    return {
        "course_percent": course_completion_percent(db, enrollment),
        "status": enrollment.status.value if hasattr(enrollment.status, "value") else enrollment.status,
        "lessons": {p.lesson_id: {"completed": p.completed, "position_seconds": p.position_seconds} for p in progress_rows},
    }


# ---------------------------------------------------------------------------
# Notes and bookmarks API
# ---------------------------------------------------------------------------

@learning_router.post("/api/v1/notes")
async def create_or_update_note(request: Request):
    user = _require_user(request)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = _db(request)
    body = await request.json()
    note = progress_service.save_note(
        db,
        user,
        lesson_id=body.get("lesson_id"),
        content=body.get("content", ""),
        tags=body.get("tags", []),
        video_timestamp=body.get("video_timestamp"),
        note_id=body.get("note_id"),
    )
    return {"status": "saved", "note_id": note.id}


@learning_router.delete("/api/v1/notes/{note_id}")
def delete_note(request: Request, note_id: int):
    user = _require_user(request)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = _db(request)
    deleted = progress_service.delete_note(db, user, note_id)
    if not deleted:
        raise NotFoundError("Note not found")
    return {"status": "deleted"}


@learning_router.get("/api/v1/notes")
def list_notes(request: Request, q: Optional[str] = None):
    user = _require_user(request)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = _db(request)
    notes = progress_service.list_notes(db, user, q)
    return {
        "notes": [
            {
                "id": n.id,
                "lesson_id": n.lesson_id,
                "content": n.content,
                "tags": n.tags,
                "video_timestamp": n.video_timestamp,
                "updated_at": n.updated_at.isoformat() if n.updated_at else None,
            }
            for n in notes
        ]
    }


@learning_router.post("/api/v1/bookmarks/{lesson_id}")
def toggle_bookmark(request: Request, lesson_id: int):
    user = _require_user(request)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = _db(request)
    bookmarked = progress_service.toggle_bookmark(db, user, lesson_id)
    return {"bookmarked": bookmarked}


# ---------------------------------------------------------------------------
# Assessment API
# ---------------------------------------------------------------------------

@learning_router.post("/api/v1/assessments/{assessment_id}/attempts")
def start_attempt(request: Request, assessment_id: int):
    user = _require_user(request)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = _db(request)
    assessment = assessment_service.get_assessment(db, assessment_id)
    if not assessment:
        raise NotFoundError("Assessment not found")
    attempt = assessment_service.start_attempt(db, user, assessment, lesson_id=request.query_params.get("lesson_id") and int(request.query_params["lesson_id"]))
    return {"attempt_id": attempt.id, "status": attempt.status.value}


@learning_router.get("/api/v1/attempts/{attempt_id}")
def get_attempt(request: Request, attempt_id: int):
    user = _require_user(request)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = _db(request)
    attempt = assessment_service.get_attempt(db, user, attempt_id)
    if not attempt:
        raise NotFoundError("Attempt not found")
    assessment = db.query(Assessment).filter(Assessment.id == attempt.assessment_id).first()
    questions = []
    for answer in attempt.answers:
        question = db.query(__import__("app.models.learning", fromlist=["AssessmentQuestion"]).AssessmentQuestion).filter(
            __import__("app.models.learning", fromlist=["AssessmentQuestion"]).AssessmentQuestion.id == answer.question_id
        ).first()
        if not question:
            continue
        options = [
            {"id": o.id, "text": o.text}
            for o in question.options
        ]
        # Never expose correct answers for unsubmitted attempts.
        show_correct = attempt.status != "in_progress"
        questions.append(
            {
                "id": question.id,
                "question_type": question.question_type.value,
                "prompt": question.prompt,
                "options": options,
                "selected": answer.selected_options,
                "text_answer": answer.text_answer,
                "is_correct": answer.is_correct if show_correct else None,
                "feedback": answer.feedback if show_correct else None,
                "explanation": question.explanation if show_correct else None,
                "correct_options": [o.id for o in question.options if o.is_correct] if show_correct else [],
            }
        )
    return {
        "attempt_id": attempt.id,
        "status": attempt.status.value,
        "score_percent": attempt.score_percent,
        "passed": attempt.passed,
        "time_limit_minutes": assessment.time_limit_minutes,
        "questions": questions,
    }


@learning_router.post("/api/v1/attempts/{attempt_id}/answers")
async def save_answer(request: Request, attempt_id: int):
    user = _require_user(request)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = _db(request)
    attempt = assessment_service.get_attempt(db, user, attempt_id)
    if not attempt:
        raise NotFoundError("Attempt not found")
    body = await request.json()
    assessment_service.save_answer(
        db,
        user,
        attempt,
        int(body.get("question_id")),
        selected_options=body.get("selected_options"),
        text_answer=body.get("text_answer"),
    )
    return {"status": "saved"}


@learning_router.post("/api/v1/attempts/{attempt_id}/submit")
def submit_attempt(request: Request, attempt_id: int):
    user = _require_user(request)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = _db(request)
    attempt = assessment_service.get_attempt(db, user, attempt_id)
    if not attempt:
        raise NotFoundError("Attempt not found")
    attempt = assessment_service.submit_attempt(db, user, attempt)
    return {
        "status": "submitted",
        "score_percent": attempt.score_percent,
        "passed": attempt.passed,
    }


# ---------------------------------------------------------------------------
# Assignment submissions
# ---------------------------------------------------------------------------

@learning_router.post("/api/v1/lessons/{lesson_id}/submit")
async def submit_assignment(request: Request, lesson_id: int):
    user = _require_user(request)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = _db(request)
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise NotFoundError("Lesson not found")
    body = await request.json()
    content = str(body.get("content", ""))
    if not content.strip():
        raise ValidationError("Submission content is required")
    submission = Submission(user_id=user.id, lesson_id=lesson.id, content=content)
    db.add(submission)
    db.commit()
    return {"status": "submitted", "submission_id": submission.id}


# ---------------------------------------------------------------------------
# Certificates, skills passport, portfolio pages
# ---------------------------------------------------------------------------

@learning_router.get("/app/certificates", response_class=HTMLResponse)
def certificates_page(request: Request):
    user = _require_user(request)
    if user is None:
        return RedirectResponse("/auth/sign-in", status_code=302)
    db = _db(request)
    from app.models.learning import Certificate

    certificates = (
        db.query(Certificate)
        .filter(Certificate.user_id == user.id)
        .order_by(Certificate.issued_at.desc())
        .all()
    )
    return templates.TemplateResponse("app/certificates.html", {"request": request, "certificates": certificates})


@learning_router.get("/app/skills", response_class=HTMLResponse)
def skills_passport(request: Request):
    user = _require_user(request)
    if user is None:
        return RedirectResponse("/auth/sign-in", status_code=302)
    db = _db(request)
    from app.models.learning import Certificate, Enrollment, SkillEvidence, SkillDefinition

    certificates = db.query(Certificate).filter(Certificate.user_id == user.id).all()
    enrollments = db.query(Enrollment).filter(Enrollment.user_id == user.id).all()
    evidence = db.query(SkillEvidence).filter(SkillEvidence.user_id == user.id).all()
    return templates.TemplateResponse(
        "app/skills.html",
        {"request": request, "certificates": certificates, "enrollments": enrollments, "evidence": evidence},
    )


@learning_router.get("/app/portfolio", response_class=HTMLResponse)
def portfolio_page(request: Request):
    user = _require_user(request)
    if user is None:
        return RedirectResponse("/auth/sign-in", status_code=302)
    db = _db(request)
    from app.models.learning import PortfolioItem

    items = db.query(PortfolioItem).filter(PortfolioItem.user_id == user.id).order_by(PortfolioItem.created_at.desc()).all()
    return templates.TemplateResponse("app/portfolio.html", {"request": request, "items": items})


@learning_router.get("/app/notes", response_class=HTMLResponse)
def notes_page(request: Request):
    user = _require_user(request)
    if user is None:
        return RedirectResponse("/auth/sign-in", status_code=302)
    return templates.TemplateResponse("app/notes.html", {"request": request})


@learning_router.get("/app/bookmarks", response_class=HTMLResponse)
def bookmarks_page(request: Request):
    user = _require_user(request)
    if user is None:
        return RedirectResponse("/auth/sign-in", status_code=302)
    return templates.TemplateResponse("app/bookmarks.html", {"request": request})


@learning_router.get("/app/assignments", response_class=HTMLResponse)
def assignments_page(request: Request):
    user = _require_user(request)
    if user is None:
        return RedirectResponse("/auth/sign-in", status_code=302)
    db = _db(request)
    from app.models.learning import Submission

    submissions = (
        db.query(Submission)
        .filter(Submission.user_id == user.id)
        .order_by(Submission.submitted_at.desc())
        .limit(20)
        .all()
    )
    return templates.TemplateResponse("app/assignments.html", {"request": request, "submissions": submissions})


@learning_router.get("/app/quizzes", response_class=HTMLResponse)
def quizzes_page(request: Request):
    user = _require_user(request)
    if user is None:
        return RedirectResponse("/auth/sign-in", status_code=302)
    db = _db(request)
    from app.models.learning import AssessmentAttempt

    attempts = (
        db.query(AssessmentAttempt)
        .filter(AssessmentAttempt.user_id == user.id)
        .order_by(AssessmentAttempt.id.desc())
        .limit(20)
        .all()
    )
    return templates.TemplateResponse("app/quizzes.html", {"request": request, "attempts": attempts})


@learning_router.get("/certificates/verify/{code}", response_class=HTMLResponse)
def verify_certificate(request: Request, code: str):
    db = _db(request)
    from app.models.learning import Certificate

    certificate = db.query(Certificate).filter(Certificate.verification_code == code).first()
    if not certificate or certificate.revoked:
        return templates.TemplateResponse(
            "public/certificate_verify.html",
            {"request": request, "certificate": None, "revoked": bool(certificate and certificate.revoked)},
        )
    course = db.query(Course).filter(Course.id == certificate.course_id).first()
    return templates.TemplateResponse(
        "public/certificate_verify.html",
        {"request": request, "certificate": certificate, "course": course, "revoked": False},
    )
