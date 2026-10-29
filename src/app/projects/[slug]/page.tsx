import { notFound } from "next/navigation";
import { Breadcrumbs, Button, Card, LevelBadge, PageHeader } from "@/components/ui";
import { CourseArtwork } from "@/components/course-artwork";
import { getProjectBySlug } from "@/lib/catalogue";
import Link from "next/link";

export const metadata = { title: "Capstone Project" };

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)", maxWidth: 46 * 16 }}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: project.title },
        ]}
      />
      <div className="mb-6">
        <CourseArtwork slug={project.slug} title={project.title} size="md" />
      </div>
      <PageHeader
        eyebrow={`${project.level} · ${project.milestoneCount} milestones`}
        title={project.title}
        description={project.description ?? undefined}
      />


      <div className="grid" style={{ gridTemplateColumns: "2fr 1fr", gap: "var(--space-8)", alignItems: "start" }}>
        <div className="flex-col" style={{ gap: "var(--space-6)" }}>
          <Card>
            <h3 style={{ marginBottom: "var(--space-3)" }}>Project brief</h3>
            {project.brief ? (
              <p className="text-muted" style={{ whiteSpace: "pre-line", margin: 0 }}>
                {project.brief}
              </p>
            ) : (
              <p className="text-muted" style={{ margin: 0 }}>
                {project.description}
              </p>
            )}
          </Card>

          <Card>
            <h3 style={{ marginBottom: "var(--space-3)" }}>Evaluation rubric</h3>
            {project.rubric.length === 0 ? (
              <p className="text-muted">The rubric for this project is being finalised.</p>
            ) : (
              <ol style={{ margin: 0, paddingLeft: "var(--space-6)", display: "grid", gap: "var(--space-3)" }}>
                {project.rubric.map((criterion, i) => (
                  <li key={i} className="text-muted">
                    {criterion}
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card>
            <h3 style={{ marginBottom: "var(--space-3)" }}>How to submit</h3>
            <ol style={{ margin: 0, paddingLeft: "var(--space-6)", display: "grid", gap: "var(--space-2)" }} className="text-muted">
              <li>Enroll in the related course(s) below.</li>
              <li>Complete the project milestone by milestone.</li>
              <li>Submit your artefacts (documents, links, or code) from the course page.</li>
              <li>Instructors grade against the rubric; you receive feedback and a score.</li>
            </ol>
          </Card>
        </div>

        <div className="flex-col" style={{ gap: "var(--space-5)" }}>
          <Card>
            <h4 style={{ marginBottom: "var(--space-2)" }}>Details</h4>
            <dl style={{ margin: 0, display: "grid", gap: "var(--space-2)" }}>
              <div className="flex justify-between">
                <dt className="text-muted">Level</dt>
                <dd style={{ margin: 0 }}><LevelBadge level={project.level} /></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Track</dt>
                <dd style={{ margin: 0 }}>{project.categoryName ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Milestones</dt>
                <dd style={{ margin: 0 }}>{project.milestoneCount}</dd>
              </div>
            </dl>
          </Card>

          {project.relatedCourseSlugs.length > 0 && (
            <Card>
              <h4 style={{ marginBottom: "var(--space-3)" }}>Related courses</h4>
              <div style={{ display: "grid", gap: "var(--space-2)" }}>
                {project.relatedCourseSlugs.map((slug) => (
                  <Button key={slug} variant="secondary" size="sm" href={`/courses/${slug}`}>
                    {slug.replace(/-/g, " ")}
                  </Button>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <h4 style={{ marginBottom: "var(--space-3)" }}>Get started</h4>
            <Button href="/app" className="w-full">Go to My Learning</Button>
            <p className="text-subtle text-sm" style={{ marginTop: "var(--space-3)", marginBottom: 0 }}>
              Sign in to track your progress and submit work.
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}
