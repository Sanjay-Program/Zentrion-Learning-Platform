import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  certificates,
  courses as coursesTable,
  enrollments,
  lessons,
  lessonBookmarks,
  lessonProgress,
  learnerNotes,
  modules,
} from "@/db/schema";
import { NotFoundError } from "@/lib/errors";

export interface CourseProgress {
  courseId: number;
  courseSlug: string;
  courseTitle: string;
  level: string;
  totalLessons: number;
  completedLessons: number;
  percent: number;
  lastAccessedAt: string | null;
}

/** Progress summary for every active enrolment of a user. */
export async function getCourseProgress(userId: number): Promise<CourseProgress[]> {
  const db = getDb();
  const active = await db
    .select({
      enrollmentId: enrollments.id,
      courseId: enrollments.courseId,
      lastAccessedAt: enrollments.lastAccessedAt,
    })
    .from(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.status, "active")))
    .all();

  const result: CourseProgress[] = [];
  for (const enr of active) {
    const courseRow = await db
      .select({ slug: coursesTable.slug, title: coursesTable.title, level: coursesTable.level })
      .from(coursesTable)
      .where(eq(coursesTable.id, enr.courseId))
      .limit(1)
      .get();
    if (!courseRow) continue;

    // All lessons in the course, with this enrolment's progress.
    const courseModules = await db
      .select({ id: modules.id })
      .from(modules)
      .where(eq(modules.courseId, enr.courseId))
      .all();
    const moduleIds = courseModules.map((m) => m.id);

    const allLessonRows = moduleIds.length
      ? await db
          .select({ id: lessons.id, completed: lessonProgress.completed })
          .from(lessons)
          .leftJoin(
            lessonProgress,
            and(
              eq(lessonProgress.lessonId, lessons.id),
              eq(lessonProgress.enrollmentId, enr.enrollmentId),
            ),
          )
          .where(inArray(lessons.moduleId, moduleIds))
          .all()
      : [];

    const completedLessons = allLessonRows.filter((r) => r.completed).length;
    const percent = allLessonRows.length
      ? Math.round((completedLessons / allLessonRows.length) * 100)
      : 0;

    result.push({
      courseId: enr.courseId,
      courseSlug: courseRow.slug,
      courseTitle: courseRow.title,
      level: courseRow.level,
      totalLessons: allLessonRows.length,
      completedLessons,
      percent,
      lastAccessedAt: enr.lastAccessedAt,
    });
  }
  return result;
}

/** Overall completion for one enrolment. */
export async function getEnrollmentProgress(
  enrollmentId: number,
): Promise<{ total: number; completed: number; percent: number }> {
  const db = getDb();
  const rows = await db
    .select({ completed: lessonProgress.completed })
    .from(lessonProgress)
    .where(eq(lessonProgress.enrollmentId, enrollmentId))
    .all();
  const completed = rows.filter((r) => r.completed).length;
  // Total is approximated by progress rows created so far; the course
  // player creates progress rows lazily as lessons are opened.
  return {
    total: rows.length,
    completed,
    percent: rows.length ? Math.round((completed / rows.length) * 100) : 0,
  };
}

/** Mark a lesson complete (or incomplete) for an enrolment. */
export async function setLessonCompleted(
  enrollmentId: number,
  lessonId: number,
  completed: boolean,
): Promise<void> {
  const db = getDb();
  const existing = await db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.enrollmentId, enrollmentId),
        eq(lessonProgress.lessonId, lessonId),
      ),
    )
    .limit(1)
    .get();
  if (existing) {
    await db
      .update(lessonProgress)
      .set({
        completed,
        completedAt: completed ? new Date().toISOString().replace("T", " ").slice(0, 19) : null,
      })
      .where(eq(lessonProgress.id, existing.id))
      .run();
  } else {
    await db
      .insert(lessonProgress)
      .values({
        enrollmentId,
        lessonId,
        completed,
        completedAt: completed ? new Date().toISOString().replace("T", " ").slice(0, 19) : null,
      })
      .run();
  }
}

/** Get the enrolment for (userId, courseId) or throw. */
export async function requireEnrollment(userId: number, courseId: number) {
  const db = getDb();
  const enrollment = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)))
    .limit(1)
    .get();
  if (!enrollment) {
    throw new NotFoundError("You are not enrolled in this course");
  }
  // Touch lastAccessedAt.
  await db
    .update(enrollments)
    .set({ lastAccessedAt: new Date().toISOString().replace("T", " ").slice(0, 19) })
    .where(eq(enrollments.id, enrollment.id))
    .run();
  return enrollment;
}

export interface LearnerNote {
  id: number;
  lessonId: number | null;
  content: string;
  tags: string[];
  videoTimestamp: number | null;
  createdAt: string;
  updatedAt: string;
}

export async function listNotes(userId: number, lessonId?: number): Promise<LearnerNote[]> {
  const db = getDb();
  return db
    .select()
    .from(learnerNotes)
    .where(
      lessonId != null
        ? and(eq(learnerNotes.userId, userId), eq(learnerNotes.lessonId, lessonId))
        : eq(learnerNotes.userId, userId),
    )
    .all();
}

export async function saveNote(
  userId: number,
  lessonId: number | null,
  content: string,
  tags: string[] = [],
): Promise<LearnerNote> {
  const db = getDb();
  const [row] = await db
    .insert(learnerNotes)
    .values({ userId, lessonId, content, tags })
    .returning();
  return row;
}

export async function deleteNote(noteId: number, userId: number): Promise<boolean> {
  const db = getDb();
  const result = await db
    .delete(learnerNotes)
    .where(and(eq(learnerNotes.id, noteId), eq(learnerNotes.userId, userId)))
    .run();
  return (result as unknown as { changes?: number }).changes !== 0;
}

export async function isBookmarked(userId: number, lessonId: number): Promise<boolean> {
  const db = getDb();
  const row = await db
    .select({ id: lessonBookmarks.id })
    .from(lessonBookmarks)
    .where(and(eq(lessonBookmarks.userId, userId), eq(lessonBookmarks.lessonId, lessonId)))
    .limit(1)
    .get();
  return !!row;
}

export async function toggleBookmark(userId: number, lessonId: number): Promise<boolean> {
  const db = getDb();
  const existing = await db
    .select()
    .from(lessonBookmarks)
    .where(and(eq(lessonBookmarks.userId, userId), eq(lessonBookmarks.lessonId, lessonId)))
    .limit(1)
    .get();
  if (existing) {
    await db
      .delete(lessonBookmarks)
      .where(eq(lessonBookmarks.id, existing.id))
      .run();
    return false;
  }
  await db
    .insert(lessonBookmarks)
    .values({ userId, lessonId })
    .run();
  return true;
}

export async function listBookmarks(userId: number) {
  const db = getDb();
  return db
    .select({
      bookmarkId: lessonBookmarks.id,
      lessonId: lessonBookmarks.lessonId,
      lessonTitle: lessons.title,
      createdAt: lessonBookmarks.createdAt,
    })
    .from(lessonBookmarks)
    .innerJoin(lessons, eq(lessons.id, lessonBookmarks.lessonId))
    .where(eq(lessonBookmarks.userId, userId))
    .orderBy(lessonBookmarks.createdAt)
    .all();
}

/** Certificates issued to a user. */
export async function listCertificates(userId: number) {
  const db = getDb();
  return db
    .select({
      id: certificates.id,
      verificationCode: certificates.verificationCode,
      issuedAt: certificates.issuedAt,
      revoked: certificates.revoked,
      courseId: certificates.courseId,
    })
    .from(certificates)
    .where(eq(certificates.userId, userId))
    .all();
}
