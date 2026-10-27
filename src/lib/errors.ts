/** Application error types with stable codes and HTTP status mapping. */
export class AppError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(message: string, code = "app_error", status = 400, details?: Record<string, unknown>) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: Record<string, unknown>) {
    super(message, "validation_error", 422, details);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, "not_found", 404);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, "forbidden", 403);
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, "unauthorized", 401);
    this.name = "UnauthorizedError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, "conflict", 409);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests") {
    super(message, "rate_limited", 429);
    this.name = "RateLimitError";
  }
}

export class PaymentRequiredError extends AppError {
  constructor(message = "Payment required") {
    super(message, "payment_required", 402);
    this.name = "PaymentRequiredError";
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string) {
    super(message, "external_service_error", 502);
    this.name = "ExternalServiceError";
  }
}

/** Serialize an error into the API error envelope. */
export function toApiError(err: unknown) {
  if (err instanceof AppError) {
    return {
      error: { code: err.code, message: err.message, details: err.details },
      status: err.status,
    };
  }
  console.error("Unhandled API error:", err);
  return {
    error: { code: "internal_error", message: "An unexpected error occurred" },
    status: 500,
  };
}
