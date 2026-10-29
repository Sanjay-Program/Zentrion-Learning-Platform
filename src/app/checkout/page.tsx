import { requireUser } from "@/lib/server";
import { getProductBySlug } from "@/lib/commerce";
import { Breadcrumbs } from "@/components/ui";
import { notFound } from "next/navigation";
import { CheckoutClient } from "./checkout-client";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; order?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;

  // Success screen after payment.
  if (sp.order) {
    return (
      <main className="container" style={{ padding: "var(--space-10) var(--space-6)", maxWidth: 44 * 16 }}>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Checkout" }]} />
        <div className="text-center" style={{ padding: "var(--space-16) 0" }}>
          <span className="badge badge-success" style={{ fontSize: "var(--text-lg)" }}>
            Payment successful
          </span>
          <h1 style={{ margin: "var(--space-4) 0 var(--space-2)" }}>
            Order #{sp.order} confirmed
          </h1>
          <p className="text-muted">
            Your entitlement has been granted. You can start learning right away.
          </p>
          <div className="flex gap-2 justify-center" style={{ marginTop: "var(--space-6)" }}>
            <a href="/app" className="btn btn-primary">Go to My Learning</a>
            <a href="/orders" className="btn btn-secondary">View orders</a>
          </div>
        </div>
      </main>
    );
  }

  if (!sp.product) notFound();
  const product = await getProductBySlug(sp.product);
  if (!product) notFound();

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)", maxWidth: 44 * 16 }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Pricing", href: "/pricing" }, { label: "Checkout" }]} />
      <CheckoutClient product={product} />
    </main>
  );
}
