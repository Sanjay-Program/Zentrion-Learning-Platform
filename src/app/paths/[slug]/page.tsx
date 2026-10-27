import { notFound } from "next/navigation";
import { getPathBySlug } from "@/lib/catalogue";
import { Breadcrumbs, Card, CourseCard, LevelBadge, PageHeader } from "@/components/ui";
import { formatHours } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const path = await getPathBySlug(slug);
  return {
    title: path ? `${path.title} — Zentrion` : "Path not found",
    description: path?.description ?? "",
  };
}

export default async function PathDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const path = await getPathBySlug(slug);
  if (!path) notFound();

  const totalHours = path.courses.reduce((s, c) => s + (c.estimatedHours ?? 0), 0);

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Paths", href: "/paths" }, { label: path.title }]} />
      <PageHeader
        eyebrow="Learning path"
        title={path.title}
        description={path.description ?? undefined}
      />

      <Card className="mb-8">
        <div className="flex gap-2 mb-3">
          <LevelBadge level={path.level} />
          <span className="badge">{path.courseCount} courses</span>
          {totalHours > 0 && <span className="badge">≈ {formatHours(totalHours)} total</span>}
        </div>
        <p className="text-muted">
          Complete every course in this path to earn the completion certificate.
          Courses are sequenced — later courses assume earlier ones are done.
        </p>
      </Card>

      <h2 style={{ marginBottom: "var(--space-4)" }}>Your roadmap</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {path.courses.map((course, i) => (
          <div key={course.id} className="flex" style={{ gap: "var(--space-5)", alignItems: "stretch" }}>
            <div
              aria-hidden="true"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "var(--primary-subtle)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <CourseCard
                slug={course.slug}
                title={course.title}
                subtitle={course.subtitle}
                level={course.level}
                hours={course.estimatedHours}
                priceCents={course.priceCents}
              />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
