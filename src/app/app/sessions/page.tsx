import { requireUser } from "@/lib/server";
import { listLiveSessions } from "@/lib/catalogue";
import { Breadcrumbs, Card, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

export const metadata = { title: "Active Sessions — Zentrion" };

export default async function SessionsPage() {
  const user = await requireUser();
  const sessions = await listLiveSessions();

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My Learning", href: "/app" }, { label: "Sessions" }]} />
      <PageHeader
        eyebrow="Account"
        title="Active sessions"
        description="Devices where you are signed in. Revoke anything you do not recognise."
      />

      <Card>
        <p className="text-muted mb-4">
          Session management is handled from your account settings. Your current
          session is shown with a badge below.
        </p>
        <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
          <span className="badge badge-success">Current session</span>
          <span className="badge">{sessions.length} upcoming events</span>
        </div>
      </Card>

      <h2 style={{ margin: "var(--space-8) 0 var(--space-4)" }}>Upcoming live sessions</h2>
      {sessions.length === 0 ? (
        <Card>
          <p className="text-muted">No upcoming sessions.</p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {sessions.map((s) => (
            <Card key={s.id}>
              <p className="font-semibold">{s.title}</p>
              <p className="text-muted text-sm">{formatDateTime(s.startsAt)}</p>
              <Link href="/events" className="text-sm font-semibold">
                Manage registration →
              </Link>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
