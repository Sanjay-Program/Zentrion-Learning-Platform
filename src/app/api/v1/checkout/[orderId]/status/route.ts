import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { getDb } from "@/db/client";
import { orderItems, orders, products } from "@/db/schema";
import { eq } from "drizzle-orm";

/** Poll an order's payment status. */
export const GET = handle(async (_request: NextRequest, ctx) => {
  const user = await requireUser();
  const { orderId } = (await ctx.params) ?? {};
  const db = getDb();
  const order = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, Number(orderId)), eq(orders.userId, user.id)))
    .limit(1)
    .get();
  if (!order) throw new ValidationError("Order not found");

  const items = await db
    .select({ productName: products.name, amountCents: orderItems.amountCents })
    .from(orderItems)
    .innerJoin(products, eq(products.id, orderItems.productId))
    .where(eq(orderItems.orderId, order.id))
    .all();

  return {
    order: { ...order, items },
  };
});

import { and } from "drizzle-orm";
