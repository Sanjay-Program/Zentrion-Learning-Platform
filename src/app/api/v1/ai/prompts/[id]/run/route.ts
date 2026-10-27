import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle, parseBody } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
import { runPrompt } from "@/lib/ai";

const schema = z.object({
  variables: z.record(z.string()).optional(),
  model: z.string().max(80).optional(),
});

/** Render a prompt template with variables and execute it against the model. */
export const POST = handle(async (request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const body = await parseBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ValidationError("Invalid request");

  const result = await runPrompt(Number(id), user.id, parsed.data.variables ?? {}, parsed.data.model);
  return result;
});
