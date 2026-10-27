import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle, parseBody } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
import { createCheckout } from "@/lib/commerce";

const schema = z.object({
  product: z.string().min(1).max(120),
  priceId: z.number().int().positive().optional(),
  couponCode: z.string().max(40).optional(),
});

/** Start a checkout session for a product. */
export const POST = handle(async (request: NextRequest) => {
  const user = await requireUser();
  const body = await parseBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ValidationError("Invalid request");
  const session = await createCheckout(user, {
    productSlug: parsed.data.product,
    priceId: parsed.data.priceId,
    couponCode: parsed.data.couponCode,
  });
  return session;
});
