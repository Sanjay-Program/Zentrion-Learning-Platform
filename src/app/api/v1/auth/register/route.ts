import { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { createUser, createRecoveryToken } from "@/lib/auth";
import { assignRole, DEFAULT_ROLE } from "@/lib/rbac";
import { sendEmail } from "@/lib/email";
import { getSettings } from "@/lib/config";
import { ConflictError, ValidationError } from "@/lib/errors";
import { handle, parseBody } from "@/lib/api";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { audit } from "@/lib/audit";

const registerSchema = z.object({
  displayName: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(10),
});

export const POST = handle(async (request: NextRequest) => {
  const body = await parseBody(request);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Invalid registration data", {
      fields: parsed.error.flatten().fieldErrors,
    });
  }
  const { displayName, email, password } = parsed.data;

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new ValidationError("Password must contain both letters and numbers");
  }

  const db = getDb();
  const existingUser = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1).get();
  if (existingUser) {
    throw new ConflictError("An account with this email already exists");
  }

  const user = await createUser({
    email,
    password,
    displayName,
    status: "pending_verification",
  });
  await assignRole(user.id, DEFAULT_ROLE);

  // Email verification token (valid 24h).
  const token = await createRecoveryToken(user.id, "email_verify", 24 * 60);
  const settings = getSettings();
  const link = `${settings.appBaseUrl}/auth/verify-email?token=${token}`;
  await sendEmail(
    email,
    "Verify your email address",
    `<p>Welcome to Zentrion, ${displayName}. Verify your email to activate your account:</p>
     <p><a href="${link}">Verify email address</a></p>
     <p>This link expires in 24 hours.</p>`,
  );

  await audit("user.registered", { actorId: user.id, entityType: "user", entityId: user.id });

  return { status: "registered", email: user.email, emailVerified: false };
});
