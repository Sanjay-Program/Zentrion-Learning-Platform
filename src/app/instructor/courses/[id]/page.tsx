import { requireUser } from "@/lib/server";
import { getInstructorCourse } from "@/lib/instructor";
import { Breadcrumbs } from "@/components/ui";
import { notFound } from "next/navigation";
import { CourseEditorClient } from "./course-editor-client";

export const metadata = { title: "Course Editor — Zentrion" };

export default async function InstructorCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  // /instructor/courses/new → creation form
  if (id === "new") {
    return (
      <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Instructor Studio", href: "/instructor" },
            { label: "New course" },
          ]}
        />
        <CourseEditorClient />
      </main>
    );
  }

  const course = await getInstructorCourse(user, Number(id));
  if (!course) notFound();

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Instructor Studio", href: "/instructor" },
          { label: course.title },
        ]}
      />
      <CourseEditorClient initialCourse={course} />
    </main>
  );
}
