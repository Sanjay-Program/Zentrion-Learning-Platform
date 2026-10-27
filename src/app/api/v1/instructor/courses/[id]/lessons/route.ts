import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle, parseBody } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
import { createLesson } from "@/lib/instructor";

const schema = z.object({
  moduleId: z.number().int().positive(),
  title: z.string().min(1).max(200),
  lessonType: z
    .enum(["video", "reading", "text", "quiz", "assignment", "project", "lab"])
    .optional(),
  content: z.string().max(100000).optional(),
  durationMinutes: z.number().int().min(1).max(1440).nullable().optional(),
  isPreview: z.boolean().optional(),
});

/** Add a lesson to a module in the course. */
export const POST = handle(async (request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const body = await parseBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ValidationError("Invalid request");
  const course = await createLesson(user, Number(id), parsed.data);
  return { course };
});
