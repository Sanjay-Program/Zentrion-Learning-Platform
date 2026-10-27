import { requireUser } from "@/lib/server";
import { requireAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import { Breadcrumbs, Card, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { AuditClient } from "./audit-client";

export const metadata = { title: "Audit Log — Admin" };

export default async function AdminAuditPage() {
  const user = await requireUser();
  try {
    await requireAdmin(user);
  } catch {
    redirect("/app");
  }

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Audit log" },
        ]}
      />
      <PageHeader
        eyebrow="Security"
        title="Audit log"
        description="Every significant action, with actor and timestamp."
      />
      <AuditClient />
    </main>
  );
}
