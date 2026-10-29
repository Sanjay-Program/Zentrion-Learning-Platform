import { requireUser } from "@/lib/server";
import { listUserOrders } from "@/lib/commerce";
import { Breadcrumbs, Card, EmptyState, PageHeader } from "@/components/ui";
import { formatDateTime, formatPrice } from "@/lib/utils";
import Link from "next/link";

export const metadata = { title: "Orders" };

export default async function OrdersPage() {
  const user = await requireUser();
  const orders = await listUserOrders(user.id);

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "My Learning", href: "/app" },
          { label: "Orders" },
        ]}
      />
      <PageHeader
        eyebrow="Commerce"
        title="Your orders"
        description="Purchase history and payment status."
      />

      {orders.length === 0 ? (
        <Card>
          <EmptyState
            title="No orders yet"
            description="Your purchases will appear here."
            action={
              <Link href="/pricing" className="btn btn-primary">
                Browse pricing
              </Link>
            }
          />
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {orders.map((order) => (
            <Card key={order.id} raised>
              <div className="flex justify-between items-start" style={{ gap: "var(--space-3)", flexWrap: "wrap" }}>
                <div>
                  <p className="font-semibold">
                    Order #{order.id}{" "}
                    <span
                      className={
                        order.status === "paid"
                          ? "badge badge-success ml-2"
                          : order.status === "failed"
                            ? "badge badge-danger ml-2"
                            : order.status === "refunded"
                              ? "badge ml-2"
                              : "badge badge-info ml-2"
                      }
                    >
                      {order.status}
                    </span>
                  </p>
                  <p className="text-muted text-sm">
                    {formatDateTime(order.createdAt)}
                    {order.paidAt && ` · paid ${formatDateTime(order.paidAt)}`}
                    {order.provider && ` · via ${order.provider}`}
                  </p>
                </div>
                <span className="font-semibold" style={{ fontSize: "var(--text-xl)" }}>
                  {formatPrice(order.totalCents, order.currency)}
                </span>
              </div>
              <ul
                style={{
                  paddingLeft: "var(--space-6)",
                  margin: "var(--space-3) 0 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-1)",
                }}
              >
                {order.items.map((item, i) => (
                  <li key={i} className="text-sm">
                    {item.productName} — {formatPrice(item.amountCents, order.currency)}
                    {item.interval && ` / ${item.interval}`}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
