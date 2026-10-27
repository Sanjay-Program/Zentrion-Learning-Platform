import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/server";
import { getDb } from "@/db/client";
import { enrollments, lessons } from "@/db/schema";
import { setLessonCompleted } from "@/lib/learning";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { handle, parseBody } from "@/lib/api";
import { z } from "zod";

const schema = z.object({ enrollmentId: z.number().int().positive() });

/** Mark the lesson as not complete. */
export const POST = handle(async (request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const lessonId = Number(id ?? new URL(request.url).searchParams.get("id"));
  const body = await parseBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ValidationError("Invalid request");
  const { enrollmentId } = parsed.data;

  const db = getDb();
  const lesson = await db
    .select()
    .from(lessons)
    .where(eq(lessons.id, lessonId))
    .limit(1)
    .get();
  if (!lesson) throw new NotFoundError("Lesson not found");

  const enrollment = await db
    .select()
    .from(enrollments)
    .where(eq(enrollments.id, enrollmentId))
    .limit(1)
    .get();
  if (!enrollment || enrollment.userId !== user.id) {
    throw new ValidationError("Enrolment not found");
  }

  await setLessonCompleted(enrollmentId, lessonId, false);
  return { status: "incomplete", lessonId };
});
