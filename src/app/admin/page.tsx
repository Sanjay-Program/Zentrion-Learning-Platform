import { redirect } from "next/navigation";
import { requireUser } from "@/lib/server";
import { requireAdmin, getAdminStats } from "@/lib/admin";
import { Breadcrumbs, Card, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const user = await requireUser();
  try {
    await requireAdmin(user);
  } catch {
    redirect("/app");
  }
  const stats = await getAdminStats();

  const cards = [
    { label: "Users", value: stats.users, href: "/admin/users" },
    { label: "Courses", value: stats.courses, href: "/admin/users" },
    { label: "Enrolments", value: stats.enrollments, href: "/admin/users" },
    { label: "Revenue", value: stats.revenue, href: "/admin/users" },
    { label: "Paid orders", value: stats.paidOrders, href: "/admin/users" },
    { label: "Active lab sessions", value: stats.activeLabSessions, href: "/admin/users" },
    { label: "AI conversations", value: stats.aiConversations, href: "/admin/users" },
  ];

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Admin" }]} />
      <PageHeader
        eyebrow="Administration"
        title="Platform overview"
        description="Key metrics across users, catalogue, commerce, and labs."
      />

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-4)" }}>
        {cards.map((c) => (
          <Link key={c.label} href={c.href} style={{ textDecoration: "none", color: "inherit" }}>
            <Card raised hover>
              <p className="text-muted text-sm">{c.label}</p>
              <p className="font-semibold" style={{ fontSize: "var(--text-3xl)" }}>
                {c.value}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)", marginTop: "var(--space-8)" }}>
        <Card raised>
          <div className="flex justify-between items-center" style={{ marginBottom: "var(--space-4)" }}>
            <h3 style={{ margin: 0 }}>Recent users</h3>
            <Link href="/admin/users" className="text-sm font-semibold">Manage →</Link>
          </div>
          {stats.recentUsers.length === 0 ? (
            <p className="text-muted text-sm">No users yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {stats.recentUsers.map((u) => (
                <div key={u.id}>
                  <p className="font-semibold text-sm">{u.displayName}</p>
                  <p className="text-muted text-sm">
                    {u.email} · joined {formatDateTime(u.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card raised>
          <h3 style={{ marginBottom: "var(--space-4)" }}>Administration</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <Link href="/admin/users" className="nav-link">User management</Link>
            <Link href="/admin/audit" className="nav-link">Audit log</Link>
          </div>
          <p className="text-muted text-sm" style={{ marginTop: "var(--space-4)", marginBottom: 0 }}>
            Access is restricted to users with the &quot;user.manage&quot; or
            &quot;audit.read&quot; permission.
          </p>
        </Card>
      </div>
    </main>
  );
}
