"""Cybersecurity academy routes: lab catalogue, lab player, CTF."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, RedirectResponse

from app.core.errors import ConflictError, ForbiddenError, NotFoundError, ValidationError
from app.main import templates
from app.models.labs import ChallengeDefinition, LabDefinition, LabSession
from app.services import labs as lab_service

cyber_router = APIRouter(tags=["cyber"])


def _user(request: Request):
    return getattr(request.state, "user", None)


def _db(request: Request):
    return request.state.db


@cyber_router.get("/cyber", response_class=HTMLResponse)
def cyber_dashboard(request: Request):
    user = _user(request)
    if user is None:
        return RedirectResponse("/auth/sign-in", status_code=302)
    db = _db(request)
    labs = db.query(LabDefinition).filter(LabDefinition.is_published.is_(True)).all()
    sessions = (
        db.query(LabSession)
        .filter(LabSession.user_id == user.id)
        .order_by(LabSession.id.desc())
        .limit(10)
        .all()
    )
    challenges = db.query(ChallengeDefinition).filter(ChallengeDefinition.is_published.is_(True)).limit(10).all()
    return templates.TemplateResponse(
        "cyber/dashboard.html",
        {"request": request, "labs": labs, "sessions": sessions, "challenges": challenges},
    )


@cyber_router.get("/cyber/roadmaps", response_class=HTMLResponse)
def cyber_roadmaps(request: Request):
    return templates.TemplateResponse("cyber/roadmaps.html", {"request": request})


@cyber_router.get("/cyber/labs", response_class=HTMLResponse)
def cyber_labs(request: Request):
    db = _db(request)
    labs = db.query(LabDefinition).filter(LabDefinition.is_published.is_(True)).all()
    return templates.TemplateResponse("cyber/labs.html", {"request": request, "labs": labs})


@cyber_router.get("/cyber/labs/{lab_id}", response_class=HTMLResponse)
def lab_player(request: Request, lab_id: int):
    user = _user(request)
    if user is None:
        return RedirectResponse("/auth/sign-in", status_code=302)
    db = _db(request)
    lab = db.query(LabDefinition).filter(LabDefinition.id == lab_id, LabDefinition.is_published.is_(True)).first()
    if not lab:
        raise NotFoundError("Lab not found")
    session = (
        db.query(LabSession)
        .filter(LabSession.lab_id == lab.id, LabSession.user_id == user.id)
        .order_by(LabSession.id.desc())
        .first()
    )
    return templates.TemplateResponse(
        "cyber/lab_player.html",
        {"request": request, "lab": lab, "session": session},
    )


@cyber_router.get("/cyber/ctf", response_class=HTMLResponse)
def ctf_page(request: Request):
    user = _user(request)
    db = _db(request)
    challenges = db.query(ChallengeDefinition).filter(ChallengeDefinition.is_published.is_(True)).all()
    user_attempts = {}
    if user:
        from app.models.labs import ChallengeAttempt

        solved = {
            row[0]
            for row in db.query(ChallengeAttempt.challenge_id)
            .filter(ChallengeAttempt.user_id == user.id, ChallengeAttempt.correct.is_(True))
            .distinct()
            .all()
        }
        user_attempts = {c.id: c.id in solved for c in challenges}
    board = lab_service.ctf_scoreboard(db)
    return templates.TemplateResponse(
        "cyber/ctf.html",
        {"request": request, "challenges": challenges, "solved": user_attempts, "scoreboard": board},
    )


@cyber_router.get("/cyber/evidence", response_class=HTMLResponse)
def evidence_page(request: Request):
    user = _user(request)
    if user is None:
        return RedirectResponse("/auth/sign-in", status_code=302)
    return templates.TemplateResponse("cyber/evidence.html", {"request": request})


@cyber_router.get("/cyber/portfolio", response_class=HTMLResponse)
def cyber_portfolio(request: Request):
    user = _user(request)
    if user is None:
        return RedirectResponse("/auth/sign-in", status_code=302)
    return templates.TemplateResponse("cyber/portfolio.html", {"request": request})


# ---------------------------------------------------------------------------
# Lab session API
# ---------------------------------------------------------------------------

@cyber_router.post("/api/v1/labs/{lab_id}/sessions")
def start_lab_session(request: Request, lab_id: int):
    user = _user(request)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = _db(request)
    lab = db.query(LabDefinition).filter(LabDefinition.id == lab_id, LabDefinition.is_published.is_(True)).first()
    if not lab:
        raise NotFoundError("Lab not found")
    session = lab_service.create_session(db, user, lab)
    return {
        "session_id": session.id,
        "status": session.status,
        "expires_at": session.expires_at.isoformat() if session.expires_at else None,
    }


@cyber_router.get("/api/v1/lab-sessions/{session_id}")
def get_lab_session(request: Request, session_id: int):
    user = _user(request)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = _db(request)
    session = lab_service.get_session(db, user, session_id)
    return {
        "id": session.id,
        "lab_id": session.lab_id,
        "status": session.status,
        "expires_at": session.expires_at.isoformat() if session.expires_at else None,
        "state": session.state,
        "grade": session.grade.score_percent if session.grade else None,
    }


@cyber_router.post("/api/v1/lab-sessions/{session_id}/command")
async def lab_command(request: Request, session_id: int):
    user = _user(request)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = _db(request)
    body = await request.json()
    command = str(body.get("command", ""))
    if not command.strip() or len(command) > 2000:
        raise ValidationError("Command is required (max 2000 chars)")
    result = lab_service.execute_command(db, user, session_id, command)
    return result


@cyber_router.post("/api/v1/lab-sessions/{session_id}/exercises/{exercise_id}")
async def lab_answer(request: Request, session_id: int, exercise_id: str):
    user = _user(request)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = _db(request)
    body = await request.json()
    result = lab_service.answer_exercise(db, user, session_id, exercise_id, body.get("answer"))
    return result


@cyber_router.post("/api/v1/lab-sessions/{session_id}/submit")
def submit_lab(request: Request, session_id: int):
    user = _user(request)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = _db(request)
    session = lab_service.submit_session(db, user, session_id)
    return {"status": session.status, "score": session.grade.score_percent if session.grade else None}


@cyber_router.post("/api/v1/lab-sessions/{session_id}/stop")
def stop_lab(request: Request, session_id: int):
    user = _user(request)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = _db(request)
    session = lab_service.stop_session(db, user, session_id)
    return {"status": session.status}


# ---------------------------------------------------------------------------
# CTF API
# ---------------------------------------------------------------------------

@cyber_router.post("/api/v1/ctf/{challenge_id}/attempt")
async def ctf_attempt(request: Request, challenge_id: int):
    user = _user(request)
    if user is None:
        raise ForbiddenError("Not authenticated")
    db = _db(request)
    challenge = db.query(ChallengeDefinition).filter(ChallengeDefinition.id == challenge_id, ChallengeDefinition.is_published.is_(True)).first()
    if not challenge:
        raise NotFoundError("Challenge not found")
    body = await request.json()
    flag = str(body.get("flag", ""))
    if not flag.strip():
        raise ValidationError("Flag is required")
    return lab_service.submit_flag(db, user, challenge, flag)


@cyber_router.get("/api/v1/ctf/scoreboard")
def ctf_scoreboard_api(request: Request):
    db = _db(request)
    return {"board": lab_service.ctf_scoreboard(db)}
