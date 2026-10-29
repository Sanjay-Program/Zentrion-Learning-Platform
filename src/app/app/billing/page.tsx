import { requireUser } from "@/lib/server";
import { listEntitlements, listUserSubscriptions } from "@/lib/commerce";
import { Breadcrumbs, Card, PageHeader } from "@/components/ui";
import { formatDateTime, formatDate } from "@/lib/utils";
import Link from "next/link";
import { BillingClient } from "./billing-client";

export const metadata = { title: "Billing" };

export default async function BillingPage() {
  const user = await requireUser();
  const [subscriptions, entitlements] = await Promise.all([
    listUserSubscriptions(user.id),
    listEntitlements(user.id),
  ]);

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "My Learning", href: "/app" },
          { label: "Billing" },
        ]}
      />
      <PageHeader
        eyebrow="Commerce"
        title="Billing"
        description="Manage subscriptions and view your entitlements."
      />

      <section style={{ marginBottom: "var(--space-8)" }}>
        <h2 style={{ marginBottom: "var(--space-4)" }}>Subscriptions</h2>
        {subscriptions.length === 0 ? (
          <Card>
            <p className="text-muted mb-4">
              No active subscriptions. Zentrion Pro includes every premium
              course, unlimited labs, and full AI quota.
            </p>
            <Link href="/pricing" className="btn btn-primary">
              View plans
            </Link>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {subscriptions.map((sub) => (
              <Card key={sub.id} raised>
                <div className="flex justify-between items-center" style={{ gap: "var(--space-3)", flexWrap: "wrap" }}>
                  <div>
                    <p className="font-semibold">{sub.productName}</p>
                    <p className="text-muted text-sm">
                      {sub.priceInterval ? `billed ${sub.priceInterval === "year" ? "yearly" : "monthly"}` : "one-time"}{" "}
                      · since {formatDate(sub.createdAt)}
                      {sub.currentPeriodEnds && ` · renews ${formatDateTime(sub.currentPeriodEnds)}`}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className={sub.status === "active" ? "badge badge-success" : "badge"}>
                      {sub.status}
                    </span>
                    {sub.status === "active" && (
                      <BillingClient subscriptionId={sub.id} />
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 style={{ marginBottom: "var(--space-4)" }}>Entitlements</h2>
        {entitlements.length === 0 ? (
          <Card>
            <p className="text-muted">
              Purchased course entitlements will appear here.
            </p>
          </Card>
        ) : (
          <Card raised>
            <table className="table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>ID</th>
                  <th>Source</th>
                  <th>Granted</th>
                  <th>Expires</th>
                </tr>
              </thead>
              <tbody>
                {entitlements.map((e, i) => (
                  <tr key={i}>
                    <td className="font-semibold">{e.resourceType}</td>
                    <td>{e.resourceId}</td>
                    <td>{e.source}</td>
                    <td>{formatDateTime(e.grantedAt)}</td>
                    <td>{e.expiresAt ? formatDateTime(e.expiresAt) : "Never"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </section>
    </main>
  );
}
