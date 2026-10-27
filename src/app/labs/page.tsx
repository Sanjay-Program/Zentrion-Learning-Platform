import { listChallenges, listLabs } from "@/lib/catalogue";
import { Breadcrumbs, Card, LevelBadge, PageHeader } from "@/components/ui";
import Link from "next/link";

export const metadata = {
  title: "Cyber Labs — Zentrion",
  description: "Hands-on cybersecurity labs and CTF challenges in a simulated environment.",
};

export default async function LabsPage() {
  const [labs, challenges] = await Promise.all([listLabs(), listChallenges()]);

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Labs" }]} />
      <PageHeader
        eyebrow="Cybersecurity"
        title="Hands-on labs"
        description="Practice real security skills in a fully simulated environment — no vulnerable infrastructure required."
      />

      <div className="flex items-center gap-2 mb-6">
        <span className="badge badge-success">100% simulated</span>
        <span className="badge badge-info">Browser sandbox</span>
        <span className="badge">Auto-graded</span>
      </div>

      <h2 style={{ marginBottom: "var(--space-4)" }}>Guided labs</h2>
      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(20rem, 1fr))", gap: "var(--space-5)" }}
      >
        {labs.map((lab) => (
          <Link key={lab.id} href={`/labs/${lab.slug}`} style={{ textDecoration: "none" }}>
            <Card hover className="flex-col h-full">
              <div className="flex gap-2 mb-3">
                <LevelBadge level={lab.difficulty} />
                <span className="badge">{lab.estimatedMinutes} min</span>
                <span className="badge badge-accent">{lab.labType}</span>
              </div>
              <h3 style={{ fontSize: "var(--text-xl)" }}>{lab.title}</h3>
              <p className="text-muted text-sm">{lab.description}</p>
              <span className="text-sm font-semibold" style={{ marginTop: "auto", paddingTop: "var(--space-4)" }}>
                Launch lab →
              </span>
            </Card>
          </Link>
        ))}
      </div>

      <h2 style={{ margin: "var(--space-12) 0 var(--space-4)" }}>CTF challenges</h2>
      <p className="text-muted mb-6">
        Short, scoped puzzles. Find the flag, submit it, and earn points.
      </p>
      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(20rem, 1fr))", gap: "var(--space-5)" }}
      >
        {challenges.map((ch) => (
          <Link key={ch.id} href={`/challenges/${ch.slug}`} style={{ textDecoration: "none" }}>
            <Card hover className="flex-col h-full">
              <div className="flex gap-2 mb-3">
                <LevelBadge level={ch.difficulty} />
                <span className="badge badge-warning">{ch.points} pts</span>
                <span className="badge">{ch.category}</span>
              </div>
              <h3 style={{ fontSize: "var(--text-xl)" }}>{ch.title}</h3>
              <p className="text-muted text-sm">{ch.description}</p>
              <span className="text-sm font-semibold" style={{ marginTop: "auto", paddingTop: "var(--space-4)" }}>
                Solve challenge →
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
