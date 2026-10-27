import Link from "next/link";

export const metadata = {
  title: "About — Zentrion Learntech",
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
    colorSubtle: "rgba(34, 211, 238, 0.08)",
    colorBorder: "rgba(34, 211, 238, 0.15)",
    title: "Hands-On First",
    desc: "Every concept is paired with a lab, project, or real-world prompt you can run — not just a video to watch passively.",
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
    desc: "Security training happens in simulated, sandboxed environments with synthetic data. Nothing here touches a live system.",
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
    title: "AI-Assisted, Not Dependent",
    desc: "Our AI Tutor augments learning with context, not crutches. It works offline too — no vendor lock-in, ever.",
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
    title: "Open Skills, Verifiable",
    desc: "Skills evidence, progress, and certificates are recorded per learner — portable, auditable, and shareable anywhere.",
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
    title: "Community Powered",
    desc: "250,000+ learners, instructors, and mentors collaborate, review each other's code, and grow together every day.",
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
    title: "Always Current",
    desc: "Curriculum updated continuously with new AI models, security threats, and industry best practices as the world evolves.",
  },
];

const PLATFORM_FEATURES = [
  { icon: "📚", title: "500+ Courses", desc: "Video lessons, reading, quizzes and capstone projects across 7 specialisations." },
  { icon: "🛤️", title: "Learning Paths", desc: "Sequenced curricula with prerequisites, milestones, and structured progression." },
  { icon: "🔬", title: "Browser Labs", desc: "Sandboxed terminals, SIEM triage, injection labs — zero setup required." },
  { icon: "🚩", title: "CTF Challenges", desc: "Capture-the-flag style flag challenges with instant automated verification." },
  { icon: "🤖", title: "AI Workspace", desc: "Tutor, Prompt Studio, Agents, Knowledge Bases and an evaluation harness." },
  { icon: "🎖️", title: "Credentials", desc: "Certificates, skills evidence, portfolio artefacts and employer-ready profiles." },
  { icon: "🎬", title: "Live Classes", desc: "Weekly interactive live coding sessions, code reviews, and Q&A with experts." },
  { icon: "🏢", title: "Enterprise Ready", desc: "Multi-tenant portals, cohort management, and audit-ready compliance reports." },
];

const TEAM = [
  { name: "Sanjay Murugadoss", role: "Founder & CEO", avatar: "SM", color: "#6366F1", badge: "Cybersecurity & AI" },
  { name: "Priya R.", role: "Head of Curriculum", avatar: "PR", color: "#0891B2", badge: "ML & Data Science" },
  { name: "Karthik V.", role: "Platform Architect", avatar: "KV", color: "#9333EA", badge: "Systems & DevOps" },
  { name: "Ananya B.", role: "Head of Community", avatar: "AB", color: "#10B981", badge: "Learner Success" },
];

const MILESTONES = [
  { year: "2022", event: "Zentrion founded to democratise AI & cybersecurity education in India" },
  { year: "2023", event: "Launched first 50 courses with in-browser sandboxed lab infrastructure" },
  { year: "2024", event: "Reached 100,000 learners; partnered with 30+ enterprise clients" },
  { year: "2025", event: "Launched AI Workspace with Agentic AI courses and prompt engineering studio" },
  { year: "2026", event: "250,000+ active learners; expanding globally with multi-language support" },
];

export default function AboutPage() {
  return (
    <div style={{ background: "#ffffff", color: "#F8FAFC", minHeight: "100vh" }}>

      {/* ============================================================ */}
      {/* HERO                                                          */}
      {/* ============================================================ */}
      <section
        style={{
          position: "relative",
          padding: "5.5rem 0 4.5rem",
          overflow: "hidden",
          background: "radial-gradient(ellipse 70% 50% at 50% -5%, rgba(99, 102, 241, 0.12), transparent 70%)",
        }}
      >
        <div className="hero-grid-bg" style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.35 }} />

        <div className="animate-float" style={{ position: "absolute", top: "10%", left: "5%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(99, 102, 241, 0.06), transparent 70%)", zIndex: 0, pointerEvents: "none" }} />
        <div className="animate-float-medium" style={{ position: "absolute", top: "15%", right: "5%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(34, 211, 238, 0.06), transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#64748B", marginBottom: "2rem" }}>
            <Link href="/" style={{ color: "#64748B", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span style={{ color: "#94A3B8" }}>About</span>
          </div>

          <div className="section-eyebrow" style={{ display: "inline-flex", marginBottom: "1.5rem" }}>
            <span>🚀</span> Our Story
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))", gap: "4rem", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "1.5rem" }}>
                Building the{" "}
                <span style={{ background: "linear-gradient(135deg, #22D3EE 0%, #818CF8 50%, #C084FC 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Future
                </span>
                {" "}of Tech Education
              </h1>
              <p style={{ fontSize: "1.15rem", color: "#94A3B8", lineHeight: 1.7, marginBottom: "2rem" }}>
                Zentrion Learntech is an integrated learning platform for AI, prompt engineering, agentic AI, application development and cybersecurity. We combine structured courses, project-based evaluation, simulated security labs, and AI workspace tools in one place — for individuals, instructors, colleges, and enterprises.
              </p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link href="/courses" style={{ padding: "0.85rem 1.75rem", borderRadius: "0.75rem", background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "#fff", fontWeight: 700, textDecoration: "none", boxShadow: "0 0 25px rgba(99,102,241,0.4)", fontSize: "0.95rem" }}>
                  Explore Courses →
                </Link>
                <Link href="/contact" style={{ padding: "0.85rem 1.75rem", borderRadius: "0.75rem", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#F8FAFC", fontWeight: 600, textDecoration: "none", fontSize: "0.95rem" }}>
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Stats panel */}
            <div className="holo-card" style={{ padding: "2.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.75rem" }}>
                {[
                  { value: "250K+", label: "Active Learners", color: "#FFFFFF" },
                  { value: "500+", label: "Courses & Labs", color: "#0891B2" },
                  { value: "50+", label: "Expert Instructors", color: "#6366F1" },
                  { value: "95%", label: "Job Success Rate", color: "#10B981" },
                  { value: "30+", label: "Enterprise Clients", color: "#F59E0B" },
                  { value: "4.9★", label: "Average Rating", color: "#9333EA" },
                ].map((stat) => (
                  <div key={stat.label} style={{ textAlign: "center" }}>
                    <div className="stat-number" style={{ color: stat.color, marginBottom: "0.25rem" }}>{stat.value}</div>
                    <div style={{ color: "#64748B", fontSize: "0.8rem", fontWeight: 500 }}>{stat.label}</div>
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
      <section style={{ padding: "5rem 0", background: "#0A0F1D" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "44rem", margin: "0 auto 3.5rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>What We Believe</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0.75rem" }}>Values That Drive Everything</h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem", lineHeight: 1.65 }}>Every feature, every course, every design decision starts with these core principles.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))", gap: "1.5rem" }}>
            {VALUES.map((v) => (
              <div key={v.title} className="holo-card" style={{ padding: "2rem", display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                <div style={{ width: 52, height: 52, borderRadius: "0.875rem", background: v.colorSubtle, border: `1px solid ${v.colorBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {v.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.5rem" }}>{v.title}</h3>
                  <p style={{ color: "#94A3B8", fontSize: "0.875rem", lineHeight: 1.6, margin: 0 }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PLATFORM FEATURES                                             */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "#ffffff", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "44rem", margin: "0 auto 3.5rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Platform Capabilities</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0.75rem" }}>Everything You Need, In One Place</h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem", lineHeight: 1.65 }}>No switching between tools. Learn, practice, collaborate, and verify all on Zentrion.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))", gap: "1.25rem" }}>
            {PLATFORM_FEATURES.map((f) => (
              <div key={f.title} className="glass-card-hover" style={{ padding: "1.75rem", borderRadius: "1rem", background: "rgba(10,15,29,0.7)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.75rem", lineHeight: 1, flexShrink: 0 }}>{f.icon}</span>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.35rem" }}>{f.title}</h3>
                  <p style={{ color: "#94A3B8", fontSize: "0.85rem", lineHeight: 1.55, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* TIMELINE / MILESTONES                                         */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "#0A0F1D", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container" style={{ maxWidth: "52rem" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Our Journey</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0.75rem" }}>Built Year by Year</h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem" }}>From a bold idea to 250,000+ learners across the globe.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {MILESTONES.map((m, i) => (
              <div key={m.year} className="timeline-step" style={{ paddingBottom: i < MILESTONES.length - 1 ? "2rem" : 0 }}>
                <div className="timeline-num">{m.year.slice(2)}</div>
                <div style={{ paddingTop: "0.65rem", flex: 1 }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6366F1", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.3rem" }}>{m.year}</div>
                  <p style={{ color: "#CBD5E1", fontSize: "1rem", lineHeight: 1.6, margin: 0 }}>{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* TEAM                                                          */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "#ffffff", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>The Team</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0.75rem" }}>People Behind Zentrion</h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem" }}>Educators, engineers, and lifelong learners obsessed with outcomes.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))", gap: "1.5rem" }}>
            {TEAM.map((member) => (
              <div key={member.name} className="holo-card" style={{ padding: "2rem", textAlign: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: member.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "1.35rem", margin: "0 auto 1.25rem", boxShadow: `0 0 25px ${member.color}66` }}>
                  {member.avatar}
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.25rem" }}>{member.name}</h3>
                <p style={{ color: "#64748B", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{member.role}</p>
                <span style={{ display: "inline-flex", padding: "0.25rem 0.65rem", borderRadius: "9999px", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#6366F1", fontSize: "0.72rem", fontWeight: 600 }}>
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
      <section style={{ padding: "5rem 0", background: "#0A0F1D", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container">
          <div style={{ textAlign: "center", padding: "4rem 2rem", borderRadius: "1.5rem", background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,211,238,0.08))", border: "1px solid rgba(99,102,241,0.3)", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
            <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, color: "#FFFFFF", marginBottom: "1rem" }}>
              Join 250,000+ Learners Building the Future
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem", maxWidth: "34rem", margin: "0 auto 2rem", lineHeight: 1.65 }}>
              Whether you&apos;re a student, engineer, or team leader — Zentrion has a path for you.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/auth/sign-up" style={{ padding: "0.9rem 2rem", borderRadius: "0.75rem", background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "#fff", fontWeight: 700, textDecoration: "none", boxShadow: "0 0 25px rgba(99,102,241,0.5)", fontSize: "1rem" }}>
                Start Free Today
              </Link>
              <Link href="/contact" style={{ padding: "0.9rem 2rem", borderRadius: "0.75rem", background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.15)", color: "#F8FAFC", fontWeight: 600, textDecoration: "none", fontSize: "1rem" }}>
                Talk to Our Team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
