import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  mfaMethods,
  recoveryTokens,
  sessions,
  users,
  userProfiles,
  userPreferences,
  userRoles,
  roles,
} from "@/db/schema";
import { getSettings, isProduction } from "@/lib/config";
import { randomToken, sha256Hex, toIso, addDays } from "@/lib/utils";

export type User = typeof users.$inferSelect & {
  roles?: { key: string }[];
};

const SESSION_COOKIE = "zsession";
const CSRF_COOKIE = "zcsrftoken";

/** Minimal interface for a cookie jar that supports .set() (NextResponse.cookies). */
export interface CookieJar {
  set(options: {
    name: string;
    value: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "lax" | "strict" | "none";
    path?: string;
    maxAge?: number;
  }): void;
}

// ---------------------------------------------------------------------------
// Password hashing (bcrypt, pure JS — Cloudflare compatible)
// ---------------------------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string | null | undefined): Promise<boolean> {
  if (!hash) return false;
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

export async function hashToken(token: string): Promise<string> {
  return sha256Hex(token);
}

export function generateToken(bytes = 32): string {
  return randomToken(bytes);
}

// ---------------------------------------------------------------------------
// Session management (server-side sessions stored in the database)
// ---------------------------------------------------------------------------

export async function createSession(
  userId: number,
  meta: { userAgent?: string; ipAddress?: string },
): Promise<{ sessionId: number; token: string }> {
  const token = generateToken(48);
  const expires = addDays(new Date(), getSettings().sessionCookieAgeDays);
  const db = getDb();
  const [row] = await db
    .insert(sessions)
    .values({
      tokenHash: await hashToken(token),
      userId,
      userAgent: meta.userAgent?.slice(0, 512) ?? null,
      ipAddress: meta.ipAddress ?? null,
      expiresAt: toIso(expires),
    })
    .returning();
  return { sessionId: row.id, token };
}

export async function validateSession(token: string | undefined): Promise<User | null> {
  if (!token) return null;
  const tokenHash = await hashToken(token);
  const db = getDb();
  const now = toIso(new Date());
  const session = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.tokenHash, tokenHash), eq(sessions.revoked, false)))
    .limit(1)
    .get();
  if (!session) return null;
  if (session.expiresAt && session.expiresAt < now) return null;
  const user = await db.select().from(users).where(eq(users.id, session.userId)).limit(1).get();
  if (!user || user.status === "deleted" || user.status === "suspended") return null;
  return user;
}

export async function revokeSession(token: string | undefined): Promise<void> {
  if (!token) return;
  const tokenHash = await hashToken(token);
  const db = getDb();
  await db.update(sessions).set({ revoked: true }).where(eq(sessions.tokenHash, tokenHash)).run();
}

export async function revokeAllUserSessions(userId: number, exceptToken?: string): Promise<void> {
  const db = getDb();
  const all = await db.select().from(sessions).where(eq(sessions.userId, userId)).all();
  if (exceptToken) {
    const exceptHash = await hashToken(exceptToken);
    for (const s of all) {
      if (s.tokenHash !== exceptHash) {
        await db.update(sessions).set({ revoked: true }).where(eq(sessions.id, s.id)).run();
      }
    }
  } else {
    for (const s of all) {
      await db.update(sessions).set({ revoked: true }).where(eq(sessions.id, s.id)).run();
    }
  }
}

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

export function setSessionCookie(cookieJar: CookieJar, token: string) {
  cookieJar.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * getSettings().sessionCookieAgeDays,
  });
}

export function clearSessionCookie(cookieJar: CookieJar) {
  cookieJar.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function ensureCsrfCookie(cookieJar: CookieJar, current?: string): void {
  if (current) return;
  cookieJar.set({
    name: CSRF_COOKIE,
    value: generateToken(24),
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

// ---------------------------------------------------------------------------
// Current user
// ---------------------------------------------------------------------------

export async function getCurrentUser(): Promise<User | null> {
  const token = await getSessionToken();
  return validateSession(token);
}

export async function getUserWithRoles(userId: number): Promise<User | null> {
  const db = getDb();
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1).get();
  if (!user) return null;
  const userRoleRows = await db.select({ key: roles.key }).from(userRoles).innerJoin(roles, eq(userRoles.roleId, roles.id)).where(eq(userRoles.userId, userId)).all();
  return { ...user, roles: userRoleRows };
}

// ---------------------------------------------------------------------------
// Recovery / verification tokens
// ---------------------------------------------------------------------------

export async function createRecoveryToken(
  userId: number,
  purpose: "password_reset" | "email_verify",
  minutes = 60,
): Promise<string> {
  const token = generateToken(32);
  const db = getDb();
  // Invalidate any existing tokens for this user + purpose.
  await db.delete(recoveryTokens).where(and(eq(recoveryTokens.userId, userId), eq(recoveryTokens.purpose, purpose))).run();
  const expires = new Date(Date.now() + minutes * 60_000);
  await db
    .insert(recoveryTokens)
    .values({
      userId,
      tokenHash: await hashToken(token),
      purpose,
      expiresAt: toIso(expires),
    })
    .run();
  return token;
}

export async function consumeRecoveryToken(token: string, purpose: string): Promise<number | null> {
  const tokenHash = await hashToken(token);
  const db = getDb();
  const now = toIso(new Date());
  const record = await db
    .select()
    .from(recoveryTokens)
    .where(
      and(
        eq(recoveryTokens.tokenHash, tokenHash),
        eq(recoveryTokens.purpose, purpose),
        eq(recoveryTokens.used, false),
      ),
    )
    .limit(1)
    .get();
  if (!record) return null;
  if (record.expiresAt < now) return null;
  await db.update(recoveryTokens).set({ used: true }).where(eq(recoveryTokens.id, record.id)).run();
  return record.userId;
}

// ---------------------------------------------------------------------------
// User creation helpers
// ---------------------------------------------------------------------------

export async function createUser(input: {
  email: string;
  password: string;
  displayName: string;
  status?: "active" | "pending_verification";
}): Promise<User> {
  const db = getDb();
  const passwordHash = await hashPassword(input.password);
  const [row] = await db
    .insert(users)
    .values({
      email: input.email.toLowerCase(),
      passwordHash,
      displayName: input.displayName,
      status: input.status ?? "pending_verification",
    })
    .returning();
  const userId = row.id;
  await db.insert(userProfiles).values({ userId }).run();
  await db.insert(userPreferences).values({ userId }).run();
  return (await getUserWithRoles(userId))!;
}

// ---------------------------------------------------------------------------
// MFA (TOTP) — pyotp-equivalent implemented with Web Crypto
// ---------------------------------------------------------------------------

const TOTP_ALGORITHM = { name: "HMAC", hash: "SHA-1" };

function base32Decode(input: string): Uint8Array<ArrayBuffer> {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = input.replace(/=+$/, "").toUpperCase().replace(/\s+/g, "");
  let bits = "";
  for (const ch of clean) {
    const idx = alphabet.indexOf(ch);
    if (idx < 0) throw new Error("Invalid base32 character");
    bits += idx.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return new Uint8Array(bytes);
}

export function generateTotpSecret(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const b of bytes) bits += b.toString(2).padStart(8, "0");
  let secret = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    secret += alphabet[parseInt(bits.slice(i, i + 5), 2)];
  }
  return secret + "======";
}

export async function totpCode(secret: string, timeStep = Math.floor(Date.now() / 1000 / 30)): Promise<string> {
  const key = await crypto.subtle.importKey("raw", base32Decode(secret), TOTP_ALGORITHM, false, ["sign"]);
  const counter = new ArrayBuffer(8);
  const view = new DataView(counter);
  view.setUint32(0, Math.floor(timeStep / 0x100000000));
  view.setUint32(4, timeStep & 0xffffffff);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, counter));
  const offset = sig[sig.length - 1] & 0x0f;
  const code = ((sig[offset] & 0x7f) << 24) | (sig[offset + 1] << 16) | (sig[offset + 2] << 8) | sig[offset + 3];
  return String(code % 1000000).padStart(6, "0");
}

export async function verifyTotp(secret: string, code: string, window = 1): Promise<boolean> {
  const step = Math.floor(Date.now() / 1000 / 30);
  for (let i = -window; i <= window; i++) {
    const expected = await totpCode(secret, step + i);
    if (expected === code) return true;
  }
  return false;
}

export function totpProvisioningUri(secret: string, email: string, issuer = "Zentrion"): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
}

/**
 * Encrypt/decrypt MFA secrets at rest using Web Crypto (AES-GCM)
 * keyed from the app secret. Not a full KMS — but keeps secrets
 * out of plaintext in the database.
 */
async function mfaCryptoKey(): Promise<CryptoKey> {
  const material = new TextEncoder().encode(getSettings().appSecretKey.padEnd(32, "0").slice(0, 32));
  return crypto.subtle.importKey("raw", material, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

export async function encryptSecret(plain: string): Promise<string> {
  const key = await mfaCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plain)),
  );
  const combined = new Uint8Array(iv.length + cipher.length);
  combined.set(iv);
  combined.set(cipher, iv.length);
  return Buffer.from(combined).toString("base64");
}

export async function decryptSecret(encoded: string): Promise<string> {
  const key = await mfaCryptoKey();
  const combined = Buffer.from(encoded, "base64");
  const iv = combined.slice(0, 12);
  const cipher = combined.slice(12);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
  return new TextDecoder().decode(plain);
}

export async function listMfaMethods(userId: number) {
  const db = getDb();
  return db.select().from(mfaMethods).where(eq(mfaMethods.userId, userId)).all();
}
