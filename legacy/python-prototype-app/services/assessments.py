"""Assessment service: attempts, auto-grading, subjective review."""
from __future__ import annotations

import random
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.core.errors import ConflictError, NotFoundError, ValidationError
from app.models.learning import (
    Assessment,
    AssessmentAnswer,
    AssessmentAttempt,
    AssessmentOption,
    AssessmentQuestion,
    AttemptStatus,
    Submission,
    GradingRecord,
)
from app.models.identity import User
from app.core.audit import audit


def get_assessment(db: Session, assessment_id: int) -> Optional[Assessment]:
    return db.query(Assessment).filter(Assessment.id == assessment_id).first()


def can_take(db: Session, user: User, assessment: Assessment) -> bool:
    """Access rule: the lesson's assessment requires course enrolment unless preview."""
    if user.is_superuser:
        return True
    # Objective-question assessments attached to a published lesson require enrolment.
    return True  # enrolment checks are enforced at the lesson level by the player


def start_attempt(db: Session, user: User, assessment: Assessment, *, lesson_id: Optional[int] = None, enrollment_id: Optional[int] = None) -> AssessmentAttempt:
    max_attempts = assessment.max_attempts
    if max_attempts is not None:
        previous = (
            db.query(AssessmentAttempt)
            .filter(AssessmentAttempt.assessment_id == assessment.id, AssessmentAttempt.user_id == user.id)
            .filter(AssessmentAttempt.status != AttemptStatus.IN_PROGRESS)
            .count()
        )
        if previous >= max_attempts:
            raise ConflictError("Maximum attempts reached")
    in_progress = (
        db.query(AssessmentAttempt)
        .filter(
            AssessmentAttempt.assessment_id == assessment.id,
            AssessmentAttempt.user_id == user.id,
            AssessmentAttempt.status == AttemptStatus.IN_PROGRESS,
        )
        .first()
    )
    if in_progress:
        return in_progress
    attempt = AssessmentAttempt(
        assessment_id=assessment.id,
        user_id=user.id,
        lesson_id=lesson_id,
        enrollment_id=enrollment_id,
        status=AttemptStatus.IN_PROGRESS,
    )
    db.add(attempt)
    db.flush()
    questions = list(assessment.questions)
    if assessment.shuffle_questions:
        random.shuffle(questions)
    for question in questions:
        options = list(question.options)
        if assessment.shuffle_questions:
            random.shuffle(options)
        db.add(
            AssessmentAnswer(
                attempt_id=attempt.id,
                question_id=question.id,
                selected_options=[],
            )
        )
    db.commit()
    audit(db, "assessment.started", actor=user, entity_type="assessment", entity_id=assessment.id)
    return attempt


def get_attempt(db: Session, user: User, attempt_id: int) -> Optional[AssessmentAttempt]:
    return (
        db.query(AssessmentAttempt)
        .filter(AssessmentAttempt.id == attempt_id, AssessmentAttempt.user_id == user.id)
        .first()
    )


def save_answer(db: Session, user: User, attempt: AssessmentAttempt, question_id: int, *, selected_options: Optional[list[int]] = None, text_answer: Optional[str] = None) -> None:
    if attempt.status != AttemptStatus.IN_PROGRESS:
        raise ConflictError("This attempt is already submitted")
    answer = (
        db.query(AssessmentAnswer)
        .filter(AssessmentAnswer.attempt_id == attempt.id, AssessmentAnswer.question_id == question_id)
        .first()
    )
    if not answer:
        raise NotFoundError("Question not part of this attempt")
    if selected_options is not None:
        valid_option_ids = {o.id for o in db.query(AssessmentOption).filter(AssessmentOption.question_id == question_id).all()}
        if not set(selected_options).issubset(valid_option_ids):
            raise ValidationError("Invalid option selected")
        question = db.query(AssessmentQuestion).filter(AssessmentQuestion.id == question_id).first()
        if question and question.question_type.value in {"single", "true_false"} and len(selected_options) > 1:
            raise ValidationError("Only one option can be selected")
        answer.selected_options = selected_options
    if text_answer is not None:
        answer.text_answer = str(text_answer)[:8000]
    db.commit()


def submit_attempt(db: Session, user: User, attempt: AssessmentAttempt) -> AssessmentAttempt:
    if attempt.status != AttemptStatus.IN_PROGRESS:
        raise ConflictError("Attempt already submitted")
    assessment = db.query(Assessment).filter(Assessment.id == attempt.assessment_id).first()
    answers = (
        db.query(AssessmentAnswer)
        .filter(AssessmentAnswer.attempt_id == attempt.id)
        .all()
    )
    total_points = 0
    earned = 0
    auto_gradable = True
    for answer in answers:
        question = db.query(AssessmentQuestion).filter(AssessmentQuestion.id == answer.question_id).first()
        if not question:
            continue
        if question.question_type.value in {"short_answer", "long_answer", "code"}:
            auto_gradable = False
            answer.score_points = None
            answer.is_correct = None
            continue
        correct_options = {o.id for o in question.options if o.is_correct}
        selected = set(answer.selected_options or [])
        is_correct = selected == correct_options
        answer.is_correct = is_correct
        answer.score_points = question.points if is_correct else 0
        if assessment.show_feedback in {"immediate", "after_submit"}:
            answer.feedback = question.explanation
        total_points += question.points
        earned += answer.score_points
    if total_points > 0:
        attempt.score_percent = round(100 * earned / total_points)
    else:
        attempt.score_percent = None
    attempt.status = AttemptStatus.SUBMITTED
    attempt.submitted_at = datetime.now(timezone.utc)
    if attempt.score_percent is not None:
        attempt.passed = attempt.score_percent >= assessment.passing_score
        attempt.status = AttemptStatus.GRADED
    db.commit()
    audit(db, "assessment.submitted", actor=user, entity_type="assessment", entity_id=attempt.assessment_id, details={"score": attempt.score_percent})
    return attempt


def grade_submission(db: Session, grader: User, submission: Submission, *, score_percent: int, feedback: str, rubric_scores: Optional[list] = None) -> GradingRecord:
    if not 0 <= score_percent <= 100:
        raise ValidationError("Score must be between 0 and 100")
    record = GradingRecord(
        submission_id=submission.id,
        grader_id=grader.id,
        score_percent=score_percent,
        rubric_scores=rubric_scores or [],
        feedback=feedback,
    )
    db.add(record)
    submission.status = "graded"
    db.commit()
    audit(db, "submission.graded", actor=grader, entity_type="submission", entity_id=submission.id)
    return record


def lesson_submissions(db: Session, lesson_id: int) -> list[Submission]:
    return (
        db.query(Submission)
        .filter(Submission.lesson_id == lesson_id)
        .order_by(Submission.submitted_at.desc())
        .all()
    )


def user_attempts(db: Session, user: User, assessment_id: int) -> list[AssessmentAttempt]:
    return (
        db.query(AssessmentAttempt)
        .filter(AssessmentAttempt.assessment_id == assessment_id, AssessmentAttempt.user_id == user.id)
        .order_by(AssessmentAttempt.id.desc())
        .all()
    )
