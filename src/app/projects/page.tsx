import { Breadcrumbs, Badge, Card, LevelBadge, PageHeader } from "@/components/ui";
import { BreadcrumbJsonLd } from "@/components/seo-schema";
import { CourseArtwork } from "@/components/course-artwork";
import { listProjects } from "@/lib/catalogue";
import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = process.env.APP_BASE_URL || "https://zentrion.dev";

export const metadata: Metadata = {
  title: "Capstone Projects — Portfolio-Ready Real World Deliverables",
  description:
    "Build real-world engineering capstone projects evaluated against industry rubrics. Deploy autonomous AI agents, cloud honeypots, and production web applications.",
  alternates: {
    canonical: `${BASE_URL}/projects`,
  },
  openGraph: {
    title: "Capstone Projects | Zentrion Learntech",
    description: "Realistic, rubric-scored engineering projects that showcase your verified skills to top tech employers.",
    url: `${BASE_URL}/projects`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Capstone Projects | Zentrion Learntech",
    description: "Build production portfolio deliverables in AI and Cybersecurity.",
  },
};

export default async function ProjectsPage() {
  const projects = await listProjects();

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Capstone Projects", url: "/projects" },
        ]}
      />
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
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 19rem), 1fr))", gap: "var(--space-5)" }}>
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <Card hover className="flex-col h-full" style={{ padding: 0, overflow: "hidden" }}>
                <CourseArtwork slug={p.slug} title={p.title} size="sm" />
                <div style={{ padding: "var(--space-5)", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div className="flex gap-2 mb-2" style={{ flexWrap: "wrap", alignItems: "center" }}>
                    <LevelBadge level={p.level} />
                    {p.milestoneCount > 0 && <Badge>{p.milestoneCount} milestones</Badge>}
                  </div>
                  <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-2)" }}>{p.title}</h3>
                  <p className="text-muted text-sm" style={{ flex: 1, lineHeight: 1.6 }}>{p.description}</p>
                  <p className="text-sm font-semibold mt-4" style={{ color: "var(--primary, #3b3bf0)" }}>View project deliverable →</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

