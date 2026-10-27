import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle, parseBody } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
import {
  deletePromptTemplate,
  getPromptTemplate,
  updatePromptTemplate,
} from "@/lib/ai";

const updateSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
  template: z.string().min(1).max(20000).optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  visibility: z.enum(["private", "public"]).optional(),
  changelog: z.string().max(300).optional(),
});

/** Get a prompt template with its version history. */
export const GET = handle(async (_request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const template = await getPromptTemplate(Number(id), user.id);
  return { template };
});

/** Update a prompt template (new template creates a version). */
export const PUT = handle(async (request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const body = await parseBody(request);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError("Invalid request");
  const template = await updatePromptTemplate(Number(id), user.id, parsed.data);
  return { template };
});

export const DELETE = handle(async (_request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  await deletePromptTemplate(Number(id), user.id);
  return { status: "deleted" };
});
