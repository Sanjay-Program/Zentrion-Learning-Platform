import { Breadcrumbs, Card, PageHeader } from "@/components/ui";
import Link from "next/link";

export const metadata = {
  title: "Legal",
};

export default function LegalIndexPage() {
  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)", maxWidth: 44 * 16 }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Legal" }]} />
      <PageHeader eyebrow="Legal" title="Legal center" />
      <Card>
        <ul style={{ paddingLeft: "var(--space-5)" }}>
          <li className="mb-2">
            <Link href="/legal/terms">Terms of Service</Link>
          </li>
          <li className="mb-2">
            <Link href="/legal/privacy">Privacy Policy</Link>
          </li>
          <li>
            <Link href="/legal/security">Security Practices</Link>
          </li>
        </ul>
      </Card>
    </main>
  );
}
