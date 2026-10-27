/**
 * Instructor domain: course management, curriculum editing,
 * and the grading queue.
 */
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  courses,
  enrollments,
  gradingRecords,
  lessons,
  lessonBlocks,
  modules,
  submissions,
  users,
} from "@/db/schema";
import { hasPermission } from "@/lib/rbac";
import { type User } from "@/lib/auth";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import { slugify, toIso } from "@/lib/utils";

/** True when the user owns the course or can manage any course. */
async function canManageCourse(user: User, courseId: number): Promise<boolean> {
  if (await hasPermission(user, "course.manage")) return true;
  const db = getDb();
  const course = await db
    .select({ instructorId: courses.instructorId })
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1)
    .get();
  return course?.instructorId === user.id;
}

async function requireCourse(user: User, courseId: number) {
  const db = getDb();
  const course = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1)
    .get();
  if (!course) throw new NotFoundError("Course not found");
  if (!(await canManageCourse(user, courseId))) {
    throw new ValidationError("You do not manage this course");
  }
  return course;
}

export interface InstructorCourseRow {
  id: number;
  slug: string;
  title: string;
  status: string;
  level: string;
  priceCents: number;
  isPublished: boolean;
  updatedAt: string;
  lessonCount: number;
  enrollmentCount: number;
}

/** Courses the user teaches (or all, for admins). */
export async function listInstructorCourses(user: User): Promise<InstructorCourseRow[]> {
  const db = getDb();
  const isAdmin = await hasPermission(user, "course.manage");
  const rows = await db
    .select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      status: courses.status,
      level: courses.level,
      priceCents: courses.priceCents,
      isPublished: courses.isPublished,
      updatedAt: courses.updatedAt,
    })
    .from(courses)
    .where(isAdmin ? undefined : eq(courses.instructorId, user.id))
    .orderBy(desc(courses.updatedAt))
    .limit(100)
    .all();

  return Promise.all(
    rows.map(async (row) => {
      const lessonCount = await db
        .select({ n: count(lessons.id) })
        .from(lessons)
        .innerJoin(modules, eq(modules.id, lessons.moduleId))
        .where(eq(modules.courseId, row.id))
        .get();
      const enrollmentCount = await db
        .select({ n: count(enrollments.id) })
        .from(enrollments)
        .where(eq(enrollments.courseId, row.id))
        .get();
      return {
        ...row,
        lessonCount: lessonCount?.n ?? 0,
        enrollmentCount: enrollmentCount?.n ?? 0,
      };
    }),
  );
}

export interface InstructorCourseDetail {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  status: string;
  level: string;
  language: string;
  estimatedHours: number | null;
  priceCents: number;
  currency: string;
  isPublished: boolean;
  categoryId: number | null;
  updatedAt: string;
  modules: {
    id: number;
    title: string;
    description: string | null;
    orderIndex: number;
    lessons: {
      id: number;
      title: string;
      lessonType: string;
      orderIndex: number;
      durationMinutes: number | null;
      isPreview: boolean;
    }[];
  }[];
}

/** Full course with its curriculum tree. */
export async function getInstructorCourse(
  user: User,
  courseId: number,
): Promise<InstructorCourseDetail | null> {
  const course = await requireCourse(user, courseId);
  const db = getDb();
  const courseModules = await db
    .select()
    .from(modules)
    .where(eq(modules.courseId, courseId))
    .orderBy(modules.orderIndex)
    .all();
  const loaded = await Promise.all(
    courseModules.map(async (m) => {
      const courseLessons = await db
        .select()
        .from(lessons)
        .where(eq(lessons.moduleId, m.id))
        .orderBy(lessons.orderIndex)
        .all();
      return { ...m, lessons: courseLessons };
    }),
  );
  return {
    ...course,
    modules: loaded.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      orderIndex: m.orderIndex,
      lessons: m.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        lessonType: l.lessonType,
        orderIndex: l.orderIndex,
        durationMinutes: l.durationMinutes,
        isPreview: l.isPreview,
      })),
    })),
  };
}

const courseUpdateSchemaKeys = [
  "title",
  "subtitle",
  "description",
  "status",
  "level",
  "language",
  "estimatedHours",
  "priceCents",
  "categoryId",
] as const;

export type CourseUpdate = Partial<{
  title: string;
  subtitle: string;
  description: string;
  status: "draft" | "in_review" | "published" | "archived";
  level: string;
  language: string;
  estimatedHours: number | null;
  priceCents: number;
  categoryId: number | null;
}>;

/** Create a course owned by the user. */
export async function createCourse(
  user: User,
  input: { title: string; subtitle?: string; description?: string; level?: string; priceCents?: number },
) {
  const db = getDb();
  const slug = slugify(input.title);
  const existing = await db
    .select({ id: courses.id })
    .from(courses)
    .where(eq(courses.slug, slug))
    .limit(1)
    .get();
  if (existing) throw new ConflictError("A course with this slug already exists");

  const result = await db
    .insert(courses)
    .values({
      slug,
      title: input.title,
      subtitle: input.subtitle ?? "",
      description: input.description ?? "",
      level: input.level ?? "beginner",
      priceCents: input.priceCents ?? 0,
      instructorId: user.id,
    })
    .run();
  return requireCourse(user, Number(result.lastInsertRowid));
}

/** Update course metadata. */
export async function updateCourse(
  user: User,
  courseId: number,
  input: CourseUpdate,
) {
  const course = await requireCourse(user, courseId);
  const db = getDb();
  const set: Partial<typeof courses.$inferInsert> = {};
  for (const key of courseUpdateSchemaKeys) {
    if (key in input) set[key] = input[key] as never;
  }
  await db
    .update(courses)
    .set({ ...set, updatedAt: toIso(new Date()) })
    .where(eq(courses.id, courseId))
    .run();
  return getInstructorCourse(user, courseId);
}

/** Add a module to a course. */
export async function createModule(
  user: User,
  courseId: number,
  input: { title: string; description?: string },
) {
  await requireCourse(user, courseId);
  const db = getDb();
  const max = await db
    .select({ orderIndex: modules.orderIndex })
    .from(modules)
    .where(eq(modules.courseId, courseId))
    .orderBy(desc(modules.orderIndex))
    .limit(1)
    .get();
  const result = await db
    .insert(modules)
    .values({
      courseId,
      title: input.title,
      description: input.description ?? "",
      orderIndex: (max?.orderIndex ?? -1) + 1,
    })
    .run();
  return getInstructorCourse(user, courseId);
}

export async function updateModule(
  user: User,
  courseId: number,
  moduleId: number,
  input: { title?: string; description?: string; orderIndex?: number },
) {
  await requireCourse(user, courseId);
  const db = getDb();
  await db
    .update(modules)
    .set(input)
    .where(and(eq(modules.id, moduleId), eq(modules.courseId, courseId)))
    .run();
  return getInstructorCourse(user, courseId);
}

export async function deleteModule(user: User, courseId: number, moduleId: number) {
  await requireCourse(user, courseId);
  const db = getDb();
  // Lessons cascade via FK; blocks cascade from lessons.
  await db
    .delete(modules)
    .where(and(eq(modules.id, moduleId), eq(modules.courseId, courseId)))
    .run();
  return getInstructorCourse(user, courseId);
}

/** Resolve the course that contains a lesson. */
export async function resolveLessonCourseId(lessonId: number): Promise<number | null> {
  const db = getDb();
  const row = await db
    .select({ courseId: modules.courseId })
    .from(lessons)
    .innerJoin(modules, eq(modules.id, lessons.moduleId))
    .where(eq(lessons.id, lessonId))
    .limit(1)
    .get();
  return row?.courseId ?? null;
}

/** Add a lesson to a module. */
export async function createLesson(
  user: User,
  courseId: number,
  input: {
    moduleId: number;
    title: string;
    lessonType?: string;
    content?: string;
    durationMinutes?: number | null;
    isPreview?: boolean;
  },
) {
  await requireCourse(user, courseId);
  const db = getDb();
  const module = await db
    .select({ id: modules.id })
    .from(modules)
    .where(and(eq(modules.id, input.moduleId), eq(modules.courseId, courseId)))
    .limit(1)
    .get();
  if (!module) throw new ValidationError("Module does not belong to this course");

  const max = await db
    .select({ orderIndex: lessons.orderIndex })
    .from(lessons)
    .where(eq(lessons.moduleId, input.moduleId))
    .orderBy(desc(lessons.orderIndex))
    .limit(1)
    .get();
  const result = await db
    .insert(lessons)
    .values({
      moduleId: input.moduleId,
      title: input.title,
      lessonType: (input.lessonType ?? "text") as typeof lessons.$inferInsert.lessonType,
      content: input.content ?? "",
      durationMinutes: input.durationMinutes ?? null,
      isPreview: input.isPreview ?? false,
      orderIndex: (max?.orderIndex ?? -1) + 1,
    })
    .run();
  const lessonId = Number(result.lastInsertRowid);

  // Seed a default text block with the lesson content.
  if (input.content) {
    await db
      .insert(lessonBlocks)
      .values({ lessonId, blockType: "text", content: input.content, orderIndex: 0 })
      .run();
  }
  return getInstructorCourse(user, courseId);
}

export async function updateLesson(
  user: User,
  courseId: number,
  lessonId: number,
  input: {
    title?: string;
    lessonType?: string;
    content?: string;
    durationMinutes?: number | null;
    isPreview?: boolean;
  },
) {
  await requireCourse(user, courseId);
  const db = getDb();
  const lesson = await db
    .select()
    .from(lessons)
    .innerJoin(modules, eq(modules.id, lessons.moduleId))
    .where(and(eq(lessons.id, lessonId), eq(modules.courseId, courseId)))
    .limit(1)
    .get();
  if (!lesson) throw new NotFoundError("Lesson not found in this course");

  const set: Partial<typeof lessons.$inferInsert> = {};
  if (input.title !== undefined) set.title = input.title;
  if (input.lessonType !== undefined) {
    set.lessonType = input.lessonType as typeof lessons.$inferInsert.lessonType;
  }
  if (input.durationMinutes !== undefined) set.durationMinutes = input.durationMinutes;
  if (input.isPreview !== undefined) set.isPreview = input.isPreview;
  await db.update(lessons).set(set).where(eq(lessons.id, lessonId)).run();

  if (input.content !== undefined) {
    await db
      .update(lessons)
      .set({ content: input.content })
      .where(eq(lessons.id, lessonId))
      .run();
    const block = await db
      .select()
      .from(lessonBlocks)
      .where(and(eq(lessonBlocks.lessonId, lessonId), eq(lessonBlocks.blockType, "text")))
      .limit(1)
      .get();
    if (block) {
      await db
        .update(lessonBlocks)
        .set({ content: input.content })
        .where(eq(lessonBlocks.id, block.id))
        .run();
    } else {
      await db
        .insert(lessonBlocks)
        .values({ lessonId, blockType: "text", content: input.content, orderIndex: 0 })
        .run();
    }
  }
  return getInstructorCourse(user, courseId);
}

export async function deleteLesson(user: User, courseId: number, lessonId: number) {
  await requireCourse(user, courseId);
  const db = getDb();
  await db
    .delete(lessons)
    .where(eq(lessons.id, lessonId))
    .run();
  return getInstructorCourse(user, courseId);
}

// ---------------------------------------------------------------------------
// Grading queue
// ---------------------------------------------------------------------------

export interface InstructorSubmission {
  id: number;
  content: string | null;
  status: string;
  submittedAt: string;
  lessonId: number | null;
  lessonTitle: string | null;
  courseId: number;
  courseTitle: string;
  learnerId: number;
  learnerName: string;
  learnerEmail: string;
  grade: { scorePercent: number; feedback: string | null } | null;
}

/** Submissions for lessons in the user's courses, newest first. */
export async function listInstructorSubmissions(user: User): Promise<InstructorSubmission[]> {
  const db = getDb();
  const isAdmin = await hasPermission(user, "grade.submissions");
  const courseRows = await db
    .select({ id: courses.id })
    .from(courses)
    .where(isAdmin ? undefined : eq(courses.instructorId, user.id))
    .all();
  const courseIds = courseRows.map((c) => c.id);
  if (courseIds.length === 0) return [];

  const rows = await db
    .select({
      id: submissions.id,
      content: submissions.content,
      status: submissions.status,
      submittedAt: submissions.submittedAt,
      lessonId: submissions.lessonId,
      lessonTitle: lessons.title,
      courseId: courses.id,
      courseTitle: courses.title,
      learnerId: users.id,
      learnerName: users.displayName,
      learnerEmail: users.email,
    })
    .from(submissions)
    .innerJoin(users, eq(users.id, submissions.userId))
    .leftJoin(lessons, eq(lessons.id, submissions.lessonId))
    .innerJoin(modules, eq(modules.id, lessons.moduleId))
    .innerJoin(courses, eq(courses.id, modules.courseId))
    .where(inArray(courses.id, courseIds))
    .orderBy(desc(submissions.id))
    .limit(100)
    .all();

  return Promise.all(
    rows.map(async (row) => {
      const grade =
        (await db
          .select({ scorePercent: gradingRecords.scorePercent, feedback: gradingRecords.feedback })
          .from(gradingRecords)
          .where(eq(gradingRecords.submissionId, row.id))
          .orderBy(desc(gradingRecords.id))
          .limit(1)
          .get()) ?? null;
      return { ...row, grade };
    }),
  );
}

/** Grade a submission (instructor or admin only). */
export async function gradeSubmission(
  user: User,
  submissionId: number,
  input: { scorePercent: number; feedback?: string; rubricScores?: unknown[] },
) {
  if (!(await hasPermission(user, "grade.submissions"))) {
    // Fall back to ownership: allow grading submissions in own courses.
    const submissionsList = await listInstructorSubmissions(user);
    if (!submissionsList.some((s) => s.id === submissionId)) {
      throw new ValidationError("You cannot grade this submission");
    }
  }
  const db = getDb();
  const submission = await db
    .select()
    .from(submissions)
    .where(eq(submissions.id, submissionId))
    .limit(1)
    .get();
  if (!submission) throw new NotFoundError("Submission not found");

  if (input.scorePercent < 0 || input.scorePercent > 100) {
    throw new ValidationError("Score must be between 0 and 100");
  }

  await db
    .insert(gradingRecords)
    .values({
      submissionId,
      graderId: user.id,
      scorePercent: input.scorePercent,
      rubricScores: input.rubricScores ?? [],
      feedback: input.feedback ?? "",
    })
    .run();
  await db
    .update(submissions)
    .set({ status: input.scorePercent >= 60 ? "graded" : "revised" })
    .where(eq(submissions.id, submissionId))
    .run();

  const grade = await db
    .select({ scorePercent: gradingRecords.scorePercent, feedback: gradingRecords.feedback })
    .from(gradingRecords)
    .where(eq(gradingRecords.submissionId, submissionId))
    .orderBy(desc(gradingRecords.id))
    .limit(1)
    .get();
  const list = await listInstructorSubmissions(user);
  const row = list.find((s) => s.id === submissionId);
  return {
    submissionId,
    scorePercent: grade?.scorePercent ?? input.scorePercent,
    feedback: grade?.feedback ?? input.feedback ?? "",
    status: row?.status ?? "graded",
  };
}
