import Link from "next/link";

export const metadata = {
  title: "For Colleges & Universities",
  description: "Deploy Zentrion across your campus. Cohort management, AI-powered labs, bulk invitations, skills-gap analytics, and audit-ready compliance reports for universities and colleges.",
};

const FEATURES = [
  {
    icon: "🏛️",
    color: "#0891B2",
    colorSubtle: "rgba(34,211,238,0.12)",
    colorBorder: "rgba(34,211,238,0.25)",
    title: "Organisation Portals",
    desc: "Tenant-isolated portals for departments, faculties, and cohorts with your own branding, domain, and SSO configuration.",
  },
  {
    icon: "👥",
    color: "#6366F1",
    colorSubtle: "rgba(129,140,248,0.12)",
    colorBorder: "rgba(129,140,248,0.25)",
    title: "Cohort Management",
    desc: "Group learners by batch or programme, assign customised curricula, set completion deadlines, and track progress at scale.",
  },
  {
    icon: "📨",
    color: "#9333EA",
    colorSubtle: "rgba(192,132,252,0.12)",
    colorBorder: "rgba(192,132,252,0.25)",
    title: "Bulk Invitations",
    desc: "Invite entire cohorts via CSV import. Students join instantly with pre-provisioned accounts and course assignments.",
  },
  {
    icon: "📊",
    color: "#10B981",
    colorSubtle: "rgba(16,185,129,0.12)",
    colorBorder: "rgba(16,185,129,0.25)",
    title: "Skills-Gap Analytics",
    desc: "Aggregate skill evidence across cohorts. Identify where students excel and where the programme needs reinforcement.",
  },
  {
    icon: "📋",
    color: "#F59E0B",
    colorSubtle: "rgba(245,158,11,0.12)",
    colorBorder: "rgba(245,158,11,0.25)",
    title: "Audit-Ready Reports",
    desc: "Exportable completion, assessment, and competency reports built for NAAC, NBA, and accreditation requirements.",
  },
  {
    icon: "🎬",
    color: "#F472B6",
    colorSubtle: "rgba(244,114,182,0.12)",
    colorBorder: "rgba(244,114,182,0.25)",
    title: "Instructor Studio",
    desc: "Course creation, grading workflows, live session hosting, and project rubric management — all in one integrated studio.",
  },
  {
    icon: "🔬",
    color: "#0891B2",
    colorSubtle: "rgba(34,211,238,0.12)",
    colorBorder: "rgba(34,211,238,0.25)",
    title: "In-Browser Labs",
    desc: "Sandboxed terminals for cybersecurity, AI, and data science — no infrastructure procurement or lab maintenance needed.",
  },
  {
    icon: "🤖",
    color: "#6366F1",
    colorSubtle: "rgba(129,140,248,0.12)",
    colorBorder: "rgba(129,140,248,0.25)",
    title: "AI-Powered Tutor",
    desc: "Context-aware AI tutor that adapts to each student's progress, answers questions, and identifies learning gaps automatically.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Scope the Programme",
    desc: "Work with our curriculum team to select courses, labs, and learning paths that map to your syllabus outcomes and AICTE/UGC requirements.",
  },
  {
    n: "02",
    title: "Provision Learners",
    desc: "Bulk-invite students and faculty via CSV. Organise into cohorts, departments, and year groups. Pre-configure course assignments.",
  },
  {
    n: "03",
    title: "Launch & Teach",
    desc: "Run live classes, assign projects, conduct quizzes, and host AI-lab sessions directly on the platform — no external tools needed.",
  },
  {
    n: "04",
    title: "Measure & Report",
    desc: "Track completion, assess skills gaps, and export detailed reports for faculty reviews, Board meetings, and accreditation audits.",
  },
];

const TESTIMONIALS = [
  {
    quote: "Zentrion reduced our lab infrastructure cost by 60% while improving student engagement metrics by 3x. The skills-gap analytics are invaluable for curriculum planning.",
    name: "Dr. Meera S.",
    role: "HoD — Computer Science, SRM University",
    initials: "MS",
    color: "#6366F1",
  },
  {
    quote: "We deployed Zentrion for 2,500 students in under a week. The cohort management is seamless, and students love the AI tutor for after-hours support.",
    name: "Prof. Rajiv N.",
    role: "Dean — Technology, Manipal Institute",
    initials: "RN",
    color: "#0891B2",
  },
  {
    quote: "Our placement rate jumped from 72% to 91% after integrating Zentrion's AI and Cybersecurity tracks. The certificates are recognised by our top hiring partners.",
    name: "Dr. Kavitha P.",
    role: "Director — NIIT University",
    initials: "KP",
    color: "#9333EA",
  },
];

const STATS = [
  { value: "50+", label: "Partner Institutions" },
  { value: "Scalable", label: "Avg Students/Campus" },
  { value: "40%", label: "Placement Rate Lift" },
  { value: "60%", label: "Lab Cost Reduction" },
];

export default function ForCollegesPage() {
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
          background: "radial-gradient(ellipse 70% 50% at 50% -5%, rgba(34, 211, 238, 0.18), transparent 70%), radial-gradient(circle at 80% 60%, rgba(99, 102, 241, 0.08), transparent 50%)",
        }}
      >
        <div className="hero-grid-bg" style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.35 }} />
        <div className="animate-float" style={{ position: "absolute", top: "10%", left: "5%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(34, 211, 238, 0.1), transparent 70%)", zIndex: 0, pointerEvents: "none" }} />
        <div className="animate-float-medium" style={{ position: "absolute", top: "20%", right: "8%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(99, 102, 241, 0.08), transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#64748B", marginBottom: "2rem" }}>
            <Link href="/" style={{ color: "#64748B", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span style={{ color: "#94A3B8" }}>For Colleges</span>
          </div>

          <div className="section-eyebrow" style={{ display: "inline-flex", marginBottom: "1.5rem" }}>
            <span>🎓</span> For Colleges & Universities
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(24rem, 1fr))", gap: "4rem", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "1.25rem" }}>
                Transform Your
                <br />
                Campus with{" "}
                <span style={{ background: "linear-gradient(135deg, #22D3EE 0%, #818CF8 60%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  AI-Powered
                </span>{" "}
                Learning
              </h1>
              <p style={{ fontSize: "1.1rem", color: "#94A3B8", lineHeight: 1.7, marginBottom: "2rem", maxWidth: "36rem" }}>
                Run entire degree programmes, specialisations, and placement training on one platform — with tenant isolation, cohort management, AI labs, and NAAC/NBA-ready compliance reports.
              </p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
                <a href="https://wa.me/917305771789?text=Hello%2C%20I%27m%20interested%20in%20Zentrion%20for%20our%20college" target="_blank" rel="noopener noreferrer"
                  style={{ padding: "0.9rem 1.75rem", borderRadius: "0.75rem", background: "linear-gradient(135deg, #22D3EE, #6366F1)", color: "#fff", fontWeight: 700, textDecoration: "none", boxShadow: "0 0 25px rgba(34,211,238,0.35)", fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                  💬 Book a Campus Demo
                </a>
                <Link href="/contact"
                  style={{ padding: "0.9rem 1.75rem", borderRadius: "0.75rem", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#F8FAFC", fontWeight: 600, textDecoration: "none", fontSize: "0.95rem" }}>
                  Request Proposal
                </Link>
              </div>
              <p style={{ color: "#64748B", fontSize: "0.85rem" }}>
                ✅ No infrastructure investment &nbsp;·&nbsp; ✅ NAAC/NBA reporting ready &nbsp;·&nbsp; ✅ Deploy in &lt;1 week
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              {STATS.map((s) => (
                <div key={s.label} className="holo-card" style={{ padding: "2rem", textAlign: "center" }}>
                  <div className="stat-number" style={{ color: "#0891B2", marginBottom: "0.4rem" }}>{s.value}</div>
                  <div style={{ color: "#64748B", fontSize: "0.8rem", fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ============================================================ */}
      {/* FEATURES GRID                                                 */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "#0A0F1D" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "44rem", margin: "0 auto 3.5rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Platform Features</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0.75rem" }}>Built for Institutions at Scale</h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem", lineHeight: 1.65 }}>Every feature purpose-built for academic environments — from single departments to 10,000-student campuses.</p>
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
      {/* HOW IT WORKS (Timeline)                                       */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "#ffffff", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container" style={{ maxWidth: "56rem" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Deployment Process</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0.75rem" }}>Go Live in 4 Simple Steps</h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem" }}>From contract signing to full deployment in under a week.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {STEPS.map((step, i) => (
              <div key={step.n} className="timeline-step" style={{ paddingBottom: i < STEPS.length - 1 ? "2.5rem" : 0 }}>
                <div className="timeline-num" style={{ fontSize: "0.85rem" }}>{step.n}</div>
                <div style={{ paddingTop: "0.75rem" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.5rem" }}>{step.title}</h3>
                  <p style={{ color: "#94A3B8", fontSize: "0.95rem", lineHeight: 1.65, margin: 0, maxWidth: "44rem" }}>{step.desc}</p>
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
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>What Institutions Say</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0" }}>Trusted by Educators Nationwide</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))", gap: "1.5rem" }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="testimonial-card">
                <div style={{ color: "#6366F1", fontSize: "2rem", lineHeight: 1, marginBottom: "1rem" }}>"</div>
                <p style={{ color: "#E2E8F0", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "1.5rem", fontStyle: "italic" }}>{t.quote}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.95rem", boxShadow: `0 0 15px ${t.color}55` }}>
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
      {/* CURRICULUM PACKAGES                                           */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "#ffffff", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Curriculum Tracks</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0.75rem" }}>Pre-Built Tracks for Your Syllabus</h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem" }}>Industry-aligned tracks mapped to AICTE, UGC, and NEP 2020 frameworks.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))", gap: "1.25rem" }}>
            {[
              { title: "Artificial Intelligence & ML", icon: "🤖", courses: 120, duration: "4 semesters", badge: "AICTE Approved" },
              { title: "Cybersecurity & Ethical Hacking", icon: "🛡️", courses: 85, duration: "2 semesters", badge: "Industry Aligned" },
              { title: "Data Science & Analytics", icon: "📊", courses: 95, duration: "3 semesters", badge: "Placement Ready" },
              { title: "Prompt Engineering & GenAI", icon: "⚡", courses: 60, duration: "1 semester", badge: "2026 Trending" },
              { title: "Full-Stack & Cloud Dev", icon: "🌐", courses: 110, duration: "4 semesters", badge: "Project Based" },
              { title: "AI Agents & Automation", icon: "🔄", courses: 70, duration: "2 semesters", badge: "Enterprise Ready" },
            ].map((track) => (
              <div key={track.title} className="holo-card" style={{ padding: "1.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <span style={{ fontSize: "1.75rem" }}>{track.icon}</span>
                  <span style={{ padding: "0.2rem 0.55rem", borderRadius: "9999px", background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.25)", color: "#0891B2", fontSize: "0.7rem", fontWeight: 700 }}>
                    {track.badge}
                  </span>
                </div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.75rem" }}>{track.title}</h3>
                <div style={{ display: "flex", gap: "1.25rem", fontSize: "0.82rem", color: "#94A3B8" }}>
                  <span>📚 {track.courses} lessons</span>
                  <span>⏱️ {track.duration}</span>
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
          <div style={{ textAlign: "center", padding: "4.5rem 2rem", borderRadius: "1.5rem", background: "linear-gradient(135deg, rgba(34,211,238,0.12), rgba(99,102,241,0.1))", border: "1px solid rgba(34,211,238,0.3)", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
            <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, color: "#FFFFFF", marginBottom: "1rem" }}>
              Ready to Transform Your Campus?
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem", maxWidth: "36rem", margin: "0 auto 2rem", lineHeight: 1.65 }}>
              Get a personalised campus deployment plan, curriculum mapping, and a 90-day pilot offer — completely free.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="https://wa.me/917305771789?text=Hello%2C%20I%20want%20a%20campus%20demo%20of%20Zentrion" target="_blank" rel="noopener noreferrer"
                style={{ padding: "0.9rem 2rem", borderRadius: "0.75rem", background: "linear-gradient(135deg, #22D3EE, #6366F1)", color: "#fff", fontWeight: 700, textDecoration: "none", boxShadow: "0 0 25px rgba(34,211,238,0.4)", fontSize: "1rem" }}>
                💬 Book Free Campus Demo
              </a>
              <Link href="/for-enterprises" style={{ padding: "0.9rem 2rem", borderRadius: "0.75rem", background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.15)", color: "#F8FAFC", fontWeight: 600, textDecoration: "none", fontSize: "1rem" }}>
                For Enterprises →
              </Link>
            </div>
            <p style={{ color: "#64748B", fontSize: "0.85rem", marginTop: "1.5rem" }}>
              📞 Call us: <a href="tel:+917305771789" style={{ color: "#38BDF8", fontWeight: 600, textDecoration: "none" }}>+91 7305771789</a> &nbsp;·&nbsp; Mon–Sat 9AM–9PM IST
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
