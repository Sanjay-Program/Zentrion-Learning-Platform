import { Breadcrumbs, Card, PageHeader } from "@/components/ui";

export const metadata = { title: "Refund Policy" };

export default function RefundPage() {
  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)", maxWidth: 44 * 16 }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Legal", href: "/legal" }, { label: "Refund policy" }]} />
      <PageHeader eyebrow="Legal" title="Refund Policy" />
      <Card>
        <h3>1. One-time course purchases</h3>
        <p className="text-muted">
          Course purchases are final once content access has been granted,
          because digital content is consumed immediately. If you believe a
          purchase was made in error or a course is materially broken, contact
          us within 14 days and we will review the request.
        </p>
        <h3>2. Subscriptions</h3>
        <p className="text-muted">
          Subscriptions (for example Pro) may be cancelled at any time.
          Cancellation takes effect at the end of the current paid period;
          access continues until then. Refunds for the unused portion of a
          billing period are issued at our discretion.
        </p>
        <h3>3. How to request a refund</h3>
        <p className="text-muted">
          Contact <a href="mailto:billing@zentrion.dev">billing@zentrion.dev</a> with
          your order number. In-app refund requests are tracked as support
          tickets and resolved by the finance operator role.
        </p>
        <h3>4. Simulated payments</h3>
        <p className="text-muted">
          This deployment uses a simulated payment provider. No real charges
          are made, so no real refunds are due. In a production deployment the
          policy above governs the connected payment provider.
        </p>
        <h3>5. Prohibited conduct</h3>
        <p className="text-muted">
          Refunds may be denied where account integrity violations (cheating,
          unauthorised assistance, abuse) are found.
        </p>
      </Card>
    </main>
  );
}
