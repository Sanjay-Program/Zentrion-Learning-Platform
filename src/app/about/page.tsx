import Link from "next/link";

export const metadata = {
  title: "About",
  description: "Learn about Zentrion Learntech — the #1 AI, Cybersecurity & Future-Tech learning platform built for engineers and creators of tomorrow.",
};

const VALUES = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    color: "#0891B2",
    colorSubtle: "rgba(34, 211, 238, 0.12)",
    colorBorder: "rgba(34, 211, 238, 0.25)",
    title: "Hands-On First",
    desc: "Every concept is paired with an interactive lab, real-world project, or live terminal you can run — not passive video lectures.",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    color: "#6366F1",
    colorSubtle: "rgba(129, 140, 248, 0.12)",
    colorBorder: "rgba(129, 140, 248, 0.25)",
    title: "Safe By Design",
    desc: "Defensive cybersecurity training happens in isolated, sandboxed environments with synthetic data. Zero real-world risk.",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M4.93 4.93a10 10 0 0 0 0 14.14"/>
      </svg>
    ),
    color: "#9333EA",
    colorSubtle: "rgba(192, 132, 252, 0.12)",
    colorBorder: "rgba(192, 132, 252, 0.25)",
    title: "AI-Augmented Mentorship",
    desc: "Our AI Tutor augments human instructors with 24/7 context-aware explanations, code debugging, and adaptive difficulty.",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
      </svg>
    ),
    color: "#10B981",
    colorSubtle: "rgba(16, 185, 129, 0.12)",
    colorBorder: "rgba(16, 185, 129, 0.25)",
    title: "Verifiable Skills Evidence",
    desc: "Certificates, lab completions, and capstone code repositories are cryptographically recorded — shareable on LinkedIn and portfolios.",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    color: "#F59E0B",
    colorSubtle: "rgba(245, 158, 11, 0.12)",
    colorBorder: "rgba(245, 158, 11, 0.25)",
    title: "Vibrant Community",
    desc: "Learners, staff instructors, and senior industry architects collaborate, review each other's code, and grow together.",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.5 2v6h-6"/><path d="M21.34 15.57a10 10 0 1 1-.57-8.38"/>
      </svg>
    ),
    color: "#F472B6",
    colorSubtle: "rgba(244, 114, 182, 0.12)",
    colorBorder: "rgba(244, 114, 182, 0.25)",
    title: "Always Cutting-Edge",
    desc: "Curriculum continuously updated to reflect 2026 AI models, Agentic frameworks (LangGraph, CrewAI), and zero-day threat landscapes.",
  },
];

const PLATFORM_FEATURES = [
  { icon: "📚", title: "Flagship AI Courses", desc: "Structured modules covering AI fluency, prompt engineering, agentic AI, and cybersecurity." },
  { icon: "🛤️", title: "Learning Paths", desc: "Step-by-step career tracks with milestones, capstone checkpoints, and prerequisites." },
  { icon: "🔬", title: "In-Browser Sandboxes", desc: "Instant Linux terminals, SIEM threat triage, prompt injection defense — zero local installation." },
  { icon: "🚩", title: "CTF Challenges", desc: "Hands-on capture-the-flag security challenges with real-time automated verification." },
  { icon: "🤖", title: "AI Workspace", desc: "Personal AI tutor, Prompt Studio, Autonomous Agents, and model evaluation harnesses." },
  { icon: "🎖️", title: "Cryptographic Credentials", desc: "Tamper-evident certificates with QR code verification and portfolio assets." },
  { icon: "🎬", title: "Live Masterclasses", desc: "Interactive live coding sessions, architectural teardowns, and AMA sessions with experts." },
  { icon: "🏢", title: "Enterprise & College Portals", desc: "Multi-tenant RBAC, cohort analytics, SSO integration, and NAAC/NBA compliance exports." },
];

const TEAM = [
  { name: "Sanjay Murugadoss", role: "Founder & Lead Architect", avatar: "SM", color: "#6366F1", badge: "Cybersecurity & Agentic AI" },
  { name: "Priya R.", role: "Head of Curriculum", avatar: "PR", color: "#0891B2", badge: "Machine Learning & LLMs" },
  { name: "Karthik V.", role: "Platform Architect", avatar: "KV", color: "#9333EA", badge: "Cloud Infrastructure & Sandboxes" },
  { name: "Ananya B.", role: "Head of Learner Success", avatar: "AB", color: "#10B981", badge: "Community & Career Placement" },
];

const MILESTONES = [
  { year: "2022", event: "Zentrion founded to pioneer hands-on, practical engineering and cybersecurity education." },
  { year: "2023", event: "Architected custom in-browser sandboxed lab infrastructure and launched flagship AI tracks." },
  { year: "2024", event: "Scaled learner base and partnered with 30+ higher education institutions and tech enterprises." },
  { year: "2025", event: "Launched AI Workspace, Agentic AI Engineering curriculum, and automated lab grading harnesses." },
  { year: "2026", event: "Deployed enterprise multi-tenant cloud and expanding globally with multi-language cohort support." },
];

export default function AboutPage() {
  return (
    <div style={{ background: "var(--bg, #060913)", color: "var(--text, #F8FAFC)", minHeight: "100vh" }}>

      {/* ============================================================ */}
      {/* HERO SECTION                                                  */}
      {/* ============================================================ */}
      <section
        style={{
          position: "relative",
          padding: "5.5rem 0 4.5rem",
          overflow: "hidden",
          background: "radial-gradient(ellipse 70% 50% at 50% -5%, rgba(99, 102, 241, 0.18), transparent 70%), radial-gradient(circle at 80% 60%, rgba(34, 211, 238, 0.1), transparent 50%)",
        }}
      >
        <div className="hero-grid-bg" style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.35 }} />
        <div className="animate-float" style={{ position: "absolute", top: "10%", left: "5%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(99, 102, 241, 0.08), transparent 70%)", zIndex: 0, pointerEvents: "none" }} />
        <div className="animate-float-medium" style={{ position: "absolute", top: "15%", right: "5%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(34, 211, 238, 0.08), transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#64748B", marginBottom: "2rem" }}>
            <Link href="/" style={{ color: "#94A3B8", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span style={{ color: "#22D3EE", fontWeight: 600 }}>About</span>
          </div>

          <div className="section-eyebrow" style={{ display: "inline-flex", marginBottom: "1.5rem" }}>
            <span>🚀</span> Our Mission & Vision
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))", gap: "4rem", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "1.5rem" }}>
                Building the{" "}
                <span style={{ background: "linear-gradient(135deg, #22D3EE 0%, #818CF8 50%, #C084FC 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Future
                </span>
                {" "}of Tech Education
              </h1>
              <p style={{ fontSize: "1.15rem", color: "#CBD5E1", lineHeight: 1.7, marginBottom: "2rem" }}>
                Zentrion Learntech is an integrated learning platform for AI, prompt engineering, agentic AI, application development and cybersecurity. We combine structured courses, project-based evaluation, simulated security labs, and AI workspace tools in one place — for individuals, instructors, colleges, and enterprises.
              </p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link
                  href="/courses"
                  style={{
                    padding: "0.9rem 1.85rem",
                    borderRadius: "0.75rem",
                    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: "0 0 25px rgba(99,102,241,0.45)",
                    fontSize: "0.95rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  Explore Courses →
                </Link>
                <Link
                  href="/contact"
                  style={{
                    padding: "0.9rem 1.85rem",
                    borderRadius: "0.75rem",
                    background: "rgba(15, 23, 42, 0.8)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    color: "#FFFFFF",
                    fontWeight: 600,
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Stats panel */}
            <div className="holo-card" style={{ padding: "2.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.75rem" }}>
                {[
                  { value: "Growing", label: "Active Learners", color: "#FFFFFF" },
                  { value: "7+", label: "Flagship Courses & Labs", color: "#22D3EE" },
                  { value: "50+", label: "Expert Instructors", color: "#818CF8" },
                  { value: "91%", label: "Placement Lift", color: "#10B981" },
                  { value: "30+", label: "Enterprise Clients", color: "#F59E0B" },
                  { value: "4.9★", label: "Learner Rating", color: "#C084FC" },
                ].map((stat) => (
                  <div key={stat.label} style={{ textAlign: "center" }}>
                    <div className="stat-number" style={{ color: stat.color, marginBottom: "0.25rem", fontSize: "2rem" }}>{stat.value}</div>
                    <div style={{ color: "#CBD5E1", fontSize: "0.85rem", fontWeight: 600 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ============================================================ */}
      {/* VALUES                                                        */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "var(--bg-subtle, #0a0f24)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "44rem", margin: "0 auto 3.5rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Our Core Principles</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0.75rem" }}>
              Values That Drive Everything
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem", lineHeight: 1.65 }}>
              Every feature, every lab scenario, and every architectural choice begins with these foundational tenets.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))", gap: "1.5rem" }}>
            {VALUES.map((v) => (
              <div key={v.title} className="holo-card" style={{ padding: "2rem", display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                <div style={{ width: 52, height: 52, borderRadius: "0.875rem", background: v.colorSubtle, border: `1px solid ${v.colorBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {v.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.5rem" }}>{v.title}</h3>
                  <p style={{ color: "#94A3B8", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ============================================================ */}
      {/* PLATFORM FEATURES                                             */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "var(--bg, #060913)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "44rem", margin: "0 auto 3.5rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Platform Capabilities</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0.75rem" }}>
              Everything You Need, In One Place
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem", lineHeight: 1.65 }}>
              No switching between disconnected tools. Learn, practice, collaborate, and certify on Zentrion.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))", gap: "1.25rem" }}>
            {PLATFORM_FEATURES.map((f) => (
              <div key={f.title} className="holo-card" style={{ padding: "1.75rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.75rem", lineHeight: 1, flexShrink: 0 }}>{f.icon}</span>
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.35rem" }}>{f.title}</h3>
                  <p style={{ color: "#94A3B8", fontSize: "0.85rem", lineHeight: 1.55, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ============================================================ */}
      {/* TIMELINE / MILESTONES                                         */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "var(--bg-subtle, #0a0f24)" }}>
        <div className="container" style={{ maxWidth: "52rem" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Our Journey</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0.75rem" }}>
              Built Year by Year
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem" }}>From an ambitious engineering vision to thousands of empowered technologists worldwide.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {MILESTONES.map((m, i) => (
              <div key={m.year} className="timeline-step" style={{ paddingBottom: i < MILESTONES.length - 1 ? "2.25rem" : 0 }}>
                <div className="timeline-num" style={{ fontSize: "0.85rem", fontWeight: 800 }}>{m.year.slice(2)}</div>
                <div style={{ paddingTop: "0.5rem", flex: 1 }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#22D3EE", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.3rem" }}>{m.year}</div>
                  <p style={{ color: "#E2E8F0", fontSize: "1rem", lineHeight: 1.6, margin: 0 }}>{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ============================================================ */}
      {/* LEADERSHIP TEAM                                              */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "var(--bg, #060913)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Core Team</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0.75rem" }}>
              People Behind Zentrion
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem" }}>Software architects, security researchers, and educators dedicated to engineering excellence.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))", gap: "1.5rem" }}>
            {TEAM.map((member) => (
              <div key={member.name} className="holo-card" style={{ padding: "2.25rem 2rem", textAlign: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: member.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "1.35rem", margin: "0 auto 1.25rem", boxShadow: `0 0 25px ${member.color}66` }}>
                  {member.avatar}
                </div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.25rem" }}>{member.name}</h3>
                <p style={{ color: "#CBD5E1", fontSize: "0.9rem", marginBottom: "0.75rem" }}>{member.role}</p>
                <span style={{ display: "inline-flex", padding: "0.3rem 0.75rem", borderRadius: "9999px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#818CF8", fontSize: "0.75rem", fontWeight: 600 }}>
                  {member.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CTA                                                           */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "var(--bg-subtle, #0a0f24)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container">
          <div style={{ textAlign: "center", padding: "4rem 2rem", borderRadius: "1.5rem", background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(34,211,238,0.12))", border: "1px solid rgba(99,102,241,0.35)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
            <h2 style={{ fontSize: "clamp(1.85rem, 3.5vw, 2.6rem)", fontWeight: 900, color: "#FFFFFF", marginBottom: "1rem" }}>
              Join Growing Learners Building the Future
            </h2>
            <p style={{ color: "#CBD5E1", fontSize: "1.1rem", maxWidth: "34rem", margin: "0 auto 2rem", lineHeight: 1.65 }}>
              Whether you&apos;re a student, software engineer, or team lead — Zentrion has a proven learning path for you.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/auth/sign-up" style={{ padding: "0.95rem 2.25rem", borderRadius: "0.75rem", background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "#FFFFFF", fontWeight: 700, textDecoration: "none", boxShadow: "0 0 25px rgba(99,102,241,0.5)", fontSize: "1rem" }}>
                Start Free Today
              </Link>
              <Link href="/contact" style={{ padding: "0.95rem 2rem", borderRadius: "0.75rem", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.25)", color: "#FFFFFF", fontWeight: 600, textDecoration: "none", fontSize: "1rem" }}>
                Talk to Our Team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
