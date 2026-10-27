import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle, parseBody } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
import {
  deleteLesson,
  resolveLessonCourseId,
  updateLesson,
} from "@/lib/instructor";

const schema = z.object({
  title: z.string().min(1).max(200).optional(),
  lessonType: z
    .enum(["video", "reading", "text", "quiz", "assignment", "project", "lab"])
    .optional(),
  content: z.string().max(100000).optional(),
  durationMinutes: z.number().int().min(1).max(1440).nullable().optional(),
  isPreview: z.boolean().optional(),
});

/** Update a lesson in one of the user's courses. */
export const PUT = handle(async (request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const lessonId = Number(id);
  const courseId = await resolveLessonCourseId(lessonId);
  if (!courseId) throw new ValidationError("Lesson not found");
  const body = await parseBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ValidationError("Invalid request");
  const course = await updateLesson(user, courseId, lessonId, parsed.data);
  return { course };
});

export const DELETE = handle(async (_request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const lessonId = Number(id);
  const courseId = await resolveLessonCourseId(lessonId);
  if (!courseId) throw new ValidationError("Lesson not found");
  const course = await deleteLesson(user, courseId, lessonId);
  return { course };
});
