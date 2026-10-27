import { notFound, redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { requireUser } from "@/lib/server";
import { getDb } from "@/db/client";
import { courses, lessonProgress, lessons, modules } from "@/db/schema";
import { getCourseBySlug, isEnrolled } from "@/lib/catalogue";
import { requireEnrollment } from "@/lib/learning";
import { Breadcrumbs, Card, LevelBadge, PageHeader, Progress } from "@/components/ui";
import { LessonList } from "./lesson-list";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  return { title: course ? `${course.title} — My Learning` : "Not enrolled" };
}

export default async function CoursePlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireUser();
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const enrolled = await isEnrolled(user.id, course.id);
  if (!enrolled) {
    redirect(`/courses/${course.slug}`);
  }
  const enrollment = await requireEnrollment(user.id, course.id);

  // Progress for this course.
  const db = getDb();
  const courseModules = await db
    .select({ id: modules.id })
    .from(modules)
    .where(eq(modules.courseId, course.id))
    .all();
  const moduleIds = courseModules.map((m) => m.id);
  const allLessons = moduleIds.length
    ? await db
        .select({ completed: lessonProgress.completed })
        .from(lessons)
        .leftJoin(
          lessonProgress,
          and(
            eq(lessonProgress.lessonId, lessons.id),
            eq(lessonProgress.enrollmentId, enrollment.id),
          ),
        )
        .where(inArray(lessons.moduleId, moduleIds))
        .all()
    : [];
  const completed = allLessons.filter((l) => l.completed).length;
  const percent = allLessons.length ? Math.round((completed / allLessons.length) * 100) : 0;

  return (
    <main className="container" style={{ padding: "var(--space-8) var(--space-6)" }}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "My Learning", href: "/app" },
          { label: course.title, href: `/app/courses/${course.slug}` },
        ]}
      />

      <div className="flex justify-between items-center mb-6" style={{ gap: "var(--space-4)", flexWrap: "wrap" }}>
        <div>
          <div className="flex gap-2 mb-2">
            <LevelBadge level={course.level} />
            <span className="badge">{course.lessonCount} lessons</span>
          </div>
          <h1 style={{ margin: 0 }}>{course.title}</h1>
        </div>
        <div style={{ minWidth: 220 }}>
          <Progress value={percent} label={`${percent}% complete`} />
        </div>
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2.2fr)", gap: "var(--space-6)", alignItems: "start" }}
      >
        <aside>
          <LessonList course={course} enrollmentId={enrollment.id} />
        </aside>
        <div>
          <Card raised>
            <h2>Course overview</h2>
            <p className="text-muted" style={{ whiteSpace: "pre-line" }}>
              {course.description}
            </p>
            <p className="text-sm text-muted mt-4">
              Select a lesson from the curriculum to start learning. Your progress is
              saved automatically, and you can take notes and bookmark lessons as you go.
            </p>
            <div className="flex gap-2 mt-4">
              {course.modules[0]?.lessons[0] && (
                <Link
                  href={`/app/courses/${course.slug}/lessons/${course.modules[0].lessons[0].id}`}
                  className="btn btn-primary"
                >
                  {percent > 0 ? "Continue" : "Start first lesson"}
                </Link>
              )}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
