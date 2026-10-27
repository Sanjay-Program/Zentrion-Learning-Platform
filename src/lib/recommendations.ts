import { eq, or, like } from "drizzle-orm";
import { getDb } from "@/db/client";
import { courses, categories, userProfiles } from "@/db/schema";

const INTEREST_TO_CATEGORY: Record<string, string> = {
  ai: "artificial-intelligence",
  "prompt-engineering": "prompt-engineering",
  "agentic-ai": "agentic-ai",
  "ai-apps": "ai-application-development",
  cybersecurity: "cybersecurity",
  python: "programming",
  "data-science": "data-science",
  devops: "devops",
  cloud: "cloud-computing",
  "career-development": "career-development",
};

export interface Recommendation {
  id: number;
  slug: string;
  title: string;
  level: string;
  estimatedHours: number | null;
  isFree: boolean;
  reason: string;
}

/**
 * Explainable recommendations derived from the learner's
 * declared interests plus enrolment state. No opaque ranking.
 */
export async function generateRecommendations(
  userId: number,
  limit = 6,
): Promise<Recommendation[]> {
  const db = getDb();
  const profile = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1)
    .get();
  const interests: string[] = profile?.interests ?? [];

  const categorySlugs = interests
    .map((i) => INTEREST_TO_CATEGORY[i])
    .filter(Boolean);

  const candidates: { score: number; course: (typeof courses.$inferSelect) }[] = [];
  const all = await db
    .select()
    .from(courses)
    .where(eq(courses.status, "published"))
    .all();

  for (const course of all) {
    let score = 0;
    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.id, course.categoryId ?? -1))
      .limit(1)
      .get();
    if (category && categorySlugs.includes(category.slug)) {
      score = 2; // matches declared interests
    } else if (course.isFeatured) {
      score = 1; // popular
    }
    if (score > 0) candidates.push({ score, course });
  }

  candidates.sort((a, b) => b.score - a.score || b.course.id - a.course.id);
  return candidates.slice(0, limit).map(({ score, course }) => ({
    id: course.id,
    slug: course.slug,
    title: course.title,
    level: course.level,
    estimatedHours: course.estimatedHours,
    isFree: course.priceCents <= 0,
    reason: score === 2 ? "Matches your interests" : "Popular on Zentrion",
  }));
}
