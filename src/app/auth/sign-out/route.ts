import { NextRequest, NextResponse } from "next/server";
import { getSessionToken, revokeSession, clearSessionCookie } from "@/lib/auth";

/**
 * Sign-out endpoint used by the navbar form (POST /auth/sign-out).
 * Revokes the server-side session and clears the cookie.
 */
export async function POST(request: NextRequest) {
  const token = await getSessionToken();
  if (token) {
    await revokeSession(token).catch(() => undefined);
  }
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  clearSessionCookie(response.cookies);
  return response;
}
