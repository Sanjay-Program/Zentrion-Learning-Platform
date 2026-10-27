import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle, parseBody } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
import {
  createPromptTemplate,
  listPromptTemplates,
  listPublicPromptTemplates,
} from "@/lib/ai";

const schema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  template: z.string().min(1).max(20000),
  tags: z.array(z.string().max(30)).max(10).optional(),
  visibility: z.enum(["private", "public"]).optional(),
});

/** List prompt templates (optionally including the public gallery). */
export const GET = handle(async (request: NextRequest) => {
  const user = await requireUser();
  const includePublic = request.nextUrl.searchParams.get("includePublic") === "1";
  const [mine, public_] = await Promise.all([
    listPromptTemplates(user.id),
    includePublic ? listPublicPromptTemplates() : Promise.resolve([]),
  ]);
  return { templates: mine, publicTemplates: public_ };
});

/** Create a prompt template with automatic versioning. */
export const POST = handle(async (request: NextRequest) => {
  const user = await requireUser();
  const body = await parseBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ValidationError("Invalid request");
  const template = await createPromptTemplate(user.id, parsed.data);
  return { template };
});
