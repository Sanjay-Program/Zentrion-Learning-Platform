import { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { consumeRecoveryToken, hashPassword, revokeAllUserSessions } from "@/lib/auth";
import { handle, parseBody, json } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { audit } from "@/lib/audit";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(10),
});

export const POST = handle(async (request: NextRequest) => {
  const body = await parseBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Invalid reset data");
  }
  const { token, password } = parsed.data;

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new ValidationError("Password must contain both letters and numbers");
  }

  const userId = await consumeRecoveryToken(token, "password_reset");
  if (userId === null) {
    throw new ValidationError("Reset link is invalid or expired");
  }
  const db = getDb();
  const passwordHash = await hashPassword(password);
  await db
    .update(users)
    .set({ passwordHash, failedLoginAttempts: 0, lockedUntil: null })
    .where(eq(users.id, userId))
    .run();
  // Invalidate all existing sessions after a password change.
  await revokeAllUserSessions(userId);
  await audit("user.password_changed", { actorId: userId, entityType: "user", entityId: userId });
  return { status: "password_reset" };
});
