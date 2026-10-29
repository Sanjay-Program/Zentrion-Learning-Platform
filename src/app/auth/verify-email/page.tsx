import { consumeRecoveryToken } from "@/lib/auth";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, PageHeader } from "@/components/ui";
import Link from "next/link";

export const metadata = { title: "Verify email" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const sp = await searchParams;
  let message = "Missing verification token.";
  let ok = false;

  if (sp.token) {
    const userId = await consumeRecoveryToken(sp.token, "email_verify");
    if (userId) {
      const db = getDb();
      await db
        .update(users)
        .set({ emailVerified: true, status: "active" })
        .where(eq(users.id, userId))
        .run();
      ok = true;
      message = "Your email has been verified. Welcome to Zentrion!";
    } else {
      message = "This verification link is invalid or has expired. Request a new one.";
    }
  }

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)", maxWidth: 32 * 16 }}>
      <PageHeader eyebrow="Account" title="Email verification" />
      <Card>
        <div className={`alert ${ok ? "alert-success" : "alert-warning"}`} role="status">
          {message}
        </div>
        <Link href="/auth/sign-in" className="btn btn-primary mt-6">
          Continue to sign in
        </Link>
      </Card>
    </main>
  );
}
