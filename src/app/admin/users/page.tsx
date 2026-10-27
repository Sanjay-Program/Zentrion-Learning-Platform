import { requireUser } from "@/lib/server";
import { requireAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import { Breadcrumbs, PageHeader } from "@/components/ui";
import { UsersClient } from "./users-client";

export const metadata = { title: "Users — Admin" };

export default async function AdminUsersPage() {
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
          { label: "Users" },
        ]}
      />
      <PageHeader
        eyebrow="User management"
        title="Users"
        description="Search users and manage their roles."
      />
      <UsersClient />
    </main>
  );
}
