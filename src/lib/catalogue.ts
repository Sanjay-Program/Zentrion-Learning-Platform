import { and, count, desc, eq, inArray, like, or } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  categories,
  challengeDefinitions,
  courses,
  enrollments,
  labDefinitions,
  learningPathItems,
  learningPaths,
  lessons,
  liveSessions,
  modules,
  projectDefinitions,
  sessionRegistrations,
  users,
} from "@/db/schema";

export interface CourseRow {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  level: string;
  estimatedHours: number | null;
  priceCents: number;
  isFeatured: boolean;
  categorySlug: string | null;
  categoryName: string | null;
  instructorName: string | null;
  lessonCount: number;
}

export interface CourseFilters {
  q?: string;
  category?: string;
  level?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

/** Published courses with aggregated lesson counts and category info. */
export async function listCourses(filters: CourseFilters = {}): Promise<CourseRow[]> {
  const db = getDb();
  const limit = filters.limit ?? 60;
  const offset = filters.offset ?? 0;

  const conditions: (SQL<unknown> | undefined)[] = [
    eq(courses.status, "published"),
    eq(courses.isPublished, true),
  ];
  if (filters.q) {
    conditions.push(
      or(
        like(courses.title, `%${filters.q}%`),
        like(courses.description, `%${filters.q}%`),
      ),
    );
  }
  if (filters.category) {
    conditions.push(eq(categories.slug, filters.category));
  }
  if (filters.level) {
    conditions.push(eq(courses.level, filters.level));
  }
  if (filters.featured) {
    conditions.push(eq(courses.isFeatured, true));
  }
  const where = and(...conditions.filter((c): c is SQL<unknown> => !!c));

  const rows = await db
    .select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      subtitle: courses.subtitle,
      description: courses.description,
      level: courses.level,
      estimatedHours: courses.estimatedHours,
      priceCents: courses.priceCents,
      isFeatured: courses.isFeatured,
      categorySlug: categories.slug,
      categoryName: categories.name,
      instructorName: users.displayName,
    })
    .from(courses)
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .leftJoin(users, eq(courses.instructorId, users.id))
    .where(where)
    .orderBy(desc(courses.isFeatured), desc(courses.id))
    .limit(limit)
    .offset(offset)
    .all();

  const ids = rows.map((r) => r.id);
  if (ids.length === 0) return [];
  const lessonCounts = await db
    .select({ courseId: modules.courseId, n: count(lessons.id) })
    .from(modules)
    .innerJoin(lessons, eq(lessons.moduleId, modules.id))
    .where(inArray(modules.courseId, ids))
    .groupBy(modules.courseId)
    .all();
  const countByCourse = new Map(lessonCounts.map((r) => [r.courseId, r.n]));
  return rows.map((r) => ({ ...r, lessonCount: countByCourse.get(r.id) ?? 0 }));
}

export interface CourseDetail extends CourseRow {
  modules: {
    id: number;
    title: string;
    description: string | null;
    lessons: {
      id: number;
      title: string;
      lessonType: string;
      durationMinutes: number | null;
      isPreview: boolean;
      orderIndex: number;
    }[];
  }[];
}

/** Full course with its modules and lessons. */
export async function getCourseBySlug(slug: string): Promise<CourseDetail | null> {
  const db = getDb();
  const course = await db
    .select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      subtitle: courses.subtitle,
      description: courses.description,
      level: courses.level,
      estimatedHours: courses.estimatedHours,
      priceCents: courses.priceCents,
      isFeatured: courses.isFeatured,
      categorySlug: categories.slug,
      categoryName: categories.name,
      instructorName: users.displayName,
    })
    .from(courses)
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .leftJoin(users, eq(courses.instructorId, users.id))
    .where(and(eq(courses.slug, slug), eq(courses.status, "published")))
    .limit(1)
    .get();
  if (!course) return null;

  const mods = await db
    .select()
    .from(modules)
    .where(eq(modules.courseId, course.id))
    .orderBy(modules.orderIndex)
    .all();

  const courseLessons = mods.length
    ? await db
        .select({
          id: lessons.id,
          moduleId: lessons.moduleId,
          title: lessons.title,
          lessonType: lessons.lessonType,
          durationMinutes: lessons.durationMinutes,
          isPreview: lessons.isPreview,
          orderIndex: lessons.orderIndex,
        })
        .from(lessons)
        .where(inArray(lessons.moduleId, mods.map((m) => m.id)))
        .orderBy(lessons.orderIndex)
        .all()
    : [];

  const lessonsByModule = new Map<number, CourseDetail["modules"][number]["lessons"]>();
  for (const lesson of courseLessons) {
    const bucket = lessonsByModule.get(lesson.moduleId) ?? [];
    bucket.push(lesson);
    lessonsByModule.set(lesson.moduleId, bucket);
  }

  return {
    ...course,
    lessonCount: courseLessons.length,
    modules: mods.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      lessons: lessonsByModule.get(m.id) ?? [],
    })),
  };
}

export interface PathRow {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  level: string;
  estimatedHours: number | null;
  courseCount: number;
}

export async function listPaths(): Promise<PathRow[]> {
  const db = getDb();
  const paths = await db
    .select()
    .from(learningPaths)
    .where(eq(learningPaths.isPublished, true))
    .orderBy(learningPaths.id)
    .all();
  const result: PathRow[] = [];
  for (const p of paths) {
    const items = await db
      .select({ courseId: learningPathItems.courseId })
      .from(learningPathItems)
      .where(eq(learningPathItems.pathId, p.id))
      .all();
    result.push({ ...p, courseCount: items.length });
  }
  return result;
}

export interface PathDetail extends PathRow {
  courses: CourseRow[];
}

export async function getPathBySlug(slug: string): Promise<PathDetail | null> {
  const db = getDb();
  const path = await db
    .select()
    .from(learningPaths)
    .where(and(eq(learningPaths.slug, slug), eq(learningPaths.isPublished, true)))
    .limit(1)
    .get();
  if (!path) return null;
  const items = await db
    .select({ courseId: learningPathItems.courseId })
    .from(learningPathItems)
    .where(eq(learningPathItems.pathId, path.id))
    .orderBy(learningPathItems.orderIndex)
    .all();

  const pathCourses: CourseRow[] = [];
  if (items.length) {
    const rows = await db
      .select({
        id: courses.id,
        slug: courses.slug,
        title: courses.title,
        subtitle: courses.subtitle,
        description: courses.description,
        level: courses.level,
        estimatedHours: courses.estimatedHours,
        priceCents: courses.priceCents,
        isFeatured: courses.isFeatured,
        categorySlug: categories.slug,
        categoryName: categories.name,
        instructorName: users.displayName,
      })
      .from(courses)
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .leftJoin(users, eq(courses.instructorId, users.id))
      .where(and(inArray(courses.id, items.map((i) => i.courseId)), eq(courses.status, "published")))
      .all();
    for (const item of items) {
      const row = rows.find((r) => r.id === item.courseId);
      if (row) pathCourses.push({ ...row, lessonCount: 0 });
    }
  }
  return { ...path, courseCount: pathCourses.length, courses: pathCourses };
}

export interface LabRow {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  labType: string;
  difficulty: string;
  estimatedMinutes: number;
  objectives: string[];
}

export async function listLabs(): Promise<LabRow[]> {
  const db = getDb();
  return db
    .select()
    .from(labDefinitions)
    .where(eq(labDefinitions.isPublished, true))
    .orderBy(labDefinitions.id)
    .all();
}

export async function listChallenges(): Promise<typeof challengeDefinitions.$inferSelect[]> {
  const db = getDb();
  return db
    .select()
    .from(challengeDefinitions)
    .where(eq(challengeDefinitions.isPublished, true))
    .orderBy(challengeDefinitions.id)
    .all();
}

export interface LiveSessionRow {
  id: number;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  seatLimit: number | null;
  instructorName: string | null;
  registrationCount: number;
}

export async function listLiveSessions(): Promise<LiveSessionRow[]> {
  const db = getDb();
  const sessions = await db
    .select({
      id: liveSessions.id,
      title: liveSessions.title,
      description: liveSessions.description,
      startsAt: liveSessions.startsAt,
      endsAt: liveSessions.endsAt,
      seatLimit: liveSessions.seatLimit,
      instructorName: users.displayName,
    })
    .from(liveSessions)
    .leftJoin(users, eq(liveSessions.instructorId, users.id))
    .where(eq(liveSessions.isPublished, true))
    .orderBy(liveSessions.startsAt)
    .all();
  const result: LiveSessionRow[] = [];
  for (const s of sessions) {
    const regs = await db
      .select({ n: count(sessionRegistrations.id) })
      .from(sessionRegistrations)
      .where(eq(sessionRegistrations.sessionId, s.id))
      .all();
    result.push({ ...s, registrationCount: regs[0]?.n ?? 0 });
  }
  return result;
}

/** Whether a user is enrolled in a course. */
export async function isEnrolled(userId: number, courseId: number): Promise<boolean> {
  const db = getDb();
  const row = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)))
    .limit(1)
    .get();
  return !!row;
}

/** All categories for filter UI. */
export async function listCategories() {
  const db = getDb();
  return db
    .select({ slug: categories.slug, name: categories.name })
    .from(categories)
    .orderBy(categories.name)
    .all();
}

// ---------------------------------------------------------------------------
// Capstone projects
// ---------------------------------------------------------------------------

export interface ProjectRow {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  brief: string | null;
  level: string;
  categoryName: string | null;
  milestoneCount: number;
}

/** Published capstone projects. */
export async function listProjects(): Promise<ProjectRow[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: projectDefinitions.id,
      slug: projectDefinitions.slug,
      title: projectDefinitions.title,
      description: projectDefinitions.description,
      brief: projectDefinitions.brief,
      level: projectDefinitions.level,
      categoryName: categories.name,
      rubric: projectDefinitions.rubric,
    })
    .from(projectDefinitions)
    .leftJoin(categories, eq(projectDefinitions.categoryId, categories.id))
    .orderBy(projectDefinitions.id)
    .all();
  return rows.map((r) => ({
    ...r,
    milestoneCount: Array.isArray(r.rubric) ? r.rubric.length : 0,
  }));
}

export interface ProjectDetail extends ProjectRow {
  brief: string | null;
  rubric: string[];
  relatedCourseSlugs: string[];
}

/** Full capstone project with rubric and related courses. */
export async function getProjectBySlug(slug: string): Promise<ProjectDetail | null> {
  const db = getDb();
  const row = await db
    .select({
      id: projectDefinitions.id,
      slug: projectDefinitions.slug,
      title: projectDefinitions.title,
      description: projectDefinitions.description,
      brief: projectDefinitions.brief,
      level: projectDefinitions.level,
      categoryName: categories.name,
      rubric: projectDefinitions.rubric,
    })
    .from(projectDefinitions)
    .leftJoin(categories, eq(projectDefinitions.categoryId, categories.id))
    .where(eq(projectDefinitions.slug, slug))
    .limit(1)
    .get();
  if (!row) return null;

  const rubric = Array.isArray(row.rubric)
    ? (row.rubric as unknown[]).map((r) => (typeof r === "string" ? r : JSON.stringify(r)))
    : [];

  // Related courses share the project's category.
  const related = row.categoryName
    ? await db
        .select({ slug: courses.slug })
        .from(courses)
        .innerJoin(categories, eq(courses.categoryId, categories.id))
        .where(and(eq(categories.name, row.categoryName), eq(courses.status, "published")))
        .limit(4)
        .all()
    : [];

  return {
    ...row,
    milestoneCount: rubric.length,
    rubric,
    relatedCourseSlugs: related.map((r) => r.slug),
  };
}
