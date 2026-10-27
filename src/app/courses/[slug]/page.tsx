import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseBySlug, isEnrolled } from "@/lib/catalogue";
import { getCurrentUser } from "@/lib/auth";
import { LevelBadge } from "@/components/ui";
import { CourseArtwork, getCourseTheme } from "@/components/course-artwork";
import { formatHours, formatPrice } from "@/lib/utils";
import { EnrollButton } from "./enroll-button";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  return {
    title: course ? `${course.title} — Zentrion Learntech` : "Course not found",
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

  const totalMinutes = course.modules.reduce(
    (sum, m) => sum + m.lessons.reduce((s, l) => s + (l.durationMinutes ?? 0), 0),
    0,
  );

  return (
    <div style={{ background: "#ffffff", color: "#F8FAFC", minHeight: "100vh", padding: "2.5rem 0 5rem" }}>
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
          <h1
            style={{
              fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              marginBottom: "0.75rem",
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
            {course.subtitle || "From basics to advanced with real-world projects, including Generative AI, LLMs and AI Agents."}
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
              <span style={{ color: "#94A3B8" }}>(12,845 reviews)</span>
            </div>
            <div style={{ color: "#64748B" }}>·</div>
            <div>👥 120,000+ students</div>
            <div style={{ color: "#64748B" }}>·</div>
            <div>Created by <span style={{ color: "#6366F1", fontWeight: 600 }}>Zentrion Team</span></div>
            <div style={{ color: "#64748B" }}>·</div>
            <div>Last updated Mar 2026</div>
            <div style={{ color: "#64748B" }}>·</div>
            <div>🌐 English, Hindi + 8 more</div>
          </div>
        </div>

        {/* Main Grid: Content + Sticky Enrollment Aside */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
            gap: "2.5rem",
            alignItems: "start",
          }}
        >
          {/* Left Column */}
          <div>
            {/* Tabs Bar */}
            <div
              style={{
                display: "flex",
                gap: "1.5rem",
                borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
                marginBottom: "2rem",
                overflowX: "auto",
              }}
            >
              {[
                { name: "Overview", active: true },
                { name: "Curriculum", active: false },
                { name: "Projects", active: false },
                { name: "Instructor", active: false },
                { name: "Reviews", active: false },
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
                border: "1px solid rgba(0, 0, 0, 0.08)",
                marginBottom: "2.5rem",
              }}
            >
              <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "1.25rem" }}>
                What you&apos;ll learn
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))",
                  gap: "1rem 1.5rem",
                }}
              >
                {[
                  "Python for AI & Machine Learning",
                  "Deploy models in production",
                  "Deep Learning & Neural Networks",
                  "Work with AI Agents & Automation",
                  "Generative AI (ChatGPT, LLMs)",
                  "Prompt Engineering techniques",
                  "Build real-world AI projects",
                  "Lifetime updates & support",
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
                border: "1px solid rgba(0, 0, 0, 0.08)",
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
                  background: "rgba(99, 102, 241, 0.06)",
                  border: "1px solid rgba(99, 102, 241, 0.15)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#4338CA", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>
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
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "1.2rem 1.5rem",
                        background: "rgba(15, 23, 42, 0.4)",
                        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ color: "#6366F1", fontWeight: 700, fontSize: "0.85rem" }}>
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
                            <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.45rem", borderRadius: "0.25rem", background: "rgba(34, 211, 238, 0.06)", color: "#0891B2", fontWeight: 600 }}>
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
                background: "rgba(10, 15, 29, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(99, 102, 241, 0.12)",
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
                      background: "rgba(255, 255, 255, 0.9)",
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
                    Preview Course
                  </span>
                </div>
              </div>

              {/* Pricing & Enrolment Area */}
              <div style={{ padding: "1.75rem" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "2rem", fontWeight: 900, color: "#FFFFFF" }}>
                    {course.priceCents <= 0 ? "Free" : formatPrice(course.priceCents)}
                  </span>
                  {course.priceCents > 0 && (
                    <>
                      <span style={{ fontSize: "1.1rem", color: "#64748B", textDecoration: "line-through" }}>
                        ₹ 9,999
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.5rem",
                          borderRadius: "0.25rem",
                          background: "rgba(16, 185, 129, 0.15)",
                          color: "#10B981",
                        }}
                      >
                        80% OFF
                      </span>
                    </>
                  )}
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <EnrollButton
                    courseId={course.id}
                    priceCents={course.priceCents}
                    enrolled={enrolled}
                    slug={course.slug}
                    variant="block"
                  />
                </div>

                {/* Course Perks Checklist */}
                <div style={{ borderTop: "1px solid rgba(0, 0, 0, 0.08)", paddingTop: "1.25rem" }}>
                  <div style={{ fontWeight: 700, color: "#FFFFFF", fontSize: "0.9rem", marginBottom: "0.85rem" }}>
                    This course includes:
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.85rem", color: "#CBD5E1" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span>♾️</span> Lifetime access
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span>📚</span> 500+ lessons (80+ hours)
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span>🛠️</span> Hands-on projects
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span>💬</span> Live doubt sessions
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span>🎓</span> Certificate of completion
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span>📱</span> Mobile & TV access
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
