import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle, parseBody } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
import {
  deleteAgent,
  getAgent,
  updateAgent,
} from "@/lib/ai";

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
  objective: z.string().max(2000).optional(),
  instructions: z.string().max(10000).optional(),
  model: z.string().min(1).max(80).optional(),
  toolIds: z.array(z.number().int().positive()).max(20).optional(),
  maxSteps: z.number().int().min(1).max(50).optional(),
  timeLimitSeconds: z.number().int().min(10).max(3600).optional(),
  tokenBudget: z.number().int().positive().nullable().optional(),
  requireApproval: z.boolean().optional(),
});

/** Get an agent with its recent runs. */
export const GET = handle(async (_request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const agent = await getAgent(Number(id), user.id);
  return { agent };
});

/** Update agent configuration. */
export const PUT = handle(async (request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const body = await parseBody(request);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError("Invalid request");
  const agent = await updateAgent(Number(id), user.id, parsed.data);
  return { agent };
});

export const DELETE = handle(async (_request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  await deleteAgent(Number(id), user.id);
  return { status: "deleted" };
});
