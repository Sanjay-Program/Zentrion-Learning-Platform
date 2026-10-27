import { NextRequest } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users, loginEvents, sessions } from "@/db/schema";
import {
  verifyPassword,
  createSession,
  setSessionCookie,
  getUserWithRoles,
  validateSession,
} from "@/lib/auth";
import { requestMeta, handle, parseBody, json } from "@/lib/api";
import { ConflictError, ForbiddenError, ValidationError, UnauthorizedError } from "@/lib/errors";
import { audit } from "@/lib/audit";
import { addMinutes, toIso } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const POST = handle(async (request: NextRequest) => {
  const body = await parseBody(request);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Invalid login data", {
      fields: parsed.error.flatten().fieldErrors,
    });
  }
  const { email, password } = parsed.data;
  const meta = requestMeta(request);
  const db = getDb();

  const user = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1).get();
  const logFailure = (reason: string) => {
    db.insert(loginEvents)
      .values({
        userId: user?.id ?? null,
        ipAddress: meta.ipAddress ?? null,
        userAgent: meta.userAgent ?? null,
        success: false,
        reason,
      })
      .run();
  };

  if (!user) {
    logFailure("unknown_email");
    throw new ValidationError("Invalid email or password");
  }
  if (user.lockedUntil && user.lockedUntil > toIso(new Date())) {
    logFailure("locked");
    throw new ConflictError("Account temporarily locked due to too many failed attempts");
  }
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    const attempts = user.failedLoginAttempts + 1;
    await db
      .update(users)
      .set({
        failedLoginAttempts: attempts,
        lockedUntil: attempts >= 5 ? toIso(addMinutes(new Date(), 15)) : null,
      })
      .where(eq(users.id, user.id))
      .run();
    logFailure("bad_password");
    throw new ValidationError("Invalid email or password");
  }
  if (user.status === "suspended") {
    logFailure("suspended");
    throw new ForbiddenError("This account is suspended");
  }

  await db
    .update(users)
    .set({ failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: toIso(new Date()) })
    .where(eq(users.id, user.id))
    .run();
  db.insert(loginEvents)
    .values({
      userId: user.id,
      ipAddress: meta.ipAddress ?? null,
      userAgent: meta.userAgent ?? null,
      success: true,
    })
    .run();

  const { sessionId, token } = await createSession(user.id, meta);
  const fullUser = (await getUserWithRoles(user.id))!;

  const response = json({
    status: "logged_in",
    user: publicUser(fullUser),
  });
  setSessionCookie(response.cookies, token);
  await audit("user.login", { actorId: user.id, entityType: "session", entityId: sessionId });
  return response;
});

function publicUser(user: {
  id: number;
  email: string;
  displayName: string;
  emailVerified: boolean;
  isSuperuser: boolean;
  status: string;
  roles?: { key: string }[];
}) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerified,
    isSuperuser: user.isSuperuser,
    status: user.status,
    roles: user.roles?.map((r) => r.key) ?? [],
  };
}
