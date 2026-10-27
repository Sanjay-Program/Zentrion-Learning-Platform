import { requireUser } from "@/lib/server";
import { handle } from "@/lib/api";
import { listUserOrders } from "@/lib/commerce";

/** List the current user's orders. */
export const GET = handle(async () => {
  const user = await requireUser();
  const orders = await listUserOrders(user.id);
  return { orders };
});
