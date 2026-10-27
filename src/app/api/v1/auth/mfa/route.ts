import { NextRequest } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/db/client";
import { mfaMethods } from "@/db/schema";
import {
  getCurrentUser,
  generateTotpSecret,
  totpProvisioningUri,
  verifyTotp,
  encryptSecret,
  decryptSecret,
} from "@/lib/auth";
import { handle, parseBody, json } from "@/lib/api";
import { ForbiddenError, ValidationError, ConflictError } from "@/lib/errors";
import { audit } from "@/lib/audit";
import qrcode from "qrcode";

const confirmSchema = z.object({ code: z.string().min(6).max(6) });

export const GET = handle(async () => {
  const user = await getCurrentUser();
  if (!user) return { enabled: false };
  const db = getDb();
  const method = await db
    .select()
    .from(mfaMethods)
    .where(and(eq(mfaMethods.userId, user.id), eq(mfaMethods.confirmed, true)))
    .limit(1)
    .get();
  return { enabled: !!method };
});

export const POST = handle(async (request: NextRequest) => {
  // Enable: generate a pending TOTP secret + QR code.
  const user = await getCurrentUser();
  if (!user) throw new ForbiddenError("Not authenticated");
  const db = getDb();
  const pending = await db
    .select()
    .from(mfaMethods)
    .where(and(eq(mfaMethods.userId, user.id), eq(mfaMethods.confirmed, false)))
    .limit(1)
    .get();
  if (pending) throw new ConflictError("MFA setup already in progress — confirm or discard it");

  const secret = generateTotpSecret();
  const encrypted = await encryptSecret(secret);
  await db
    .insert(mfaMethods)
    .values({ userId: user.id, methodType: "totp", secretEncrypted: encrypted, confirmed: false })
    .run();

  const uri = totpProvisioningUri(secret, user.email);
  const qrDataUrl = await qrcode.toDataURL(uri, { width: 220, margin: 1 });
  return { secret, provisioningUri: uri, qrCode: qrDataUrl };
});

export const PUT = handle(async (request: NextRequest) => {
  // Confirm the pending TOTP setup.
  const user = await getCurrentUser();
  if (!user) throw new ForbiddenError("Not authenticated");
  const body = await parseBody(request);
  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError("A 6-digit code is required");

  const db = getDb();
  const pending = await db
    .select()
    .from(mfaMethods)
    .where(and(eq(mfaMethods.userId, user.id), eq(mfaMethods.confirmed, false)))
    .limit(1)
    .get();
  if (!pending) throw new ValidationError("No pending MFA setup");
  const secret = await decryptSecret(pending.secretEncrypted);
  if (!(await verifyTotp(secret, parsed.data.code))) {
    throw new ValidationError("Invalid code");
  }
  await db.update(mfaMethods).set({ confirmed: true }).where(eq(mfaMethods.id, pending.id)).run();
  await audit("user.mfa_enabled", { actorId: user.id, entityType: "user", entityId: user.id });
  return { status: "mfa_enabled" };
});

export const DELETE = handle(async (request: NextRequest) => {
  // Disable MFA (requires a valid code).
  const user = await getCurrentUser();
  if (!user) throw new ForbiddenError("Not authenticated");
  const body = await parseBody(request);
  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError("A 6-digit code is required");

  const db = getDb();
  const method = await db
    .select()
    .from(mfaMethods)
    .where(and(eq(mfaMethods.userId, user.id), eq(mfaMethods.confirmed, true)))
    .limit(1)
    .get();
  if (!method) throw new ValidationError("MFA is not enabled");
  const secret = await decryptSecret(method.secretEncrypted);
  if (!(await verifyTotp(secret, parsed.data.code))) {
    throw new ValidationError("Invalid code");
  }
  await db.delete(mfaMethods).where(eq(mfaMethods.id, method.id)).run();
  await audit("user.mfa_disabled", { actorId: user.id, entityType: "user", entityId: user.id });
  return { status: "mfa_disabled" };
});
