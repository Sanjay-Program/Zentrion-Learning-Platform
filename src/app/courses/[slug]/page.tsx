import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseBySlug, isEnrolled } from "@/lib/catalogue";
import { getCurrentUser } from "@/lib/auth";
import { LevelBadge } from "@/components/ui";
import { CourseArtwork, getCourseTheme } from "@/components/course-artwork";
import { formatHours } from "@/lib/utils";
import { getCoursePricing, TRUST_PROMISES } from "@/lib/course-pricing";
import { EnrollButton } from "./enroll-button";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  return {
    title: course ? `${course.title}` : "Course not found",
    description: course?.subtitle ?? "",
  };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();
  const user = await getCurrentUser();
  const enrolled = user ? await isEnrolled(user.id, course.id) : false;
  const theme = getCourseTheme(course.slug);
  const pricing = getCoursePricing(course.slug);

  const totalMinutes = course.modules.reduce(
    (sum, m) => sum + m.lessons.reduce((s, l) => s + (l.durationMinutes ?? 0), 0),
    0,
  );

  return (
    <div style={{ background: "var(--bg, #060913)", color: "var(--text, #F8FAFC)", minHeight: "100vh", padding: "2.5rem 0 6rem" }}>
      <div className="container">
        {/* Breadcrumbs */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#94A3B8", marginBottom: "1.5rem" }}>
          <Link href="/" style={{ color: "#94A3B8", textDecoration: "none" }}>Home</Link>
          <span>/</span>
          <Link href="/courses" style={{ color: "#94A3B8", textDecoration: "none" }}>Courses</Link>
          <span>/</span>
          <span style={{ color: "#0891B2" }}>{course.title}</span>
        </div>

        {/* Top Header Banner */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.85rem" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.3rem 0.8rem",
                borderRadius: "9999px",
                background: "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.3))",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                color: "#FCA5A5",
                fontSize: "0.78rem",
                fontWeight: 800,
                letterSpacing: "0.02em",
              }}
              className="flame-pulse"
            >
              🔥 Limited Seats: Only {pricing.seatsRemaining} seats left in this cohort
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.3rem 0.8rem",
                borderRadius: "9999px",
                background: "rgba(245, 158, 11, 0.12)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                color: "#FCD34D",
                fontSize: "0.78rem",
                fontWeight: 700,
              }}
            >
              ⏳ Offer valid until 10th October only
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              marginBottom: "0.75rem",
              lineHeight: 1.25,
            }}
          >
            {course.title}
          </h1>
          <p
            style={{
              fontSize: "1.15rem",
              lineHeight: 1.6,
              color: "#94A3B8",
              maxWidth: "52rem",
              marginBottom: "1.25rem",
            }}
          >
            {course.subtitle || "From fundamentals to production-grade deployment with hands-on labs and real-world architectures."}
          </p>

          {/* Social Proof / Meta Strip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.25rem",
              flexWrap: "wrap",
              fontSize: "0.875rem",
              color: "#CBD5E1",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span style={{ color: "#FBBF24", fontWeight: 700 }}>★ 4.9</span>
              <span style={{ color: "#94A3B8" }}>(12,845 verified alumni)</span>
            </div>
            <div style={{ color: "#64748B" }}>·</div>
            <div>👥 120,000+ engineers enrolled</div>
            <div style={{ color: "#64748B" }}>·</div>
            <div>Led by <span style={{ color: "#6366F1", fontWeight: 600 }}>Zentrion AI & Security Labs</span></div>
            <div style={{ color: "#64748B" }}>·</div>
            <div>🌐 English & Hindi (Subtitles)</div>
          </div>
        </div>

        {/* Main Grid: Content + Sticky Enrollment Aside */}
        <div className="course-detail-layout">
          {/* Left Column */}
          <div>
            {/* Tabs Bar */}
            <div
              style={{
                display: "flex",
                gap: "1.5rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                marginBottom: "2rem",
                overflowX: "auto",
              }}
            >
              {[
                { name: "Overview", active: true },
                { name: "Curriculum", active: false },
                { name: "Projects", active: false },
                { name: "Certifications", active: false },
                { name: "FAQs", active: false },
              ].map((tab) => (
                <button
                  key={tab.name}
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    padding: "0.75rem 0",
                    fontSize: "0.95rem",
                    fontWeight: tab.active ? 700 : 500,
                    color: tab.active ? "#22D3EE" : "#94A3B8",
                    borderBottom: tab.active ? "2px solid #22D3EE" : "2px solid transparent",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* "What you'll learn" Card */}
            <div
              style={{
                padding: "2rem",
                borderRadius: "1rem",
                background: "rgba(10, 15, 29, 0.75)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                marginBottom: "2.5rem",
              }}
            >
              <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "1.25rem" }}>
                What you&apos;ll achieve in this course
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))",
                  gap: "1rem 1.5rem",
                }}
              >
                {[
                  "Production-grade architectures & code patterns",
                  "Verified defensive guardrails and verification checklists",
                  "Automated pipelines with frontier model orchestration",
                  "Hands-on interactive cloud labs with zero local setup",
                  "Industry portfolio capstone reviewed by senior engineers",
                  "Cryptographically signed credential with QR verification",
                  "Lifetime curriculum updates & future model refreshes",
                  "Direct access to peer community & weekly mentor office hours",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                    <span style={{ color: "#10B981", fontWeight: 800, fontSize: "1rem", lineHeight: 1.2 }}>✓</span>
                    <span style={{ color: "#E2E8F0", fontSize: "0.925rem" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* About This Course Description */}
            <div
              style={{
                padding: "2rem",
                borderRadius: "1rem",
                background: "rgba(10, 15, 29, 0.75)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                marginBottom: "2.5rem",
              }}
            >
              <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "1rem" }}>
                Course Overview & Pedagogy
              </h2>
              <p style={{ color: "#94A3B8", lineHeight: 1.7, fontSize: "0.95rem", whiteSpace: "pre-line", margin: "0 0 1.5rem" }}>
                {course.description}
              </p>

              {/* Capstone Project Card */}
              <div
                style={{
                  padding: "1.25rem 1.5rem",
                  borderRadius: "0.75rem",
                  background: "rgba(99, 102, 241, 0.08)",
                  border: "1px solid rgba(99, 102, 241, 0.2)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#818CF8", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>
                  <span>🏆</span> Capstone Portfolio Deliverable
                </div>
                <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.35rem" }}>
                  {theme.projectArtifact}
                </div>
                <p style={{ color: "#94A3B8", fontSize: "0.85rem", margin: 0 }}>
                  You will build, test, and package this complete project with industry evaluation rubrics to demonstrate in technical interviews.
                </p>
              </div>
            </div>

            {/* Curriculum Accordion */}
            <div style={{ marginBottom: "2.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
                  Course Curriculum
                </h2>
                <span style={{ color: "#94A3B8", fontSize: "0.85rem" }}>
                  {course.modules.length} Modules · {course.lessonCount} Lessons · {formatHours(course.estimatedHours)}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {course.modules.map((mod, i) => (
                  <div
                    key={mod.id}
                    style={{
                      borderRadius: "0.75rem",
                      background: "rgba(10, 15, 29, 0.75)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "1.2rem 1.5rem",
                        background: "rgba(15, 23, 42, 0.6)",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ color: "#818CF8", fontWeight: 700, fontSize: "0.85rem" }}>
                          Module {i + 1}:
                        </span>
                        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
                          {mod.title}
                        </h3>
                      </div>
                      <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
                        {mod.lessons.length} lessons
                      </span>
                    </div>

                    <div style={{ padding: "0.5rem 1.5rem" }}>
                      {mod.lessons.map((lesson, idx) => (
                        <div
                          key={lesson.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            padding: "0.75rem 0",
                            borderBottom: idx < mod.lessons.length - 1 ? "1px solid rgba(255, 255, 255, 0.04)" : "none",
                            fontSize: "0.9rem",
                          }}
                        >
                          <span style={{ color: "#0891B2", width: "20px" }}>
                            {lesson.lessonType === "video" ? "▶" : lesson.lessonType === "lab" ? "⚗" : "📄"}
                          </span>
                          <span style={{ color: "#F1F5F9", flex: 1 }}>
                            {lesson.title}
                          </span>
                          {lesson.isPreview && (
                            <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.45rem", borderRadius: "0.25rem", background: "rgba(34, 211, 238, 0.15)", color: "#22D3EE", fontWeight: 600 }}>
                              Preview
                            </span>
                          )}
                          <span style={{ color: "#64748B", fontSize: "0.8rem" }}>
                            {lesson.durationMinutes != null ? `${lesson.durationMinutes}:00` : "15:00"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Enrollment Card */}
          <aside style={{ position: "sticky", top: "5.5rem" }}>
            <div
              style={{
                borderRadius: "1.25rem",
                background: "rgba(10, 15, 29, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(99, 102, 241, 0.15)",
                overflow: "hidden",
                backdropFilter: "blur(16px)",
              }}
            >
              {/* Video Preview Container */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "200px",
                  background: "#0F172A",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CourseArtwork slug={course.slug} title={course.title} size="md" />
                
                {/* Play Button Overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(6, 9, 19, 0.45)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.95)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#6366F1",
                      fontSize: "1.25rem",
                      boxShadow: "0 0 25px rgba(255, 255, 255, 0.5)",
                      cursor: "pointer",
                    }}
                  >
                    ▶
                  </div>
                  <span style={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.85rem", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
                    Interactive Syllabus Preview
                  </span>
                </div>
              </div>

              {/* Pricing & Enrolment Area */}
              <div style={{ padding: "1.75rem" }}>
                {/* Urgency badges */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.3rem 0.65rem",
                      borderRadius: "0.4rem",
                      background: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid rgba(239, 68, 68, 0.35)",
                      color: "#F87171",
                      fontSize: "0.78rem",
                      fontWeight: 800,
                    }}
                  >
                    🔥 Limited Seats: Only {pricing.seatsRemaining} seats left in this batch
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.3rem 0.65rem",
                      borderRadius: "0.4rem",
                      background: "rgba(245, 158, 11, 0.12)",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      color: "#FBBF24",
                      fontSize: "0.76rem",
                      fontWeight: 700,
                    }}
                  >
                    ⏳ Special Offer valid until 10th October only
                  </div>
                </div>

                {/* Slashed price + Current price */}
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "2.25rem", fontWeight: 900, color: "#22D3EE" }}>
                    {pricing.formattedPrice}
                  </span>
                  <span style={{ fontSize: "1.15rem", color: "#64748B", textDecoration: "line-through", fontWeight: 600 }}>
                    {pricing.formattedOriginalPrice}
                  </span>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      padding: "0.25rem 0.6rem",
                      borderRadius: "9999px",
                      background: "rgba(16, 185, 129, 0.2)",
                      border: "1px solid rgba(16, 185, 129, 0.4)",
                      color: "#34D399",
                    }}
                  >
                    {pricing.discountPct}% OFF
                  </span>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <EnrollButton
                    courseId={course.id}
                    priceCents={pricing.price * 100}
                    enrolled={enrolled}
                    slug={course.slug}
                    variant="block"
                    label={`Claim Your Seat — ${pricing.formattedPrice}`}
                  />
                </div>

                {/* Trust Promises */}
                <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "1.25rem" }}>
                  <div style={{ fontWeight: 700, color: "#FFFFFF", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.85rem" }}>
                    Verified Buyer Protections
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem", color: "#CBD5E1" }}>
                    {TRUST_PROMISES.map((t) => (
                      <div key={t.title} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                        <span style={{ fontSize: "1.1rem", lineHeight: 1.2 }}>{t.icon}</span>
                        <div>
                          <div style={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.85rem" }}>{t.title}</div>
                          <div style={{ color: "#94A3B8", fontSize: "0.78rem" }}>{t.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Course Inclusions */}
                <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "1.25rem", marginTop: "1.25rem" }}>
                  <div style={{ fontWeight: 700, color: "#FFFFFF", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
                    Instant Enrollment Includes:
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.825rem", color: "#94A3B8" }}>
                    <div>♾️ Full lifetime access to all lessons & code</div>
                    <div>🛠️ Browser sandbox lab access (no setup needed)</div>
                    <div>🎓 Verifiable certificate with QR verification code</div>
                    <div>💬 Peer Discord community & TA support</div>
                    <div>📱 Seamless desktop, tablet & mobile experience</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Sticky Checkout Bar */}
      <div className="mobile-enroll-bar">
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
            <span style={{ fontSize: "1.35rem", fontWeight: 900, color: "#22D3EE" }}>
              {pricing.formattedPrice}
            </span>
            <span style={{ fontSize: "0.8rem", color: "#64748B", textDecoration: "line-through" }}>
              {pricing.formattedOriginalPrice}
            </span>
          </div>
          <div style={{ fontSize: "0.7rem", color: "#F87171", fontWeight: 700 }}>
            🔥 Only {pricing.seatsRemaining} seats left
          </div>
        </div>

        <Link
          href={`/checkout?course=${course.id}`}
          style={{
            padding: "0.65rem 1.25rem",
            borderRadius: "0.5rem",
            background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
            color: "#FFFFFF",
            fontSize: "0.9rem",
            fontWeight: 800,
            textDecoration: "none",
            boxShadow: "0 0 15px rgba(99, 102, 241, 0.5)",
          }}
        >
          Claim Seat →
        </Link>
      </div>
    </div>
  );
}

