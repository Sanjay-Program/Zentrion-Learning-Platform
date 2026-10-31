import Link from "next/link";
import { EnterpriseRoiCalculator, EnterpriseFaqAccordion } from "./enterprise-interactive";

export const metadata = {
  title: "For Enterprises",
  description: "Upskill your entire workforce in AI, Cybersecurity, and Future Tech. Custom LMS, team analytics, SSO integration, and dedicated success management for enterprise teams.",
};

const FEATURES = [
  {
    icon: "🔐",
    color: "#6366F1",
    colorSubtle: "rgba(99,102,241,0.12)",
    colorBorder: "rgba(99,102,241,0.25)",
    title: "SSO & SAML Integration",
    desc: "Connect with your existing identity provider (Okta, Azure AD, Google Workspace). Zero friction for employee login with SCIM auto-provisioning.",
  },
  {
    icon: "📈",
    color: "#10B981",
    colorSubtle: "rgba(16,185,129,0.12)",
    colorBorder: "rgba(16,185,129,0.25)",
    title: "Advanced Team Analytics",
    desc: "Real-time dashboards tracking completion rates, skills acquisition, learning velocity, and ROI per department or engineering squad.",
  },
  {
    icon: "🎯",
    color: "#0891B2",
    colorSubtle: "rgba(34,211,238,0.12)",
    colorBorder: "rgba(34,211,238,0.25)",
    title: "Custom Learning Paths",
    desc: "Curate role-specific paths for software engineers, security analysts, PMs, and executives — aligned to your internal competency framework.",
  },
  {
    icon: "👔",
    color: "#F59E0B",
    colorSubtle: "rgba(245,158,11,0.12)",
    colorBorder: "rgba(245,158,11,0.25)",
    title: "Dedicated Success Manager",
    desc: "A dedicated CSM for onboarding, customized quarterly business reviews (QBRs), curriculum tuning, and proactive escalation management.",
  },
  {
    icon: "🌐",
    color: "#9333EA",
    colorSubtle: "rgba(192,132,252,0.12)",
    colorBorder: "rgba(192,132,252,0.25)",
    title: "Whitelabel Option",
    desc: "Deploy Zentrion under your corporate brand with custom subdomain, logo, corporate colors, and customized employee onboarding templates.",
  },
  {
    icon: "⚡",
    color: "#F472B6",
    colorSubtle: "rgba(244,114,182,0.12)",
    colorBorder: "rgba(244,114,182,0.25)",
    title: "API & Webhooks",
    desc: "Full REST API and webhook support for seamless integration with your internal HRMS (Workday, BambooHR), LMS, Slack, JIRA, and telemetry.",
  },
  {
    icon: "📜",
    color: "#0891B2",
    colorSubtle: "rgba(34,211,238,0.12)",
    colorBorder: "rgba(34,211,238,0.25)",
    title: "Compliance & Audit Logs",
    desc: "ISO 27001-aligned security. GDPR-compliant tenant isolation. Full exportable tamper-evident audit logs for regulatory and security reviews.",
  },
  {
    icon: "🔬",
    color: "#6366F1",
    colorSubtle: "rgba(129,140,248,0.12)",
    colorBorder: "rgba(129,140,248,0.25)",
    title: "Custom Labs & Threat Simulations",
    desc: "Commission bespoke cybersecurity lab scenarios and AI agent testbeds that mirror your actual production infrastructure and threat perimeter.",
  },
];

const USE_CASES = [
  {
    icon: "🏦",
    sector: "Banking, Financial Services & Insurance (BFSI)",
    pain: "Rapid AI adoption mandates strict data confidentiality and regulatory audits (RBI, SEC).",
    solution: "Isolated sandbox tracks for FinTech GenAI, fraud detection classifiers, and automated compliance verification.",
  },
  {
    icon: "🏥",
    sector: "Healthcare & Pharmaceuticals",
    pain: "Clinical teams require ML literacy while strictly preserving HIPAA and patient health data sanctity.",
    solution: "Synthetic medical data pipelines, HIPAA-aware AI triage sandboxes, and hospital ransomware defense drills.",
  },
  {
    icon: "🏭",
    sector: "Manufacturing & Industry 4.0",
    pain: "Industrial IoT engineers need to adopt predictive analytics and cyber-physical security.",
    solution: "Tailored OT/IT security tracks and embedded ML models for smart-factory operational resilience.",
  },
  {
    icon: "💻",
    sector: "Cloud & Technology Enterprises",
    pain: "Continuous developer upskilling needed to transition engineering orgs to Agentic AI and LLM security.",
    solution: "Agentic AI orchestration, prompt injection defense, and RAG architectures mapped directly to senior engineering ladders.",
  },
];

const TESTIMONIALS = [
  {
    quote: "We trained 800 engineers on AI Agents in 6 weeks. The lab simulations mirrored our actual production stack. Zentrion's enterprise team was exceptional throughout.",
    name: "CTO, Series B SaaS",
    role: "Global Technology Company (NDA)",
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
    role: "Global Tier-1 Bank (NDA)",
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
    <div style={{ background: "var(--bg, #060913)", color: "var(--text, #F8FAFC)", minHeight: "100vh" }}>

      {/* ============================================================ */}
      {/* HERO SECTION                                                  */}
      {/* ============================================================ */}
      <section
        style={{
          position: "relative",
          padding: "5.5rem 0 4.5rem",
          overflow: "hidden",
          background: "radial-gradient(ellipse 70% 50% at 50% -5%, rgba(99, 102, 241, 0.18), transparent 70%), radial-gradient(circle at 80% 60%, rgba(16, 185, 129, 0.12), transparent 50%)",
        }}
      >
        <div className="hero-grid-bg" style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.35 }} />
        <div className="animate-float" style={{ position: "absolute", top: "10%", left: "5%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(99, 102, 241, 0.08), transparent 70%)", zIndex: 0, pointerEvents: "none" }} />
        <div className="animate-float-medium" style={{ position: "absolute", bottom: "15%", right: "8%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(16, 185, 129, 0.1), transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#64748B", marginBottom: "2rem" }}>
            <Link href="/" style={{ color: "#94A3B8", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span style={{ color: "#22D3EE", fontWeight: 600 }}>For Enterprises</span>
          </div>

          <div className="section-eyebrow" style={{ display: "inline-flex", marginBottom: "1.5rem" }}>
            <span>🏢</span> Enterprise Workforce Solutions
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(24rem, 1fr))", gap: "4rem", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "1.25rem" }}>
                Upskill Your Entire
                <br />
                Workforce in{" "}
                <span style={{ background: "linear-gradient(135deg, #6366F1 0%, #22D3EE 50%, #10B981 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  AI & Security
                </span>
              </h1>
              <p style={{ fontSize: "1.1rem", color: "#CBD5E1", lineHeight: 1.7, marginBottom: "2rem", maxWidth: "36rem" }}>
                From 50 to 50,000 employees — Zentrion Enterprise delivers AI agents, LLM cybersecurity, and future-tech training with SSO integration, custom competency paths, real-time analytics, and dedicated support.
              </p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
                <a
                  href="https://wa.me/917305771789?text=Hello%2C%20I%20need%20enterprise%20training%20for%20my%20team"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "0.9rem 1.75rem",
                    borderRadius: "0.75rem",
                    background: "linear-gradient(135deg, #6366F1, #10B981)",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: "0 0 25px rgba(99,102,241,0.45)",
                    fontSize: "0.95rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  💬 Get Enterprise Demo
                </a>
                <a
                  href="#roi-calculator"
                  style={{
                    padding: "0.9rem 1.75rem",
                    borderRadius: "0.75rem",
                    background: "rgba(15, 23, 42, 0.8)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    color: "#FFFFFF",
                    fontWeight: 600,
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  🧮 Calculate Team ROI →
                </a>
              </div>
              <p style={{ color: "#94A3B8", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <span>✅ SOC 2 Type II Aligned</span>
                <span>✅ GDPR Compliant</span>
                <span>✅ ISO 27001 Aligned</span>
                <span>✅ 99.9% Platform SLA</span>
              </p>
            </div>

            {/* Stats Holo Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              {STATS.map((s) => (
                <div key={s.label} className="holo-card" style={{ padding: "2rem", textAlign: "center" }}>
                  <div className="stat-number" style={{ color: "#22D3EE", marginBottom: "0.4rem", fontSize: "2.25rem" }}>{s.value}</div>
                  <div style={{ color: "#CBD5E1", fontSize: "0.85rem", fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ============================================================ */}
      {/* INTERACTIVE ROI ESTIMATOR SECTION                            */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "var(--bg-subtle, #0a0f24)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "44rem", margin: "0 auto 3rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>ROI & Productivity</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0.75rem" }}>
              Quantifiable Business Impact
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem", lineHeight: 1.65 }}>
              Enterprise teams trained on Zentrion deliver projects 3x faster, reduce contractor spend, and retain top engineering talent.
            </p>
          </div>

          <EnterpriseRoiCalculator />
        </div>
      </section>

      <div className="section-divider" />

      {/* ============================================================ */}
      {/* ENTERPRISE FEATURES                                          */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "var(--bg, #060913)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "44rem", margin: "0 auto 3.5rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Enterprise Infrastructure</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0.75rem" }}>
              Everything a Modern Enterprise Needs
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem", lineHeight: 1.65 }}>
              Security, scale, customisation, and integrations — built-in from day one.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))", gap: "1.5rem" }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="holo-card" style={{ padding: "2rem", display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                <div style={{ width: 52, height: 52, borderRadius: "0.875rem", background: f.colorSubtle, border: `1px solid ${f.colorBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                  {f.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.5rem" }}>{f.title}</h3>
                  <p style={{ color: "#94A3B8", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ============================================================ */}
      {/* INDUSTRY USE CASES                                           */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "var(--bg-subtle, #0a0f24)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "44rem", margin: "0 auto 3.5rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Tailored Industry Tracks</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0.75rem" }}>
              Designed for Your Industry
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem", lineHeight: 1.65 }}>
              Sector-specific training tracks mapped to your real compliance, regulatory, and production workflows.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))", gap: "1.5rem" }}>
            {USE_CASES.map((uc) => (
              <div key={uc.sector} className="holo-card" style={{ padding: "2rem" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{uc.icon}</div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.75rem" }}>{uc.sector}</h3>
                <div style={{ marginBottom: "0.75rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "#F59E0B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>
                    The Challenge
                  </div>
                  <p style={{ color: "#CBD5E1", fontSize: "0.9rem", lineHeight: 1.55, margin: 0 }}>{uc.pain}</p>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#22D3EE", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>
                    Zentrion Solution
                  </div>
                  <p style={{ color: "#E2E8F0", fontSize: "0.9rem", lineHeight: 1.55, margin: 0 }}>{uc.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ============================================================ */}
      {/* TESTIMONIALS                                                  */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "var(--bg, #060913)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Enterprise Case Studies</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0" }}>
              Results That Speak for Themselves
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))", gap: "1.5rem" }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="testimonial-card">
                <div style={{ color: "#6366F1", fontSize: "2.5rem", lineHeight: 1, marginBottom: "1rem" }}>“</div>
                <p style={{ color: "#E2E8F0", fontSize: "1rem", lineHeight: 1.7, marginBottom: "1.5rem", fontStyle: "italic" }}>
                  {t.quote}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.85rem", boxShadow: `0 0 15px ${t.color}55` }}>
                    {t.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#FFFFFF", fontSize: "1rem" }}>{t.name}</div>
                    <div style={{ color: "#94A3B8", fontSize: "0.82rem" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ============================================================ */}
      {/* IMPLEMENTATION PROCESS TIMELINE                               */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "var(--bg-subtle, #0a0f24)" }}>
        <div className="container" style={{ maxWidth: "52rem" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Rapid Deployment</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0.75rem" }}>
              Live in Under 2 Weeks
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem" }}>
              Dedicated enterprise implementation track with zero downtime and white-glove technical handholding.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              { n: "01", title: "Discovery & Skills Mapping", desc: "We review your engineering stack, competency matrix, and team roles in an intensive 60-minute technical session." },
              { n: "02", title: "Custom Pilot Provisioning", desc: "Contracting, MSA signing, and secure multi-tenant environment provisioning — typically completed within 3 business days." },
              { n: "03", title: "SSO & Security Integration", desc: "Your identity team connects Okta, Azure AD, or Google Workspace with automated SCIM 2.0 user lifecycle sync." },
              { n: "04", title: "Curriculum & Sandbox Calibration", desc: "Our staff engineers configure custom hands-on lab environments matching your internal libraries, models, and VPC architecture." },
              { n: "05", title: "Cohort Launch & Live Masterclasses", desc: "Kick off with executive sponsor alignment, onboarding workshops, and proactive learner engagement tracking." },
              { n: "06", title: "Quarterly ROI & Skills Reporting", desc: "Executive dashboards detailing competency velocity, course completion, practical lab pass rates, and business ROI." },
            ].map((step, i) => (
              <div key={step.n} className="timeline-step" style={{ paddingBottom: i < 5 ? "2.25rem" : 0 }}>
                <div className="timeline-num" style={{ fontSize: "0.85rem", fontWeight: 800 }}>{step.n}</div>
                <div style={{ paddingTop: "0.5rem" }}>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.4rem" }}>{step.title}</h3>
                  <p style={{ color: "#CBD5E1", fontSize: "0.95rem", lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ============================================================ */}
      {/* ENTERPRISE FAQS                                               */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "var(--bg, #060913)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Enterprise FAQ</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0" }}>
              Frequently Asked Enterprise Questions
            </h2>
          </div>

          <EnterpriseFaqAccordion />
        </div>
      </section>

      {/* ============================================================ */}
      {/* FINAL HIGH-IMPACT ENTERPRISE CTA                             */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "var(--bg-subtle, #0a0f24)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container">
          <div
            style={{
              textAlign: "center",
              padding: "4.5rem 2rem",
              borderRadius: "1.5rem",
              background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(16,185,129,0.12))",
              border: "1px solid rgba(99,102,241,0.4)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(99,102,241,0.15)",
            }}
          >
            <h2 style={{ fontSize: "clamp(2rem, 3.8vw, 2.75rem)", fontWeight: 900, color: "#FFFFFF", marginBottom: "1rem", letterSpacing: "-0.02em" }}>
              Ready to Upskill Your Workforce?
            </h2>
            <p style={{ color: "#CBD5E1", fontSize: "1.1rem", maxWidth: "38rem", margin: "0 auto 2.25rem", lineHeight: 1.65 }}>
              Receive a personalised enterprise proposal with full curriculum matrix, ROI forecast, and a 30-day pilot cohort.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href="https://wa.me/917305771789?text=Hello%2C%20I%20want%20enterprise%20training%20for%20my%20team"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "0.95rem 2.25rem",
                  borderRadius: "0.75rem",
                  background: "linear-gradient(135deg, #6366F1, #10B981)",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 0 30px rgba(99,102,241,0.5)",
                  fontSize: "1rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                💬 Get Enterprise Proposal
              </a>
              <Link
                href="/for-colleges"
                style={{
                  padding: "0.95rem 2rem",
                  borderRadius: "0.75rem",
                  background: "rgba(15,23,42,0.8)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  textDecoration: "none",
                  fontSize: "1rem",
                }}
              >
                For Colleges & Universities →
              </Link>
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", marginTop: "2rem", color: "#94A3B8", fontSize: "0.9rem" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                📞 <a href="tel:+917305771789" style={{ color: "#38BDF8", fontWeight: 700, textDecoration: "none" }}>+91 7305771789</a>
              </span>
              <span>•</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                ✉️ <a href="mailto:enterprise@zentrion.dev" style={{ color: "#38BDF8", fontWeight: 700, textDecoration: "none" }}>enterprise@zentrion.dev</a>
              </span>
              <span>•</span>
              <span style={{ color: "#64748B" }}>Mon–Sat 9AM–9PM IST</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
