import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle, parseBody } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
import {
  deleteKnowledgeBase,
  getKnowledgeBase,
  ingestDocument,
} from "@/lib/ai";

const ingestSchema = z.object({
  filename: z.string().min(1).max(200),
  content: z.string().min(1).max(200000),
  mimeType: z.string().max(100).optional(),
});

/** Get a knowledge base with documents and chunks. */
export const GET = handle(async (_request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const kb = await getKnowledgeBase(Number(id), user.id);
  return { knowledgeBase: kb };
});

/** Ingest a text document into a knowledge base (chunked + indexed). */
export const POST = handle(async (request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const body = await parseBody(request);
  const parsed = ingestSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError("Invalid request");
  const kb = await ingestDocument(Number(id), user.id, parsed.data);
  return { knowledgeBase: kb };
});

export const DELETE = handle(async (_request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  await deleteKnowledgeBase(Number(id), user.id);
  return { status: "deleted" };
});
