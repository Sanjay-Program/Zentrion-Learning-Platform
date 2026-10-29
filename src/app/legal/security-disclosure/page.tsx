import { Breadcrumbs, Card, PageHeader } from "@/components/ui";

export const metadata = { title: "Security Disclosure" };

export default function SecurityDisclosurePage() {
  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)", maxWidth: 44 * 16 }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Company", href: "/about" }, { label: "Security disclosure" }]} />
      <PageHeader eyebrow="Security" title="Security Disclosure" />
      <Card>
        <h3>Reporting a vulnerability</h3>
        <p className="text-muted">
          We welcome responsible disclosure. If you discover a security issue,
          please email <a href="mailto:security@zentrion.dev">security@zentrion.dev</a>
          with a description and, where possible, steps to reproduce. Encrypted
          reports are welcome.
        </p>
        <h3>Scope</h3>
        <p className="text-muted">
          In scope: authentication and session handling, authorisation and
          tenant isolation, the lab sandbox boundary, AI feature data handling,
          and payment flow integrity. Out of scope: simulated lab environments
          (they are designed to be attacked) and social engineering of support
          staff.
        </p>
        <h3>Our commitments</h3>
        <p className="text-muted">
          We acknowledge reports within two business days, keep you informed of
          progress, and credit reporters (unless they prefer anonymity) once a
          fix ships. We ask that you do not test against other users&apos; data
          and that you disclose responsibly.
        </p>
        <h3>Safe-harbour</h3>
        <p className="text-muted">
          Good-faith research that follows this policy will not be pursued
          legally. Do not access, modify or exfiltrate other users&apos; data,
          even to demonstrate a flaw.
        </p>
        <h3>Platform security overview</h3>
        <p className="text-muted">
          For the general security posture of the platform, see our{" "}
          <a href="/legal/security">security page</a>.
        </p>
      </Card>
    </main>
  );
}
