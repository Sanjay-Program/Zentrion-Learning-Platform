import { Breadcrumbs, Card, PageHeader } from "@/components/ui";
import Link from "next/link";

export const metadata = { title: "Help Centre — Zentrion" };

const faqs = [
  {
    topic: "Getting started",
    items: [
      ["How do I create an account?", "Use the Get started button on any page. You can sign up with email and password; a verification email is sent (simulated in offline mode)."],
      ["What are the demo accounts?", "admin@zentrion.dev (platform admin), instructor@zentrion.dev (instructor) and learner@zentrion.dev (learner) are seeded with published content."],
      ["Is any API key required?", "No. AI features run on a built-in offline tutor when no provider key is configured. Labs and payments are simulated locally."],
    ],
  },
  {
    topic: "Learning",
    items: [
      ["How do courses work?", "Courses contain modules and lessons (video, reading, quizzes, assignments). Your progress is tracked automatically as you complete lessons."],
      ["What are capstone projects?", "Projects are rubric-scored assessments. You submit artefacts per milestone and instructors grade against a public rubric."],
      ["How do labs work?", "Labs launch a simulated, time-boxed environment in your browser. Commands run against a safe in-process simulator — never a real system."],
      ["How do challenges work?", "CTF-style challenges give you a target and a flag format. Submit the correct flag to solve it instantly."],
    ],
  },
  {
    topic: "AI workspace",
    items: [
      ["Does the AI Tutor need a key?", "No. With no provider configured it uses the offline tutor, which answers from the platform's curriculum. Configure AI_PROVIDER and AI_API_KEY for live models."],
      ["What is the Prompt Studio?", "A place to draft prompt templates with {{variables}}, run them, and compare versions with recorded runs and token usage."],
      ["What are evaluations?", "The Evals workspace scores prompts against datasets of question–answer pairs so you can measure quality instead of guessing."],
    ],
  },
  {
    topic: "Accounts & billing",
    items: [
      ["How do payments work?", "Checkout uses a simulated provider in this deployment. Orders and entitlements are recorded locally and access is granted immediately."],
      ["How do I reset my password?", "Use Forgot password on the sign-in page. Reset links are generated and (in offline mode) logged to the console."],
      ["How do certificates work?", "Certificates are issued for completed courses and can be verified publicly by code at /certificates/[code]."],
    ],
  },
];

export default function HelpPage() {
  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Help centre" }]} />
      <PageHeader
        eyebrow="Support"
        title="Help centre"
        description="Answers to the questions we hear most. Still stuck? Contact us."
      />

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))", gap: "var(--space-6)", alignItems: "start" }}>
        {faqs.map((group) => (
          <Card key={group.topic}>
            <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-4)" }}>{group.topic}</h3>
            <div style={{ display: "grid", gap: "var(--space-4)" }}>
              {group.items.map(([q, a]) => (
                <div key={q}>
                  <p style={{ fontWeight: 600, margin: "0 0 var(--space-1)" }}>{q}</p>
                  <p className="text-muted text-sm" style={{ margin: 0 }}>{a}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center" style={{ marginTop: "var(--space-12)" }}>
        <p className="text-muted" style={{ marginBottom: "0.5rem" }}>Can&apos;t find what you need? We&apos;re here to help.</p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1rem" }}>
          <a
            href="https://wa.me/917305771789?text=Hello%20Zentrion%20Support%2C%20I%20need%20help%20with%20the%20platform."
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.65rem 1.25rem",
              borderRadius: "0.5rem",
              background: "#25D366",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "0.9rem",
              textDecoration: "none",
              boxShadow: "0 4px 15px rgba(37, 211, 102, 0.3)",
            }}
          >
            <span>💬</span> WhatsApp: +91 7305771789
          </a>
          <a
            href="tel:+917305771789"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.65rem 1.25rem",
              borderRadius: "0.5rem",
              background: "rgba(56, 189, 248, 0.15)",
              border: "1px solid rgba(56, 189, 248, 0.35)",
              color: "#38BDF8",
              fontWeight: 700,
              fontSize: "0.9rem",
              textDecoration: "none",
            }}
          >
            <span>📞</span> Call +91 7305771789
          </a>
          <Link href="/contact" className="btn btn-primary" style={{ padding: "0.65rem 1.25rem" }}>
            Submit a ticket →
          </Link>
        </div>
      </div>
    </main>
  );
}
