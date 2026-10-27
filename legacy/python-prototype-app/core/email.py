"""Email service with graceful degradation (console backend in development)."""
from __future__ import annotations

import logging
import smtplib
from email.message import EmailMessage
from typing import Optional

from app.config import get_settings

logger = logging.getLogger("zention.email")


def send_email(to: str, subject: str, html_body: str, text_body: Optional[str] = None) -> bool:
    settings = get_settings()
    if not settings.email_configured:
        # Development fallback: log instead of failing.
        logger.info("[email] To: %s | Subject: %s", to, subject)
        logger.debug("[email body]\n%s", html_body)
        return True
    msg = EmailMessage()
    msg["To"] = to
    msg["From"] = settings.smtp_from
    msg["Subject"] = subject
    msg.set_content(text_body or subject)
    msg.add_alternative(html_body, subtype="html")
    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as server:
            if settings.smtp_username and settings.smtp_password:
                server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(msg)
        return True
    except Exception as exc:  # noqa: BLE001
        logger.error("Email delivery failed: %s", exc)
        return False
