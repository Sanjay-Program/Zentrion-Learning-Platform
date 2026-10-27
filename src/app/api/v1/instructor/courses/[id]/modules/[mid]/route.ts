import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle, parseBody } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
import { deleteModule, updateModule } from "@/lib/instructor";

const schema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  orderIndex: z.number().int().min(0).optional(),
});

/** Update a module. */
export const PUT = handle(async (request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id, mid } = (await ctx.params) ?? {};
  const body = await parseBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ValidationError("Invalid request");
  const course = await updateModule(user, Number(id), Number(mid), parsed.data);
  return { course };
});

export const DELETE = handle(async (_request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id, mid } = (await ctx.params) ?? {};
  const course = await deleteModule(user, Number(id), Number(mid));
  return { course };
});
