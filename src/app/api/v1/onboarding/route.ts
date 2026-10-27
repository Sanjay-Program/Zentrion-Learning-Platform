import { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { userProfiles } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { handle, parseBody } from "@/lib/api";
import { ForbiddenError, ValidationError } from "@/lib/errors";
import { generateRecommendations } from "@/lib/recommendations";
import { GOAL_OPTIONS, INTEREST_OPTIONS, ROLE_OPTIONS } from "@/lib/onboarding-options";

const schema = z.object({
  interests: z.array(z.string()).max(20).optional(),
  careerGoal: z.string().max(200).optional(),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  weeklyHours: z.number().int().min(1).max(80).optional(),
});

export const GET = handle(async () => {
  const user = await getCurrentUser();
  if (!user) throw new ForbiddenError("Not authenticated");
  const db = getDb();
  const profile = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id))
    .limit(1)
    .get();
  return {
    profile: profile ?? null,
    options: {
      interests: INTEREST_OPTIONS,
      roles: ROLE_OPTIONS,
      goals: GOAL_OPTIONS,
      levels: ["beginner", "intermediate", "advanced"],
    },
  };
});

export const POST = handle(async (request: NextRequest) => {
  const user = await getCurrentUser();
  if (!user) throw new ForbiddenError("Not authenticated");
  const body = await parseBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Invalid onboarding data", {
      fields: parsed.error.flatten().fieldErrors,
    });
  }
  const db = getDb();
  const existing = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id))
    .limit(1)
    .get();
  const values = {
    interests: parsed.data.interests ?? existing?.interests ?? [],
    careerGoal: parsed.data.careerGoal ?? existing?.careerGoal ?? null,
    experienceLevel: parsed.data.experienceLevel ?? existing?.experienceLevel ?? null,
    weeklyHours: parsed.data.weeklyHours ?? existing?.weeklyHours ?? null,
    onboardingCompleted: true,
  };
  if (existing) {
    await db.update(userProfiles).set(values).where(eq(userProfiles.userId, user.id)).run();
  } else {
    await db.insert(userProfiles).values({ userId: user.id, ...values }).run();
  }
  const recommendations = await generateRecommendations(user.id);
  return { status: "saved", recommendations };
});
