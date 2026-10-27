import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle } from "@/lib/api";
import { listLabSessions, startLabSession } from "@/lib/labs";

/** List the user's sessions for a lab, or provision a new one. */
export const GET = handle(async (_request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const sessions = await listLabSessions(Number(id), user.id);
  return { sessions };
});

export const POST = handle(async (_request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const session = await startLabSession(Number(id), user.id);
  return { session };
});
