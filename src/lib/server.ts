import { NextResponse } from "next/server";
import { getCurrentUser, ensureCsrfCookie, type User } from "@/lib/auth";
import { getDb } from "@/db/client";
import { ensureRolesAndPermissions } from "@/lib/rbac";
import { validateStartup } from "@/lib/config";

export { NextResponse };

/**
 * Resolve the current user from the session cookie.
 * Returns null when unauthenticated (does not throw).
 */
export async function currentUser(): Promise<User | null> {
  return getCurrentUser();
}

/**
 * Resolve the current user or throw a 401-style response.
 */
export async function requireUser(): Promise<User> {
  const user = await currentUser();
  if (!user) {
    const { UnauthorizedError } = await import("@/lib/errors");
    throw new UnauthorizedError();
  }
  return user;
}

/**
 * Middleware entry: validates startup config and ensures the
 * permission matrix exists. Call once at app bootstrap (instrumentation).
 */
export async function bootstrap(): Promise<void> {
  const problems = validateStartup();
  for (const p of problems) {
    console.warn(`[config] ${p}`);
  }
  try {
    await ensureRolesAndPermissions();
  } catch (err) {
    console.warn("[bootstrap] role bootstrap deferred:", err instanceof Error ? err.message : err);
  }
}

/** Standard JSON API response helper with CSRF cookie bootstrap. */
export function apiResponse(
  data: unknown,
  init: { status?: number; headers?: Record<string, string> } = {},
): NextResponse {
  return NextResponse.json(data, {
    status: init.status ?? 200,
    headers: init.headers,
  });
}

export function apiError(code: string, message: string, status: number): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}
