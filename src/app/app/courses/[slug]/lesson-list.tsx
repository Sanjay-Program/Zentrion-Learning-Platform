import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { lessonProgress, lessons } from "@/db/schema";
import { Card } from "@/components/ui";
import Link from "next/link";

interface LessonListProps {
  course: {
    id: number;
    slug: string;
    modules: {
      id: number;
      title: string;
      description: string | null;
      lessons: {
        id: number;
        title: string;
        lessonType: string;
        durationMinutes: number | null;
        isPreview: boolean;
        orderIndex: number;
      }[];
    }[];
  };
  enrollmentId: number;
}

/** Curriculum sidebar with per-lesson completion state. */
export async function LessonList({ course, enrollmentId }: LessonListProps) {
  const db = getDb();
  const moduleIds = course.modules.map((m) => m.id);

  // Fetch completion state for all lessons in this course for this enrolment.
  const { inArray } = await import("drizzle-orm");
  const completion = moduleIds.length
    ? await db
        .select({
          lessonId: lessons.id,
          completed: lessonProgress.completed,
        })
        .from(lessons)
        .leftJoin(
          lessonProgress,
          and(
            eq(lessonProgress.lessonId, lessons.id),
            eq(lessonProgress.enrollmentId, enrollmentId),
          ),
        )
        .where(inArray(lessons.moduleId, moduleIds))
        .all()
    : [];
  const completedSet = new Set(
    completion.filter((c) => c.completed).map((c) => c.lessonId),
  );

  return (
    <nav aria-label="Course curriculum" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {course.modules.map((mod, i) => (
        <Card key={mod.id}>
          <p className="font-semibold text-sm mb-2">
            <span className="text-muted">Module {i + 1}</span>
            <br />
            {mod.title}
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {mod.lessons.map((lesson) => {
              const done = completedSet.has(lesson.id);
              return (
                <li key={lesson.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <Link
                    href={`/app/courses/${course.slug}/lessons/${lesson.id}`}
                    className="nav-link"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-2)",
                      padding: "var(--space-2) 0",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: done ? "none" : "2px solid var(--border)",
                        background: done ? "var(--success)" : "transparent",
                        color: "#fff",
                        fontSize: 11,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {done ? "✓" : ""}
                    </span>
                    <span className="text-sm" style={{ textDecoration: done ? "line-through" : undefined, opacity: done ? 0.7 : 1 }}>
                      {lesson.title}
                    </span>
                    {lesson.durationMinutes != null && (
                      <span className="text-muted text-sm" style={{ marginLeft: "auto" }}>
                        {lesson.durationMinutes}m
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      ))}
    </nav>
  );
}
