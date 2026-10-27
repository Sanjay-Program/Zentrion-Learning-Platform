import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle, parseBody } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
import { gradeSubmission } from "@/lib/instructor";

const schema = z.object({
  scorePercent: z.number().int().min(0).max(100),
  feedback: z.string().max(5000).optional(),
  rubricScores: z.array(z.unknown()).max(50).optional(),
});

/** Grade a learner submission. */
export const POST = handle(async (request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const body = await parseBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ValidationError("Invalid request");
  const result = await gradeSubmission(user, Number(id), parsed.data);
  return result;
});
