"""Onboarding and personalised recommendations."""
from __future__ import annotations

from typing import Optional

from sqlalchemy.orm import Session

from app.models.catalogue import Course
from app.models.identity import User

INTEREST_OPTIONS = [
    "ai", "prompt-engineering", "agentic-ai", "ai-apps",
    "cybersecurity", "python", "data-science", "devops",
    "cloud", "career-development",
]
ROLE_OPTIONS = [
    "student", "developer", "ai-engineer", "cybersecurity-professional",
    "business-owner", "educator", "data-analyst", "it-professional",
]
GOAL_OPTIONS = [
    "learn-ai-fundamentals", "build-ai-apps", "become-ai-engineer",
    "cybersecurity-career", "career-advancement", "academic-study",
]
LEVEL_OPTIONS = ["beginner", "intermediate", "advanced"]

INTEREST_TO_CATEGORY: dict[str, str] = {
    "ai": "artificial-intelligence",
    "prompt-engineering": "prompt-engineering",
    "agentic-ai": "agentic-ai",
    "cybersecurity": "cybersecurity",
    "python": "programming",
}


def generate_recommendations(db: Session, user: User, limit: int = 6) -> list[dict]:
    """Explainable recommendations from interests and enrolment state."""
    profile = user.profile
    interests = (profile.interests if profile else []) or []

    # Build candidate courses matching interests
    candidates: list[tuple[int, Course]] = []
    if interests:
        category_slugs = [INTEREST_TO_CATEGORY.get(i) for i in interests if i in INTEREST_TO_CATEGORY]
        if category_slugs:
            for course in (
                db.query(Course)
                .filter(Course.status == "published", Course.is_published.is_(True))
                .all()
            ):
                course_category = (
                    db.query(__import__("app.models.catalogue", fromlist=["Category"]).Category)
                    .filter(__import__("app.models.catalogue", fromlist=["Category"]).Category.id == course.category_id)
                    .first()
                )
                if course_category and course_category.slug in category_slugs:
                    candidates.append((2, course))
    # Fill remaining with featured courses
    for course in (
        db.query(Course)
        .filter(Course.status == "published", Course.is_published.is_(True))
        .order_by(Course.is_featured.desc())
        .limit(limit)
        .all()
    ):
        candidates.append((1, course))

    seen: set[int] = set()
    recommendations = []
    for score, course in sorted(candidates, key=lambda x: -x[0]):
        if course.id in seen:
            continue
        seen.add(course.id)
        recommendations.append(
            {
                "id": course.id,
                "slug": course.slug,
                "title": course.title,
                "level": course.level,
                "estimated_hours": course.estimated_hours,
                "is_free": course.is_free,
                "reason": "Matches your interests" if score == 2 else "Popular on Zentrion",
            }
        )
        if len(recommendations) >= limit:
            break
    return recommendations


def learning_plan(db: Session, user: User) -> dict:
    """Generate an editable learning plan from goals and availability."""
    profile = user.profile
    weekly_hours = (profile.weekly_hours if profile else None) or 4
    recommendations = generate_recommendations(db, user, limit=4)
    total_hours = sum(r["estimated_hours"] or 0 for r in recommendations)
    weeks = max(1, round(total_hours / max(1, weekly_hours)))
    return {
        "courses": recommendations,
        "weekly_hours": weekly_hours,
        "estimated_weeks": weeks,
        "milestones": [
            {"week": 1, "goal": "Complete onboarding and set up your learning calendar"},
            {"week": max(2, weeks // 2), "goal": "Finish the first course and its practice exercises"},
            {"week": weeks, "goal": "Complete the capstone project and review your skills passport"},
        ],
    }
