import Link from "next/link";

export const metadata = {
  title: "Zentrion for Enterprises — Corporate AI & Cybersecurity Training",
  description: "Upskill your entire workforce in AI, Cybersecurity, and Future Tech. Custom LMS, team analytics, SSO integration, and dedicated success management for enterprise teams.",
};

const FEATURES = [
  {
    icon: "🔐",
    color: "#6366F1",
    colorSubtle: "rgba(99,102,241,0.12)",
    colorBorder: "rgba(99,102,241,0.25)",
    title: "SSO & SAML Integration",
    desc: "Connect with your existing identity provider (Okta, Azure AD, Google Workspace). Zero friction for employee login.",
  },
  {
    icon: "📈",
    color: "#10B981",
    colorSubtle: "rgba(16,185,129,0.12)",
    colorBorder: "rgba(16,185,129,0.25)",
    title: "Advanced Team Analytics",
    desc: "Real-time dashboards tracking completion rates, skills acquisition, learning velocity, and ROI per department.",
  },
  {
    icon: "🎯",
    color: "#0891B2",
    colorSubtle: "rgba(34,211,238,0.12)",
    colorBorder: "rgba(34,211,238,0.25)",
    title: "Custom Learning Paths",
    desc: "Curate role-specific paths for engineers, analysts, PMs, and executives — aligned to your internal competency framework.",
  },
  {
    icon: "👔",
    color: "#F59E0B",
    colorSubtle: "rgba(245,158,11,0.12)",
    colorBorder: "rgba(245,158,11,0.25)",
    title: "Dedicated Success Manager",
    desc: "A dedicated CSM for onboarding, quarterly business reviews, and proactive escalation management.",
  },
  {
    icon: "🌐",
    color: "#9333EA",
    colorSubtle: "rgba(192,132,252,0.12)",
    colorBorder: "rgba(192,132,252,0.25)",
    title: "Whitelabel Option",
    desc: "Deploy Zentrion under your brand with your domain, logo, colors, and employee communication templates.",
  },
  {
    icon: "⚡",
    color: "#F472B6",
    colorSubtle: "rgba(244,114,182,0.12)",
    colorBorder: "rgba(244,114,182,0.25)",
    title: "API & Webhooks",
    desc: "Full REST API and webhook support for integration with your HRMS, LMS, Slack, JIRA, and internal tooling.",
  },
  {
    icon: "📜",
    color: "#0891B2",
    colorSubtle: "rgba(34,211,238,0.12)",
    colorBorder: "rgba(34,211,238,0.25)",
    title: "Compliance & Audit",
    desc: "ISO 27001-aligned security. GDPR-compliant data handling. Full audit log exports for compliance teams.",
  },
  {
    icon: "🔬",
    color: "#6366F1",
    colorSubtle: "rgba(129,140,248,0.12)",
    colorBorder: "rgba(129,140,248,0.25)",
    title: "Custom Labs & Simulations",
    desc: "Commission bespoke cybersecurity lab scenarios and AI simulations that reflect your actual infrastructure and threat landscape.",
  },
];

const USE_CASES = [
  {
    icon: "🏦",
    sector: "Banking & Finance",
    pain: "Rapid AI adoption with regulatory compliance needs",
    solution: "Curated paths for AI in FinTech, fraud detection, and compliance — with audit logs for RBI requirements.",
  },
  {
    icon: "🏥",
    sector: "Healthcare & Pharma",
    pain: "Clinical AI and data security training at scale",
    solution: "HIPAA-aware lab environments for clinical ML, medical imaging AI, and hospital cybersecurity drills.",
  },
  {
    icon: "🏭",
    sector: "Manufacturing & Industry 4.0",
    pain: "Upskilling for smart factory and IIoT teams",
    solution: "Custom automation and IoT security tracks for engineers transitioning to AI-first operations.",
  },
  {
    icon: "💻",
    sector: "Technology Companies",
    pain: "Continuous developer upskilling in fast-moving AI landscape",
    solution: "Agentic AI, LLM security, and prompt engineering tracks aligned to engineering career ladders.",
  },
];

const TESTIMONIALS = [
  {
    quote: "We trained 800 engineers on AI Agents in 6 weeks. The lab simulations mirrored our actual production stack. Zentrion's enterprise team was exceptional throughout.",
    name: "CTO, Series B SaaS",
    role: "Technology Company (NDA)",
    initials: "CTO",
    color: "#6366F1",
  },
  {
    quote: "The skills-gap dashboard helped us identify which teams needed AI upskilling before our GPT integration. Saved us months of guesswork and 40% in contractor costs.",
    name: "VP Engineering",
    role: "Fortune 500 Manufacturing (NDA)",
    initials: "VP",
    color: "#0891B2",
  },
  {
    quote: "SSO with Azure AD was live in 3 hours. The whitelabel made it feel like our own internal platform. Employee NPS for the training jumped from 45 to 87.",
    name: "L&D Director",
    role: "Global Bank (NDA)",
    initials: "LD",
    color: "#10B981",
  },
];

const STATS = [
  { value: "800+", label: "Enterprise Learners Avg" },
  { value: "6 Wks", label: "Avg Upskilling Sprint" },
  { value: "87%", label: "Avg Employee NPS" },
  { value: "40%", label: "Training Cost Savings" },
];

export default function ForEnterprisesPage() {
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
          background: "radial-gradient(ellipse 70% 50% at 50% -5%, rgba(99, 102, 241, 0.12), transparent 70%), radial-gradient(circle at 80% 60%, rgba(16, 185, 129, 0.1), transparent 50%)",
        }}
      >
        <div className="hero-grid-bg" style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.35 }} />
        <div className="animate-float" style={{ position: "absolute", top: "10%", left: "5%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(99, 102, 241, 0.06), transparent 70%)", zIndex: 0, pointerEvents: "none" }} />
        <div className="animate-float-medium" style={{ position: "absolute", bottom: "15%", right: "8%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(16, 185, 129, 0.08), transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#64748B", marginBottom: "2rem" }}>
            <Link href="/" style={{ color: "#64748B", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span style={{ color: "#94A3B8" }}>For Enterprises</span>
          </div>

          <div className="section-eyebrow" style={{ display: "inline-flex", marginBottom: "1.5rem" }}>
            <span>🏢</span> For Enterprise Teams
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(24rem, 1fr))", gap: "4rem", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "1.25rem" }}>
                Upskill Your Entire
                <br />
                Workforce in{" "}
                <span style={{ background: "linear-gradient(135deg, #6366F1 0%, #10B981 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  AI & Security
                </span>
              </h1>
              <p style={{ fontSize: "1.1rem", color: "#94A3B8", lineHeight: 1.7, marginBottom: "2rem", maxWidth: "36rem" }}>
                From 50 to 50,000 employees — Zentrion Enterprise delivers AI, cybersecurity, and future-tech training with SSO integration, custom learning paths, advanced analytics, and dedicated support.
              </p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
                <a href="https://wa.me/917305771789?text=Hello%2C%20I%20need%20enterprise%20training%20for%20my%20team" target="_blank" rel="noopener noreferrer"
                  style={{ padding: "0.9rem 1.75rem", borderRadius: "0.75rem", background: "linear-gradient(135deg, #6366F1, #10B981)", color: "#fff", fontWeight: 700, textDecoration: "none", boxShadow: "0 0 25px rgba(99,102,241,0.35)", fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                  💬 Get Enterprise Demo
                </a>
                <Link href="/contact"
                  style={{ padding: "0.9rem 1.75rem", borderRadius: "0.75rem", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#F8FAFC", fontWeight: 600, textDecoration: "none", fontSize: "0.95rem" }}>
                  Request Proposal
                </Link>
              </div>
              <p style={{ color: "#64748B", fontSize: "0.85rem" }}>
                ✅ SOC 2 Type II &nbsp;·&nbsp; ✅ GDPR Compliant &nbsp;·&nbsp; ✅ ISO 27001 Aligned &nbsp;·&nbsp; ✅ 99.9% SLA
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              {STATS.map((s) => (
                <div key={s.label} className="holo-card" style={{ padding: "2rem", textAlign: "center" }}>
                  <div className="stat-number" style={{ color: "#6366F1", marginBottom: "0.4rem" }}>{s.value}</div>
                  <div style={{ color: "#64748B", fontSize: "0.8rem", fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ============================================================ */}
      {/* ENTERPRISE FEATURES                                          */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "#0A0F1D" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "44rem", margin: "0 auto 3.5rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Enterprise Features</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0.75rem" }}>Everything a Modern Enterprise Needs</h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem", lineHeight: 1.65 }}>Security, scale, customisation, and integrations — not optional add-ons, but built-in from day one.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))", gap: "1.5rem" }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="holo-card" style={{ padding: "2rem", display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                <div style={{ width: 52, height: 52, borderRadius: "0.875rem", background: f.colorSubtle, border: `1px solid ${f.colorBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                  {f.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.5rem" }}>{f.title}</h3>
                  <p style={{ color: "#94A3B8", fontSize: "0.875rem", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* INDUSTRY USE CASES                                           */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "#ffffff", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "44rem", margin: "0 auto 3.5rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Industry Use Cases</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0.75rem" }}>Designed for Your Industry</h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem", lineHeight: 1.65 }}>Sector-specific training tracks mapped to your real business context — not generic e-learning.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))", gap: "1.5rem" }}>
            {USE_CASES.map((uc) => (
              <div key={uc.sector} className="holo-card" style={{ padding: "2rem" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{uc.icon}</div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.75rem" }}>{uc.sector}</h3>
                <div style={{ marginBottom: "0.75rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>Challenge</div>
                  <p style={{ color: "#94A3B8", fontSize: "0.875rem", lineHeight: 1.55, margin: 0 }}>{uc.pain}</p>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#0891B2", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>Zentrion Solution</div>
                  <p style={{ color: "#CBD5E1", fontSize: "0.875rem", lineHeight: 1.55, margin: 0 }}>{uc.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* TESTIMONIALS                                                  */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "#0A0F1D", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Enterprise Success Stories</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0" }}>Results That Speak for Themselves</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))", gap: "1.5rem" }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="testimonial-card">
                <div style={{ color: "#6366F1", fontSize: "2rem", lineHeight: 1, marginBottom: "1rem" }}>"</div>
                <p style={{ color: "#E2E8F0", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "1.5rem", fontStyle: "italic" }}>{t.quote}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.85rem", boxShadow: `0 0 15px ${t.color}55` }}>
                    {t.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#FFFFFF", fontSize: "0.95rem" }}>{t.name}</div>
                    <div style={{ color: "#94A3B8", fontSize: "0.8rem" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* IMPLEMENTATION PROCESS                                        */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "#ffffff", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container" style={{ maxWidth: "52rem" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Implementation</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0.75rem" }}>Live in Under 2 Weeks</h2>
            <p style={{ color: "#94A3B8" }}>Dedicated enterprise implementation track with zero downtime and full handholding.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              { n: "01", title: "Discovery Call", desc: "We map your competency framework, team structure, and technical environment requirements in a 60-minute deep-dive." },
              { n: "02", title: "Contract & Provisioning", desc: "Legal review, MSA signing, and tenant provisioning — typically completed within 3 business days." },
              { n: "03", title: "SSO & Integration Setup", desc: "Your IT team connects the identity provider. We configure SCIM provisioning, Slack notifications, and any API hooks." },
              { n: "04", title: "Curriculum Mapping", desc: "Our curriculum team customises learning paths for each role tier based on your competency requirements." },
              { n: "05", title: "Pilot Launch & Feedback", desc: "30-day pilot with a selected cohort. Iterate on content, paths, and UX based on early employee feedback." },
              { n: "06", title: "Full Rollout & QBR", desc: "Company-wide launch with quarterly business reviews, skills reports, and continuous optimisation." },
            ].map((step, i) => (
              <div key={step.n} className="timeline-step" style={{ paddingBottom: i < 5 ? "2.25rem" : 0 }}>
                <div className="timeline-num" style={{ fontSize: "0.8rem" }}>{step.n}</div>
                <div style={{ paddingTop: "0.75rem" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.4rem" }}>{step.title}</h3>
                  <p style={{ color: "#94A3B8", fontSize: "0.9rem", lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
                </div>
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
          <div style={{ textAlign: "center", padding: "4.5rem 2rem", borderRadius: "1.5rem", background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(16,185,129,0.08))", border: "1px solid rgba(99,102,241,0.3)", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
            <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, color: "#FFFFFF", marginBottom: "1rem" }}>
              Ready to Upskill Your Workforce?
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem", maxWidth: "36rem", margin: "0 auto 2rem", lineHeight: 1.65 }}>
              Get a personalised enterprise proposal with ROI projections and a 30-day pilot — at no cost.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="https://wa.me/917305771789?text=Hello%2C%20I%20want%20enterprise%20training%20for%20my%20team" target="_blank" rel="noopener noreferrer"
                style={{ padding: "0.9rem 2rem", borderRadius: "0.75rem", background: "linear-gradient(135deg, #6366F1, #10B981)", color: "#fff", fontWeight: 700, textDecoration: "none", boxShadow: "0 0 25px rgba(99,102,241,0.5)", fontSize: "1rem" }}>
                💬 Get Enterprise Proposal
              </a>
              <Link href="/for-colleges" style={{ padding: "0.9rem 2rem", borderRadius: "0.75rem", background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.15)", color: "#F8FAFC", fontWeight: 600, textDecoration: "none", fontSize: "1rem" }}>
                For Colleges →
              </Link>
            </div>
            <p style={{ color: "#64748B", fontSize: "0.85rem", marginTop: "1.5rem" }}>
              📞 <a href="tel:+917305771789" style={{ color: "#38BDF8", fontWeight: 600, textDecoration: "none" }}>+91 7305771789</a> &nbsp;·&nbsp; ✉️ <a href="mailto:enterprise@zentrion.dev" style={{ color: "#38BDF8", fontWeight: 600, textDecoration: "none" }}>enterprise@zentrion.dev</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
