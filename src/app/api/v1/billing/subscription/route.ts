import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle, parseBody } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
import { cancelSubscription, listUserSubscriptions } from "@/lib/commerce";

/** List the user's subscriptions. */
export const GET = handle(async () => {
  const user = await requireUser();
  const subscriptions = await listUserSubscriptions(user.id);
  return { subscriptions };
});

const schema = z.object({
  subscriptionId: z.number().int().positive(),
});

/** Cancel a subscription. */
export const POST = handle(async (request: NextRequest) => {
  const user = await requireUser();
  const body = await parseBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ValidationError("Invalid request");
  const subscription = await cancelSubscription(user, parsed.data.subscriptionId);
  return { subscription };
});
