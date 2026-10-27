import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/server";
import { getDb } from "@/db/client";
import { lessons } from "@/db/schema";
import { listNotes, saveNote } from "@/lib/learning";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { handle, parseBody } from "@/lib/api";
import { z } from "zod";

const noteSchema = z.object({
  content: z.string().min(1).max(20000),
});

/** List notes for a lesson, or create a new one. */
export const GET = handle(async (request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const lessonId = Number(id ?? new URL(request.url).searchParams.get("id"));
  const notes = await listNotes(user.id, lessonId);
  return { notes };
});

export const POST = handle(async (request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const lessonId = Number(id ?? new URL(request.url).searchParams.get("id"));

  const db = getDb();
  const lesson = await db
    .select()
    .from(lessons)
    .where(eq(lessons.id, lessonId))
    .limit(1)
    .get();
  if (!lesson) throw new NotFoundError("Lesson not found");

  const body = await parseBody(request);
  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError("Note content is required");

  const note = await saveNote(user.id, lessonId, parsed.data.content);
  return { note };
});
