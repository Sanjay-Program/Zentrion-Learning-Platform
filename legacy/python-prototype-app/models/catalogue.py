"""Learning catalogue models."""
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


class CourseStatus(str, enum.Enum):
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class LessonType(str, enum.Enum):
    VIDEO = "video"
    READING = "reading"
    TEXT = "text"
    QUIZ = "quiz"
    ASSIGNMENT = "assignment"
    PROJECT = "project"
    LAB = "lab"


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True)
    name: Mapped[str] = mapped_column(String(120))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    parent_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True)
    name: Mapped[str] = mapped_column(String(120))


course_tags = Table(
    "course_tags",
    Base.metadata,
    mapped_column("course_id", Integer, ForeignKey("courses.id", ondelete="CASCADE"), primary_key=True),
    mapped_column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    subtitle: Mapped[Optional[str]] = mapped_column(String(400), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[CourseStatus] = mapped_column(String(24), default=CourseStatus.DRAFT)
    category_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    level: Mapped[str] = mapped_column(String(40), default="beginner")
    language: Mapped[str] = mapped_column(String(10), default="en")
    estimated_hours: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    price_cents: Mapped[int] = mapped_column(Integer, default=0)
    currency: Mapped[str] = mapped_column(String(8), default="USD")
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    instructor_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    review_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    modules: Mapped[list["Module"]] = relationship(back_populates="course", cascade="all, delete-orphan", order_by="Module.order_index")
    tags_rel: Mapped[list["Tag"]] = relationship(secondary=course_tags, back_populates="courses_rel")
    category: Mapped[Optional["Category"]] = relationship()

    @property
    def is_free(self) -> bool:
        return self.price_cents <= 0


class Module(Base):
    __tablename__ = "course_modules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    course_id: Mapped[int] = mapped_column(Integer, ForeignKey("courses.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    course: Mapped["Course"] = relationship(back_populates="modules")
    lessons: Mapped[list["Lesson"]] = relationship(back_populates="module", cascade="all, delete-orphan", order_by="Lesson.order_index")


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    module_id: Mapped[int] = mapped_column(Integer, ForeignKey("course_modules.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(200))
    lesson_type: Mapped[LessonType] = mapped_column(String(24), default=LessonType.TEXT)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # markdown
    duration_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    video_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    is_preview: Mapped[bool] = mapped_column(Boolean, default=False)
    assessment_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("assessments.id", ondelete="SET NULL"), nullable=True)
    lab_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("lab_definitions.id", ondelete="SET NULL"), nullable=True)

    module: Mapped["Module"] = relationship(back_populates="lessons")
    blocks: Mapped[list["LessonBlock"]] = relationship(back_populates="lesson", cascade="all, delete-orphan", order_by="LessonBlock.order_index")


class LessonBlock(Base):
    __tablename__ = "lesson_blocks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lesson_id: Mapped[int] = mapped_column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"))
    block_type: Mapped[str] = mapped_column(String(32))  # heading | text | code | video | callout | exercise
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    meta: Mapped[list] = mapped_column(JSON, default=dict)

    lesson: Mapped["Lesson"] = relationship(back_populates="blocks")


class LearningPath(Base):
    __tablename__ = "learning_paths"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    level: Mapped[str] = mapped_column(String(40), default="beginner")
    estimated_hours: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    items: Mapped[list["LearningPathItem"]] = relationship(back_populates="path", cascade="all, delete-orphan", order_by="LearningPathItem.order_index")


class LearningPathItem(Base):
    __tablename__ = "learning_path_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    path_id: Mapped[int] = mapped_column(Integer, ForeignKey("learning_paths.id", ondelete="CASCADE"))
    course_id: Mapped[int] = mapped_column(Integer, ForeignKey("courses.id", ondelete="CASCADE"))
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    is_required: Mapped[bool] = mapped_column(Boolean, default=True)

    path: Mapped["LearningPath"] = relationship(back_populates="items")
    course: Mapped["Course"] = relationship()


class MediaAsset(Base):
    __tablename__ = "media_assets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    storage_key: Mapped[str] = mapped_column(String(512))
    original_filename: Mapped[str] = mapped_column(String(255))
    mime_type: Mapped[str] = mapped_column(String(120))
    size_bytes: Mapped[int] = mapped_column(Integer, default=0)
    kind: Mapped[str] = mapped_column(String(40), default="attachment")  # video | caption | attachment | avatar
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class CourseReview(Base):
    __tablename__ = "course_reviews"
    __table_args__ = (UniqueConstraint("course_id", "user_id", name="uq_course_review"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    course_id: Mapped[int] = mapped_column(Integer, ForeignKey("courses.id", ondelete="CASCADE"))
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    rating: Mapped[int] = mapped_column(Integer)  # 1..5
    title: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    body: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class InstructorApplication(Base):
    __tablename__ = "instructor_applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    expertise: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    status: Mapped[str] = mapped_column(String(24), default="pending")  # pending | approved | rejected
    decided_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
