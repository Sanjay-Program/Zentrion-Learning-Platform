"""Cybersecurity lab models."""
from __future__ import annotations

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
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base


class LabDefinition(Base):
    __tablename__ = "lab_definitions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    lab_type: Mapped[str] = mapped_column(String(40))  # linux | networking | web_security | soc | forensics | cloud | detection | llm_security | ctf
    difficulty: Mapped[str] = mapped_column(String(40), default="beginner")
    objectives: Mapped[list] = mapped_column(JSON, default=list)
    instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # markdown
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=30)
    # Lab engine configuration (validated by the lab executor)
    engine_config: Mapped[list] = mapped_column(JSON, default=dict)
    grading_rubric: Mapped[list] = mapped_column(JSON, default=list)
    ttl_minutes: Mapped[int] = mapped_column(Integer, default=120)
    safety_classification: Mapped[str] = mapped_column(String(40), default="simulated")
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    sessions: Mapped[list["LabSession"]] = relationship(back_populates="lab")


class LabSessionStatus(str):
    AVAILABLE = "available"
    PROVISIONING = "provisioning"
    RUNNING = "running"
    SUBMITTED = "submitted"
    EXPIRED = "expired"
    STOPPING = "stopping"
    STOPPED = "stopped"
    FAILED = "failed"


class LabSession(Base):
    __tablename__ = "lab_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lab_id: Mapped[int] = mapped_column(Integer, ForeignKey("lab_definitions.id", ondelete="CASCADE"))
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    status: Mapped[str] = mapped_column(String(24), default=LabSessionStatus.PROVISIONING)
    environment_version: Mapped[str] = mapped_column(String(40), default="1.0")
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    state: Mapped[list] = mapped_column(JSON, default=dict)  # executor-managed sandbox state
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    lab: Mapped["LabDefinition"] = relationship(back_populates="sessions")
    events: Mapped[list["LabEvent"]] = relationship(back_populates="session", cascade="all, delete-orphan")
    grade: Mapped[Optional["LabGrade"]] = relationship(back_populates="session", cascade="all, delete-orphan", uselist=False)


class LabEvent(Base):
    __tablename__ = "lab_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[int] = mapped_column(Integer, ForeignKey("lab_sessions.id", ondelete="CASCADE"))
    event_type: Mapped[str] = mapped_column(String(60))  # lifecycle | command | milestone | submission
    details: Mapped[Optional[str]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    session: Mapped["LabSession"] = relationship(back_populates="events")


class LabGrade(Base):
    __tablename__ = "lab_grades"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[int] = mapped_column(Integer, ForeignKey("lab_sessions.id", ondelete="CASCADE"))
    score_percent: Mapped[int] = mapped_column(Integer)
    rubric_scores: Mapped[list] = mapped_column(JSON, default=list)
    feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    graded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    session: Mapped["LabSession"] = relationship(back_populates="grade")


class LabEvidence(Base):
    __tablename__ = "lab_evidence"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[int] = mapped_column(Integer, ForeignKey("lab_sessions.id", ondelete="CASCADE"))
    kind: Mapped[str] = mapped_column(String(60))  # command_log | file | report | flag
    reference: Mapped[str] = mapped_column(String(512))
    details: Mapped[Optional[str]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ChallengeDefinition(Base):
    __tablename__ = "challenge_definitions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(60), default="general")
    difficulty: Mapped[str] = mapped_column(String(40), default="easy")
    points: Mapped[int] = mapped_column(Integer, default=100)
    flag_hash: Mapped[str] = mapped_column(String(128))  # hashed flag, never stored in plain text
    hints: Mapped[list] = mapped_column(JSON, default=list)
    max_attempts: Mapped[int] = mapped_column(Integer, default=10)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    attempts: Mapped[list["ChallengeAttempt"]] = relationship(back_populates="challenge")


class ChallengeAttempt(Base):
    __tablename__ = "challenge_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    challenge_id: Mapped[int] = mapped_column(Integer, ForeignKey("challenge_definitions.id", ondelete="CASCADE"))
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    submitted_flag_hash: Mapped[str] = mapped_column(String(128))
    correct: Mapped[bool] = mapped_column(Boolean)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    challenge: Mapped["ChallengeDefinition"] = relationship(back_populates="attempts")
