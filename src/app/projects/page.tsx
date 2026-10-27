import { Breadcrumbs, Badge, Card, LevelBadge, PageHeader } from "@/components/ui";
import { CourseArtwork } from "@/components/course-artwork";
import { listProjects } from "@/lib/catalogue";
import Link from "next/link";

export const metadata = { title: "Capstone Projects — Zentrion" };

export default async function ProjectsPage() {
  const projects = await listProjects();

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Projects" }]} />
      <PageHeader
        eyebrow="Project-based evaluation"
        title="Capstone projects"
        description="Apply everything you learn in realistic, rubric-scored projects. Each project is evaluated against a public rubric by instructors and peers."
      />

      {projects.length === 0 ? (
        <Card>
          <p className="text-muted">Projects are being prepared — check back soon.</p>
        </Card>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(20rem, 1fr))", gap: "var(--space-5)" }}>
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <Card hover className="flex-col h-full" style={{ padding: 0, overflow: "hidden" }}>
                <CourseArtwork slug={p.slug} title={p.title} size="sm" />
                <div style={{ padding: "var(--space-5)", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div className="flex gap-2 mb-2">
                    <LevelBadge level={p.level} />
                    {p.milestoneCount > 0 && <Badge>{p.milestoneCount} milestones</Badge>}
                  </div>
                  <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-2)" }}>{p.title}</h3>
                  <p className="text-muted text-sm" style={{ flex: 1 }}>{p.description}</p>
                  <p className="text-subtle text-sm mt-4">View project deliverable →</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

