import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle, parseBody } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
import { createEvalDataset, listEvalDatasets } from "@/lib/ai";

const schema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  cases: z
    .array(
      z.object({
        inputText: z.string().min(1).max(8000),
        expectedOutput: z.string().max(8000).optional(),
      }),
    )
    .min(1)
    .max(100)
    .optional(),
});

/** List evaluation datasets owned by the user. */
export const GET = handle(async () => {
  const user = await requireUser();
  const datasets = await listEvalDatasets(user.id);
  return { datasets };
});

/** Create an evaluation dataset with cases. */
export const POST = handle(async (request: NextRequest) => {
  const user = await requireUser();
  const body = await parseBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ValidationError("Invalid request");
  const dataset = await createEvalDataset(user.id, parsed.data);
  return { dataset };
});
