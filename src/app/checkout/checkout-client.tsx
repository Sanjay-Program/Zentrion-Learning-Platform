"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/webclient";
import { Button, Card, Field, Input } from "@/components/ui";
import { formatPrice } from "@/lib/utils";

interface Price {
  id: number;
  currency: string;
  amountCents: number;
  interval: string | null;
  providerPriceId: string | null;
}

interface Product {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  productType: string;
  prices: Price[];
}

/** Checkout form: pick a price, optional coupon, pay. */
export function CheckoutClient({ product }: { product: Product }) {
  const router = useRouter();
  const [priceId, setPriceId] = useState<number>(product.prices[0]?.id ?? 0);
  const [coupon, setCoupon] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = product.prices.find((p) => p.id === priceId) ?? product.prices[0];

  const pay = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const session = await apiFetch<{
        orderId: number;
        paymentUrl: string;
        simulated: boolean;
        status: string;
      }>("/api/v1/checkout", {
        method: "POST",
        body: JSON.stringify({
          product: product.slug,
          priceId,
          couponCode: coupon.trim() || undefined,
        }),
      });
      if (session.simulated) {
        router.push(`/checkout/success?order=${session.orderId}`);
      } else {
        window.location.href = session.paymentUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)", alignItems: "start" }}>
      <Card raised>
        <p className="text-muted text-sm">{product.productType}</p>
        <h1 style={{ margin: "var(--space-1) 0" }}>{product.name}</h1>
        {product.description && (
          <p className="text-muted">{product.description}</p>
        )}

        <form onSubmit={pay}>
          <Field label="Plan" htmlFor="checkout-price">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {product.prices.map((price) => (
                <label
                  key={price.id}
                  className="flex items-center"
                  style={{
                    gap: "var(--space-3)",
                    padding: "var(--space-3)",
                    border: `1px solid ${price.id === priceId ? "var(--primary)" : "var(--border)"}`,
                    borderRadius: "var(--radius)",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="price"
                    checked={price.id === priceId}
                    onChange={() => setPriceId(price.id)}
                  />
                  <span className="font-semibold">
                    {formatPrice(price.amountCents, price.currency)}
                    {price.interval && (
                      <span className="text-muted text-sm">
                        {" / "}
                        {price.interval === "year" ? "year" : "month"}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </Field>

          <Field label="Coupon code (optional)" htmlFor="checkout-coupon">
            <Input
              id="checkout-coupon"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="e.g. LEARN20"
            />
          </Field>

          {error && (
            <p role="alert" style={{ color: "var(--danger)" }}>{error}</p>
          )}

          <Button type="submit" disabled={busy || product.prices.length === 0}>
            {busy ? "Processing…" : `Pay ${selected ? formatPrice(selected.amountCents, selected.currency) : ""}`}
          </Button>
          <p className="text-muted text-sm" style={{ marginTop: "var(--space-3)", marginBottom: 0 }}>
            Secure checkout. In development, payments are simulated and
            entitlements are granted immediately.
          </p>
        </form>
      </Card>

      <Card>
        <h3 style={{ marginBottom: "var(--space-4)" }}>Order summary</h3>
        <div className="flex justify-between" style={{ marginBottom: "var(--space-2)" }}>
          <span>{product.name}</span>
          <span className="font-semibold">
            {selected ? formatPrice(selected.amountCents, selected.currency) : "—"}
            {selected?.interval && (
              <span className="text-muted text-sm">
                {" / "}
                {selected.interval === "year" ? "year" : "month"}
              </span>
            )}
          </span>
        </div>
        <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "var(--space-3) 0" }} />
        <div className="flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="font-semibold">
            {selected ? formatPrice(selected.amountCents, selected.currency) : "—"}
          </span>
        </div>
        <p className="text-muted text-sm" style={{ marginTop: "var(--space-4)", marginBottom: 0 }}>
          {product.productType === "subscription"
            ? "Recurring billing. Cancel anytime from your billing settings."
            : "One-time purchase. Lifetime access to this course."}
        </p>
      </Card>
    </div>
  );
}
