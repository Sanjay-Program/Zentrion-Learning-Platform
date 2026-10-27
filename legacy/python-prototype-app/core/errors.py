"""Application error types with stable codes."""
from __future__ import annotations


class AppError(Exception):
    code = "app_error"
    status_code = 400
    message = "An error occurred"

    def __init__(self, message: str | None = None, *, details: dict | None = None):
        self.message = message or self.message
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(AppError):
    code = "validation_error"
    status_code = 422
    message = "Validation failed"


class NotFoundError(AppError):
    code = "not_found"
    status_code = 404
    message = "Resource not found"


class ForbiddenError(AppError):
    code = "forbidden"
    status_code = 403
    message = "You do not have permission to perform this action"


class UnauthorizedError(AppError):
    code = "unauthorized"
    status_code = 401
    message = "Authentication required"


class ConflictError(AppError):
    code = "conflict"
    status_code = 409
    message = "Resource conflict"


class RateLimitError(AppError):
    code = "rate_limited"
    status_code = 429
    message = "Too many requests"


class ExternalServiceError(AppError):
    code = "external_service_error"
    status_code = 502
    message = "An external service is unavailable"


class PaymentRequiredError(AppError):
    code = "payment_required"
    status_code = 402
    message = "Payment required"
