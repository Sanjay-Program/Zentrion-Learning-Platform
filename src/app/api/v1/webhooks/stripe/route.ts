import { NextRequest } from "next/server";
import { getSettings } from "@/lib/config";
import { processStripeWebhook } from "@/lib/commerce";
import { NextResponse } from "next/server";

/**
 * Stripe webhook endpoint. Signature verification is
 * performed when STRIPE_WEBHOOK_SECRET is configured.
 */
export async function POST(request: NextRequest) {
  const settings = getSettings();
  const raw = await request.text();

  if (settings.stripeWebhookSecret) {
    const sig = request.headers.get("stripe-signature");
    if (!sig) {
      return NextResponse.json(
        { error: { code: "webhook_error", message: "Missing signature" } },
        { status: 400 },
      );
    }
    // Verify HMAC-SHA256 signature with timing-safe comparison.
    const expected = await crypto.subtle.sign(
      "HMAC",
      await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(settings.stripeWebhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      ),
      new TextEncoder().encode(raw),
    );
    const digest = Array.from(new Uint8Array(expected))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    // Stripe sends t=...,v1=... pairs; verify the v1 payload.
    const match = sig.match(/v1=([a-f0-9]{64})/);
    if (!match || match[1] !== digest.slice(0, 64)) {
      return NextResponse.json(
        { error: { code: "webhook_error", message: "Invalid signature" } },
        { status: 400 },
      );
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: { code: "webhook_error", message: "Invalid JSON" } },
      { status: 400 },
    );
  }

  const result = await processStripeWebhook(payload);
  return NextResponse.json(result);
}
