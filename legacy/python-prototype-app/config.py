"""Application configuration with startup validation."""
from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import Optional

from pydantic import BaseModel, Field, field_validator

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseModel):
    app_env: str = "development"
    app_secret_key: str = ""
    app_base_url: str = "http://localhost:8000"
    database_url: str = "sqlite:///./data/zentrion.db"

    access_token_expire_minutes: int = 60
    session_cookie_age_days: int = 30

    smtp_host: Optional[str] = None
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_from: str = "Zentrion Learntech <noreply@example.com>"

    ai_provider: str = "none"
    ai_base_url: str = "https://api.openai.com/v1"
    ai_api_key: Optional[str] = None
    ai_default_model: str = "gpt-4o-mini"
    ai_embedding_model: str = "text-embedding-3-small"
    ai_max_tokens_per_day: int = 50000

    stripe_secret_key: Optional[str] = None
    stripe_publishable_key: Optional[str] = None
    stripe_webhook_secret: Optional[str] = None

    storage_backend: str = "local"
    storage_s3_bucket: Optional[str] = None
    storage_s3_region: Optional[str] = None
    storage_aws_access_key_id: Optional[str] = None
    storage_aws_secret_access_key: Optional[str] = None

    lab_executor: str = "simulated"
    lab_max_session_minutes: int = 120

    @field_validator("app_env")
    @classmethod
    def _check_env(cls, v: str) -> str:
        assert v in {"development", "testing", "staging", "production"}, f"bad APP_ENV: {v}"
        return v

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"

    @property
    def ai_configured(self) -> bool:
        return bool(self.ai_provider != "none" and self.ai_api_key and self.ai_base_url)

    @property
    def payments_configured(self) -> bool:
        return bool(self.stripe_secret_key and self.stripe_webhook_secret)

    @property
    def email_configured(self) -> bool:
        return bool(self.smtp_host and self.smtp_username)


def _load_dotenv() -> None:
    """Minimal .env loader (python-dotenv if available, else parse manually)."""
    env_path = BASE_DIR / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key, value = key.strip(), value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


_load_dotenv()


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings(
        app_env=os.getenv("APP_ENV", "development"),
        app_secret_key=os.getenv("APP_SECRET_KEY", ""),
        app_base_url=os.getenv("APP_BASE_URL", "http://localhost:8000"),
        database_url=os.getenv("DATABASE_URL", "sqlite:///./data/zentrion.db"),
        access_token_expire_minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")),
        session_cookie_age_days=int(os.getenv("SESSION_COOKIE_AGE_DAYS", "30")),
        smtp_host=os.getenv("SMTP_HOST") or None,
        smtp_port=int(os.getenv("SMTP_PORT", "587")),
        smtp_username=os.getenv("SMTP_USERNAME") or None,
        smtp_password=os.getenv("SMTP_PASSWORD") or None,
        smtp_from=os.getenv("SMTP_FROM", "Zentrion Learntech <noreply@example.com>"),
        ai_provider=os.getenv("AI_PROVIDER", "none"),
        ai_base_url=os.getenv("AI_BASE_URL", "https://api.openai.com/v1"),
        ai_api_key=os.getenv("AI_API_KEY") or None,
        ai_default_model=os.getenv("AI_DEFAULT_MODEL", "gpt-4o-mini"),
        ai_embedding_model=os.getenv("AI_EMBEDDING_MODEL", "text-embedding-3-small"),
        ai_max_tokens_per_day=int(os.getenv("AI_MAX_TOKENS_PER_DAY", "50000")),
        stripe_secret_key=os.getenv("STRIPE_SECRET_KEY") or None,
        stripe_publishable_key=os.getenv("STRIPE_PUBLISHABLE_KEY") or None,
        stripe_webhook_secret=os.getenv("STRIPE_WEBHOOK_SECRET") or None,
        storage_backend=os.getenv("STORAGE_BACKEND", "local"),
        storage_s3_bucket=os.getenv("STORAGE_S3_BUCKET") or None,
        storage_s3_region=os.getenv("STORAGE_S3_REGION") or None,
        storage_aws_access_key_id=os.getenv("STORAGE_AWS_ACCESS_KEY_ID") or None,
        storage_aws_secret_access_key=os.getenv("STORAGE_AWS_SECRET_ACCESS_KEY") or None,
        lab_executor=os.getenv("LAB_EXECUTOR", "simulated"),
        lab_max_session_minutes=int(os.getenv("LAB_MAX_SESSION_MINUTES", "120")),
    )


def validate_startup(settings: Settings | None = None) -> list[str]:
    """Validate required settings at startup. Returns a list of problems."""
    settings = settings or get_settings()
    problems: list[str] = []
    if settings.is_production:
        if not settings.app_secret_key or settings.app_secret_key.startswith("change-me"):
            problems.append("APP_SECRET_KEY must be set to a strong random value in production")
        if settings.database_url.startswith("sqlite"):
            problems.append("SQLite is not supported in production; configure PostgreSQL")
    return problems
