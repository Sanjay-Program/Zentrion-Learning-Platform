import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/server";
import { getDb } from "@/db/client";
import { lessons } from "@/db/schema";
import { toggleBookmark } from "@/lib/learning";
import { NotFoundError } from "@/lib/errors";
import { handle } from "@/lib/api";
import { audit } from "@/lib/audit";

/** Toggle a bookmark on the lesson. */
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

  const bookmarked = await toggleBookmark(user.id, lessonId);
  await audit(bookmarked ? "lesson.bookmarked" : "lesson.unbookmarked", {
    actorId: user.id,
    entityType: "lesson",
    entityId: lessonId,
  });
  return { status: bookmarked ? "bookmarked" : "unbookmarked", lessonId };
});
