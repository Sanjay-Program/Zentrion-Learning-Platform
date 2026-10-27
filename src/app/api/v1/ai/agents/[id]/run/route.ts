import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle, parseBody } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
import { getRun, runAgent } from "@/lib/ai";

const schema = z.object({
  inputData: z.record(z.unknown()).optional(),
});

/** Execute an agent run (synchronous, bounded by maxSteps). */
export const POST = handle(async (request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const body = await parseBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ValidationError("Invalid request");
  const run = await runAgent(Number(id), user.id, parsed.data.inputData ?? {});
  return { run };
});

/** Fetch a single run with its step trace. */
export const GET = handle(async (request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const runId = Number(new URL(request.url).searchParams.get("runId"));
  if (!Number.isInteger(runId)) throw new ValidationError("runId is required");
  const run = await getRun(runId, user.id);
  return { run };
});
