import { requireUser } from "@/lib/server";
import { listCertificates } from "@/lib/learning";
import { getDb } from "@/db/client";
import { courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Breadcrumbs, Card, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Certificates — Zentrion" };

export default async function CertificatesPage() {
  const user = await requireUser();
  const certificates = await listCertificates(user.id);
  const db = getDb();

  const rows = await Promise.all(
    certificates.map(async (cert) => {
      const course = await db
        .select({ title: courses.title, slug: courses.slug })
        .from(courses)
        .where(eq(courses.id, cert.courseId))
        .limit(1)
        .get();
      return { ...cert, courseTitle: course?.title ?? "Course", courseSlug: course?.slug };
    }),
  );

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My Learning", href: "/app" }, { label: "Certificates" }]} />
      <PageHeader
        eyebrow="Credentials"
        title="Certificates"
        description="Verifiable certificates for completed courses."
      />

      {rows.length === 0 ? (
        <Card>
          <p className="text-muted mb-4">
            Complete a course to earn your first certificate. Certificates
            include a unique verification code anyone can check.
          </p>
          <a href="/courses" className="btn btn-primary">
            Browse courses
          </a>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {rows.map((cert) => (
            <Card key={cert.id} raised>
              <div className="flex justify-between" style={{ gap: "var(--space-4)", flexWrap: "wrap" }}>
                <div>
                  <h3 style={{ marginBottom: "var(--space-1)" }}>{cert.courseTitle}</h3>
                  <p className="text-muted text-sm">
                    Issued {formatDate(cert.issuedAt)}
                    {cert.revoked && <span className="badge badge-danger ml-2">Revoked</span>}
                  </p>
                  <p className="text-sm mt-2">
                    <span className="text-muted">Verification code: </span>
                    <code className="badge">{cert.verificationCode}</code>
                  </p>
                </div>
                <div className="flex" style={{ gap: "var(--space-2)" }}>
                  <a href={`/app/courses/${cert.courseSlug}`} className="btn btn-secondary btn-sm">
                    Review course
                  </a>
                  <a
                    href={`/certificates/${cert.verificationCode}`}
                    className="btn btn-ghost btn-sm"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
