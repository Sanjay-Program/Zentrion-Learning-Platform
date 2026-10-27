import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/db/client";
import { liveSessions, sessionRegistrations } from "@/db/schema";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { audit } from "@/lib/audit";

/**
 * Reserve a seat at a live session.
 * Used as a plain form action (POST /api/v1/events/[id]/register),
 * so it redirects back to /events on success.
 */
export async function POST(
  request: NextRequest,
  ctx: { params: Promise<Record<string, string>> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/auth/sign-in?next=/events", request.url), 303);
  }
  const { id } = await ctx.params;
  const sessionId = Number(id ?? new URL(request.url).searchParams.get("id"));
  if (!Number.isFinite(sessionId)) {
    return NextResponse.redirect(new URL("/events?error=invalid", request.url), 303);
  }

  const db = getDb();
  const session = await db
    .select()
    .from(liveSessions)
    .where(eq(liveSessions.id, sessionId))
    .limit(1)
    .get();
  if (!session || !session.isPublished) {
    return NextResponse.redirect(new URL("/events?error=not_found", request.url), 303);
  }

  const already = await db
    .select()
    .from(sessionRegistrations)
    .where(and(eq(sessionRegistrations.sessionId, sessionId), eq(sessionRegistrations.userId, user.id)))
    .limit(1)
    .get();
  if (already) {
    return NextResponse.redirect(new URL("/events?error=already", request.url), 303);
  }

  if (session.seatLimit != null) {
    const count = await db
      .select({ id: sessionRegistrations.id })
      .from(sessionRegistrations)
      .where(eq(sessionRegistrations.sessionId, sessionId))
      .all();
    if (count.length >= session.seatLimit) {
      return NextResponse.redirect(new URL("/events?error=full", request.url), 303);
    }
  }

  await db
    .insert(sessionRegistrations)
    .values({ sessionId, userId: user.id, status: "registered" })
    .run();

  await audit("event.registered", { actorId: user.id, entityType: "live_session", entityId: sessionId });

  return NextResponse.redirect(new URL("/events?registered=1", request.url), 303);
}
