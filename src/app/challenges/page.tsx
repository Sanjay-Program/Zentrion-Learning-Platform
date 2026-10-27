import { listChallenges } from "@/lib/catalogue";
import { Breadcrumbs, Card, LevelBadge, PageHeader } from "@/components/ui";
import Link from "next/link";

export const metadata = { title: "Challenges — Zentrion" };

export default async function ChallengesPage() {
  const challenges = await listChallenges();

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Challenges" }]} />
      <PageHeader
        eyebrow="Capture the flag"
        title="Security challenges"
        description="Realistic CTF challenges in a safe, simulated environment. Submit flags to score points."
      />

      {challenges.length === 0 ? (
        <Card>
          <p className="text-muted">No published challenges yet.</p>
        </Card>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "var(--space-5)" }}>
          {challenges.map((c) => (
            <Card key={c.id} raised hover>
              <div className="flex justify-between items-start" style={{ gap: "var(--space-2)" }}>
                <h3 style={{ marginBottom: "var(--space-1)" }}>
                  <Link href={`/challenges/${c.slug}`}>{c.title}</Link>
                </h3>
                <span className="badge badge-primary">{c.points} pts</span>
              </div>
              <p className="text-muted text-sm" style={{ marginBottom: "var(--space-3)" }}>
                {c.description}
              </p>
              <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
                <LevelBadge level={c.difficulty} />
                <span className="badge">{c.category}</span>
                <span className="badge badge-secondary">{c.maxAttempts} attempts</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
