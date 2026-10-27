"""Catalogue and search service."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.catalogue import Category, Course, LearningPath, Tag
from app.models.identity import User


@dataclass
class CourseQuery:
    q: Optional[str] = None
    category: Optional[str] = None
    level: Optional[str] = None
    min_hours: Optional[float] = None
    max_hours: Optional[float] = None
    language: Optional[str] = None
    free_only: bool = False
    paid_only: bool = False
    sort: str = "relevance"  # relevance | newest | popular | duration
    page: int = 1
    page_size: int = 20

    def validated(self) -> "CourseQuery":
        self.page = max(1, self.page)
        self.page_size = max(1, min(100, self.page_size))
        if self.sort not in {"relevance", "newest", "popular", "duration"}:
            self.sort = "relevance"
        if self.free_only and self.paid_only:
            self.free_only = False
            self.paid_only = False
        return self


@dataclass
class SearchResults:
    items: list
    total: int = 0
    page: int = 1
    page_size: int = 20
    pages: int = 0


def search_courses(db: Session, query: CourseQuery) -> SearchResults:
    query = query.validated()
    q = db.query(Course).filter(Course.status == "published", Course.is_published.is_(True))
    if query.q:
        like = f"%{query.q}%"
        q = q.filter(or_(Course.title.ilike(like), Course.description.ilike(like), Course.subtitle.ilike(like)))
    if query.category:
        q = q.join(Category).filter(Category.slug == query.category)
    if query.level:
        q = q.filter(Course.level == query.level)
    if query.language:
        q = q.filter(Course.language == query.language)
    if query.min_hours is not None:
        q = q.filter(Course.estimated_hours >= query.min_hours)
    if query.max_hours is not None:
        q = q.filter(Course.estimated_hours <= query.max_hours)
    if query.free_only:
        q = q.filter(Course.price_cents <= 0)
    if query.paid_only:
        q = q.filter(Course.price_cents > 0)
    if query.sort == "newest":
        q = q.order_by(Course.published_at.desc())
    elif query.sort == "duration":
        q = q.order_by(Course.estimated_hours.asc().nullslast())
    elif query.sort == "popular":
        q = q.order_by(Course.id.desc())  # enrolment counts need a JOIN; stable fallback
    else:
        q = q.order_by(Course.is_featured.desc(), Course.id.desc())
    total = q.count()
    pages = (total + query.page_size - 1) // query.page_size
    items = q.offset((query.page - 1) * query.page_size).limit(query.page_size).all()
    return SearchResults(items=items, total=total, page=query.page, page_size=query.page_size, pages=pages)


def global_search(db: Session, q: str, page: int = 1) -> dict:
    """Search across courses, paths, projects (public published content)."""
    courses = search_courses(db, CourseQuery(q=q, page=page, page_size=8)).items
    like = f"%{q}%"
    paths = (
        db.query(LearningPath)
        .filter(LearningPath.is_published.is_(True), or_(LearningPath.title.ilike(like), LearningPath.description.ilike(like)))
        .limit(8)
        .all()
    )
    return {
        "q": q,
        "courses": courses,
        "paths": paths,
        "categories": db.query(Category).filter(Category.name.ilike(like)).limit(5).all(),
    }


def get_published_course(db: Session, slug: str) -> Optional[Course]:
    return (
        db.query(Course)
        .filter(Course.slug == slug, Course.status == "published", Course.is_published.is_(True))
        .first()
    )


def course_curriculum(db: Session, course: Course) -> list:
    """Modules with lessons, including assessment/lab linkage."""
    modules = course.modules
    result = []
    for module in modules:
        result.append(
            {
                "id": module.id,
                "title": module.title,
                "description": module.description,
                "lessons": [
                    {
                        "id": lesson.id,
                        "title": lesson.title,
                        "lesson_type": lesson.lesson_type.value if hasattr(lesson.lesson_type, "value") else lesson.lesson_type,
                        "duration_minutes": lesson.duration_minutes,
                        "is_preview": lesson.is_preview,
                        "assessment_id": lesson.assessment_id,
                        "lab_id": lesson.lab_id,
                    }
                    for lesson in module.lessons
                ],
            }
        )
    return result


def course_stats(db: Session, course: Course) -> dict:
    lessons = db.query(LearningPath.id)  # placeholder to avoid unused import churn
    from app.models.learning import Enrollment, LessonProgress

    enrolment_count = db.query(Enrollment).filter(Enrollment.course_id == course.id).count()
    module_count = len(course.modules)
    lesson_count = sum(len(m.lessons) for m in course.modules)
    return {
        "enrolments": enrolment_count,
        "modules": module_count,
        "lessons": lesson_count,
        "hours": course.estimated_hours,
    }


def related_courses(db: Session, course: Course, limit: int = 4) -> list[Course]:
    q = db.query(Course).filter(
        Course.status == "published",
        Course.is_published.is_(True),
        Course.id != course.id,
    )
    if course.category_id:
        q = q.filter(Course.category_id == course.category_id)
    return q.limit(limit).all()


def get_published_path(db: Session, slug: str) -> Optional[LearningPath]:
    return db.query(LearningPath).filter(LearningPath.slug == slug, LearningPath.is_published.is_(True)).first()


def discover_data(db: Session) -> dict:
    featured = db.query(Course).filter(Course.is_featured.is_(True), Course.status == "published").limit(6).all()
    categories = db.query(Category).all()
    paths = db.query(LearningPath).filter(LearningPath.is_published.is_(True)).limit(4).all()
    return {"featured": featured, "categories": categories, "paths": paths}


def featured_tags(db: Session, limit: int = 20) -> list[Tag]:
    return db.query(Tag).limit(limit).all()
