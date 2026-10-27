import { Breadcrumbs, Card, PageHeader } from "@/components/ui";

export const metadata = {
  title: "Terms of Service — Zentrion",
};

export default function TermsPage() {
  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)", maxWidth: 44 * 16 }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Legal", href: "/legal" }, { label: "Terms" }]} />
      <PageHeader eyebrow="Legal" title="Terms of Service" />
      <Card>
        <p className="text-muted text-sm">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        <h3>1. Acceptance of terms</h3>
        <p className="text-muted">
          By accessing and using the Zentrion platform ("the Service"), you agree to be bound by
          these Terms of Service and any applicable policies. If you do not agree, do not use the
          Service.
        </p>
        <h3>2. Description of the service</h3>
        <p className="text-muted">
          Zentrion provides online courses, learning paths, simulated cybersecurity labs, AI-assisted
          learning tools, and related educational content. Labs and challenges run entirely in
          simulated environments; no real systems are ever targeted.
        </p>
        <h3>3. Accounts</h3>
        <p className="text-muted">
          You must provide accurate registration information and keep your credentials confidential.
          You are responsible for all activity under your account. Sharing accounts is not permitted.
        </p>
        <h3>4. Acceptable use</h3>
        <p className="text-muted">
          Do not use the Service to attack real systems, distribute malware, harass others, or
          violate any law. Content created in labs is simulated and must remain within the platform.
        </p>
        <h3>5. AI features</h3>
        <p className="text-muted">
          AI-assisted tools may produce incorrect or incomplete information. Always verify critical
          outputs. Do not submit sensitive personal data to AI features. Usage limits may apply.
        </p>
        <h3>6. Payments</h3>
        <p className="text-muted">
          Paid courses and subscriptions are billed through the payment provider shown at checkout.
          Course purchases are final once content access is granted; subscriptions may be cancelled
          at any time and continue until the end of the paid period.
        </p>
        <h3>7. Certificates</h3>
        <p className="text-muted">
          Completion certificates are issued for verified course completion and may be revoked if
          integrity violations (cheating, unauthorized assistance) are discovered.
        </p>
        <h3>8. Limitation of liability</h3>
        <p className="text-muted">
          The Service is provided "as is". Zentrion is not liable for indirect or consequential
          damages. Educational outcomes depend on your own effort.
        </p>
        <h3>9. Changes</h3>
        <p className="text-muted">
          We may update these terms. Continued use after changes constitutes acceptance.
        </p>
        <h3>10. Contact</h3>
        <p className="text-muted">
          Questions about these terms: <a href="mailto:legal@zentrion.dev">legal@zentrion.dev</a>
        </p>
      </Card>
    </main>
  );
}
