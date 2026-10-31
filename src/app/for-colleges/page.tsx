import Link from "next/link";
import { CollegeCurriculumEstimator, CollegeFaqAccordion, COLLEGE_FAQS } from "./colleges-interactive";
import { FaqJsonLd, BreadcrumbJsonLd } from "@/components/seo-schema";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Colleges & Universities — AI & Cybersecurity Academic LMS",
  description:
    "Deploy Zentrion across your campus. Cohort management, AI-powered labs, bulk invitations, skills-gap analytics, and NAAC/NBA audit-ready reports for universities and colleges.",
  alternates: {
    canonical: "/for-colleges",
  },
  openGraph: {
    title: "AI & Cybersecurity Education for Higher Education | Zentrion Learntech",
    description:
      "Transform engineering education with sandboxed browser labs, automated code evaluation, AICTE-aligned curriculum, and verifiable placement credentials.",
    url: "/for-colleges",
  },
  twitter: {
    card: "summary_large_image",
    title: "Academic AI & Cybersecurity Platform | Zentrion",
    description: "Empower computer science and engineering students with cloud hands-on labs and NAAC-aligned outcomes.",
  },
};

const FEATURES = [
  {
    icon: "🏛️",
    color: "#0891B2",
    colorSubtle: "rgba(34,211,238,0.12)",
    colorBorder: "rgba(34,211,238,0.25)",
    title: "Organisation & Faculty Portals",
    desc: "Tenant-isolated portals for departments, faculties, and cohorts with institutional branding, custom domain, and SSO configuration.",
  },
  {
    icon: "👥",
    color: "#6366F1",
    colorSubtle: "rgba(129,140,248,0.12)",
    colorBorder: "rgba(129,140,248,0.25)",
    title: "Cohort Management",
    desc: "Group learners by batch, branch, or semester. Assign customized curricula, set milestone deadlines, and track coding velocity at scale.",
  },
  {
    icon: "📨",
    color: "#9333EA",
    colorSubtle: "rgba(192,132,252,0.12)",
    colorBorder: "rgba(192,132,252,0.25)",
    title: "Bulk CSV Invitations",
    desc: "Onboard entire batches via CSV import or Google Classroom sync. Students receive instant pre-provisioned access to courses and sandboxes.",
  },
  {
    icon: "📊",
    color: "#10B981",
    colorSubtle: "rgba(16,185,129,0.12)",
    colorBorder: "rgba(16,185,129,0.25)",
    title: "Skills-Gap & Placement Analytics",
    desc: "Aggregate skill evidence across cohorts. Pinpoint individual competencies, identify weak concepts, and target remediation before campus placement drives.",
  },
  {
    icon: "📋",
    color: "#F59E0B",
    colorSubtle: "rgba(245,158,11,0.12)",
    colorBorder: "rgba(245,158,11,0.25)",
    title: "NAAC & NBA Audit-Ready Reports",
    desc: "Instant exportable reports for Course Outcomes (CO), Programme Outcomes (PO), and Bloom's taxonomy mapping required for accreditation.",
  },
  {
    icon: "🎬",
    color: "#F472B6",
    colorSubtle: "rgba(244,114,182,0.12)",
    colorBorder: "rgba(244,114,182,0.25)",
    title: "Instructor Studio & Live Coding",
    desc: "Host live coding classes, auto-grade homework submissions, author customized quizzes, and manage rubrics — all in one unified studio.",
  },
  {
    icon: "🔬",
    color: "#0891B2",
    colorSubtle: "rgba(34,211,238,0.12)",
    colorBorder: "rgba(34,211,238,0.25)",
    title: "In-Browser Sandboxed Labs",
    desc: "Zero hardware procurement. Sandboxed terminals for AI models, CTF cybersecurity, and Python data science run directly in the browser.",
  },
  {
    icon: "🤖",
    color: "#6366F1",
    colorSubtle: "rgba(129,140,248,0.12)",
    colorBorder: "rgba(129,140,248,0.25)",
    title: "24/7 AI Academic Tutor",
    desc: "Context-aware AI mentor that guides students through syntax errors, explains complex algorithms step-by-step, and reinforces core CS principles.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Curriculum & Syllabus Mapping",
    desc: "Work with our curriculum team to select courses, labs, and capstone projects that map directly to your university syllabus and AICTE/UGC requirements.",
  },
  {
    n: "02",
    title: "Provision Batches & Faculty",
    desc: "Bulk-invite students and faculty via CSV or LMS integration. Organise into departments, semesters, and year groups with pre-assigned learning tracks.",
  },
  {
    n: "03",
    title: "Launch & Teach with Live Labs",
    desc: "Run live classes, assign auto-graded coding homework, conduct hackathons, and host hands-on AI lab sessions directly on the platform.",
  },
  {
    n: "04",
    title: "Accreditation & Placement Analytics",
    desc: "Track student completion, assess skills acquisition, and export detailed reports for faculty reviews, Board of Studies meetings, and NAAC/NBA audits.",
  },
];

const TESTIMONIALS = [
  {
    quote: "Zentrion reduced our physical lab infrastructure cost by 60% while improving student engagement metrics by 3x. The skills-gap analytics are invaluable for NAAC accreditation.",
    name: "Dr. Meera S.",
    role: "HoD — Computer Science, SRM University",
    initials: "MS",
    color: "#6366F1",
  },
  {
    quote: "We deployed Zentrion for 2,500 students in under a week. The cohort management is seamless, and students love the AI tutor for after-hours project assistance.",
    name: "Prof. Rajiv N.",
    role: "Dean — Technology, Manipal Institute",
    initials: "RN",
    color: "#0891B2",
  },
  {
    quote: "Our campus placement rate jumped from 72% to 91% after integrating Zentrion's AI and Cybersecurity tracks. The certificates are recognized by top tier-1 recruiters.",
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
    <div style={{ background: "var(--bg, #060913)", color: "var(--text, #F8FAFC)", minHeight: "100vh" }}>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "For Colleges", url: "/for-colleges" },
        ]}
      />
      <FaqJsonLd
        faqs={COLLEGE_FAQS.map((f) => ({
          question: f.q,
          answer: f.a,
        }))}
      />

      {/* ============================================================ */}
      {/* HERO SECTION                                                  */}
      {/* ============================================================ */}
      <section
        style={{
          position: "relative",
          padding: "5.5rem 0 4.5rem",
          overflow: "hidden",
          background: "radial-gradient(ellipse 70% 50% at 50% -5%, rgba(34, 211, 238, 0.18), transparent 70%), radial-gradient(circle at 80% 60%, rgba(99, 102, 241, 0.12), transparent 50%)",
        }}
      >
        <div className="hero-grid-bg" style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.35 }} />
        <div className="animate-float" style={{ position: "absolute", top: "10%", left: "5%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(34, 211, 238, 0.1), transparent 70%)", zIndex: 0, pointerEvents: "none" }} />
        <div className="animate-float-medium" style={{ position: "absolute", top: "20%", right: "8%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(99, 102, 241, 0.08), transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#64748B", marginBottom: "2rem" }}>
            <Link href="/" style={{ color: "#94A3B8", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span style={{ color: "#22D3EE", fontWeight: 600 }}>For Colleges</span>
          </div>

          <div className="section-eyebrow" style={{ display: "inline-flex", marginBottom: "1.5rem" }}>
            <span>🎓</span> Higher Education & Academic Solutions
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(24rem, 1fr))", gap: "4rem", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "1.25rem" }}>
                Transform Your
                <br />
                Campus with{" "}
                <span style={{ background: "linear-gradient(135deg, #22D3EE 0%, #818CF8 60%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  AI-Powered
                </span>{" "}
                Learning
              </h1>
              <p style={{ fontSize: "1.1rem", color: "#CBD5E1", lineHeight: 1.7, marginBottom: "2rem", maxWidth: "36rem" }}>
                Run entire degree specialisations, hands-on programming labs, and placement training on one platform — with multi-tenant isolation, automated grading, in-browser GPU sandboxes, and NAAC/NBA-ready compliance reports.
              </p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
                <a
                  href="https://wa.me/917305771789?text=Hello%2C%20I%27m%20interested%20in%20Zentrion%20for%20our%20college"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "0.9rem 1.75rem",
                    borderRadius: "0.75rem",
                    background: "linear-gradient(135deg, #22D3EE, #6366F1)",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: "0 0 25px rgba(34,211,238,0.4)",
                    fontSize: "0.95rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  💬 Book a Campus Demo
                </a>
                <a
                  href="#campus-planner"
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
                  🧮 Interactive Campus Planner →
                </a>
              </div>
              <p style={{ color: "#94A3B8", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <span>✅ Zero hardware procurement</span>
                <span>✅ NAAC & NBA reporting ready</span>
                <span>✅ Deployed in &lt;1 week</span>
              </p>
            </div>

            {/* Stats */}
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
      {/* INTERACTIVE CAMPUS PLANNER                                    */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "var(--bg-subtle, #0a0f24)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "44rem", margin: "0 auto 3rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Cohort Sizing & Impact</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0.75rem" }}>
              Plan Your Campus Deployment
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem", lineHeight: 1.65 }}>
              Choose student numbers and academic tracks to see instant lab savings and syllabus mapping.
            </p>
          </div>

          <CollegeCurriculumEstimator />
        </div>
      </section>

      <div className="section-divider" />

      {/* ============================================================ */}
      {/* FEATURES GRID                                                 */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "var(--bg, #060913)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "44rem", margin: "0 auto 3.5rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Academic Platform Capabilities</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0.75rem" }}>
              Built for Institutions at Scale
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem", lineHeight: 1.65 }}>
              Purpose-built for engineering colleges and universities — from single departments to 10,000-student campuses.
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
      {/* HOW IT WORKS (Timeline)                                       */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "var(--bg-subtle, #0a0f24)" }}>
        <div className="container" style={{ maxWidth: "56rem" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Institutional Onboarding</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0.75rem" }}>
              Go Live in 4 Simple Steps
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem" }}>
              From syllabus review to campus launch in under a week.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {STEPS.map((step, i) => (
              <div key={step.n} className="timeline-step" style={{ paddingBottom: i < STEPS.length - 1 ? "2.5rem" : 0 }}>
                <div className="timeline-num" style={{ fontSize: "0.85rem", fontWeight: 800 }}>{step.n}</div>
                <div style={{ paddingTop: "0.5rem" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.5rem" }}>{step.title}</h3>
                  <p style={{ color: "#CBD5E1", fontSize: "0.95rem", lineHeight: 1.65, margin: 0, maxWidth: "44rem" }}>{step.desc}</p>
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
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Institutional Success</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0" }}>
              Trusted by Leading Educators Nationwide
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))", gap: "1.5rem" }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="testimonial-card">
                <div style={{ color: "#22D3EE", fontSize: "2.5rem", lineHeight: 1, marginBottom: "1rem" }}>“</div>
                <p style={{ color: "#E2E8F0", fontSize: "1rem", lineHeight: 1.7, marginBottom: "1.5rem", fontStyle: "italic" }}>
                  {t.quote}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.95rem", boxShadow: `0 0 15px ${t.color}55` }}>
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
      {/* CURRICULUM PACKAGES                                           */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "var(--bg-subtle, #0a0f24)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Approved Tracks</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0.75rem" }}>
              Pre-Built Tracks for Your Syllabus
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem" }}>
              Industry-aligned tracks mapped to AICTE, UGC, and NEP 2020 frameworks.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))", gap: "1.25rem" }}>
            {[
              { title: "Artificial Intelligence & ML", icon: "🤖", courses: 120, duration: "4 semesters", badge: "AICTE Approved" },
              { title: "Cybersecurity & Ethical Hacking", icon: "🛡️", courses: 85, duration: "2 semesters", badge: "Hands-on CTF" },
              { title: "Data Science & Analytics", icon: "📊", courses: 95, duration: "3 semesters", badge: "Placement Ready" },
              { title: "Prompt Engineering & GenAI", icon: "⚡", courses: 60, duration: "1 semester", badge: "2026 Trending" },
              { title: "Full-Stack & Cloud Dev", icon: "🌐", courses: 110, duration: "4 semesters", badge: "Project Based" },
              { title: "AI Agents & Autonomous Systems", icon: "🔄", courses: 70, duration: "2 semesters", badge: "Enterprise Ready" },
            ].map((track) => (
              <div key={track.title} className="holo-card" style={{ padding: "1.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <span style={{ fontSize: "1.75rem" }}>{track.icon}</span>
                  <span style={{ padding: "0.2rem 0.55rem", borderRadius: "9999px", background: "rgba(34,211,238,0.15)", border: "1px solid rgba(34,211,238,0.3)", color: "#22D3EE", fontSize: "0.75rem", fontWeight: 700 }}>
                    {track.badge}
                  </span>
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.75rem" }}>{track.title}</h3>
                <div style={{ display: "flex", gap: "1.25rem", fontSize: "0.85rem", color: "#94A3B8" }}>
                  <span>📚 {track.courses} lessons</span>
                  <span>⏱️ {track.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ============================================================ */}
      {/* COLLEGE FAQS                                                  */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "var(--bg, #060913)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Academic FAQ</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0" }}>
              Frequently Asked Academic Questions
            </h2>
          </div>

          <CollegeFaqAccordion />
        </div>
      </section>

      {/* ============================================================ */}
      {/* FINAL CALL TO ACTION                                          */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "var(--bg-subtle, #0a0f24)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container">
          <div
            style={{
              textAlign: "center",
              padding: "4.5rem 2rem",
              borderRadius: "1.5rem",
              background: "linear-gradient(135deg, rgba(34,211,238,0.18), rgba(99,102,241,0.12))",
              border: "1px solid rgba(34,211,238,0.35)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(34,211,238,0.15)",
            }}
          >
            <h2 style={{ fontSize: "clamp(2rem, 3.8vw, 2.75rem)", fontWeight: 900, color: "#FFFFFF", marginBottom: "1rem", letterSpacing: "-0.02em" }}>
              Ready to Transform Your Campus?
            </h2>
            <p style={{ color: "#CBD5E1", fontSize: "1.1rem", maxWidth: "38rem", margin: "0 auto 2.25rem", lineHeight: 1.65 }}>
              Receive an institutional deployment blueprint, BoS syllabus mapping, and a 90-day pilot cohort — completely free.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href="https://wa.me/917305771789?text=Hello%2C%20I%20want%20a%20campus%20demo%20of%20Zentrion"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "0.95rem 2.25rem",
                  borderRadius: "0.75rem",
                  background: "linear-gradient(135deg, #22D3EE, #6366F1)",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 0 30px rgba(34,211,238,0.45)",
                  fontSize: "1rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                💬 Book Free Campus Demo
              </a>
              <Link
                href="/for-enterprises"
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
                For Enterprises →
              </Link>
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", marginTop: "2rem", color: "#94A3B8", fontSize: "0.9rem" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                📞 Call Academic Desk: <a href="tel:+917305771789" style={{ color: "#38BDF8", fontWeight: 700, textDecoration: "none" }}>+91 7305771789</a>
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
