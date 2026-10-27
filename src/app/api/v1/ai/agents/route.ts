import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle, parseBody } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
import { createAgent, listAgents, listTools } from "@/lib/ai";

const schema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  objective: z.string().max(2000).optional(),
  instructions: z.string().max(10000).optional(),
  model: z.string().min(1).max(80),
  toolIds: z.array(z.number().int().positive()).max(20).optional(),
  maxSteps: z.number().int().min(1).max(50).optional(),
  timeLimitSeconds: z.number().int().min(10).max(3600).optional(),
  tokenBudget: z.number().int().positive().nullable().optional(),
  requireApproval: z.boolean().optional(),
});

/** List the user's agents and the approved tool registry. */
export const GET = handle(async () => {
  const user = await requireUser();
  const [agents, tools] = await Promise.all([listAgents(user.id), listTools()]);
  return { agents, tools };
});

/** Define a new agent. */
export const POST = handle(async (request: NextRequest) => {
  const user = await requireUser();
  const body = await parseBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ValidationError("Invalid request");
  const agent = await createAgent(user.id, parsed.data);
  return { agent };
});
