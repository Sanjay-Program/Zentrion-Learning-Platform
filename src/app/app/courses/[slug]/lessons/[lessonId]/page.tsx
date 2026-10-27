import { notFound } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { requireUser } from "@/lib/server";
import { getDb } from "@/db/client";
import { lessonBlocks, lessonProgress, lessons, modules } from "@/db/schema";
import { getCourseBySlug } from "@/lib/catalogue";
import { isBookmarked, listNotes, requireEnrollment } from "@/lib/learning";
import { Breadcrumbs, Card, PageHeader } from "@/components/ui";
import { LessonViewer } from "@/components/lesson-viewer";
import { LessonControls } from "./lesson-controls";
import { NotesPanel } from "./notes-panel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { lessonId } = await params;
  const db = getDb();
  const lesson = await db
    .select({ title: lessons.title })
    .from(lessons)
    .where(eq(lessons.id, Number(lessonId)))
    .limit(1)
    .get();
  return { title: lesson ? `${lesson.title} — Zentrion` : "Lesson not found" };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId: lessonIdParam } = await params;
  const user = await requireUser();
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const lessonId = Number(lessonIdParam);
  const db = getDb();
  const lesson = await db
    .select()
    .from(lessons)
    .where(eq(lessons.id, lessonId))
    .limit(1)
    .get();
  if (!lesson) notFound();

  // Verify the lesson belongs to this course.
  const module = await db
    .select()
    .from(modules)
    .where(eq(modules.id, lesson.moduleId))
    .limit(1)
    .get();
  if (!module || module.courseId !== course.id) notFound();

  const enrollment = await requireEnrollment(user.id, course.id);

  const blocks = await db
    .select()
    .from(lessonBlocks)
    .where(eq(lessonBlocks.lessonId, lessonId))
    .orderBy(lessonBlocks.orderIndex)
    .all();

  const progressRow = await db
    .select({ completed: lessonProgress.completed })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.enrollmentId, enrollment.id),
        eq(lessonProgress.lessonId, lessonId),
      ),
    )
    .limit(1)
    .get();
  const isCompleted = !!progressRow?.completed;

  const bookmarked = await isBookmarked(user.id, lessonId);
  const notes = await listNotes(user.id, lessonId);

  // Flat ordered lesson list across the course for prev/next navigation.
  const courseModules = await db
    .select({ id: modules.id })
    .from(modules)
    .where(eq(modules.courseId, course.id))
    .orderBy(modules.orderIndex)
    .all();
  const flatLessons = courseModules.length
    ? await db
        .select({ id: lessons.id, title: lessons.title })
        .from(lessons)
        .where(inArray(lessons.moduleId, courseModules.map((m) => m.id)))
        .orderBy(lessons.orderIndex)
        .all()
    : [];
  const currentIndex = flatLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < flatLessons.length - 1
      ? flatLessons[currentIndex + 1]
      : null;

  return (
    <main className="container" style={{ padding: "var(--space-8) var(--space-6)" }}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "My Learning", href: "/app" },
          { label: course.title, href: `/app/courses/${course.slug}` },
          { label: lesson.title },
        ]}
      />

      <PageHeader
        eyebrow={module.title}
        title={lesson.title}
        description={
          lesson.durationMinutes != null
            ? `${lesson.durationMinutes} min · ${lesson.lessonType}`
            : lesson.lessonType
        }
      />

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0, 2.2fr) minmax(0, 1fr)", gap: "var(--space-6)", alignItems: "start" }}
      >
        <div>
          <LessonViewer
            title={lesson.title}
            durationMinutes={lesson.durationMinutes}
            lessonType={lesson.lessonType}
            content={lesson.content}
            courseSlug={course.slug}
          />

          <LessonControls
            enrollmentId={enrollment.id}
            lessonId={lessonId}
            completed={isCompleted}
            bookmarked={bookmarked}
            prevLesson={prevLesson}
            nextLesson={nextLesson}
            courseSlug={course.slug}
          />
        </div>

        <aside>
          <NotesPanel notes={notes} lessonId={lessonId} />
        </aside>
      </div>
    </main>
  );
}
