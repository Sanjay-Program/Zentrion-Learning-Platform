"""Audit logging and notifications (event-driven, in-app + email)."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.models.commerce import AuditEvent, Notification
from app.models.identity import User


def audit(
    db: Session,
    action: str,
    *,
    actor: Optional[User] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    details: Optional[dict] = None,
    ip_address: Optional[str] = None,
) -> None:
    event = AuditEvent(
        actor_id=actor.id if actor else None,
        actor_role=type(actor).__name__ if actor else None,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details if details is not None else None,
        ip_address=ip_address,
    )
    db.add(event)
    db.commit()


def notify(
    db: Session,
    user_id: int,
    type_: str,
    title: str,
    *,
    body: Optional[str] = None,
    reference_type: Optional[str] = None,
    reference_id: Optional[int] = None,
    send_email: bool = False,
) -> None:
    notification = Notification(
        user_id=user_id,
        type=type_,
        title=title,
        body=body,
        reference_type=reference_type,
        reference_id=reference_id,
        email_sent=not send_email,
    )
    db.add(notification)
    db.commit()


def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def safe_json(value) -> Optional[dict]:
    try:
        return json.loads(value) if isinstance(value, str) else value
    except (json.JSONDecodeError, TypeError):
        return None
