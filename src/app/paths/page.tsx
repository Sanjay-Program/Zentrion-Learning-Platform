import { listPaths } from "@/lib/catalogue";
import { Breadcrumbs, Card, LevelBadge, PageHeader } from "@/components/ui";
import { BreadcrumbJsonLd } from "@/components/seo-schema";
import { formatHours } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = process.env.APP_BASE_URL || "https://zentrion.dev";

export const metadata: Metadata = {
  title: "Career Learning Paths — Step-by-Step Engineering Tracks",
  description:
    "Follow structured, sequenced career learning paths from beginner to production-ready engineer in AI Agents, Defensive Cybersecurity, and Full-Stack Engineering.",
  alternates: {
    canonical: `${BASE_URL}/paths`,
  },
  openGraph: {
    title: "Career Learning Paths | Zentrion Learntech",
    description: "Sequenced bundles of courses that take you from fundamentals to job-ready skills with verifiable credentials.",
    url: `${BASE_URL}/paths`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Career Learning Paths | Zentrion Learntech",
    description: "Step-by-step career tracks in AI and Cybersecurity.",
  },
};

export default async function PathsPage() {
  const paths = await listPaths();
  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Learning Paths", url: "/paths" },
        ]}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Paths" }]} />
      <PageHeader
        eyebrow="Career tracks"
        title="Learning Paths"
        description="Sequenced bundles of courses that take you from fundamentals to job-ready skills."
      />
      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 20rem), 1fr))", gap: "var(--space-5)" }}
      >
        {paths.map((path) => (
          <Link key={path.id} href={`/paths/${path.slug}`} style={{ textDecoration: "none" }}>
            <Card hover className="flex-col h-full">
              <div className="flex gap-2 mb-3" style={{ flexWrap: "wrap", alignItems: "center" }}>
                <LevelBadge level={path.level} />
                {path.estimatedHours != null && (
                  <span className="badge">{formatHours(path.estimatedHours)}</span>
                )}
                <span className="badge badge-accent">{path.courseCount} courses</span>
              </div>
              <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-2)" }}>{path.title}</h3>
              {path.description && (
                <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>{path.description}</p>
              )}
              <span className="text-sm font-semibold" style={{ marginTop: "auto", paddingTop: "var(--space-4)", color: "var(--primary, #3b3bf0)" }}>
                View path →
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
