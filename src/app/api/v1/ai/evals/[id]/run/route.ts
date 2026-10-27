import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle, parseBody } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
import { runEvaluation } from "@/lib/ai";

/** Execute every case in the dataset and score against expected output. */
export const POST = handle(async (request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const body = await parseBody(request).catch(() => ({}));
  const parsed = z.object({ model: z.string().max(80).optional() }).safeParse(body);
  if (!parsed.success) throw new ValidationError("Invalid request");
  const summary = await runEvaluation(Number(id), user.id, parsed.data.model);
  return summary;
});
