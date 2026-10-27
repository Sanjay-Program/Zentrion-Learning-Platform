import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle, parseBody } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
import { createModule } from "@/lib/instructor";

const schema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
});

/** Add a module to a course. */
export const POST = handle(async (request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const body = await parseBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ValidationError("Invalid request");
  const course = await createModule(user, Number(id), parsed.data);
  return { course };
});
