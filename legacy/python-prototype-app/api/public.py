"""Public website routes (server-rendered) and public JSON API."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Query, Request
from fastapi.responses import HTMLResponse

from app.main import templates
from app.models.catalogue import Category, CourseReview, LearningPath
from app.models.commerce import LiveSession
from app.models.labs import LabDefinition
from app.services import catalogue as catalogue_service
from app.services.catalogue import CourseQuery, search_courses
from app.services.enrollment import has_course_access

public_router = APIRouter(tags=["public"])


def _ctx(request: Request, **extra) -> dict:
    ctx: dict = {"request": request}
    ctx.update(extra)
    return ctx


# ---------------------------------------------------------------------------
# Public JSON API
# ---------------------------------------------------------------------------

@public_router.get("/api/v1/courses")
def api_courses(
    q: Optional[str] = None,
    category: Optional[str] = None,
    level: Optional[str] = None,
    language: Optional[str] = None,
    free: Optional[bool] = None,
    sort: str = "relevance",
    page: int = 1,
    page_size: int = 20,
    request: Request = None,
):
    results = search_courses(
        request.state.db,
        CourseQuery(q=q, category=category, level=level, language=language, free_only=bool(free), sort=sort, page=page, page_size=page_size),
    )
    return {
        "items": [
            {
                "id": c.id,
                "slug": c.slug,
                "title": c.title,
                "subtitle": c.subtitle,
                "level": c.level,
                "language": c.language,
                "estimated_hours": c.estimated_hours,
                "price_cents": c.price_cents,
                "is_free": c.is_free,
            }
            for c in results.items
        ],
        "total": results.total,
        "page": results.page,
        "pages": results.pages,
    }


@public_router.get("/api/v1/search")
def api_search(q: str = Query(min_length=1), page: int = 1, request: Request = None):
    return catalogue_service.global_search(request.state.db, q, page)


# ---------------------------------------------------------------------------
# Website pages
# ---------------------------------------------------------------------------

@public_router.get("/", response_class=HTMLResponse)
def home(request: Request):
    db = request.state.db
    data = catalogue_service.discover_data(db)
    labs = db.query(LabDefinition).filter(LabDefinition.is_published.is_(True)).limit(4).all()
    now = datetime.now(timezone.utc)
    upcoming = (
        db.query(LiveSession)
        .filter(LiveSession.is_published.is_(True), LiveSession.starts_at > now)
        .order_by(LiveSession.starts_at)
        .limit(3)
        .all()
    )
    return templates.TemplateResponse(
        "public/home.html",
        _ctx(request, featured=data["featured"], categories=data["categories"], paths=data["paths"], labs=labs, upcoming=upcoming),
    )


@public_router.get("/discover", response_class=HTMLResponse)
def discover(
    request: Request,
    q: Optional[str] = None,
    category: Optional[str] = None,
    level: Optional[str] = None,
    language: Optional[str] = None,
    free: Optional[bool] = None,
    sort: str = "relevance",
    page: int = 1,
):
    db = request.state.db
    results = search_courses(db, CourseQuery(q=q, category=category, level=level, language=language, free_only=bool(free), sort=sort, page=page))
    categories = db.query(Category).all()
    return templates.TemplateResponse(
        "public/discover.html",
        _ctx(request, results=results, q=q, category=category, level=level, language=language, free=free, sort=sort, categories=categories),
    )


@public_router.get("/courses", response_class=HTMLResponse)
def courses_page(request: Request, q: Optional[str] = None, page: int = 1):
    db = request.state.db
    results = search_courses(db, CourseQuery(q=q, page=page))
    return templates.TemplateResponse("public/courses.html", _ctx(request, results=results, q=q))


@public_router.get("/courses/{slug}", response_class=HTMLResponse)
def course_detail(request: Request, slug: str):
    db = request.state.db
    course = catalogue_service.get_published_course(db, slug)
    if not course:
        return templates.TemplateResponse("errors/404.html", _ctx(request), status_code=404)
    user = getattr(request.state, "user", None)
    curriculum = catalogue_service.course_curriculum(db, course)
    stats = catalogue_service.course_stats(db, course)
    related = catalogue_service.related_courses(db, course)
    reviews = db.query(CourseReview).filter(CourseReview.course_id == course.id).order_by(CourseReview.id.desc()).limit(10).all()
    return templates.TemplateResponse(
        "public/course_detail.html",
        _ctx(request, course=course, curriculum=curriculum, stats=stats, related=related, reviews=reviews, has_access=has_course_access(db, user, course)),
    )


@public_router.get("/paths", response_class=HTMLResponse)
def paths_page(request: Request):
    db = request.state.db
    paths = db.query(LearningPath).filter(LearningPath.is_published.is_(True)).all()
    return templates.TemplateResponse("public/paths.html", _ctx(request, paths=paths))


@public_router.get("/paths/{slug}", response_class=HTMLResponse)
def path_detail(request: Request, slug: str):
    db = request.state.db
    path = catalogue_service.get_published_path(db, slug)
    if not path:
        return templates.TemplateResponse("errors/404.html", _ctx(request), status_code=404)
    user = getattr(request.state, "user", None)
    progress = catalogue_service.path_progress(db, user, path) if user else None
    return templates.TemplateResponse("public/path_detail.html", _ctx(request, path=path, progress=progress))


@public_router.get("/pricing", response_class=HTMLResponse)
def pricing(request: Request):
    db = request.state.db
    from app.services.commerce import product_catalogue

    products = product_catalogue(db)
    return templates.TemplateResponse("public/pricing.html", _ctx(request, products=products))


@public_router.get("/labs", response_class=HTMLResponse)
def labs_page(request: Request):
    db = request.state.db
    labs = db.query(LabDefinition).filter(LabDefinition.is_published.is_(True)).all()
    return templates.TemplateResponse("public/labs.html", _ctx(request, labs=labs))


@public_router.get("/events", response_class=HTMLResponse)
def events_page(request: Request):
    db = request.state.db
    now = datetime.now(timezone.utc)
    sessions = (
        db.query(LiveSession)
        .filter(LiveSession.is_published.is_(True), LiveSession.starts_at > now)
        .order_by(LiveSession.starts_at)
        .all()
    )
    return templates.TemplateResponse("public/events.html", _ctx(request, sessions=sessions))


@public_router.get("/instructors", response_class=HTMLResponse)
def instructors_page(request: Request):
    db = request.state.db
    from app.models.catalogue import Course
    from app.models.identity import User

    instructor_ids = [r[0] for r in db.query(Course.instructor_id).filter(Course.instructor_id.isnot(None)).distinct().all()]
    instructors = db.query(User).filter(User.id.in_(instructor_ids)).all() if instructor_ids else []
    return templates.TemplateResponse("public/instructors.html", _ctx(request, instructors=instructors))


@public_router.get("/legal/{slug}", response_class=HTMLResponse)
def legal_page(request: Request, slug: str):
    valid = {"privacy", "terms", "cookies", "refund", "acceptable-use", "security-disclosure", "accessibility", "status"}
    if slug not in valid:
        return templates.TemplateResponse("errors/404.html", _ctx(request), status_code=404)
    return templates.TemplateResponse(f"public/legal/{slug}.html", _ctx(request, slug=slug))


@public_router.get("/blog", response_class=HTMLResponse)
def blog_page(request: Request):
    return templates.TemplateResponse("public/blog.html", _ctx(request))


@public_router.get("/resources", response_class=HTMLResponse)
def resources_page(request: Request):
    return templates.TemplateResponse("public/resources.html", _ctx(request))


@public_router.get("/for-colleges", response_class=HTMLResponse)
def for_colleges(request: Request):
    return templates.TemplateResponse("public/for_colleges.html", _ctx(request))


@public_router.get("/for-enterprises", response_class=HTMLResponse)
def for_enterprises(request: Request):
    return templates.TemplateResponse("public/for_enterprises.html", _ctx(request))


@public_router.get("/become-instructor", response_class=HTMLResponse)
def become_instructor(request: Request):
    return templates.TemplateResponse("public/become_instructor.html", _ctx(request))


@public_router.get("/about", response_class=HTMLResponse)
def about(request: Request):
    return templates.TemplateResponse("public/about.html", _ctx(request))


@public_router.get("/contact", response_class=HTMLResponse)
def contact(request: Request):
    return templates.TemplateResponse("public/contact.html", _ctx(request))


@public_router.get("/help", response_class=HTMLResponse)
def help_centre(request: Request):
    return templates.TemplateResponse("public/help.html", _ctx(request))
