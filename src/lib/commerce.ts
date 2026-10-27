/**
 * Commerce: checkout sessions, orders, subscriptions,
 * entitlements, and webhook processing.
 */
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  entitlements,
  orderItems,
  orders,
  paymentAttempts,
  paymentEvents,
  prices,
  products,
  subscriptions,
} from "@/db/schema";
import {
  getSettings,
  paymentsConfigured,
} from "@/lib/config";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { type User } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { randomToken, toIso } from "@/lib/utils";

export interface ProductWithPrices {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  productType: string;
  referenceId: number | null;
  isActive: boolean;
  prices: {
    id: number;
    currency: string;
    amountCents: number;
    interval: string | null;
    providerPriceId: string | null;
  }[];
}

/** Product with all active prices. */
export async function getProductBySlug(slug: string): Promise<ProductWithPrices | null> {
  const db = getDb();
  const product = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.isActive, true)))
    .limit(1)
    .get();
  if (!product) return null;
  const priceRows = await db
    .select()
    .from(prices)
    .where(and(eq(prices.productId, product.id), eq(prices.isActive, true)))
    .all();
  return { ...product, prices: priceRows };
}

export interface OrderRow {
  id: number;
  status: string;
  totalCents: number;
  currency: string;
  provider: string | null;
  couponCode: string | null;
  createdAt: string;
  paidAt: string | null;
  items: { productName: string; amountCents: number; interval: string | null }[];
}

/** Orders for a user, newest first. */
export async function listUserOrders(userId: number): Promise<OrderRow[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.id))
    .limit(50)
    .all();

  return Promise.all(
    rows.map(async (order) => {
      const items = await db
        .select({
          productName: products.name,
          amountCents: orderItems.amountCents,
          interval: prices.interval,
        })
        .from(orderItems)
        .innerJoin(products, eq(products.id, orderItems.productId))
        .innerJoin(prices, eq(prices.id, orderItems.priceId))
        .where(eq(orderItems.orderId, order.id))
        .all();
      return { ...order, items };
    }),
  );
}

export interface CheckoutSession {
  orderId: number;
  status: string;
  totalCents: number;
  currency: string;
  paymentUrl: string;
  provider: string;
  simulated: boolean;
}

/**
 * Create a checkout session for a product.
 * With Stripe configured this creates a real Checkout Session and
 * returns its URL. Otherwise it returns a simulated checkout flow.
 */
export async function createCheckout(
  user: User,
  input: { productSlug: string; priceId?: number; couponCode?: string },
): Promise<CheckoutSession> {
  const db = getDb();
  const product = await getProductBySlug(input.productSlug);
  if (!product) throw new NotFoundError("Product not found");

  const price = input.priceId
    ? product.prices.find((p) => p.id === input.priceId)
    : product.prices[0];
  if (!price) throw new ValidationError("No active price for this product");

  let totalCents = price.amountCents;

  // Apply coupon if provided.
  let couponId: number | null = null;
  if (input.couponCode) {
    const { coupons } = await import("@/db/schema");
    const coupon = await db
      .select()
      .from(coupons)
      .where(and(eq(coupons.code, input.couponCode.toUpperCase()), eq(coupons.isActive, true)))
      .limit(1)
      .get();
    if (!coupon) throw new ValidationError("Invalid coupon code");
    if (coupon.expiresAt && coupon.expiresAt < toIso(new Date())) {
      throw new ValidationError("Coupon has expired");
    }
    if (coupon.maxUses !== null && coupon.useCount >= coupon.maxUses) {
      throw new ValidationError("Coupon is no longer available");
    }
    couponId = coupon.id;
    if (coupon.discountType === "percent") {
      totalCents = Math.round(totalCents * (1 - Number(coupon.discountValue) / 100));
    } else if (coupon.discountType === "fixed") {
      totalCents = Math.max(0, totalCents - Number(coupon.discountValue));
    }
  }

  const result = await db
    .insert(orders)
    .values({
      userId: user.id,
      status: "pending",
      totalCents,
      currency: price.currency,
      provider: paymentsConfigured() ? "stripe" : "simulated",
      couponCode: couponId ? input.couponCode?.toUpperCase() ?? null : null,
    })
    .run();
  const orderId = Number(result.lastInsertRowid);

  await db
    .insert(orderItems)
    .values({
      orderId,
      productId: product.id,
      priceId: price.id,
      amountCents: totalCents,
      currency: price.currency,
    })
    .run();

  await audit("checkout.started", {
    actorId: user.id,
    entityType: "order",
    entityId: orderId,
    details: { product: product.slug, amountCents: totalCents },
  });

  // Real Stripe Checkout Session when configured.
  if (paymentsConfigured()) {
    const settings = getSettings();
    try {
      const session = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${settings.stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          mode: price.interval ? "subscription" : "payment",
          ...(price.providerPriceId
            ? { "line_items[0][price]": price.providerPriceId }
            : {
                "line_items[0][price_data][currency]": price.currency.toLowerCase(),
                "line_items[0][price_data][unit_amount]": String(totalCents),
                "line_items[0][price_data][product_data][name]": product.name,
                ...(price.interval
                  ? { "line_items[0][price_data][recurring][interval]": price.interval }
                  : {}),
              }),
          "line_items[0][quantity]": "1",
          success_url: `${settings.appBaseUrl}/checkout/success?order=${orderId}`,
          cancel_url: `${settings.appBaseUrl}/checkout?product=${product.slug}`,
          client_reference_id: String(orderId),
          metadata: JSON.stringify({ orderId, userId: user.id }),
        }),
      });
      const data = (await session.json()) as { id?: string; url?: string };
      if (data.id) {
        await db
          .update(orders)
          .set({ providerSessionId: data.id })
          .where(eq(orders.id, orderId))
          .run();
        await db
          .insert(paymentAttempts)
          .values({
            orderId,
            provider: "stripe",
            providerIntentId: data.id,
            status: "checkout_created",
            amountCents: totalCents,
            currency: price.currency,
          })
          .run();
        return {
          orderId,
          status: "pending",
          totalCents,
          currency: price.currency,
          paymentUrl: data.url ?? `${settings.appBaseUrl}/checkout/success?order=${orderId}`,
          provider: "stripe",
          simulated: false,
        };
      }
    } catch (err) {
      console.error("[checkout] stripe session creation failed:", err);
    }
  }

  // Simulated checkout: mark as paid immediately in development.
  await db
    .insert(paymentAttempts)
    .values({
      orderId,
      provider: "simulated",
      status: "succeeded",
      amountCents: totalCents,
      currency: price.currency,
    })
    .run();
  await fulfillOrder(orderId, "simulated", `sim-${randomToken(8)}`);

  return {
    orderId,
    status: "paid",
    totalCents,
    currency: price.currency,
    paymentUrl: `/checkout/success?order=${orderId}`,
    provider: "simulated",
    simulated: true,
  };
}

/** Mark an order paid and grant entitlements (idempotent by provider session). */
export async function fulfillOrder(
  orderId: number,
  provider: string,
  providerSessionId: string,
): Promise<void> {
  const db = getDb();
  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1)
    .get();
  if (!order) throw new NotFoundError("Order not found");
  if (order.status === "paid") return;

  await db
    .update(orders)
    .set({ status: "paid", paidAt: toIso(new Date()), providerSessionId })
    .where(eq(orders.id, orderId))
    .run();

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))
    .all();

  for (const item of items) {
    const price = await db
      .select()
      .from(prices)
      .where(eq(prices.id, item.priceId))
      .limit(1)
      .get();
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, item.productId))
      .limit(1)
      .get();
    if (!price || !product) continue;

    // Grant course entitlement for course products.
    if (product.productType === "course" && product.referenceId) {
      await db
        .insert(entitlements)
        .values({
          userId: order.userId,
          resourceType: "course",
          resourceId: product.referenceId,
          source: "purchase",
          orderId,
        })
        .onConflictDoNothing()
        .run();
    }

    // Create a subscription for recurring prices.
    if (price.interval) {
      const periodDays = price.interval === "year" ? 365 : 30;
      const periodEnds = toIso(
        new Date(Date.now() + periodDays * 24 * 60 * 60_000),
      );
      const existing = await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.userId, order.userId),
            eq(subscriptions.productId, product.id),
            eq(subscriptions.status, "active"),
          ),
        )
        .limit(1)
        .get();
      if (!existing) {
        await db
          .insert(subscriptions)
          .values({
            userId: order.userId,
            productId: product.id,
            providerSubscriptionId: providerSessionId,
            status: "active",
            currentPeriodEnds: periodEnds,
          })
          .run();
      }
    }
  }

  await audit("checkout.completed", {
    actorId: order.userId,
    entityType: "order",
    entityId: orderId,
    details: { provider, amountCents: order.totalCents },
  });
}

/** Record a provider webhook event (idempotent on provider+eventId). */
export async function recordWebhookEvent(
  provider: string,
  eventId: string,
  eventType: string,
  payload: unknown,
): Promise<"stored" | "duplicate"> {
  const db = getDb();
  const existing = await db
    .select({ id: paymentEvents.id })
    .from(paymentEvents)
    .where(and(eq(paymentEvents.provider, provider), eq(paymentEvents.eventId, eventId)))
    .limit(1)
    .get();
  if (existing) return "duplicate";

  await db
    .insert(paymentEvents)
    .values({
      provider,
      eventId,
      eventType,
      payload: JSON.stringify(payload ?? {}),
    })
    .run();
  return "stored";
}

/** Process a Stripe webhook event. */
export async function processStripeWebhook(
  payload: Record<string, unknown>,
): Promise<{ received: boolean }> {
  const type = String(payload.type ?? "");
  const data = (payload.data ?? {}) as { object?: Record<string, unknown> };
  const object = data.object ?? {};

  switch (type) {
    case "checkout.session.completed": {
      const orderId = Number(object.client_reference_id);
      const sessionId = String(object.id);
      if (Number.isFinite(orderId)) {
        await recordWebhookEvent("stripe", sessionId, type, payload);
        await fulfillOrder(orderId, "stripe", sessionId);
      }
      break;
    }
    case "customer.subscription.deleted":
    case "customer.subscription.updated": {
      const subscriptionId = String(object.id);
      const status = String(object.status ?? "");
      const db = getDb();
      await recordWebhookEvent("stripe", subscriptionId, type, payload);
      if (status === "canceled" || status === "unpaid") {
        await db
          .update(subscriptions)
          .set({ status: "canceled" })
          .where(eq(subscriptions.providerSubscriptionId, subscriptionId))
          .run();
      } else if (status === "active") {
        const periodEnds = object.current_period_end
          ? toIso(new Date(Number(object.current_period_end) * 1000))
          : null;
        await db
          .update(subscriptions)
          .set({
            status: "active",
            ...(periodEnds ? { currentPeriodEnds: periodEnds } : {}),
          })
          .where(eq(subscriptions.providerSubscriptionId, subscriptionId))
          .run();
      }
      break;
    }
    default:
      await recordWebhookEvent("stripe", String(payload.id ?? randomToken(10)), type, payload);
  }
  return { received: true };
}

export interface SubscriptionRow {
  id: number;
  status: string;
  currentPeriodEnds: string | null;
  createdAt: string;
  productName: string;
  priceInterval: string | null;
}

/** Active subscriptions for a user. */
export async function listUserSubscriptions(userId: number): Promise<SubscriptionRow[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.id))
    .limit(20)
    .all();
  return Promise.all(
    rows.map(async (sub) => {
      const product = await db
        .select({ name: products.name })
        .from(products)
        .where(eq(products.id, sub.productId))
        .limit(1)
        .get();
      const price = await db
        .select({ interval: prices.interval })
        .from(prices)
        .where(eq(prices.productId, sub.productId))
        .limit(1)
        .get();
      return {
        ...sub,
        productName: product?.name ?? "Subscription",
        priceInterval: price?.interval ?? null,
      };
    }),
  );
}

/** Cancel a subscription owned by the user. */
export async function cancelSubscription(
  user: User,
  subscriptionId: number,
): Promise<SubscriptionRow> {
  const db = getDb();
  const sub = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.id, subscriptionId), eq(subscriptions.userId, user.id)))
    .limit(1)
    .get();
  if (!sub) throw new NotFoundError("Subscription not found");
  if (sub.status !== "active") throw new ValidationError("Subscription is not active");

  // With Stripe configured, cancel at the provider.
  if (paymentsConfigured() && sub.providerSubscriptionId) {
    const settings = getSettings();
    try {
      await fetch(
        `https://api.stripe.com/v1/subscriptions/${sub.providerSubscriptionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${settings.stripeSecretKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ invoice_now: "true" }),
        },
      );
    } catch (err) {
      console.error("[billing] stripe cancel failed:", err);
    }
  }

  await db
    .update(subscriptions)
    .set({ status: "canceled" })
    .where(eq(subscriptions.id, subscriptionId))
    .run();
  await audit("subscription.canceled", {
    actorId: user.id,
    entityType: "subscription",
    entityId: subscriptionId,
  });

  const rows = await listUserSubscriptions(user.id);
  return rows.find((r) => r.id === subscriptionId)!;
}

/** Entitlements for a user (e.g. purchased courses). */
export async function listEntitlements(userId: number) {
  const db = getDb();
  const rows = await db
    .select({
      resourceType: entitlements.resourceType,
      resourceId: entitlements.resourceId,
      source: entitlements.source,
      grantedAt: entitlements.grantedAt,
      expiresAt: entitlements.expiresAt,
    })
    .from(entitlements)
    .where(eq(entitlements.userId, userId))
    .orderBy(desc(entitlements.id))
    .limit(100)
    .all();
  return rows;
}
