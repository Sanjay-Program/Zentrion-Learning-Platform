import { listPaths } from "@/lib/catalogue";
import { Breadcrumbs, Card, LevelBadge, PageHeader } from "@/components/ui";
import { formatHours } from "@/lib/utils";
import Link from "next/link";

export const metadata = {
  title: "Learning Paths",
  description: "Structured learning paths that bundle courses into career tracks.",
};

export default async function PathsPage() {
  const paths = await listPaths();
  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Paths" }]} />
      <PageHeader
        eyebrow="Career tracks"
        title="Learning Paths"
        description="Sequenced bundles of courses that take you from fundamentals to job-ready skills."
      />
      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(22rem, 1fr))", gap: "var(--space-5)" }}
      >
        {paths.map((path) => (
          <Link key={path.id} href={`/paths/${path.slug}`} style={{ textDecoration: "none" }}>
            <Card hover className="flex-col h-full">
              <div className="flex gap-2 mb-3">
                <LevelBadge level={path.level} />
                <Card className="hidden" aria-hidden="true">
                  <span />
                </Card>
                {path.estimatedHours != null && (
                  <span className="badge">{formatHours(path.estimatedHours)}</span>
                )}
                <span className="badge badge-accent">{path.courseCount} courses</span>
              </div>
              <h3 style={{ fontSize: "var(--text-xl)" }}>{path.title}</h3>
              {path.description && (
                <p className="text-muted text-sm">{path.description}</p>
              )}
              <span className="text-sm font-semibold" style={{ marginTop: "auto", paddingTop: "var(--space-4)" }}>
                View path →
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
