import { Breadcrumbs, Card, PageHeader } from "@/components/ui";

export const metadata = {
  title: "Privacy Policy — Zentrion",
};

export default function PrivacyPage() {
  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)", maxWidth: 44 * 16 }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Legal", href: "/legal" }, { label: "Privacy" }]} />
      <PageHeader eyebrow="Legal" title="Privacy Policy" />
      <Card>
        <p className="text-muted text-sm">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        <h3>1. What we collect</h3>
        <p className="text-muted">
          Account data (name, email, hashed password), learning activity (enrolments, lesson
          progress, notes, lab sessions), AI usage logs (prompts, tokens, latency), and standard
          server logs (IP address, user agent).
        </p>
        <h3>2. How we use it</h3>
        <p className="text-muted">
          To deliver the service, personalise recommendations, grade labs, enforce AI usage limits,
          and improve courses. Learning recommendations are explainable: they derive from interests
          you declare, not opaque profiling.
        </p>
        <h3>3. AI features and retention</h3>
        <p className="text-muted">
          Conversations with AI tutors are stored so you can resume them. You can control AI data
          retention in Settings and delete conversations at any time. Do not submit sensitive
          personal information to AI features.
        </p>
        <h3>4. Where it lives</h3>
        <p className="text-muted">
          Data is stored in managed databases (SQLite/D1) and object storage (R2) operated by
          Cloudflare. We do not sell personal data.
        </p>
        <h3>5. Security</h3>
        <p className="text-muted">
          Passwords are hashed with bcrypt; sessions are server-side, token-hashed, and revocable;
          multi-factor authentication (TOTP) is available; all state-changing requests are
          CSRF-protected.
        </p>
        <h3>6. Your rights</h3>
        <p className="text-muted">
          You may access, correct, export, or delete your account data at any time from Settings,
          or by emailing <a href="mailto:privacy@zentrion.dev">privacy@zentrion.dev</a>.
        </p>
        <h3>7. Cookies</h3>
        <p className="text-muted">
          We use a session cookie (httpOnly), a CSRF cookie, and a theme preference stored locally
          in your browser.
        </p>
        <h3>8. Changes</h3>
        <p className="text-muted">
          We may update this policy. Material changes will be announced in-app.
        </p>
      </Card>
    </main>
  );
}
