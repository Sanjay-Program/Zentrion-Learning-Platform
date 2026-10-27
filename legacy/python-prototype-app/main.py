"""FastAPI application factory, middleware and routing."""
from __future__ import annotations

import logging
import time
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.config import BASE_DIR, get_settings, validate_startup
from app.core.audit import audit
from app.core.rbac import ensure_roles_and_permissions
from app.database import engine, init_db

logger = logging.getLogger("zention")

settings = get_settings()

TEMPLATES_DIR = Path(__file__).resolve().parent / "templates"
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))


@asynccontextmanager
async def lifespan(app: FastAPI):
    problems = validate_startup()
    for p in problems:
        logger.warning("Configuration problem: %s", p)
    init_db()
    db = next(iter([None]))  # placeholder to satisfy typing; real session below
    from app.database import SessionLocal

    with SessionLocal() as session:
        ensure_roles_and_permissions(session)
    logger.info("Application started (%s)", settings.app_env)
    yield
    logger.info("Application shutting down")


app = FastAPI(
    title="Zentrion Learntech",
    description="Integrated AI, practical-skills and cybersecurity learning platform",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.app_base_url.rstrip("/"), "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    csp = (
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'"
    )
    response.headers.setdefault("Content-Security-Policy", csp)
    if settings.is_production:
        response.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    return response


@app.middleware("http")
async def session_middleware(request: Request, call_next):
    """Attach the authenticated user and a request-scoped DB session."""
    from app.database import SessionLocal

    db = SessionLocal()
    request.state.db = db
    try:
        token = request.cookies.get("zsession")
        if token:
            from app.core.security import validate_session

            user = validate_session(db, token)
            request.state.user = user
            if user is not None:
                request.state.user_id = user.id
        if "zcsrftoken" not in request.cookies:
            from app.core.security import generate_token

            request.state.new_csrf = generate_token(24)
        response = await call_next(request)
    finally:
        db.close()
    new_csrf = getattr(request.state, "new_csrf", None)
    if new_csrf:
        response.set_cookie(
            key="zcsrftoken",
            value=new_csrf,
            httponly=False,
            samesite="lax",
            secure=settings.is_production,
            max_age=60 * 60 * 24 * 30,
        )
    return response


@app.middleware("http")
async def request_logging(request: Request, call_next):
    started = time.perf_counter()
    response = await call_next(request)
    duration_ms = int((time.perf_counter() - started) * 1000)
    logger.info("%s %s -> %s (%dms)", request.method, request.url.path, response.status_code, duration_ms)
    return response


# --- Static files and templates ---
static_dir = Path(__file__).resolve().parent / "static"
static_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    if request.url.path.startswith("/api/"):
        return JSONResponse({"error": {"code": "not_found", "message": "Resource not found"}}, status_code=404)
    return templates.TemplateResponse("errors/404.html", {"request": request}, status_code=404)


@app.exception_handler(403)
async def forbidden_handler(request: Request, exc):
    if request.url.path.startswith("/api/"):
        return JSONResponse({"error": {"code": "forbidden", "message": "Forbidden"}}, status_code=403)
    return templates.TemplateResponse("errors/403.html", {"request": request}, status_code=403)


@app.exception_handler(500)
async def server_error_handler(request: Request, exc):
    logger.exception("Unhandled server error on %s", request.url.path)
    if request.url.path.startswith("/api/"):
        return JSONResponse({"error": {"code": "internal_error", "message": "Internal server error"}}, status_code=500)
    return templates.TemplateResponse("errors/500.html", {"request": request}, status_code=500)


# Register routers
from app.api import (  # noqa: E402
    admin_router,
    ai_router,
    auth_router,
    commerce_router,
    courses_router,
    cyber_router,
    instructor_router,
    learning_router,
    notifications_router,
    organizations_router,
    public_router,
    webhooks_router,
)

for router in (
    public_router,
    auth_router,
    courses_router,
    learning_router,
    ai_router,
    cyber_router,
    instructor_router,
    organizations_router,
    commerce_router,
    notifications_router,
    admin_router,
    webhooks_router,
):
    app.include_router(router)
