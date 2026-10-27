import { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { consumeRecoveryToken } from "@/lib/auth";
import { handle, parseBody, json } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { audit } from "@/lib/audit";
import { toIso } from "@/lib/utils";

const schema = z.object({ token: z.string().min(1) });

export const POST = handle(async (request: NextRequest) => {
  const body = await parseBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("A verification token is required");
  }
  const userId = await consumeRecoveryToken(parsed.data.token, "email_verify");
  if (userId === null) {
    throw new ValidationError("Verification link is invalid or expired");
  }
  const db = getDb();
  await db
    .update(users)
    .set({ emailVerified: true, status: "active" })
    .where(eq(users.id, userId))
    .run();
  await audit("user.email_verified", { actorId: userId, entityType: "user", entityId: userId });
  return { status: "verified" };
});
