import { listChallenges, listLabs } from "@/lib/catalogue";
import { Breadcrumbs, Card, LevelBadge, PageHeader } from "@/components/ui";
import { BreadcrumbJsonLd } from "@/components/seo-schema";
import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = process.env.APP_BASE_URL || "https://zentrion.dev";

export const metadata: Metadata = {
  title: "Hands-on Cybersecurity & AI Cloud Labs — Zentrion Learntech",
  description:
    "Practice hands-on penetration testing, incident response, network packet analysis, and AI prompt defense in fully sandboxed, auto-graded in-browser cloud labs.",
  alternates: {
    canonical: `${BASE_URL}/labs`,
  },
  openGraph: {
    title: "Hands-on Cyber & AI Cloud Labs | Zentrion Learntech",
    description: "100% simulated, isolated browser sandboxes with auto-graded evaluation.",
    url: `${BASE_URL}/labs`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Hands-on Cyber & AI Labs | Zentrion",
    description: "Practice real security skills in browser sandboxes.",
  },
};

export default async function LabsPage() {
  const [labs, challenges] = await Promise.all([listLabs(), listChallenges()]);

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Hands-on Labs", url: "/labs" },
        ]}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Labs" }]} />
      <PageHeader
        eyebrow="Cybersecurity"
        title="Hands-on labs"
        description="Practice real security skills in a fully simulated environment — no vulnerable infrastructure required."
      />

      <div className="flex items-center gap-2 mb-6" style={{ flexWrap: "wrap" }}>
        <span className="badge badge-success">100% simulated</span>
        <span className="badge badge-info">Browser sandbox</span>
        <span className="badge">Auto-graded</span>
      </div>

      <h2 style={{ marginBottom: "var(--space-4)" }}>Guided labs</h2>
      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 19rem), 1fr))", gap: "var(--space-5)" }}
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
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 19rem), 1fr))", gap: "var(--space-5)" }}
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
