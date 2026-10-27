"""Cybersecurity lab engine.

All labs execute against simulated, in-process environments. No student
input is ever passed to a real shell. The LabExecutor port allows a real
sandboxed container runtime to be plugged in later; the simulated executor
ships with synthetic data for every lab type.
"""
from __future__ import annotations

import hashlib
import json
import shlex
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from sqlalchemy.orm import Session

from app.config import get_settings
from app.core.audit import audit
from app.core.errors import ConflictError, ForbiddenError, NotFoundError, ValidationError
from app.models.identity import User
from app.models.labs import (
    ChallengeAttempt,
    ChallengeDefinition,
    LabDefinition,
    LabEvent,
    LabGrade,
    LabSession,
    LabSessionStatus,
)


# ---------------------------------------------------------------------------
# Simulated Linux command interpreter (sandboxed, in-memory filesystem)
# ---------------------------------------------------------------------------

ALLOWED_COMMANDS = {
    "ls", "pwd", "cd", "cat", "echo", "touch", "mkdir", "grep", "find",
    "whoami", "id", "uname", "date", "head", "tail", "wc", "cp", "mv",
    "rm", "chmod", "ps", "env", "history", "cat", "which", "file", "stat",
}

DEFAULT_FS: dict[str, dict[str, str]] = {
    "/": {"etc": None, "home": None, "var": None, "usr": None},
    "/etc": {"passwd": "root:x:0:0:root:/root:/bin/bash\nlearner:x:1000:1000:learner:/home/learner:/bin/bash", "hostname": "lab-host"},
    "/home": {"learner": None},
    "/home/learner": {"notes.txt": "Welcome to the lab. Complete the exercises.\n", "secret.txt": "SIMULATED-SECRET-DO-NOT-USE-ANYWHERE"},
    "/var": {"log": None},
    "/var/log": {"auth.log": "Mar 10 09:12:01 lab-host sshd[1234]: Accepted password for learner\nMar 10 09:15:33 lab-host sudo: learner : TTY=pts/0 ; PWD=/home/learner ; USER=root ; COMMAND=/bin/cat /etc/shadow\n"},
    "/usr": {"bin": None},
}


class SimulatedLinux:
    """A tiny POSIX-like interpreter for a disposable per-session filesystem."""

    def __init__(self, fs: dict[str, dict[str, str]], cwd: str = "/home/learner"):
        self.fs = {k: dict(v) for k, v in fs.items()}
        self.cwd = cwd
        self.history: list[str] = []

    def _resolve(self, path: str) -> str:
        if not path.startswith("/"):
            path = f"{self.cwd.rstrip('/')}/{path}"
        parts: list[str] = []
        for part in path.split("/"):
            if part in ("", "."):
                continue
            if part == "..":
                if parts:
                    parts.pop()
                continue
            parts.append(part)
        return "/" + "/".join(parts)

    def run(self, raw: str) -> str:
        self.history.append(raw)
        try:
            tokens = shlex.split(raw)
        except ValueError:
            return "sh: unterminated quote"
        if not tokens:
            return ""
        cmd = tokens[0]
        args = tokens[1:]
        if cmd not in ALLOWED_COMMANDS:
            return f"{cmd}: command not found (simulated lab supports a limited command set)"
        handler = getattr(self, f"_{cmd}", None)
        if handler is None:
            return f"{cmd}: not implemented in the simulated lab"
        try:
            return handler(args)
        except Exception as exc:  # noqa: BLE001
            return f"{cmd}: error: {exc}"

    # --- command implementations ---

    def _ls(self, args: list[str]) -> str:
        long = "-l" in args or "--long" in args
        all_files = "-a" in args
        paths = [a for a in args if not a.startswith("-")]
        target = self._resolve(paths[0]) if paths else self.cwd
        entries = self.fs.get(target)
        if entries is None:
            return f"ls: cannot access '{target}': No such file or directory"
        names = list(entries.keys())
        if not all_files:
            names = [n for n in names if not n.startswith(".")]
        if long:
            lines = [f"-rw-r--r-- 1 learner learner {len(entries.get(n, '') or '')} {n}" for n in sorted(names)]
            return "\n".join(lines) if lines else "(empty)"
        return "  ".join(sorted(names)) or "(empty)"

    def _pwd(self, _args: list[str]) -> str:
        return self.cwd

    def _cd(self, args: list[str]) -> str:
        if not args:
            self.cwd = "/home/learner"
            return ""
        target = self._resolve(args[0])
        if target not in self.fs:
            return f"cd: no such file or directory: {args[0]}"
        self.cwd = target
        return ""

    def _cat(self, args: list[str]) -> str:
        if not args:
            return "cat: missing operand"
        target = self._resolve(args[0])
        content = self.fs.get(target)
        if content is None:
            if target in self.fs:
                return f"cat: {args[0]}: Is a directory"
            return f"cat: {args[0]}: No such file or directory"
        return content

    def _echo(self, args: list[str]) -> str:
        return " ".join(args)

    def _touch(self, args: list[str]) -> str:
        if not args:
            return "touch: missing file operand"
        target = self._resolve(args[0])
        parent = target.rsplit("/", 1)[0] or "/"
        if parent not in self.fs:
            return f"touch: cannot touch '{args[0]}': No such file or directory"
        name = target.rsplit("/", 1)[1]
        self.fs[parent].setdefault(name, "")
        return ""

    def _mkdir(self, args: list[str]) -> str:
        if not args:
            return "mkdir: missing operand"
        target = self._resolve(args[0])
        parent = target.rsplit("/", 1)[0] or "/"
        if parent not in self.fs:
            return f"mkdir: cannot create directory '{args[0]}': No such file or directory"
        name = target.rsplit("/", 1)[1]
        if name in self.fs[parent]:
            return f"mkdir: cannot create directory '{args[0]}': File exists"
        self.fs[parent][name] = None
        self.fs[target] = {}
        return ""

    def _grep(self, args: list[str]) -> str:
        flags = [a for a in args if a.startswith("-")]
        positional = [a for a in args if not a.startswith("-")]
        if len(positional) < 2:
            return "usage: grep PATTERN FILE"
        pattern, path = positional[0], positional[1]
        content = self.fs.get(self._resolve(path))
        if content is None:
            return f"grep: {path}: No such file or directory"
        matches = [line for line in content.splitlines() if pattern in line]
        out = "\n".join(matches)
        if "-c" in flags:
            return str(len(matches))
        return out

    def _find(self, args: list[str]) -> str:
        base = self._resolve(args[0]) if args and not args[0].startswith("-") else self.cwd
        name_filter = None
        if "-name" in args:
            name_filter = args[args.index("-name") + 1]
        results = []
        for path, entries in self.fs.items():
            if not path.startswith(base.rstrip("/") + "/") and path != base:
                continue
            for name in entries:
                if entries[name] is None:
                    continue
                if name_filter is None or name_filter.lstrip("*") in name:
                    results.append(f"{path}/{name}")
        return "\n".join(sorted(results)) or ""

    def _whoami(self, _args: list[str]) -> str:
        return "learner"

    def _id(self, _args: list[str]) -> str:
        return "uid=1000(learner) gid=1000(learner) groups=1000(learner),27(sudo)"

    def _uname(self, args: list[str]) -> str:
        if "-a" in args:
            return "Linux lab-host 6.1.0-lab #1 SMP x86_64 GNU/Linux"
        return "Linux"

    def _date(self, _args: list[str]) -> str:
        return datetime.now(timezone.utc).strftime("%a %b %d %H:%M:%S UTC %Y")

    def _head(self, args: list[str]) -> str:
        if not args:
            return "head: missing operand"
        content = self.fs.get(self._resolve(args[-1]))
        if content is None:
            return f"head: cannot open '{args[-1]}': No such file or directory"
        n = 10
        if "-n" in args:
            n = int(args[args.index("-n") + 1])
        return "\n".join(content.splitlines()[:n])

    def _tail(self, args: list[str]) -> str:
        if not args:
            return "tail: missing operand"
        content = self.fs.get(self._resolve(args[-1]))
        if content is None:
            return f"tail: cannot open '{args[-1]}': No such file or directory"
        n = 10
        if "-n" in args:
            n = int(args[args.index("-n") + 1])
        return "\n".join(content.splitlines()[-n:])

    def _wc(self, args: list[str]) -> str:
        if not args:
            return "wc: missing operand"
        content = self.fs.get(self._resolve(args[0]))
        if content is None:
            return f"wc: {args[0]}: No such file or directory"
        lines = content.count("\n") + (1 if content and not content.endswith("\n") else 0)
        words = len(content.split())
        chars = len(content)
        return f"{lines} {words} {chars} {args[0]}"

    def _cp(self, args: list[str]) -> str:
        if len(args) < 2:
            return "cp: missing operands"
        src = self.fs.get(self._resolve(args[0]))
        if src is None:
            return f"cp: cannot stat '{args[0]}': No such file or directory"
        dst = self._resolve(args[1])
        parent = dst.rsplit("/", 1)[0] or "/"
        if parent not in self.fs:
            return f"cp: cannot create regular file '{args[1]}': No such file or directory"
        if dst in self.fs:
            self.fs[dst] = src
        else:
            self.fs[parent][dst.rsplit("/", 1)[1]] = src
        return ""

    def _mv(self, args: list[str]) -> str:
        if len(args) < 2:
            return "mv: missing operands"
        src_path = self._resolve(args[0])
        content = self.fs.get(src_path)
        if content is None:
            return f"mv: cannot stat '{args[0]}': No such file or directory"
        dst = self._resolve(args[1])
        parent = dst.rsplit("/", 1)[0] or "/"
        if parent not in self.fs:
            return f"mv: cannot move '{args[0]}': No such file or directory"
        if dst in self.fs:
            self.fs[dst] = content
        else:
            self.fs[parent][dst.rsplit("/", 1)[1]] = content
        src_parent = src_path.rsplit("/", 1)[0] or "/"
        self.fs[src_parent].pop(src_path.rsplit("/", 1)[1], None)
        return ""

    def _rm(self, args: list[str]) -> str:
        if not args:
            return "rm: missing operand"
        target = self._resolve(args[0])
        if target in self.fs:
            if self.fs[target]:
                return f"rm: cannot remove '{args[0]}': Is a directory"
            del self.fs[target]
            return ""
        parent = target.rsplit("/", 1)[0] or "/"
        name = target.rsplit("/", 1)[1]
        if parent in self.fs and name in self.fs[parent]:
            del self.fs[parent][name]
            return ""
        return f"rm: cannot remove '{args[0]}': No such file or directory"

    def _chmod(self, args: list[str]) -> str:
        return ""

    def _ps(self, _args: list[str]) -> str:
        return "  PID TTY          TIME CMD\n 1234 pts/0    00:00:00 bash\n 1250 pts/0    00:00:00 ps"

    def _env(self, _args: list[str]) -> str:
        return "PATH=/usr/local/bin:/usr/bin:/bin\nHOME=/home/learner\nUSER=learner\nLAB_ENV=simulated"

    def _history(self, _args: list[str]) -> str:
        return "\n".join(f"{i + 1}  {cmd}" for i, cmd in enumerate(self.history))

    def _which(self, args: list[str]) -> str:
        return f"/usr/bin/{args[0]}" if args and args[0] in ALLOWED_COMMANDS else ""

    def _file(self, args: list[str]) -> str:
        content = self.fs.get(self._resolve(args[0])) if args else None
        return f"{args[0]}: ASCII text" if content is not None else f"{args[0]}: cannot open (No such file or directory)"

    def _stat(self, args: list[str]) -> str:
        content = self.fs.get(self._resolve(args[0])) if args else None
        return (
            f"  File: {args[0]}\n  Size: {len(content or '')}    Blocks: 8          IO Block: 4096   regular file"
            if content is not None
            else f"stat: cannot stat '{args[0]}': No such file or directory"
        )


# ---------------------------------------------------------------------------
# Lab lifecycle service
# ---------------------------------------------------------------------------


def create_session(db: Session, user: User, lab: LabDefinition) -> LabSession:
    if not lab.is_published:
        raise NotFoundError("Lab not found")
    active = (
        db.query(LabSession)
        .filter(LabSession.lab_id == lab.id, LabSession.user_id == user.id)
        .filter(LabSession.status.in_(["running", "provisioning"]))
        .first()
    )
    if active:
        return active
    settings = get_settings()
    ttl = min(lab.ttl_minutes, settings.lab_max_session_minutes)
    session = LabSession(
        lab_id=lab.id,
        user_id=user.id,
        status=LabSessionStatus.PROVISIONING,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=ttl),
        state={"fs": DEFAULT_FS if lab.lab_type == "linux" else {}, "answers": {}, "milestones": []},
    )
    db.add(session)
    db.flush()
    db.add(LabEvent(session_id=session.id, event_type="lifecycle", details={"from": None, "to": "provisioning"}))
    # Simulated provisioning completes immediately in the simulated executor.
    session.status = LabSessionStatus.RUNNING
    session.started_at = datetime.now(timezone.utc)
    db.add(LabEvent(session_id=session.id, event_type="lifecycle", details={"from": "provisioning", "to": "running"}))
    db.commit()
    audit(db, "lab.start", actor=user, entity_type="lab_session", entity_id=session.id)
    return session


def get_session(db: Session, user: User, session_id: int) -> LabSession:
    session = db.query(LabSession).filter(LabSession.id == session_id).first()
    if not session:
        raise NotFoundError("Lab session not found")
    if session.user_id != user.id and not user.is_superuser:
        raise ForbiddenError("Not your lab session")
    return session


def execute_command(db: Session, user: User, session_id: int, command: str) -> dict:
    session = get_session(db, user, session_id)
    if session.status != LabSessionStatus.RUNNING:
        raise ConflictError(f"Lab session is {session.status}")
    lab = db.query(LabDefinition).filter(LabDefinition.id == session.lab_id).first()
    if lab.lab_type != "linux":
        raise ValidationError("This lab does not support command execution")
    state = session.state or {}
    sim = SimulatedLinux(state.get("fs", DEFAULT_FS), state.get("cwd", "/home/learner"))
    sim.cwd = state.get("cwd", "/home/learner")
    output = sim.run(command)
    state["fs"] = sim.fs
    state["cwd"] = sim.cwd
    state.setdefault("commands", []).append({"command": command, "output": output})
    session.state = state
    db.add(LabEvent(session_id=session.id, event_type="command", details={"command": command}))
    db.commit()
    return {"command": command, "output": output, "cwd": sim.cwd}


def answer_exercise(db: Session, user: User, session_id: int, exercise_id: str, answer: Any) -> dict:
    session = get_session(db, user, session_id)
    if session.status != LabSessionStatus.RUNNING:
        raise ConflictError(f"Lab session is {session.status}")
    lab = db.query(LabDefinition).filter(LabDefinition.id == session.lab_id).first()
    state = session.state or {}
    exercises = {e["id"]: e for e in (lab.engine_config.get("exercises") or [])}
    exercise = exercises.get(exercise_id)
    if not exercise:
        raise NotFoundError("Exercise not found")
    result = _validate_answer(lab, exercise, answer, state)
    state.setdefault("answers", {})[exercise_id] = {"answer": answer, "correct": result["correct"]}
    if result["correct"]:
        state.setdefault("milestones", [])
        if exercise_id not in state["milestones"]:
            state["milestones"].append(exercise_id)
            db.add(LabEvent(session_id=session.id, event_type="milestone", details={"exercise_id": exercise_id}))
    session.state = state
    db.commit()
    return result


def _validate_answer(lab: LabDefinition, exercise: dict, answer: Any, state: dict) -> dict:
    validator = exercise.get("validator", {})
    vtype = validator.get("type", "answer_equals")
    correct = False
    if vtype == "answer_equals":
        correct = str(answer).strip().lower() == str(validator.get("expected", "")).strip().lower()
    elif vtype == "answer_contains":
        correct = all(token.lower() in str(answer).lower() for token in validator.get("expected", []))
    elif vtype == "command_ran":
        commands = [c["command"] for c in state.get("commands", [])]
        correct = any(validator.get("expected", "") in c for c in commands)
    elif vtype == "file_exists":
        fs = state.get("fs", {})
        expected = validator.get("expected", [])
        correct = any(expected_name in fs.get(path, {}) for path, expected_name in
                      [(e.rsplit("/", 1)[0] or "/", e.rsplit("/", 1)[1]) for e in expected])
    elif vtype == "choice":
        correct = answer == validator.get("expected")
    return {"correct": correct, "feedback": exercise.get("feedback", "")}


def submit_session(db: Session, user: User, session_id: int) -> LabSession:
    session = get_session(db, user, session_id)
    if session.status != LabSessionStatus.RUNNING:
        raise ConflictError("Only running sessions can be submitted")
    session.status = LabSessionStatus.SUBMITTED
    session.submitted_at = datetime.now(timezone.utc)
    db.add(LabEvent(session_id=session.id, event_type="lifecycle", details={"from": "running", "to": "submitted"}))
    db.commit()
    grade_lab_session(db, session)
    audit(db, "lab.submit", actor=user, entity_type="lab_session", entity_id=session.id)
    return session


def grade_lab_session(db: Session, session: LabSession) -> LabGrade:
    lab = db.query(LabDefinition).filter(LabDefinition.id == session.lab_id).first()
    exercises = lab.engine_config.get("exercises") or []
    state = session.state or {}
    answers = state.get("answers", {})
    total = len(exercises)
    if total == 0:
        score = 100
        rubric = []
    else:
        correct = sum(1 for e in exercises if answers.get(e["id"], {}).get("correct"))
        score = round(100 * correct / total)
        rubric = [
            {"exercise": e["id"], "title": e.get("title", e["id"]), "correct": answers.get(e["id"], {}).get("correct", False), "points": round(100 / total)}
            for e in exercises
        ]
    grade = LabGrade(
        session_id=session.id,
        score_percent=score,
        rubric_scores=rubric,
        feedback=f"Completed {len([a for a in answers.values() if a.get('correct')])} of {total} exercises correctly. This lab ran in a simulated environment.",
    )
    db.add(grade)
    db.commit()
    return grade


def stop_session(db: Session, user: User, session_id: int) -> LabSession:
    session = get_session(db, user, session_id)
    if session.status not in (LabSessionStatus.RUNNING, LabSessionStatus.PROVISIONING):
        raise ConflictError("Session is not active")
    session.status = LabSessionStatus.STOPPING
    db.add(LabEvent(session_id=session.id, event_type="lifecycle", details={"from": session.status, "to": "stopping"}))
    session.status = LabSessionStatus.STOPPED
    session.finished_at = datetime.now(timezone.utc)
    db.add(LabEvent(session_id=session.id, event_type="lifecycle", details={"from": "stopping", "to": "stopped"}))
    db.commit()
    audit(db, "lab.stop", actor=user, entity_type="lab_session", entity_id=session.id)
    return session


def expire_sessions(db: Session) -> int:
    now = datetime.now(timezone.utc)
    expired = (
        db.query(LabSession)
        .filter(LabSession.status.in_(["running", "provisioning"]), LabSession.expires_at <= now)
        .all()
    )
    for session in expired:
        session.status = LabSessionStatus.EXPIRED
        session.finished_at = now
        db.add(LabEvent(session_id=session.id, event_type="lifecycle", details={"from": "running", "to": "expired"}))
    db.commit()
    return len(expired)


# ---------------------------------------------------------------------------
# CTF challenges
# ---------------------------------------------------------------------------


def _hash_flag(flag: str) -> str:
    return hashlib.sha256(flag.strip().lower().encode("utf-8")).hexdigest()


def submit_flag(db: Session, user: User, challenge: ChallengeDefinition, flag: str) -> dict:
    now = datetime.now(timezone.utc)
    if challenge.expires_at and challenge.expires_at < now:
        raise ConflictError("This challenge has expired")
    attempts = (
        db.query(ChallengeAttempt)
        .filter(ChallengeAttempt.challenge_id == challenge.id, ChallengeAttempt.user_id == user.id)
        .count()
    )
    if attempts >= challenge.max_attempts:
        raise ConflictError("Maximum attempts reached for this challenge")
    correct = _hash_flag(flag) == challenge.flag_hash
    attempt = ChallengeAttempt(
        challenge_id=challenge.id,
        user_id=user.id,
        submitted_flag_hash=_hash_flag(flag),
        correct=correct,
    )
    db.add(attempt)
    db.commit()
    audit(db, "ctf.attempt", actor=user, entity_type="challenge", entity_id=challenge.id, details={"correct": correct})
    return {
        "correct": correct,
        "attempts_used": attempts + 1,
        "attempts_remaining": max(0, challenge.max_attempts - attempts - 1),
        "points": challenge.points if correct else 0,
        "message": "Correct! Flag accepted." if correct else "Incorrect flag. Try again or review the hints.",
    }


def ctf_scoreboard(db: Session, limit: int = 20) -> list[dict]:
    from app.models.identity import User

    rows = (
        db.query(ChallengeAttempt.user_id, ChallengeAttempt.challenge_id, ChallengeAttempt.created_at)
        .filter(ChallengeAttempt.correct.is_(True))
        .distinct()
        .all()
    )
    points: dict[int, int] = {}
    solved: dict[int, set[int]] = {}
    for user_id, challenge_id, _ts in rows:
        challenge = db.query(ChallengeDefinition).filter(ChallengeDefinition.id == challenge_id).first()
        if not challenge:
            continue
        points[user_id] = points.get(user_id, 0) + challenge.points
        solved.setdefault(user_id, set()).add(challenge_id)
    users = {u.id: u for u in db.query(User).filter(User.id.in_(points.keys())).all()} if points else {}
    board = [
        {"user_id": uid, "display_name": users.get(uid).display_name if users.get(uid) else "learner", "points": pts, "solved": len(solved[uid])}
        for uid, pts in points.items()
    ]
    board.sort(key=lambda r: (-r["points"], -r["solved"]))
    return board[:limit]
