import { Breadcrumbs, Card, PageHeader } from "@/components/ui";

export const metadata = { title: "Cookie Policy — Zentrion" };

export default function CookiesPage() {
  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)", maxWidth: 44 * 16 }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Legal", href: "/legal" }, { label: "Cookies" }]} />
      <PageHeader eyebrow="Legal" title="Cookie Policy" />
      <Card>
        <h3>1. What we use</h3>
        <p className="text-muted">
          Zentrion uses strictly necessary cookies and local storage to maintain
          your signed-in session (session token), CSRF protection, and UI
          preferences such as theme. We do not use advertising or cross-site
          tracking cookies.
        </p>
        <h3>2. Session cookies</h3>
        <p className="text-muted">
          The session cookie is HTTP-only, SameSite=Lax and expires when you sign
          out or after the configured session lifetime. It contains only an
          opaque token; session data is stored server-side.
        </p>
        <h3>3. Analytics</h3>
        <p className="text-muted">
          This deployment does not set third-party analytics cookies. Platform
          usage events (logins, lesson progress, AI usage) are recorded
          server-side for operational and quota purposes only.
        </p>
        <h3>4. Your choices</h3>
        <p className="text-muted">
          You can clear cookies at any time in your browser. Disabling the session
          cookie signs you out. Because the platform is cookie-minimal, no consent
          banner is required for the categories above.
        </p>
        <h3>5. Changes</h3>
        <p className="text-muted">
          We may update this policy. The updated version is posted on this page
          with a refreshed date.
        </p>
      </Card>
    </main>
  );
}
