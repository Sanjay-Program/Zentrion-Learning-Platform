import { requireUser } from "@/lib/server";
import { listInstructorSubmissions } from "@/lib/instructor";
import { Breadcrumbs, Card, PageHeader } from "@/components/ui";
import { SubmissionsClient } from "./submissions-client";

export const metadata = { title: "Grading Queue" };

export default async function InstructorSubmissionsPage() {
  const user = await requireUser();
  const submissions = await listInstructorSubmissions(user);

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Instructor Studio", href: "/instructor" },
          { label: "Grading queue" },
        ]}
      />
      <PageHeader
        eyebrow="Assessment"
        title="Grading queue"
        description="Review and grade learner submissions for your courses."
      />
      <SubmissionsClient initialSubmissions={submissions} />
    </main>
  );
}
