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
    <div className="checkout-grid-container">
      <Card raised>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
          <span
            style={{
              padding: "0.2rem 0.6rem",
              borderRadius: "9999px",
              background: "rgba(239, 68, 68, 0.15)",
              color: "#F87171",
              fontSize: "0.75rem",
              fontWeight: 800,
            }}
          >
            🔥 Limited Seats Available
          </span>
          <span
            style={{
              padding: "0.2rem 0.6rem",
              borderRadius: "9999px",
              background: "rgba(245, 158, 11, 0.15)",
              color: "#FCD34D",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            ⏳ Offer until 10th October only
          </span>
        </div>

        <p className="text-muted text-sm" style={{ textTransform: "capitalize", margin: 0 }}>{product.productType}</p>
        <h1 style={{ margin: "var(--space-1) 0 var(--space-3)", fontSize: "1.75rem", color: "#FFFFFF" }}>{product.name}</h1>
        {product.description && (
          <p className="text-muted" style={{ fontSize: "0.925rem", lineHeight: 1.5, marginBottom: "1.5rem" }}>{product.description}</p>
        )}

        <form onSubmit={pay}>
          <Field label="Choose Pricing Option" htmlFor="checkout-price">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {product.prices.map((price) => (
                <label
                  key={price.id}
                  className="flex items-center"
                  style={{
                    gap: "var(--space-3)",
                    padding: "var(--space-3) var(--space-4)",
                    border: `1px solid ${price.id === priceId ? "#6366F1" : "rgba(255, 255, 255, 0.12)"}`,
                    background: price.id === priceId ? "rgba(99, 102, 241, 0.12)" : "rgba(15, 23, 42, 0.6)",
                    borderRadius: "var(--radius)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <input
                    type="radio"
                    name="price"
                    checked={price.id === priceId}
                    onChange={() => setPriceId(price.id)}
                  />
                  <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="font-semibold" style={{ color: "#FFFFFF", fontSize: "1.1rem" }}>
                      {formatPrice(price.amountCents, price.currency)}
                      {price.interval && (
                        <span className="text-muted text-sm">
                          {" / "}
                          {price.interval === "year" ? "year" : "month"}
                        </span>
                      )}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#10B981", fontWeight: 700 }}>
                      ✓ Early-Bird Rate
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </Field>

          <Field label="Coupon code (optional)" htmlFor="checkout-coupon">
            <Input
              id="checkout-coupon"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="e.g. ZENTRION20"
            />
          </Field>

          {error && (
            <p role="alert" style={{ color: "var(--danger)", margin: "var(--space-2) 0" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={busy || product.prices.length === 0}
            style={{
              width: "100%",
              padding: "0.9rem 1.5rem",
              borderRadius: "0.6rem",
              background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
              color: "#FFFFFF",
              fontSize: "1rem",
              fontWeight: 800,
              border: "none",
              cursor: busy ? "not-allowed" : "pointer",
              boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)",
              marginTop: "var(--space-2)",
            }}
          >
            {busy ? "Securing Seat…" : `Complete Checkout — ${selected ? formatPrice(selected.amountCents, selected.currency) : ""}`}
          </button>

          <p className="text-muted text-sm" style={{ marginTop: "var(--space-3)", marginBottom: 0, textAlign: "center" }}>
            🔒 Bank-grade 256-bit encryption. UPI, Cards & NetBanking accepted.
          </p>
        </form>
      </Card>

      <Card>
        <h3 style={{ marginBottom: "var(--space-4)", color: "#FFFFFF" }}>Order Summary & Guarantees</h3>
        <div className="flex justify-between" style={{ marginBottom: "var(--space-2)" }}>
          <span style={{ color: "#CBD5E1" }}>{product.name}</span>
          <span className="font-semibold" style={{ color: "#FFFFFF" }}>
            {selected ? formatPrice(selected.amountCents, selected.currency) : "—"}
            {selected?.interval && (
              <span className="text-muted text-sm">
                {" / "}
                {selected.interval === "year" ? "year" : "month"}
              </span>
            )}
          </span>
        </div>
        <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.1)", margin: "var(--space-3) 0" }} />
        <div className="flex justify-between" style={{ alignItems: "baseline" }}>
          <span className="font-semibold" style={{ color: "#CBD5E1", fontSize: "1.1rem" }}>Total Payable</span>
          <span className="font-semibold" style={{ color: "#22D3EE", fontSize: "1.5rem" }}>
            {selected ? formatPrice(selected.amountCents, selected.currency) : "—"}
          </span>
        </div>

        {/* High-Trust Guarantees */}
        <div style={{ marginTop: "1.5rem", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
            <span style={{ fontSize: "1.2rem" }}>🛡️</span>
            <div>
              <div style={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.875rem" }}>100% 7-Day Money-Back Guarantee</div>
              <div style={{ color: "#94A3B8", fontSize: "0.78rem" }}>Try the course for 7 days. If you&apos;re not satisfied, get a full refund instantly.</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
            <span style={{ fontSize: "1.2rem" }}>📜</span>
            <div>
              <div style={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.875rem" }}>Verifiable QR Credential</div>
              <div style={{ color: "#94A3B8", fontSize: "0.78rem" }}>Official tamper-proof certificate shareable on LinkedIn and with employers.</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
            <span style={{ fontSize: "1.2rem" }}>⚡</span>
            <div>
              <div style={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.875rem" }}>Instant Lab & Entitlement Access</div>
              <div style={{ color: "#94A3B8", fontSize: "0.78rem" }}>Immediate access to browser terminal labs, model endpoints & study materials.</div>
            </div>
          </div>
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
