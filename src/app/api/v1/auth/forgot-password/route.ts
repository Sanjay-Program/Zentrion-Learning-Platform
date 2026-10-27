import { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { createRecoveryToken } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { getSettings } from "@/lib/config";
import { handle, parseBody } from "@/lib/api";
import { audit } from "@/lib/audit";

const schema = z.object({ email: z.string().email() });

export const POST = handle(async (request: NextRequest) => {
  const body = await parseBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    // Do not reveal whether an account exists.
    return { status: "if_an_account_exists_a_reset_link_was_sent" };
  }
  const email = parsed.data.email.toLowerCase();
  const db = getDb();
  const user = await db.select().from(users).where(eq(users.email, email)).limit(1).get();
  if (user) {
    const token = await createRecoveryToken(user.id, "password_reset", 30);
    const settings = getSettings();
    const link = `${settings.appBaseUrl}/auth/reset-password?token=${token}`;
    await sendEmail(
      email,
      "Reset your password",
      `<p>Reset your Zentrion password:</p>
       <p><a href="${link}">Reset password</a></p>
       <p>This link expires in 30 minutes.</p>
       <p>If you did not request this, you can ignore this email.</p>`,
    );
    await audit("user.password_reset_requested", { actorId: user.id, entityType: "user", entityId: user.id });
  }
  return { status: "if_an_account_exists_a_reset_link_was_sent" };
});
