import { Breadcrumbs, Card, PageHeader } from "@/components/ui";

export const metadata = {
  title: "Security",
};

export default function SecurityPage() {
  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)", maxWidth: 44 * 16 }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Legal", href: "/legal" }, { label: "Security" }]} />
      <PageHeader eyebrow="Legal" title="Security practices" />
      <Card>
        <h3>Authentication</h3>
        <p className="text-muted">
          Passwords are hashed with bcrypt (cost 12). Sessions are server-side: the browser holds
          only an opaque, httpOnly cookie; the database stores its SHA-256 hash. Sessions can be
          revoked individually or globally. TOTP multi-factor authentication is available in
          account settings.
        </p>
        <h3>Request security</h3>
        <p className="text-muted">
          All state-changing requests are protected with double-submit CSRF tokens. Security
          headers (CSP, X-Frame-Options DENY, X-Content-Type-Options) are applied on every
          response.
        </p>
        <h3>AI safety</h3>
        <p className="text-muted">
          AI interactions are logged with token usage and latency for abuse detection. Agent
          actions are tiered: read-only tools run automatically; irreversible or costly actions
          require explicit human approval.
        </p>
        <h3>Lab safety</h3>
        <p className="text-muted">
          Every cybersecurity lab and challenge runs in a browser-based simulated environment.
          Labs are classified "simulated" and cannot reach external infrastructure.
        </p>
        <h3>Auditing</h3>
        <p className="text-muted">
          Security-relevant events (logins, MFA changes, permission changes, admin actions) are
          written to an append-only audit log visible to security administrators.
        </p>
        <h3>Reporting a vulnerability</h3>
        <p className="text-muted">
          Please report vulnerabilities to <a href="mailto:security@zentrion.dev">security@zentrion.dev</a>.
          We respond within 48 hours and follow coordinated disclosure.
        </p>
      </Card>
    </main>
  );
}
