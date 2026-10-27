"""Learning activity, assessments and credentials models."""
from __future__ import annotations

import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base


class EnrollmentStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    DROPPED = "dropped"


class Enrollment(Base):
    __tablename__ = "enrollments"
    __table_args__ = (UniqueConstraint("user_id", "course_id", name="uq_enrollment"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    course_id: Mapped[int] = mapped_column(Integer, ForeignKey("courses.id", ondelete="CASCADE"))
    status: Mapped[EnrollmentStatus] = mapped_column(String(24), default=EnrollmentStatus.ACTIVE)
    source: Mapped[str] = mapped_column(String(32), default="direct")  # direct | purchase | organization | path
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_accessed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class LessonProgress(Base):
    __tablename__ = "lesson_progress"
    __table_args__ = (UniqueConstraint("enrollment_id", "lesson_id", name="uq_lesson_progress"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    enrollment_id: Mapped[int] = mapped_column(Integer, ForeignKey("enrollments.id", ondelete="CASCADE"))
    lesson_id: Mapped[int] = mapped_column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"))
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    position_seconds: Mapped[int] = mapped_column(Integer, default=0)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class LessonBookmark(Base):
    __tablename__ = "lesson_bookmarks"
    __table_args__ = (UniqueConstraint("user_id", "lesson_id", name="uq_bookmark"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    lesson_id: Mapped[int] = mapped_column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"))
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class LearnerNote(Base):
    __tablename__ = "learner_notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    lesson_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=True)
    content: Mapped[str] = mapped_column(Text)
    tags: Mapped[list] = mapped_column(JSON, default=list)
    video_timestamp: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class QuestionType(str, enum.Enum):
    SINGLE = "single"
    MULTIPLE = "multiple"
    TRUE_FALSE = "true_false"
    SHORT_ANSWER = "short_answer"
    LONG_ANSWER = "long_answer"
    CODE = "code"


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    course_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    time_limit_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    passing_score: Mapped[int] = mapped_column(Integer, default=70)  # percent
    max_attempts: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    shuffle_questions: Mapped[bool] = mapped_column(Boolean, default=False)
    show_feedback: Mapped[str] = mapped_column(String(20), default="after_submit")  # immediate | after_submit | never
    created_by: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    questions: Mapped[list["AssessmentQuestion"]] = relationship(back_populates="assessment", cascade="all, delete-orphan", order_by="AssessmentQuestion.order_index")


class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    assessment_id: Mapped[int] = mapped_column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"))
    question_type: Mapped[QuestionType] = mapped_column(String(24))
    prompt: Mapped[str] = mapped_column(Text)
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    points: Mapped[int] = mapped_column(Integer, default=1)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    assessment: Mapped["Assessment"] = relationship(back_populates="questions")
    options: Mapped[list["AssessmentOption"]] = relationship(back_populates="question", cascade="all, delete-orphan", order_by="AssessmentOption.order_index")


class AssessmentOption(Base):
    __tablename__ = "assessment_options"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    question_id: Mapped[int] = mapped_column(Integer, ForeignKey("assessment_questions.id", ondelete="CASCADE"))
    text: Mapped[str] = mapped_column(Text)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    question: Mapped["AssessmentQuestion"] = relationship(back_populates="options")


class AttemptStatus(str, enum.Enum):
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    GRADED = "graded"


class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    assessment_id: Mapped[int] = mapped_column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"))
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    enrollment_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("enrollments.id", ondelete="CASCADE"), nullable=True)
    lesson_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=True)
    status: Mapped[AttemptStatus] = mapped_column(String(24), default=AttemptStatus.IN_PROGRESS)
    score_percent: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    passed: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    answers: Mapped[list["AssessmentAnswer"]] = relationship(back_populates="attempt", cascade="all, delete-orphan")


class AssessmentAnswer(Base):
    __tablename__ = "assessment_answers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    attempt_id: Mapped[int] = mapped_column(Integer, ForeignKey("assessment_attempts.id", ondelete="CASCADE"))
    question_id: Mapped[int] = mapped_column(Integer, ForeignKey("assessment_questions.id", ondelete="CASCADE"))
    selected_options: Mapped[list] = mapped_column(JSON, default=list)  # option ids
    text_answer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_correct: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    score_points: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    attempt: Mapped["AssessmentAttempt"] = relationship(back_populates="answers")


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    lesson_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=True)
    project_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("project_definitions.id", ondelete="CASCADE"), nullable=True)
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # text answer / description
    storage_keys: Mapped[list] = mapped_column(JSON, default=list)  # attached files
    status: Mapped[str] = mapped_column(String(24), default="submitted")  # submitted | graded | revision_requested
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    grading: Mapped[Optional["GradingRecord"]] = relationship(back_populates="submission", cascade="all, delete-orphan", uselist=False)


class GradingRecord(Base):
    __tablename__ = "grading_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    submission_id: Mapped[int] = mapped_column(Integer, ForeignKey("submissions.id", ondelete="CASCADE"))
    grader_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    score_percent: Mapped[int] = mapped_column(Integer)
    rubric_scores: Mapped[list] = mapped_column(JSON, default=list)
    feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_ai_suggestion: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    submission: Mapped["Submission"] = relationship(back_populates="grading")


class Certificate(Base):
    __tablename__ = "certificates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    course_id: Mapped[int] = mapped_column(Integer, ForeignKey("courses.id", ondelete="CASCADE"))
    verification_code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    revoked: Mapped[bool] = mapped_column(Boolean, default=False)
    revoked_reason: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)

    events: Mapped[list["CertificateEvent"]] = relationship(back_populates="certificate", cascade="all, delete-orphan")


class CertificateEvent(Base):
    __tablename__ = "certificate_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    certificate_id: Mapped[int] = mapped_column(Integer, ForeignKey("certificates.id", ondelete="CASCADE"))
    event_type: Mapped[str] = mapped_column(String(40))  # issued | revoked | verified
    actor_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    details: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    certificate: Mapped["Certificate"] = relationship(back_populates="events")


class SkillDefinition(Base):
    __tablename__ = "skill_definitions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True)
    name: Mapped[str] = mapped_column(String(120))
    category: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)


class SkillEvidence(Base):
    __tablename__ = "skill_evidence"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    skill_id: Mapped[int] = mapped_column(Integer, ForeignKey("skill_definitions.id", ondelete="CASCADE"))
    evidence_type: Mapped[str] = mapped_column(String(40))  # course | project | assessment | lab
    reference_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    note: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class PortfolioItem(Base):
    __tablename__ = "portfolio_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    project_submission_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    visibility: Mapped[str] = mapped_column(String(16), default="public")  # public | unlisted | private
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ProjectDefinition(Base):
    __tablename__ = "project_definitions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    brief: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # markdown
    level: Mapped[str] = mapped_column(String(40), default="intermediate")
    category_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    rubric: Mapped[list] = mapped_column(JSON, default=list)
    milestones: Mapped[list] = mapped_column(JSON, default=list)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ProjectSubmission(Base):
    __tablename__ = "project_submissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("project_definitions.id", ondelete="CASCADE"))
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    storage_keys: Mapped[list] = mapped_column(JSON, default=list)
    milestone_index: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(24), default="submitted")
    feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    score_percent: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Achievement(Base):
    __tablename__ = "achievements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    key: Mapped[str] = mapped_column(String(80))
    title: Mapped[str] = mapped_column(String(160))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    earned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
