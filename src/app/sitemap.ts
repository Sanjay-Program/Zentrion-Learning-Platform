import { getDb } from "@/db/client";
import { courses, learningPaths, labDefinitions, challengeDefinitions, projectDefinitions } from "@/db/schema";
import { eq } from "drizzle-orm";

const BASE = process.env.APP_BASE_URL || "http://localhost:3000";

export default async function sitemap() {
  const db = getDb();

  const [courseRows, pathRows, labRows, challengeRows, projectRows] = await Promise.all([
    db.select({ slug: courses.slug, updatedAt: courses.updatedAt }).from(courses).where(eq(courses.status, "published")).all(),
    db.select({ slug: learningPaths.slug }).from(learningPaths).where(eq(learningPaths.isPublished, true)).all(),
    db.select({ slug: labDefinitions.slug }).from(labDefinitions).where(eq(labDefinitions.isPublished, true)).all(),
    db.select({ slug: challengeDefinitions.slug }).from(challengeDefinitions).where(eq(challengeDefinitions.isPublished, true)).all(),
    db.select({ slug: projectDefinitions.slug }).from(projectDefinitions).all(),
  ]);

  const staticRoutes = [
    "",
    "/courses",
    "/paths",
    "/labs",
    "/challenges",
    "/projects",
    "/cyber",
    "/ai",
    "/events",
    "/pricing",
    "/about",
    "/blog",
    "/contact",
    "/help",
    "/for-colleges",
    "/for-enterprises",
    "/legal",
    "/legal/privacy",
    "/legal/terms",
    "/legal/security",
    "/legal/cookies",
    "/legal/refund",
    "/legal/accessibility",
    "/legal/status",
    "/legal/security-disclosure",
  ];

  const now = new Date();

  return [
    ...staticRoutes.map((route) => ({
      url: `${BASE}${route}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
    ...courseRows.map((c) => ({
      url: `${BASE}/courses/${c.slug}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...pathRows.map((p) => ({
      url: `${BASE}/paths/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...labRows.map((l) => ({
      url: `${BASE}/labs/${l.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...challengeRows.map((c) => ({
      url: `${BASE}/challenges/${c.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...projectRows.map((p) => ({
      url: `${BASE}/projects/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
