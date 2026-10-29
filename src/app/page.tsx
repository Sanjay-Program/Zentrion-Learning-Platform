import Link from "next/link";
import { getDb } from "@/db/client";
import { courses, categories, learningPaths, labDefinitions, liveSessions, lessons, modules, users } from "@/db/schema";
import { eq, and, sql, desc, count } from "drizzle-orm";
import { Button, Card, Badge, LevelBadge, CourseCard } from "@/components/ui";

const POPULAR_PATHS = [
  {
    title: "Artificial Intelligence",
    desc: "From basics to advanced with real-world projects",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a8 8 0 0 0-8 8c0 3.3 2 6.1 5 7.4V20a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2.6c3-1.3 5-4.1 5-7.4a8 8 0 0 0-8-8z"/>
        <line x1="9.5" y1="9" x2="9.51" y2="9"/>
        <line x1="14.5" y1="9" x2="14.51" y2="9"/>
        <path d="M10 14h4"/>
      </svg>
    ),
    href: "/courses/ai-foundations-and-fluency",
    badge: "Most Popular",
  },
  {
    title: "Prompt Engineering",
    desc: "Master AI for all fields",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5"/>
        <line x1="12" y1="19" x2="20" y2="19"/>
      </svg>
    ),
    href: "/courses/prompt-and-context-engineering",
    badge: "High Demand",
  },
  {
    title: "Cybersecurity",
    desc: "Hands-on labs & real world simulations",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <rect x="9" y="9" width="6" height="5" rx="1"/>
      </svg>
    ),
    href: "/courses/ai-cybersecurity-and-llm-security",
    badge: "Security Labs",
  },
  {
    title: "AI Agents & Automation",
    desc: "Build autonomous agents",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2"/>
        <circle cx="12" cy="5" r="2"/>
        <path d="M12 7v4"/>
        <line x1="8" y1="16" x2="8.01" y2="16"/>
        <line x1="16" y1="16" x2="16.01" y2="16"/>
      </svg>
    ),
    href: "/courses/agentic-ai-engineering",
    badge: "#1 Trend 2026",
  },
  {
    title: "Data Science",
    desc: "Analytics, ML & real projects",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    href: "/courses/build-ai-apps-apis-rag",
    badge: "Hands-on",
  },
  {
    title: "Web & App Development",
    desc: "Modern Full-stack with AI",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    href: "/courses/ai-business-automation",
    badge: "Full-Stack",
  },
];

const WHY_CHOOSE_ITEMS = [
  {
    title: "Industry-Relevant Curriculum",
    desc: "Directly mapped to 2026 enterprise AI requirements and modern tech stacks.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22D3EE" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  {
    title: "Hands-on Projects & Labs",
    desc: "Safe in-browser sandboxed terminal environments with zero external setup.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
  },
  {
    title: "Live Classes & Mentorship",
    desc: "Weekly interactive live coding, architectural reviews and live doubt solving.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C084FC" strokeWidth="2">
        <polygon points="23 7 16 12 23 17 23 7"/>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>
    ),
  },
  {
    title: "Global Certificates",
    desc: "Cryptographically verifiable certificates shareable on LinkedIn and portfolios.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
        <circle cx="12" cy="8" r="7"/>
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
      </svg>
    ),
  },
  {
    title: "Career Support & Job Assistance",
    desc: "Portfolio reviews, resume building, and direct access to enterprise hiring networks.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
    ),
  },
  {
    title: "Lifetime Access & Updates",
    desc: "Keep access forever with continuous updates as AI models and tools evolve.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="2">
        <path d="M21.5 2v6h-6"/>
        <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
      </svg>
    ),
  },
];

const REAL_PROJECTS = [
  {
    title: "AI Chatbot with RAG",
    desc: "End-to-end vector pipeline with semantic search, document ingestion, and citation synthesis.",
    diagram: "/images/lesson-diagrams/03-rag-pipeline.svg",
    badges: ["OpenAI", "LangChain", "Python", "ChromaDB"],
    href: "/courses/build-ai-apps-apis-rag",
  },
  {
    title: "Cybersecurity SOC Lab",
    desc: "Real-time threat triage simulation, packet parsing, and incident containment playbook.",
    diagram: "/images/lesson-diagrams/08-soc-investigation.svg",
    badges: ["Wireshark", "Splunk", "Linux", "Snort"],
    href: "/labs/soc-triage-sim",
  },
  {
    title: "AI Agent for Business",
    desc: "Autonomous multi-step ReAct loops with tools schema, human approvals, and CRM integrations.",
    diagram: "/images/lesson-diagrams/04-agent-lifecycle.svg",
    badges: ["AutoGPT", "CrewAI", "Python", "FastAPI"],
    href: "/courses/agentic-ai-engineering",
  },
  {
    title: "Face Recognition System",
    desc: "Deep neural network pipeline for face detection, vector embeddings, and real-time verification.",
    diagram: "/images/lesson-diagrams/01-neural-network.svg",
    badges: ["OpenCV", "TensorFlow", "Python", "Flask"],
    href: "/courses/ai-foundations-and-fluency",
  },
  {
    title: "Phishing Detection Tool",
    desc: "Heuristic and classifier defensive stack detecting spoofed links and malicious payloads.",
    diagram: "/images/lesson-diagrams/06-trust-boundaries.svg",
    badges: ["Scikit-Learn", "Python", "Streamlit", "Docker"],
    href: "/labs/prompt-injection-defense",
  },
];

const MOCKUP_TESTIMONIALS = [
  {
    quote: "The best platform to learn AI with real projects. Got my dream job as an AI Engineer!",
    name: "Rahul K.",
    role: "AI Engineer at Google",
    avatar: "/images/avatar-rahul.jpg",
  },
  {
    quote: "Amazing cybersecurity labs and hands-on training. Highly recommended!",
    name: "Sneha M.",
    role: "Security Analyst at Microsoft",
    initials: "SM",
    accent: "#8B5CF6",
  },
  {
    quote: "The AI Agent course is next level. Practical, updated and super useful!",
    name: "Arjun P.",
    role: "Product Manager at Amazon",
    initials: "AP",
    accent: "#06B6D4",
  },
];

export default async function HomePage() {
  const db = getDb();

  const featured = await db
    .select()
    .from(courses)
    .where(and(eq(courses.isFeatured, true), eq(courses.status, "published")))
    .limit(6)
    .all();

  const paths = await db
    .select()
    .from(learningPaths)
    .where(eq(learningPaths.isPublished, true))
    .limit(4)
    .all();

  const labs = await db
    .select()
    .from(labDefinitions)
    .where(eq(labDefinitions.isPublished, true))
    .limit(4)
    .all();

  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  const upcoming = await db
    .select()
    .from(liveSessions)
    .where(and(eq(liveSessions.isPublished, true), sql`${liveSessions.startsAt} > ${now}`))
    .orderBy(desc(liveSessions.startsAt))
    .limit(3)
    .all();

  const [courseCount, lessonCount, userCount] = await Promise.all([
    db.select({ n: count(courses.id) }).from(courses).where(eq(courses.status, "published")).get() as Promise<{ n: number }>,
    db.select({ n: count(lessons.id) }).from(lessons).get() as Promise<{ n: number }>,
    db.select({ n: count(users.id) }).from(users).get() as Promise<{ n: number }>,
  ]);

  return (
    <div style={{ background: "var(--bg, #ffffff)", color: "var(--text, #0f172a)", minHeight: "100vh", transition: "background 0.2s ease, color 0.2s ease" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            name: "Zentrion Learntech",
            url: process.env.APP_BASE_URL || "https://zentrion.example.com",
            description:
              "Integrated AI and practical-skills learning platform with courses, labs, and projects.",
            sameAs: [],
          }),
        }}
      />
      {/* ======================================================== */}
      {/* 1. HERO SECTION (Mockup Left Text + Right Hologram Card) */}
      {/* ======================================================== */}
      <section
        style={{
          position: "relative",
          padding: "4rem 0 5rem",
          overflow: "hidden",
          background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99, 102, 241, 0.08), transparent 75%), radial-gradient(circle at 85% 30%, rgba(34, 211, 238, 0.06), transparent 50%)",
        }}
      >
        {/* Hero grid bg */}
        <div className="hero-grid-bg" style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.4 }} />
        {/* Floating decorative orbs */}
        <div className="animate-float" style={{ position: "absolute", top: "5%", left: "3%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99, 102, 241, 0.06), transparent 70%)", zIndex: 0, pointerEvents: "none" }} />
        <div className="animate-float-medium" style={{ position: "absolute", bottom: "10%", right: "5%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(34, 211, 238, 0.06), transparent 70%)", zIndex: 0, pointerEvents: "none" }} />
        <div className="animate-float-fast" style={{ position: "absolute", top: "40%", left: "45%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(192, 132, 252, 0.05), transparent 70%)", zIndex: 0, pointerEvents: "none" }} />
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))",
              gap: "3.5rem",
              alignItems: "center",
            }}
          >
            {/* Left Content */}
            <div>
              {/* Badge */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.4rem 1rem",
                    borderRadius: "9999px",
                    background: "rgba(99, 102, 241, 0.08)",
                    border: "1px solid rgba(129, 140, 248, 0.4)",
                    color: "#4338CA",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    boxShadow: "0 0 15px rgba(99, 102, 241, 0.08)",
                  }}
                >
                  <span style={{ color: "#6366F1" }}>✦</span> #1 AI & Cybersecurity Learning Platform
                </span>
              </div>

              {/* Heading */}
              <h1
                style={{
                  fontSize: "clamp(2.5rem, 5.2vw, 4.2rem)",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                  marginBottom: "1.5rem",
                  color: "#FFFFFF",
                }}
              >
                Learn Today<br />
                Build Tomorrow<br />
                <span
                  style={{
                    background: "linear-gradient(135deg, #22D3EE 0%, #818CF8 50%, #C084FC 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  with AI
                </span>
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: "1.125rem",
                  lineHeight: 1.65,
                  color: "#94A3B8",
                  maxWidth: "34rem",
                  marginBottom: "2rem",
                }}
              >
                Master Artificial Intelligence, Cybersecurity, Prompt Engineering and Future Tech with real-world projects, expert mentors and industry-recognized certificates.
              </p>

              {/* CTA Buttons */}
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", marginBottom: "2.5rem" }}>
                <Link
                  href="/courses"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.9rem 1.8rem",
                    borderRadius: "0.75rem",
                    background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "1rem",
                    textDecoration: "none",
                    boxShadow: "0 0 25px rgba(99, 102, 241, 0.2)",
                    transition: "all 0.2s ease",
                  }}
                >
                  Explore Courses &gt;
                </Link>
                <Link
                  href="/live"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.9rem 1.8rem",
                    borderRadius: "0.75rem",
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#F8FAFC",
                    fontWeight: 600,
                    fontSize: "1rem",
                    textDecoration: "none",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <span
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.15)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                    }}
                  >
                    ▶
                  </span>
                  Watch Video
                </Link>
              </div>

              {/* 4-Stat Strip */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "0.75rem",
                  padding: "1rem 1.25rem",
                  background: "rgba(10, 15, 29, 0.75)",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  borderRadius: "1rem",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div>
                  <div className="stat-number" style={{ color: "#FFFFFF", fontSize: "1.4rem" }}>Growing</div>
                  <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>Learners</div>
                </div>
                <div>
                  <div className="stat-number" style={{ color: "#0891B2", fontSize: "1.4rem" }}>7+</div>
                  <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>Hands-on Projects</div>
                </div>
                <div>
                  <div className="stat-number" style={{ color: "#6366F1", fontSize: "1.4rem" }}>50+</div>
                  <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>Industry Experts</div>
                </div>
                <div>
                  <div className="stat-number" style={{ color: "#10B981", fontSize: "1.4rem" }}>High</div>
                  <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>Job Success</div>
                </div>
              </div>
            </div>

            {/* Right Hologram Hero Graphic Container */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "relative",
                  borderRadius: "1.5rem",
                  overflow: "hidden",
                  border: "1px solid rgba(99, 102, 241, 0.12)",
                  boxShadow: "0 20px 60px -15px rgba(99, 102, 241, 0.12), 0 0 40px rgba(34, 211, 238, 0.1)",
                  background: "#0A0F1D",
                }}
              >
                <img
                  src="/images/hero-learner.jpg"
                  alt="Zentrion AI Future Tech Learner"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    objectFit: "cover",
                  }}
                />

                {/* Overlaid Floating HUD Card 1: Left */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "1.25rem",
                    left: "1.25rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.75rem",
                    background: "rgba(10, 15, 29, 0.85)",
                    border: "1px solid rgba(34, 211, 238, 0.15)",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
                    maxWidth: "14rem",
                  }}
                >
                  <div style={{ fontSize: "0.7rem", color: "#0891B2", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Workflow
                  </div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#FFFFFF", marginTop: "2px" }}>
                    Prompt · Create · Innovate · Deploy
                  </div>
                </div>

                {/* Overlaid Floating HUD Card 2: Right */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "1.25rem",
                    right: "1.25rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.75rem",
                    background: "rgba(10, 15, 29, 0.85)",
                    border: "1px solid rgba(192, 132, 252, 0.25)",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <div style={{ fontSize: "0.7rem", color: "#9333EA", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Career Path
                  </div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#FFFFFF", marginTop: "2px" }}>
                    From Learner to Creator
                  </div>
                </div>

                {/* Overlaid Top AI Badge */}
                <div
                  style={{
                    position: "absolute",
                    top: "1.25rem",
                    right: "1.25rem",
                    width: "48px",
                    height: "48px",
                    borderRadius: "0.75rem",
                    background: "rgba(10, 15, 29, 0.8)",
                    border: "1px solid rgba(99, 102, 241, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: "1.1rem",
                    color: "#0891B2",
                    boxShadow: "0 0 15px rgba(34, 211, 238, 0.2)",
                  }}
                >
                  AI
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. POPULAR LEARNING PATHS (6 Glowing Cards)               */}
      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* 1.5 TRUST / BRANDS MARQUEE                              */}
      {/* ======================================================== */}
      <section style={{ padding: "2.5rem 0", background: "rgba(10, 15, 29, 0.8)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container">
          <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#475569", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.5rem" }}>Trusted by learners from</p>
          <div className="marquee-container">
            <div className="marquee-track">
              {[
                "Google", "Microsoft", "Amazon", "Infosys", "TCS", "Wipro", "Accenture", "IBM", "Deloitte", "HCL",
                "Zoho", "Freshworks", "Swiggy", "Razorpay", "PhonePe", "CRED", "Groww", "Meesho", "Ola", "Byju's",
                "Google", "Microsoft", "Amazon", "Infosys", "TCS", "Wipro", "Accenture", "IBM", "Deloitte", "HCL",
                "Zoho", "Freshworks", "Swiggy", "Razorpay", "PhonePe", "CRED", "Groww", "Meesho", "Ola", "Byju's"
              ].map((brand, i) => (
                <span key={`${brand}-${i}`} className="marquee-item" style={{ padding: "0.4rem 1.25rem", borderRadius: "9999px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#64748B", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.02em" }}>
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "5rem 0", background: "#ffffff" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div className="section-eyebrow" style={{ display: "inline-flex", marginBottom: "0.75rem" }}>🛤️ Career Paths</div>
              <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 0.5rem" }}>
                Popular Learning Paths
              </h2>
              <p style={{ color: "#94A3B8", fontSize: "1.05rem", margin: 0 }}>
                Choose a path, gain in-demand skills, and build real projects for your future career.
              </p>
            </div>
            <Link
              href="/courses"
              style={{
                color: "#6366F1",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(129, 140, 248, 0.25)",
              }}
            >
              View All →
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(17rem, 1fr))",
              gap: "1.5rem",
            }}
          >
            {POPULAR_PATHS.map((path) => (
              <Link
                key={path.title}
                href={path.href}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  className="glass-card-hover"
                  style={{
                    position: "relative",
                    padding: "1.75rem",
                    borderRadius: "1rem",
                    background: "rgba(10, 15, 29, 0.7)",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                    <div
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "0.75rem",
                        background: "rgba(99, 102, 241, 0.06)",
                        border: "1px solid rgba(99, 102, 241, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {path.icon}
                    </div>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        padding: "0.25rem 0.6rem",
                        borderRadius: "9999px",
                        background: "rgba(34, 211, 238, 0.06)",
                        color: "#0891B2",
                        border: "1px solid rgba(34, 211, 238, 0.1)",
                      }}
                    >
                      {path.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.5rem" }}>
                    {path.title}
                  </h3>
                  <p style={{ color: "#94A3B8", fontSize: "0.9rem", lineHeight: 1.5, margin: 0, flex: 1 }}>
                    {path.desc}
                  </p>
                  <div style={{ marginTop: "1.25rem", color: "#6366F1", fontSize: "0.85rem", fontWeight: 600 }}>
                    Start learning →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. WHY CHOOSE ZENTRION LEARNTECH? (6 Benefit Cards)       */}
      {/* ======================================================== */}
      <section style={{ padding: "5rem 0", background: "#0A0F1D", borderTop: "1px solid rgba(0, 0, 0, 0.06)", borderBottom: "1px solid rgba(0, 0, 0, 0.06)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "42rem", margin: "0 auto 3.5rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex", marginBottom: "0.75rem" }}>✨ Why Us</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 0.75rem" }}>
              Why Choose Zentrion Learntech?
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem", margin: 0 }}>
              Built specifically for modern engineers, security specialists, and creators who need verifiable results.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))",
              gap: "1.5rem",
            }}
          >
            {WHY_CHOOSE_ITEMS.map((item) => (
              <div
                key={item.title}
                style={{
                  padding: "1.75rem",
                  borderRadius: "1rem",
                  background: "rgba(6, 9, 19, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.07)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1.25rem",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "0.75rem",
                    background: "rgba(99, 102, 241, 0.08)",
                    border: "1px solid rgba(99, 102, 241, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.35rem" }}>
                    {item.title}
                  </h3>
                  <p style={{ color: "#94A3B8", fontSize: "0.875rem", lineHeight: 1.5, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. REAL PROJECTS. REAL SKILLS. REAL CAREERS. (5 Cards)     */}
      {/* ======================================================== */}
      <section style={{ padding: "5rem 0", background: "#ffffff" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "42rem", margin: "0 auto 3rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex", marginBottom: "0.75rem" }}>🚀 Portfolio Projects</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 0.75rem" }}>
              Real Projects. Real Skills. Real Careers.
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem", margin: 0 }}>
              Work on industry-grade projects and build a portfolio that gets you hired.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))",
              gap: "1.5rem",
            }}
          >
            {REAL_PROJECTS.map((proj) => (
              <div
                key={proj.title}
                style={{
                  borderRadius: "1rem",
                  background: "rgba(10, 15, 29, 0.8)",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s ease, border-color 0.2s ease",
                }}
              >
                {/* Visual diagram preview */}
                <div
                  style={{
                    height: "140px",
                    background: "rgba(255, 255, 255, 0.03)",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "1rem",
                  }}
                >
                  <img
                    src={proj.diagram}
                    alt={proj.title}
                    style={{
                      maxHeight: "100%",
                      maxWidth: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>

                <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flex: 1 }}>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.5rem" }}>
                    {proj.title}
                  </h3>
                  <p style={{ color: "#94A3B8", fontSize: "0.875rem", lineHeight: 1.5, margin: "0 0 1.25rem", flex: 1 }}>
                    {proj.desc}
                  </p>

                  {/* Tech stack badge pills */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.25rem" }}>
                    {proj.badges.map((b) => (
                      <span
                        key={b}
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          padding: "0.2rem 0.55rem",
                          borderRadius: "0.35rem",
                          background: "rgba(99, 102, 241, 0.08)",
                          color: "#4338CA",
                          border: "1px solid rgba(99, 102, 241, 0.08)",
                        }}
                      >
                        {b}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={proj.href}
                    style={{
                      color: "#0891B2",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    Build this project →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. FEATURED COURSES FROM DATABASE                        */}
      {/* ======================================================== */}
      {featured.length > 0 && (
        <section style={{ padding: "4rem 0", background: "#0A0F1D" }}>
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <div>
                <h2 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 0.35rem" }}>
                  Featured Certification Programs
                </h2>
                <p style={{ color: "#94A3B8", fontSize: "0.95rem", margin: 0 }}>
                  Structured courses with in-depth modules and hands-on capstone evaluation.
                </p>
              </div>
              <Link href="/courses" style={{ color: "#6366F1", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}>
                Browse All ({courseCount.n}) →
              </Link>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(19rem, 1fr))",
                gap: "1.5rem",
              }}
            >
              {featured.map((c) => (
                <CourseCard
                  key={c.id}
                  slug={c.slug}
                  title={c.title}
                  subtitle={c.subtitle}
                  level={c.level}
                  hours={c.estimatedHours}
                  priceCents={c.priceCents}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 6. LOVED BY Growing LEARNERS WORLDWIDE (Testimonials)     */}
      {/* ======================================================== */}
      <section style={{ padding: "5rem 0", background: "#ffffff", borderTop: "1px solid rgba(0, 0, 0, 0.06)" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div className="section-eyebrow" style={{ display: "inline-flex", marginBottom: "0.75rem" }}>💬 Testimonials</div>
              <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 0.5rem" }}>
                Loved by Growing Learners Worldwide
              </h2>
              <p style={{ color: "#94A3B8", fontSize: "1.05rem", margin: 0 }}>
                Real stories from engineers, analysts, and tech leads who transformed their careers.
              </p>
            </div>
            <Link
              href="/community"
              style={{
                color: "#6366F1",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(129, 140, 248, 0.25)",
              }}
            >
              View All Reviews →
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))",
              gap: "1.5rem",
            }}
          >
            {MOCKUP_TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                style={{
                  padding: "2rem",
                  borderRadius: "1rem",
                  background: "rgba(10, 15, 29, 0.7)",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <div style={{ color: "#6366F1", fontSize: "1.8rem", lineHeight: 1, marginBottom: "0.75rem" }}>“</div>
                <p style={{ color: "#E2E8F0", fontSize: "1rem", lineHeight: 1.6, margin: "0 0 1.5rem", flex: 1 }}>
                  {t.quote}
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                  {t.avatar ? (
                    <img
                      src={t.avatar}
                      alt={t.name}
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #6366F1",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: t.accent || "#8B5CF6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFFFFF",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        boxShadow: `0 0 15px ${t.accent || "#8B5CF6"}55`,
                      }}
                    >
                      {t.initials}
                    </div>
                  )}

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

      {/* ======================================================== */}
      {/* 7. LIVE SESSIONS & ENTERPRISE SECTION                     */}
      {/* ======================================================== */}
      {upcoming.length > 0 && (
        <section style={{ padding: "4rem 0", background: "#0A0F1D", borderTop: "1px solid rgba(0, 0, 0, 0.06)" }}>
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <div>
                <span style={{ color: "#EF4444", fontWeight: 700, fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", display: "inline-block" }}></span>
                  LIVE MASTERCLASSES
                </span>
                <h2 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#FFFFFF", margin: "0.35rem 0 0" }}>
                  Join Upcoming Live Interactive Sessions
                </h2>
              </div>
              <Link href="/live" style={{ color: "#6366F1", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}>
                Enter Live Studio →
              </Link>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))",
                gap: "1.5rem",
              }}
            >
              {upcoming.map((s) => (
                <div
                  key={s.id}
                  style={{
                    padding: "1.5rem",
                    borderRadius: "1rem",
                    background: "rgba(6, 9, 19, 0.8)",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "0.25rem", background: "rgba(239, 68, 68, 0.15)", color: "#F87171", fontWeight: 600 }}>
                    Live Workshop
                  </span>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#FFFFFF", marginTop: "0.75rem", marginBottom: "0.5rem" }}>
                    {s.title}
                  </h3>
                  <p style={{ color: "#94A3B8", fontSize: "0.85rem", margin: "0 0 1rem" }}>
                    {new Date(s.startsAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                  <Link
                    href="/live"
                    style={{
                      display: "inline-block",
                      padding: "0.5rem 1rem",
                      borderRadius: "0.5rem",
                      background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                      color: "#fff",
                      textDecoration: "none",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    Join Live Stream
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 8. BOTTOM CALL TO ACTION BANNER                          */}
      {/* ======================================================== */}
      <section style={{ padding: "5rem 0", background: "#ffffff" }}>
        <div className="container">
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              borderRadius: "1.5rem",
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(34, 211, 238, 0.06) 100%)",
              border: "1px solid rgba(99, 102, 241, 0.12)",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
            }}
          >
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 900, color: "#FFFFFF", margin: "0 0 1rem" }}>
              Ready to Build Your AI & Cyber Future?
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "1.1rem", maxWidth: "36rem", margin: "0 auto 2rem" }}>
              Join Growing engineers mastering autonomous agents, prompt architectures, and hands-on defense labs.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/auth/sign-up"
                style={{
                  padding: "0.9rem 2rem",
                  borderRadius: "0.75rem",
                  background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textDecoration: "none",
                  boxShadow: "0 0 25px rgba(99, 102, 241, 0.2)",
                }}
              >
                Get Started Free
              </Link>
              <Link
                href="/courses"
                style={{
                  padding: "0.9rem 2rem",
                  borderRadius: "0.75rem",
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#F8FAFC",
                  fontWeight: 600,
                  fontSize: "1rem",
                  textDecoration: "none",
                }}
              >
                Browse Curriculum
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
