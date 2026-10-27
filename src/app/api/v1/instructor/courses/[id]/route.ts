import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle, parseBody } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
import { getInstructorCourse, updateCourse } from "@/lib/instructor";

const schema = z.object({
  title: z.string().min(1).max(200).optional(),
  subtitle: z.string().max(300).optional(),
  description: z.string().max(10000).optional(),
  status: z.enum(["draft", "in_review", "published", "archived"]).optional(),
  level: z.string().max(40).optional(),
  language: z.string().max(10).optional(),
  estimatedHours: z.number().int().min(1).max(500).nullable().optional(),
  priceCents: z.number().int().min(0).max(10_000_000).optional(),
  categoryId: z.number().int().positive().nullable().optional(),
});

/** Get the full course with its curriculum. */
export const GET = handle(async (_request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const course = await getInstructorCourse(user, Number(id));
  if (!course) throw new ValidationError("Course not found");
  return { course };
});

/** Update course metadata. */
export const PUT = handle(async (request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const body = await parseBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ValidationError("Invalid request");
  const course = await updateCourse(user, Number(id), parsed.data);
  return { course };
});
