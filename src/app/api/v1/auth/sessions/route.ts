import { NextRequest } from "next/server";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/db/client";
import { sessions } from "@/db/schema";
import { getCurrentUser, revokeSession, revokeAllUserSessions, getSessionToken } from "@/lib/auth";
import { handle, json } from "@/lib/api";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { audit } from "@/lib/audit";

export const GET = handle(async () => {
  const user = await getCurrentUser();
  if (!user) throw new ForbiddenError("Not authenticated");
  const db = getDb();
  const rows = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.userId, user.id), eq(sessions.revoked, false)))
    .orderBy(sessions.id)
    .all();
  const currentToken = await getSessionToken();
  const { sha256Hex } = await import("@/lib/utils");
  const currentHash = currentToken ? await sha256Hex(currentToken) : null;
  return {
    sessions: rows.map((s) => ({
      id: s.id,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      isCurrent: s.tokenHash === currentHash,
    })),
  };
});

export const POST = handle(async () => {
  // Revoke all sessions except the current one.
  const user = await getCurrentUser();
  if (!user) throw new ForbiddenError("Not authenticated");
  const currentToken = await getSessionToken();
  await revokeAllUserSessions(user.id, currentToken ?? undefined);
  await audit("user.sessions_revoked", { actorId: user.id, details: { scope: "others" } });
  return { status: "all_other_sessions_revoked" };
});

export const DELETE = handle(async (request: NextRequest, ctx: { params: Promise<Record<string, string>> }) => {
  const user = await getCurrentUser();
  if (!user) throw new ForbiddenError("Not authenticated");
  const { sessionId } = await ctx.params;
  const sessionIdNum = Number(sessionId);
  if (!Number.isInteger(sessionIdNum)) throw new ValidationError("Invalid session id");
  const db = getDb();
  const session = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, sessionIdNum), eq(sessions.userId, user.id)))
    .limit(1)
    .get();
  if (!session) throw new NotFoundError("Session not found");
  await db.update(sessions).set({ revoked: true }).where(eq(sessions.id, session.id)).run();
  await audit("user.session_revoked", { actorId: user.id, entityType: "session", entityId: session.id });
  return { status: "revoked" };
});
