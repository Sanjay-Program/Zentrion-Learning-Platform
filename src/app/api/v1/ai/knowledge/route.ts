import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle, parseBody } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
import {
  createKnowledgeBase,
  listKnowledgeBases,
} from "@/lib/ai";

const schema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
});

/** List knowledge bases owned by the user. */
export const GET = handle(async () => {
  const user = await requireUser();
  const knowledgeBases = await listKnowledgeBases(user.id);
  return { knowledgeBases };
});

/** Create a knowledge base. */
export const POST = handle(async (request: NextRequest) => {
  const user = await requireUser();
  const body = await parseBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ValidationError("Invalid request");
  const kb = await createKnowledgeBase(user.id, parsed.data);
  return { knowledgeBase: kb };
});
