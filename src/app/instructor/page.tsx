import { requireUser } from "@/lib/server";
import { listInstructorCourses } from "@/lib/instructor";
import { listInstructorSubmissions } from "@/lib/instructor";
import { Breadcrumbs, Card, LevelBadge, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

export const metadata = { title: "Instructor Studio — Zentrion" };

export default async function InstructorDashboardPage() {
  const user = await requireUser();
  const [courses, submissions] = await Promise.all([
    listInstructorCourses(user),
    listInstructorSubmissions(user),
  ]);

  const totalEnrollments = courses.reduce((sum, c) => sum + c.enrollmentCount, 0);
  const totalLessons = courses.reduce((sum, c) => sum + c.lessonCount, 0);
  const pendingGrading = submissions.filter((s) => s.status === "submitted").length;

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Instructor Studio" }]}
      />
      <PageHeader
        eyebrow="Instructor Studio"
        title="Teach"
        description="Manage your courses, curriculum, and grading queue."
      />

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-4)" }}>
        <Card raised>
          <p className="text-muted text-sm">Courses</p>
          <p className="font-semibold" style={{ fontSize: "var(--text-3xl)" }}>{courses.length}</p>
        </Card>
        <Card raised>
          <p className="text-muted text-sm">Lessons</p>
          <p className="font-semibold" style={{ fontSize: "var(--text-3xl)" }}>{totalLessons}</p>
        </Card>
        <Card raised>
          <p className="text-muted text-sm">Enrolments</p>
          <p className="font-semibold" style={{ fontSize: "var(--text-3xl)" }}>{totalEnrollments}</p>
        </Card>
        <Card raised>
          <p className="text-muted text-sm">Awaiting grading</p>
          <p className="font-semibold" style={{ fontSize: "var(--text-3xl)" }}>{pendingGrading}</p>
        </Card>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "2fr 1fr", gap: "var(--space-6)", marginTop: "var(--space-8)" }}>
        <section>
          <div className="flex justify-between items-center" style={{ marginBottom: "var(--space-4)" }}>
            <h2 style={{ margin: 0 }}>Your courses</h2>
            <Link href="/instructor/courses/new" className="btn btn-primary btn-sm">
              New course
            </Link>
          </div>
          {courses.length === 0 ? (
            <Card>
              <p className="text-muted">No courses yet. Create your first course to get started.</p>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {courses.map((c) => (
                <Card key={c.id} raised>
                  <div className="flex justify-between items-center" style={{ gap: "var(--space-3)", flexWrap: "wrap" }}>
                    <div>
                      <p className="font-semibold">
                        <Link href={`/instructor/courses/${c.id}`}>{c.title}</Link>
                      </p>
                      <p className="text-muted text-sm">
                        {c.lessonCount} lessons · {c.enrollmentCount} enrolments · updated{" "}
                        {formatDateTime(c.updatedAt)}
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <LevelBadge level={c.level} />
                      <span className={c.isPublished ? "badge badge-success" : "badge"}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <aside>
          <Card>
            <div className="flex justify-between items-center" style={{ marginBottom: "var(--space-4)" }}>
              <h3 style={{ margin: 0 }}>Grading queue</h3>
              <Link href="/instructor/submissions" className="text-sm font-semibold">
                View all →
              </Link>
            </div>
            {submissions.length === 0 ? (
              <p className="text-muted text-sm">No submissions yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {submissions.slice(0, 5).map((s) => (
                  <div key={s.id}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">{s.learnerName}</span>
                      <span className={s.status === "submitted" ? "badge" : "badge badge-success"}>
                        {s.status}
                      </span>
                    </div>
                    <p className="text-muted text-sm" style={{ margin: "var(--space-1) 0 0" }}>
                      {s.lessonTitle ?? "Project"} · {s.courseTitle} · {formatDateTime(s.submittedAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </aside>
      </div>
    </main>
  );
}
