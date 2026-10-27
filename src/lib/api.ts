import { NextRequest, NextResponse } from "next/server";
import { ensureCsrfCookie, type CookieJar } from "@/lib/auth";
import { toApiError } from "@/lib/errors";

/**
 * Build a JSON API response. Ensures the CSRF cookie is present
 * and applies consistent security headers.
 */
export function json(
  data: unknown,
  init: { status?: number; request?: NextRequest } = {},
): NextResponse {
  const response = NextResponse.json(data, { status: init.status ?? 200 });
  if (init.request) {
    ensureCsrfCookie(response.cookies as unknown as CookieJar, init.request.cookies.get("zcsrftoken")?.value);
  }
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}

/** Validate the CSRF token on state-changing requests (double-submit). */
export function validateCsrf(request: NextRequest): boolean {
  const cookieToken = request.cookies.get("zcsrftoken")?.value;
  const headerToken = request.headers.get("x-csrf-token");
  if (!cookieToken || !headerToken) return false;
  // Constant-time comparison.
  if (cookieToken.length !== headerToken.length) return false;
  let diff = 0;
  for (let i = 0; i < cookieToken.length; i++) {
    diff |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i);
  }
  return diff === 0;
}

/** Enforce CSRF for non-GET mutations. Throws an error response when invalid. */
export function enforceCsrf(request: NextRequest): void {
  if (!validateCsrf(request)) {
    const { ForbiddenError } = require("@/lib/errors");
    throw new ForbiddenError("Invalid CSRF token");
  }
}

export async function parseBody<T = Record<string, unknown>>(request: NextRequest): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    const { ValidationError } = require("@/lib/errors");
    throw new ValidationError("Request body must be valid JSON");
  }
}

export function requestMeta(request: NextRequest) {
  return {
    userAgent: request.headers.get("user-agent") ?? undefined,
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("cf-connecting-ip") ??
      undefined,
  };
}

/** Wrap an async handler with consistent error mapping. */
export function handle<T>(
  fn: (request: NextRequest, ctx: { params: Promise<Record<string, string>> }) => Promise<T>,
) {
  return async (request: NextRequest, ctx: { params: Promise<Record<string, string>> }) => {
    try {
      const result = await fn(request, ctx);
      if (result instanceof NextResponse) return result;
      return json(result, { request });
    } catch (err) {
      const { error, status } = toApiError(err);
      return json(error, { status, request });
    }
  };
}
