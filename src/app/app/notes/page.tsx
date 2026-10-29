import { requireUser } from "@/lib/server";
import { listBookmarks, listNotes } from "@/lib/learning";
import { getDb } from "@/db/client";
import { lessons, modules } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Breadcrumbs, Card, PageHeader } from "@/components/ui";
import { Tabs } from "@/components/interactive";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Notes & Bookmarks" };

export default async function NotesPage() {
  const user = await requireUser();
  const [notes, bookmarks] = await Promise.all([
    listNotes(user.id),
    listBookmarks(user.id),
  ]);
  const db = getDb();

  // Resolve lesson context for notes (course path).
  const notesWithContext = await Promise.all(
    notes.slice(0, 50).map(async (note) => {
      if (!note.lessonId) return { ...note, lessonTitle: null, courseSlug: null };
      const lesson = await db
        .select({ title: lessons.title, moduleId: lessons.moduleId })
        .from(lessons)
        .where(eq(lessons.id, note.lessonId))
        .limit(1)
        .get();
      if (!lesson) return { ...note, lessonTitle: null, courseSlug: null };
      const module = await db
        .select({ courseId: modules.courseId })
        .from(modules)
        .where(eq(modules.id, lesson.moduleId))
        .limit(1)
        .get();
      return { ...note, lessonTitle: lesson.title, courseSlug: module ? `course-${module.courseId}` : null, courseId: module?.courseId ?? null };
    }),
  );

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My Learning", href: "/app" }, { label: "Notes" }]} />
      <PageHeader
        eyebrow="Workspace"
        title="Notes & bookmarks"
        description="Everything you saved while learning."
      />

      <Tabs
        tabs={[
          { id: "notes", label: `Notes (${notes.length})` },
          { id: "bookmarks", label: `Bookmarks (${bookmarks.length})` },
        ]}
        active="notes"
      />

      <section style={{ marginTop: "var(--space-6)" }}>
        <h2 style={{ marginBottom: "var(--space-4)" }}>Notes</h2>
        {notesWithContext.length === 0 ? (
          <Card>
            <p className="text-muted">No notes yet. Open any lesson and jot down key points.</p>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {notesWithContext.map((note) => (
              <Card key={note.id}>
                <p style={{ whiteSpace: "pre-line", margin: "0 0 var(--space-1)" }}>
                  {note.content}
                </p>
                <p className="text-muted text-sm">
                  {note.lessonTitle && (
                    <>
                      Lesson: {note.lessonTitle} ·{" "}
                    </>
                  )}
                  {formatDate(note.createdAt)}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: "var(--space-10)" }}>
        <h2 style={{ marginBottom: "var(--space-4)" }}>Bookmarks</h2>
        {bookmarks.length === 0 ? (
          <Card>
            <p className="text-muted">No bookmarks yet. Bookmark lessons to find them quickly.</p>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {bookmarks.map((b) => (
              <Card key={b.bookmarkId}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{b.lessonTitle}</p>
                    <p className="text-muted text-sm">Saved {formatDate(b.createdAt)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}