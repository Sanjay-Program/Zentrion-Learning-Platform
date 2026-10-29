import { notFound } from "next/navigation";
import { requireUser } from "@/lib/server";
import { getLabSession } from "@/lib/labs";
import { getLabBySlug } from "@/lib/labs";
import { Breadcrumbs, Card, PageHeader, Progress } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { LabConsoleClient } from "./lab-console-client";

export const metadata = { title: "Lab Console" };

export default async function LabSessionPage({
  params,
}: {
  params: Promise<{ slug: string; sessionId: string }>;
}) {
  const user = await requireUser();
  const { slug, sessionId } = await params;
  const [lab, session] = await Promise.all([
    getLabBySlug(slug),
    getLabSession(Number(sessionId), user.id),
  ]);
  if (!lab || !session || session.labId !== lab.id) notFound();

  const isRunning = session.status === "running";

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Labs", href: "/labs" },
          { label: lab.title, href: `/labs/${lab.slug}` },
          { label: `Session #${session.id}` },
        ]}
      />
      <PageHeader
        eyebrow={`Session #${session.id} · ${session.status}`}
        title={lab.title}
        description={`Environment: ${session.environmentVersion} · expires ${formatDateTime(session.expiresAt)}`}
      />

      <LabConsoleClient labSlug={lab.slug} initialSession={session} />

      {session.grade && (
        <Card raised style={{ marginTop: "var(--space-6)" }}>
          <h3 style={{ marginBottom: "var(--space-4)" }}>Grade</h3>
          <div className="flex justify-between items-center" style={{ gap: "var(--space-4)", flexWrap: "wrap" }}>
            <Progress value={session.grade.scorePercent} label="Score" />
            <span
              className={
                session.grade.scorePercent >= 70 ? "badge badge-success" : "badge badge-danger"
              }
            >
              {session.grade.scorePercent}%
            </span>
          </div>
          {session.grade.feedback && (
            <p className="text-muted" style={{ marginTop: "var(--space-4)" }}>
              {session.grade.feedback}
            </p>
          )}
          {(session.grade.rubricScores as { criterion?: string; points?: number; earned?: number }[]).length > 0 && (
            <table className="table" style={{ marginTop: "var(--space-4)" }}>
              <thead>
                <tr>
                  <th>Criterion</th>
                  <th>Points</th>
                  <th>Earned</th>
                </tr>
              </thead>
              <tbody>
                {(session.grade.rubricScores as { criterion?: string; points?: number; earned?: number }[]).map(
                  (r, i) => (
                    <tr key={i}>
                      <td>{r.criterion}</td>
                      <td>{r.points}</td>
                      <td>{r.earned}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          )}
        </Card>
      )}

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)", marginTop: "var(--space-6)" }}>
        <Card>
          <h3 style={{ marginBottom: "var(--space-4)" }}>Objectives</h3>
          <ol style={{ paddingLeft: "var(--space-6)", margin: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {lab.objectives.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ol>
        </Card>
        <Card>
          <h3 style={{ marginBottom: "var(--space-4)" }}>Evidence collected</h3>
          {session.evidence.length === 0 ? (
            <p className="text-muted text-sm">No evidence recorded yet.</p>
          ) : (
            <ul style={{ paddingLeft: "var(--space-6)", margin: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {session.evidence.map((e) => (
                <li key={e.id}>
                  <span className="badge">{e.kind}</span>{" "}
                  <code>{e.reference}</code>
                  {e.details && <p className="text-muted text-sm">{e.details}</p>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card style={{ marginTop: "var(--space-6)" }}>
        <h3 style={{ marginBottom: "var(--space-4)" }}>Session events</h3>
        {session.events.length === 0 ? (
          <p className="text-muted text-sm">No events recorded.</p>
        ) : (
          <ol style={{ paddingLeft: "var(--space-6)", margin: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {session.events.map((e) => (
              <li key={e.id} className="text-sm">
                <span className="badge">{e.eventType}</span>{" "}
                <span className="text-muted">{formatDateTime(e.createdAt)}</span>
                {e.details && <p className="text-muted" style={{ margin: "var(--space-1) 0 0" }}>{e.details}</p>}
              </li>
            ))}
          </ol>
        )}
      </Card>

      {!isRunning && (
        <p className="text-muted" style={{ marginTop: "var(--space-6)" }}>
          This session is {session.status}. Launch a new session from the lab page to keep practising.
        </p>
      )}
    </main>
  );
}
