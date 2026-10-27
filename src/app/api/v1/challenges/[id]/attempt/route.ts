import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle, parseBody } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
import { submitFlag } from "@/lib/labs";

const schema = z.object({
  flag: z.string().min(1).max(200),
});

/** Submit a flag for a CTF challenge. */
export const POST = handle(async (request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const body = await parseBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ValidationError("Invalid request");

  const result = await submitFlag(Number(id), user.id, parsed.data.flag);
  return result;
});
