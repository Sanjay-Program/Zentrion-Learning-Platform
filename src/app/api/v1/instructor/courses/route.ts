import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle, parseBody } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
import { createCourse, listInstructorCourses } from "@/lib/instructor";

const schema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300).optional(),
  description: z.string().max(10000).optional(),
  level: z.string().max(40).optional(),
  priceCents: z.number().int().min(0).max(10_000_000).optional(),
});

/** List courses the user teaches. */
export const GET = handle(async () => {
  const user = await requireUser();
  const courses = await listInstructorCourses(user);
  return { courses };
});

/** Create a new course. */
export const POST = handle(async (request: NextRequest) => {
  const user = await requireUser();
  const body = await parseBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ValidationError("Invalid request");
  const course = await createCourse(user, parsed.data);
  return { course };
});
