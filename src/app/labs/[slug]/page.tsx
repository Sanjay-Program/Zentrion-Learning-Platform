import { notFound } from "next/navigation";
import { requireUser } from "@/lib/server";
import { getLabBySlug, listLabSessions } from "@/lib/labs";
import { Breadcrumbs, Card, LevelBadge, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { LabClient } from "./lab-client";

export const metadata = { title: "Lab — Zentrion" };

export default async function LabDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireUser();
  const { slug } = await params;
  const [lab, sessions] = await Promise.all([
    getLabBySlug(slug),
    getLabBySlug(slug).then((l) => (l ? listLabSessions(l.id, user.id) : [])),
  ]);
  if (!lab) notFound();

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Labs", href: "/labs" },
          { label: lab.title },
        ]}
      />
      <PageHeader
        eyebrow={`${lab.labType} · ${lab.safetyClassification}`}
        title={lab.title}
        description={lab.description ?? undefined}
      />

      <div style={{ marginBottom: "var(--space-6)" }}>
        <LabClient slug={lab.slug} labId={lab.id} initialSessions={sessions} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "2fr 1fr", gap: "var(--space-6)" }}>
        <Card raised>
          <h3 style={{ marginBottom: "var(--space-4)" }}>Objectives</h3>
          <ol style={{ paddingLeft: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {lab.objectives.map((objective, i) => (
              <li key={i}>{objective}</li>
            ))}
            {lab.objectives.length === 0 && (
              <li className="text-muted">No objectives listed.</li>
            )}
          </ol>

          {lab.instructions && (
            <>
              <h3 style={{ margin: "var(--space-8) 0 var(--space-4)" }}>Instructions</h3>
              <div
                className="prose"
                style={{ whiteSpace: "pre-wrap", fontSize: "var(--text-sm)" }}
              >
                {lab.instructions}
              </div>
            </>
          )}
        </Card>

        <aside>
          <Card>
            <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "var(--space-2) var(--space-4)", margin: 0 }}>
              <dt className="text-muted">Difficulty</dt>
              <dd style={{ margin: 0 }}>
                <LevelBadge level={lab.difficulty} />
              </dd>
              <dt className="text-muted">Estimated time</dt>
              <dd style={{ margin: 0 }}>{lab.estimatedMinutes} minutes</dd>
              <dt className="text-muted">Session TTL</dt>
              <dd style={{ margin: 0 }}>{lab.ttlMinutes} minutes</dd>
              <dt className="text-muted">Engine</dt>
              <dd style={{ margin: 0 }}>{JSON.stringify(lab.engineConfig)}</dd>
            </dl>
          </Card>

          <Card style={{ marginTop: "var(--space-5)" }}>
            <h3 style={{ marginBottom: "var(--space-3)" }}>Your sessions</h3>
            {sessions.length === 0 ? (
              <p className="text-muted text-sm">No sessions yet. Launch one above.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                {sessions.slice(0, 5).map((s) => (
                  <Link
                    key={s.id}
                    href={`/labs/${lab.slug}/session/${s.id}`}
                    className="nav-link"
                  >
                    <span className="flex justify-between">
                      <span>Session #{s.id}</span>
                      <span className={s.status === "running" ? "badge badge-success" : "badge"}>
                        {s.status}
                      </span>
                    </span>
                    <span className="text-muted text-sm">
                      {formatDateTime(s.startedAt)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </aside>
      </div>
    </main>
  );
}
