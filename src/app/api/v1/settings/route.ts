import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/server";
import { getDb } from "@/db/client";
import { userPreferences, userProfiles } from "@/db/schema";
import { handle, json, parseBody } from "@/lib/api";
import { audit } from "@/lib/audit";
import { z } from "zod";

const interests = z
  .array(z.string().min(1).max(40))
  .max(20)
  .default([]);

const profileSchema = z.object({
  displayName: z.string().min(1).max(80).optional(),
  bio: z.string().max(500).optional().default(""),
  location: z.string().max(120).optional().default(""),
  careerGoal: z.string().max(200).optional().default(""),
  experienceLevel: z.union([z.enum(["beginner", "intermediate", "advanced"]), z.literal("")]).optional(),
  weeklyHours: z.number().int().min(0).max(80).nullable().optional(),
  interests: interests.optional(),
});

const preferencesSchema = z.object({
  theme: z.enum(["system", "light", "dark"]).optional(),
  language: z.string().max(10).optional(),
  emailNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  aiDataRetention: z.boolean().optional(),
  reducedMotion: z.boolean().optional(),
});

export const GET = handle(async () => {
  const user = await requireUser();
  const db = getDb();
  const profile = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id))
    .limit(1)
    .get();
  const preferences = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, user.id))
    .limit(1)
    .get();
  return { profile, preferences };
});

/** Update profile and/or learning preferences. */
export const PUT = handle(async (request: NextRequest) => {
  const user = await requireUser();
  const body = await parseBody(request);
  const db = getDb();

  const profileParsed = profileSchema.partial().safeParse(body);
  if (!profileParsed.success) {
    return json({ error: { code: "validation_error", message: "Invalid profile data" } }, { status: 400, request });
  }
  const prefParsed = preferencesSchema.partial().safeParse(body);
  if (!prefParsed.success) {
    return json({ error: { code: "validation_error", message: "Invalid preference data" } }, { status: 400, request });
  }

  const p = profileParsed.data;
  const pr = prefParsed.data;

  if (Object.keys(p).length > 0) {
    await db
      .insert(userProfiles)
      .values({ userId: user.id, ...p })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: p,
      })
      .run();
  }
  if (Object.keys(pr).length > 0) {
    await db
      .insert(userPreferences)
      .values({ userId: user.id, ...pr })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: pr,
      })
      .run();
  }

  await audit("user.settings_updated", {
    actorId: user.id,
    entityType: "user",
    entityId: user.id,
    details: { profile: Object.keys(p), preferences: Object.keys(pr) },
  });

  return { status: "updated" };
});
