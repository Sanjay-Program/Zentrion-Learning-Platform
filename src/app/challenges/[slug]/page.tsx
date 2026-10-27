import { notFound, redirect } from "next/navigation";
import { currentUser } from "@/lib/server";
import { getChallengeBySlug } from "@/lib/labs";
import { Breadcrumbs, Card, LevelBadge, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { ChallengeClient } from "./challenge-client";

export const metadata = { title: "Challenge — Zentrion" };

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await currentUser();
  if (!user) {
    redirect(`/auth/sign-in?next=/challenges/${slug}`);
  }
  const challenge = await getChallengeBySlug(slug);
  if (!challenge) notFound();

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Challenges", href: "/challenges" },
          { label: challenge.title },
        ]}
      />
      <PageHeader
        eyebrow={`${challenge.category} · ${challenge.points} points`}
        title={challenge.title}
        description={challenge.description ?? undefined}
      />

      <div style={{ marginBottom: "var(--space-6)" }}>
        <ChallengeClient challengeId={challenge.id} maxAttempts={challenge.maxAttempts} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "2fr 1fr", gap: "var(--space-6)" }}>
        <Card raised>
          <h3 style={{ marginBottom: "var(--space-4)" }}>Hints</h3>
          {challenge.hints.length === 0 ? (
            <p className="text-muted">No hints available.</p>
          ) : (
            <ol style={{ paddingLeft: "var(--space-6)", margin: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {challenge.hints.map((hint, i) => (
                <li key={i}>{hint}</li>
              ))}
            </ol>
          )}
        </Card>

        <aside>
          <Card>
            <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "var(--space-2) var(--space-4)", margin: 0 }}>
              <dt className="text-muted">Difficulty</dt>
              <dd style={{ margin: 0 }}>
                <LevelBadge level={challenge.difficulty} />
              </dd>
              <dt className="text-muted">Points</dt>
              <dd style={{ margin: 0 }}>{challenge.points}</dd>
              <dt className="text-muted">Max attempts</dt>
              <dd style={{ margin: 0 }}>{challenge.maxAttempts}</dd>
              <dt className="text-muted">Expires</dt>
              <dd style={{ margin: 0 }}>
                {challenge.expiresAt ? formatDateTime(challenge.expiresAt) : "Never"}
              </dd>
            </dl>
          </Card>

          <Card style={{ marginTop: "var(--space-5)" }}>
            <h3 style={{ marginBottom: "var(--space-3)" }}>Recent attempts</h3>
            {challenge.attempts.length === 0 ? (
              <p className="text-muted text-sm">No attempts yet.</p>
            ) : (
              <ul style={{ paddingLeft: "var(--space-6)", margin: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                {challenge.attempts.map((a) => (
                  <li key={a.id} className="text-sm">
                    <span className={a.correct ? "badge badge-success" : "badge badge-danger"}>
                      {a.correct ? "correct" : "incorrect"}
                    </span>{" "}
                    <span className="text-muted">{formatDateTime(a.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </aside>
      </div>
    </main>
  );
}
