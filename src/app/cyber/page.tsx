import { Breadcrumbs, Button, Card, LevelBadge, PageHeader } from "@/components/ui";
import { listLabs, listChallenges } from "@/lib/catalogue";
import Link from "next/link";

export const metadata = { title: "Cybersecurity Academy" };

export default async function CyberPage() {
  const [labs, challenges] = await Promise.all([listLabs(), listChallenges()]);

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cybersecurity Academy" }]} />
      <PageHeader
        eyebrow="Security training"
        title="Cybersecurity Academy"
        description="Practise real techniques in simulated environments — networks, SIEM triage, web exploitation and CTF challenges."
      />

      <section style={{ marginBottom: "var(--space-12)" }}>
        <p className="lead" style={{ maxWidth: 46 * 16 }}>
          Every lab and challenge runs in an in-process simulator with synthetic
          data. The techniques are genuine; the targets are not. No real system is
          ever touched, and no student input reaches a shell or network.
        </p>

        {/* SOC & Defense Architecture Blueprints */}
        <div
          className="grid mt-8"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))", gap: "var(--space-6)" }}
        >
          <Card className="flex-col" style={{ padding: 0, overflow: "hidden", background: "rgba(10, 15, 29, 0.85)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
            <div
              style={{
                background: "rgba(15, 23, 42, 0.9)",
                padding: "0.75rem 1rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444" }} />
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#F59E0B" }} />
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
                <span style={{ fontSize: "0.72rem", color: "#94A3B8", marginLeft: "0.5rem" }}>SOC Architecture Blueprint</span>
              </div>
              <div style={{ borderRadius: "0.5rem", overflow: "hidden", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img
                  src="/images/lesson-diagrams/08-soc-investigation.svg"
                  alt="SOC Alert Triage Architecture"
                  style={{ width: "100%", height: "180px", objectFit: "contain", display: "block" }}
                />
              </div>
            </div>
            <div style={{ padding: "var(--space-5)" }}>
              <span className="badge badge-primary mb-2">SOC Telemetry</span>
              <h3 style={{ fontSize: "var(--text-md)", marginBottom: "var(--space-1)", color: "#FFFFFF" }}>
                AI-Augmented SOC Alert Triage
              </h3>
              <p className="text-muted text-sm mb-3">
                Telemetry ingestion, prompt injection detection, alert containment playbooks, and incident audit reporting.
              </p>
              <Link href="/courses/ai-cybersecurity-and-llm-security" className="text-sm font-semibold" style={{ color: "#38BDF8" }}>
                View SOC Course & Lab →
              </Link>
            </div>
          </Card>

          <Card className="flex-col" style={{ padding: 0, overflow: "hidden", background: "rgba(10, 15, 29, 0.85)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
            <div
              style={{
                background: "rgba(15, 23, 42, 0.9)",
                padding: "0.75rem 1rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444" }} />
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#F59E0B" }} />
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
                <span style={{ fontSize: "0.72rem", color: "#94A3B8", marginLeft: "0.5rem" }}>Threat Model Architecture</span>
              </div>
              <div style={{ borderRadius: "0.5rem", overflow: "hidden", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img
                  src="/images/lesson-diagrams/06-trust-boundaries.svg"
                  alt="AI Trust Boundaries Architecture"
                  style={{ width: "100%", height: "180px", objectFit: "contain", display: "block" }}
                />
              </div>
            </div>
            <div style={{ padding: "var(--space-5)" }}>
              <span className="badge badge-accent mb-2">Threat Modeling</span>
              <h3 style={{ fontSize: "var(--text-md)", marginBottom: "var(--space-1)", color: "#FFFFFF" }}>
                AI Trust Boundaries & Attack Vectors
              </h3>
              <p className="text-muted text-sm mb-3">
                Boundary isolation between untrusted user prompts, tool executors, vector retrievals, and structured JSON output decoders.
              </p>
              <Link href="/courses/ai-cybersecurity-and-llm-security" className="text-sm font-semibold" style={{ color: "#38BDF8" }}>
                Explore Defense Curriculum →
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <section style={{ marginBottom: "var(--space-12)" }}>
        <div className="flex justify-between items-center mb-6">
          <h2>Practical labs</h2>
          <Link href="/labs" className="text-sm font-semibold">All labs →</Link>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(18rem, 1fr))", gap: "var(--space-5)" }}>
          {labs.map((lab) => (
            <Link key={lab.id} href={`/labs/${lab.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <Card hover className="flex-col h-full">
                <span className="badge badge-accent">{lab.labType.replace(/_/g, " ")}</span>
                <h3 style={{ fontSize: "var(--text-lg)", marginTop: "var(--space-3)" }}>{lab.title}</h3>
                <p className="text-muted text-sm">{lab.description}</p>
                <p className="text-subtle text-sm" style={{ marginTop: "auto", paddingTop: "var(--space-3)" }}>
                  ~{lab.estimatedMinutes} min · {lab.difficulty}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: "var(--space-12)" }}>
        <div className="flex justify-between items-center mb-6">
          <h2>Challenges</h2>
          <Link href="/challenges" className="text-sm font-semibold">All challenges →</Link>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(18rem, 1fr))", gap: "var(--space-5)" }}>
          {challenges.map((ch) => (
            <Link key={ch.id} href={`/challenges/${ch.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <Card hover className="flex-col h-full">
                <span className="badge badge-warning">{ch.difficulty}</span>
                <h3 style={{ fontSize: "var(--text-lg)", marginTop: "var(--space-3)" }}>{ch.title}</h3>
                <p className="text-muted text-sm">{ch.description}</p>
                <p className="text-subtle text-sm" style={{ marginTop: "auto", paddingTop: "var(--space-3)" }}>
                  {ch.category} · {ch.points} points
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: "var(--space-10) var(--space-8)",
          background: "var(--bg-subtle)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <h2 style={{ marginBottom: "var(--space-4)" }}>Learning tracks</h2>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))", gap: "var(--space-5)" }}>
          <div>
            <LevelBadge level="beginner" />
            <h3 style={{ marginTop: "var(--space-2)" }}>Cybersecurity Fundamentals</h3>
            <p className="text-muted text-sm">Threats, cryptography basics, defense-in-depth and security hygiene.</p>
          </div>
          <div>
            <LevelBadge level="intermediate" />
            <h3 style={{ marginTop: "var(--space-2)" }}>Network Defense &amp; SOC</h3>
            <p className="text-muted text-sm">Monitoring, log triage and incident response in a simulated SOC.</p>
          </div>
          <div>
            <LevelBadge level="intermediate" />
            <h3 style={{ marginTop: "var(--space-2)" }}>Web exploitation</h3>
            <p className="text-muted text-sm">SQL injection, XSS and the OWASP top ten — then how to fix them.</p>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <Button href="/paths/cybersecurity-analyst-track">View the analyst track</Button>
          <Button variant="secondary" href="/courses?category=cybersecurity">Browse security courses</Button>
        </div>
      </section>
    </main>
  );
}
