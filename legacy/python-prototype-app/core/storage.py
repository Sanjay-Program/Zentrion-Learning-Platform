"""Storage abstraction: local filesystem now, object storage behind an interface."""
from __future__ import annotations

import hashlib
import os
import secrets
from pathlib import Path
from typing import Optional

from app.config import get_settings

ALLOWED_MIME = {
    "image/png", "image/jpeg", "image/gif", "image/webp",
    "application/pdf",
    "text/plain", "text/csv", "text/markdown",
    "application/json",
    "video/mp4", "video/webm",
    "application/zip",
}

MAX_UPLOAD_BYTES = 100 * 1024 * 1024  # 100 MB


class StorageError(Exception):
    pass


def validate_file(filename: str, mime_type: str, size: int) -> str:
    if not filename or len(filename) > 255:
        raise StorageError("Invalid filename")
    if mime_type not in ALLOWED_MIME:
        raise StorageError(f"File type not allowed: {mime_type}")
    if size > MAX_UPLOAD_BYTES:
        raise StorageError("File exceeds the maximum allowed size")
    return os.path.basename(filename)


def store_upload(owner_id: int, kind: str, filename: str, mime_type: str, data: bytes) -> str:
    settings = get_settings()
    safe_name = validate_file(filename, mime_type, len(data))
    digest = hashlib.sha256(data).hexdigest()[:16]
    ext = Path(safe_name).suffix or ""
    key = f"uploads/{owner_id}/{kind}/{secrets.token_hex(8)}-{digest}{ext}"
    if settings.storage_backend == "local":
        target = settings_storage_path() / key
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
    else:
        raise StorageError("Configured storage backend is not available in this deployment")
    return key


def settings_storage_path() -> Path:
    base = Path(get_settings().database_url.replace("sqlite:///", ""))
    root = (base.parent / "storage").resolve() if str(base) else Path("data/storage")
    root.mkdir(parents=True, exist_ok=True)
    return root


def read_stored(key: str) -> bytes:
    path = settings_storage_path() / key
    if not path.exists() or ".." in Path(key).parts:
        raise StorageError("Object not found")
    return path.read_bytes()


def delete_stored(key: str) -> None:
    path = settings_storage_path() / key
    if path.exists() and ".." not in Path(key).parts:
        path.unlink(missing_ok=True)
