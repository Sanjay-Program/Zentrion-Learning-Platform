import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle } from "@/lib/api";
import { deleteEvalDataset, getEvalDataset } from "@/lib/ai";

/** Get a dataset with its cases and past results. */
export const GET = handle(async (_request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const dataset = await getEvalDataset(Number(id), user.id);
  return { dataset };
});

export const DELETE = handle(async (_request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  await deleteEvalDataset(Number(id), user.id);
  return { status: "deleted" };
});
