import { Breadcrumbs, Card, PageHeader } from "@/components/ui";

export const metadata = { title: "Accessibility" };

export default function AccessibilityPage() {
  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)", maxWidth: 44 * 16 }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Legal", href: "/legal" }, { label: "Accessibility" }]} />
      <PageHeader eyebrow="Legal" title="Accessibility Statement" />
      <Card>
        <h3>Our commitment</h3>
        <p className="text-muted">
          Zentrion aims to meet WCAG 2.1 AA. The platform is built with
          semantic HTML, visible focus states, keyboard-operable navigation,
          labelled form controls and sufficient colour contrast.
        </p>
        <h3>Keyboard support</h3>
        <p className="text-muted">
          All interactive controls — tabs, dialogs, dropdowns, lab consoles and
          forms — are operable by keyboard. A skip-to-content link is provided
          on every page.
        </p>
        <h3>Screen readers</h3>
        <p className="text-muted">
          Landmarks, headings, ARIA roles and live regions are used for
          navigation, notifications and dynamic content such as toasts and
          chat transcripts.
        </p>
        <h3>Known limitations</h3>
        <p className="text-muted">
          AI-generated content and third-party embeds may not always meet
          accessibility requirements; report any barrier and we will prioritise
          a fix.
        </p>
        <h3>Feedback</h3>
        <p className="text-muted">
          Accessibility feedback: <a href="mailto:accessibility@zentrion.dev">accessibility@zentrion.dev</a>.
          We respond within five business days.
        </p>
      </Card>
    </main>
  );
}
