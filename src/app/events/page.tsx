import { listLiveSessions } from "@/lib/catalogue";
import { getCurrentUser } from "@/lib/auth";
import { Breadcrumbs, Card, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

export const metadata = {
  title: "Live Events",
  description: "Live sessions, office hours, and workshops on Zentrion.",
};

export default async function EventsPage() {
  const sessions = await listLiveSessions();
  const user = await getCurrentUser();

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Events" }]} />
      <PageHeader
        eyebrow="Live learning"
        title="Events & office hours"
        description="Live sessions with instructors. Reserve a seat — recordings are posted afterwards."
      />

      {sessions.length === 0 ? (
        <Card>
          <p className="text-muted">No upcoming sessions. Check back soon.</p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {sessions.map((s) => {
            const full = s.seatLimit != null && s.registrationCount >= s.seatLimit;
            const starts = new Date(s.startsAt);
            return (
              <Card key={s.id}>
                <div className="flex justify-between" style={{ gap: "var(--space-4)", flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ marginBottom: "var(--space-1)" }}>{s.title}</h3>
                    <p className="text-muted text-sm">
                      {s.instructorName && <span>with {s.instructorName} · </span>}
                      {formatDateTime(s.startsAt)}
                      {s.seatLimit != null && (
                        <span>
                          {" "}· {s.seatLimit - s.registrationCount} seats left
                        </span>
                      )}
                    </p>
                    {s.description && (
                      <p className="text-muted text-sm" style={{ marginTop: "var(--space-2)" }}>
                        {s.description}
                      </p>
                    )}
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {!user ? (
                      <a
                        href={`https://wa.me/917305771789?text=Hello%2C%20I%20want%20to%20register%20for%20the%20live%20event%3A%20${encodeURIComponent(s.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm"
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                      >
                        💬 Register via WhatsApp
                      </a>
                    ) : full ? (
                      <span className="badge badge-warning">Session full</span>
                    ) : (
                      <form action={`/api/v1/events/${s.id}/register`} method="post">
                        <button type="submit" className="btn btn-primary btn-sm">
                          Reserve seat
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
