import { Breadcrumbs, Card, PageHeader } from "@/components/ui";
import { CertificateClient } from "./certificate-client";

export const metadata = { title: "Verify Certificate — Zentrion" };

export default function CertificateVerifyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)", maxWidth: 44 * 16 }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Verify certificate" }]} />
      <PageHeader
        eyebrow="Credentials"
        title="Verify a certificate"
        description="Enter the verification code printed on a Zentrion certificate."
      />
      <CertificateClient />
    </main>
  );
}
