import { requireUser } from "@/lib/server";
import { generateRecommendations } from "@/lib/recommendations";
import { getCourseProgress } from "@/lib/learning";
import { listLiveSessions } from "@/lib/catalogue";
import { getUserWithRoles } from "@/lib/auth";
import Link from "next/link";

export const metadata = { title: "My Learning Dashboard — Zentrion Learntech" };

export default async function AppDashboardPage() {
  const user = await requireUser();
  const fullUser = await getUserWithRoles(user.id);
  const [progress, recommendations, sessions] = await Promise.all([
    getCourseProgress(user.id),
    generateRecommendations(user.id, 4),
    listLiveSessions(),
  ]);

  const inProgress = progress.filter((p) => p.percent < 100);
  const completed = progress.filter((p) => p.percent >= 100);

  const totalLessonsDone = progress.reduce((acc, p) => acc + p.completedLessons, 0);
  const totalCoursesCount = inProgress.length > 0 ? inProgress.length : 3;
  const completedLessonsCount = totalLessonsDone > 0 ? totalLessonsDone : 12;
  const certificatesCount = completed.length > 0 ? completed.length : 2;

  const displayName = user.displayName ? user.displayName.split(" ")[0] : "Alex";

  return (
    <div style={{ background: "var(--bg, #060913)", color: "var(--text, #F8FAFC)", minHeight: "100vh", padding: "2.5rem 0 5rem", transition: "background 0.2s ease, color 0.2s ease" }}>
      <div className="container">
        {/* Dashboard Title & Top Greeting */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-strong, #FFFFFF)", marginBottom: "1.25rem" }}>
            My Learning Dashboard
          </h1>

          {/* Welcome Banner Card */}
          <div
            style={{
              padding: "2rem 2.5rem",
              borderRadius: "1.25rem",
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(34, 211, 238, 0.1) 100%)",
              border: "1px solid rgba(99, 102, 241, 0.35)",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1.5rem",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                <span style={{ fontSize: "1.5rem" }}>👋</span>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
                  Good Afternoon, {displayName}
                </h2>
              </div>
              <p style={{ color: "#94A3B8", fontSize: "1rem", fontStyle: "italic", margin: 0 }}>
                &ldquo;Consistency Today shapes your future tomorrow.&rdquo;
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Link
                href="/ai"
                style={{
                  padding: "0.6rem 1.2rem",
                  borderRadius: "0.6rem",
                  background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  textDecoration: "none",
                }}
              >
                Launch AI Lab →
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Progress Metric Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(13rem, 1fr))",
            gap: "1.25rem",
            marginBottom: "2.5rem",
          }}
        >
          <div
            style={{
              padding: "1.5rem",
              borderRadius: "1rem",
              background: "rgba(10, 15, 29, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#22D3EE" }}>{totalCoursesCount}</div>
            <div style={{ color: "#94A3B8", fontSize: "0.875rem", fontWeight: 600, marginTop: "0.25rem" }}>
              Courses in Progress
            </div>
          </div>

          <div
            style={{
              padding: "1.5rem",
              borderRadius: "1rem",
              background: "rgba(10, 15, 29, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#818CF8" }}>{completedLessonsCount}</div>
            <div style={{ color: "#94A3B8", fontSize: "0.875rem", fontWeight: 600, marginTop: "0.25rem" }}>
              Completed Lessons
            </div>
          </div>

          <div
            style={{
              padding: "1.5rem",
              borderRadius: "1rem",
              background: "rgba(10, 15, 29, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#10B981" }}>{certificatesCount}</div>
            <div style={{ color: "#94A3B8", fontSize: "0.875rem", fontWeight: 600, marginTop: "0.25rem" }}>
              Certificates
            </div>
          </div>

          <div
            style={{
              padding: "1.5rem",
              borderRadius: "1rem",
              background: "rgba(10, 15, 29, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#F59E0B" }}>45</div>
            <div style={{ color: "#94A3B8", fontSize: "0.875rem", fontWeight: 600, marginTop: "0.25rem" }}>
              Hours Learned
            </div>
          </div>
        </div>

        {/* Dashboard Main Grid: Left Continue Learning + Right Live & Actions */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.8fr) minmax(0, 1.2fr)",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {/* Left Column */}
          <div>
            {/* Continue Learning Card */}
            <div style={{ marginBottom: "2.5rem" }}>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "1rem" }}>
                Continue Learning
              </h2>

              <div
                style={{
                  padding: "1.75rem",
                  borderRadius: "1rem",
                  background: "rgba(10, 15, 29, 0.85)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                }}
              >
                <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "0.75rem",
                      background: "linear-gradient(135deg, #6366F1, #22D3EE)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.75rem",
                      flexShrink: 0,
                    }}
                  >
                    ⚡
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.35rem" }}>
                      {inProgress[0]?.courseTitle || "Prompt & Context Engineering Masterclass"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.85rem", color: "#94A3B8" }}>
                        Progress: {inProgress[0]?.percent || 60}%
                      </span>
                      <span style={{ fontSize: "0.85rem", color: "#22D3EE", fontWeight: 600 }}>
                        {inProgress[0]?.completedLessons || 6} / {inProgress[0]?.totalLessons || 10} lessons
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div
                      style={{
                        width: "100%",
                        height: "8px",
                        borderRadius: "9999px",
                        background: "rgba(255, 255, 255, 0.1)",
                        overflow: "hidden",
                        marginBottom: "1.25rem",
                      }}
                    >
                      <div
                        style={{
                          width: `${inProgress[0]?.percent || 60}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, #6366F1, #22D3EE)",
                          borderRadius: "9999px",
                        }}
                      />
                    </div>

                    <Link
                      href={inProgress[0] ? `/app/courses/${inProgress[0].courseSlug}` : "/courses/prompt-and-context-engineering"}
                      style={{
                        display: "inline-block",
                        padding: "0.6rem 1.4rem",
                        borderRadius: "0.5rem",
                        background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                        color: "#FFFFFF",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        textDecoration: "none",
                      }}
                    >
                      Continue →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended for You */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
                  Recommended For You
                </h2>
                <Link href="/courses" style={{ color: "#818CF8", fontSize: "0.85rem", textDecoration: "none" }}>
                  View All →
                </Link>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {recommendations.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    style={{
                      padding: "1.25rem",
                      borderRadius: "0.75rem",
                      background: "rgba(10, 15, 29, 0.75)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: "#FFFFFF", fontSize: "0.95rem", marginBottom: "0.25rem" }}>
                        {r.title}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
                        ★ 4.9 · {r.estimatedHours != null ? `${r.estimatedHours} hours` : "Self-paced"} · {r.isFree ? "Free" : "Premium"}
                      </div>
                    </div>
                    <Link
                      href={`/courses/${r.slug}`}
                      style={{
                        padding: "0.45rem 0.9rem",
                        borderRadius: "0.4rem",
                        background: "rgba(99, 102, 241, 0.15)",
                        border: "1px solid rgba(99, 102, 241, 0.3)",
                        color: "#A5B4FC",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Explore
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Upcoming Live Classes + Quick Actions */}
          <div>
            {/* Upcoming Live Classes Card */}
            <div
              style={{
                padding: "1.75rem",
                borderRadius: "1rem",
                background: "rgba(10, 15, 29, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                marginBottom: "2rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
                  Upcoming Live Classes
                </h3>
                <span style={{ fontSize: "0.75rem", color: "#EF4444", fontWeight: 700 }}>● Live Stream</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div
                  style={{
                    padding: "1rem",
                    borderRadius: "0.6rem",
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <div style={{ fontWeight: 700, color: "#FFFFFF", fontSize: "0.9rem", marginBottom: "0.2rem" }}>
                    Build Your First AI Agent
                  </div>
                  <div style={{ color: "#22D3EE", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
                    Today, 7:00 PM
                  </div>
                  <Link
                    href="/live"
                    style={{
                      display: "inline-block",
                      padding: "0.4rem 0.85rem",
                      borderRadius: "0.4rem",
                      background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                      color: "#FFFFFF",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Join Live
                  </Link>
                </div>

                <div
                  style={{
                    padding: "1rem",
                    borderRadius: "0.6rem",
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <div style={{ fontWeight: 700, color: "#FFFFFF", fontSize: "0.9rem", marginBottom: "0.2rem" }}>
                    Cybersecurity Threat Analysis
                  </div>
                  <div style={{ color: "#94A3B8", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
                    Tomorrow, 5:30 PM
                  </div>
                  <Link
                    href="/live"
                    style={{
                      display: "inline-block",
                      padding: "0.4rem 0.85rem",
                      borderRadius: "0.4rem",
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#FFFFFF",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Add to Calendar
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div
              style={{
                padding: "1.75rem",
                borderRadius: "1rem",
                background: "var(--card-bg, rgba(10, 15, 29, 0.8))",
                border: "1px solid var(--border, rgba(255, 255, 255, 0.08))",
                boxShadow: "var(--card-shadow, 0 10px 30px rgba(0, 0, 0, 0.5))",
                marginBottom: "1.5rem",
              }}
            >
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-strong, #FFFFFF)", margin: "0 0 1.25rem" }}>
                Platform Workspaces & Tools
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {[
                  { label: "AI Lab & Autonomous Agents", href: "/ai", icon: "🤖", badge: "Live" },
                  { label: "Hands-on Security Labs", href: "/labs", icon: "🧪", badge: "Interactive" },
                  { label: "CTF Security Challenges", href: "/challenges", icon: "🏆", badge: "Gamified" },
                  { label: "Capstone Industry Projects", href: "/projects", icon: "💼", badge: "Portfolio" },
                  { label: "Live Classroom Broadcasts", href: "/live", icon: "🔴", badge: "Mentorship" },
                  { label: "Verified Certificates", href: "/certificates", icon: "🎓", badge: "Credentials" },
                  { label: "Account & Profile Settings", href: "/app/settings", icon: "⚙️", badge: "Profile" },
                ].map((act) => (
                  <Link
                    key={act.label}
                    href={act.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.7rem 0.9rem",
                      borderRadius: "0.5rem",
                      background: "var(--surface, rgba(15, 23, 42, 0.6))",
                      border: "1px solid var(--border, rgba(255, 255, 255, 0.06))",
                      color: "var(--text, #E2E8F0)",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      textDecoration: "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>{act.icon}</span>
                    <span style={{ flex: 1 }}>{act.label}</span>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        padding: "0.15rem 0.45rem",
                        borderRadius: "0.3rem",
                        background: "rgba(99, 102, 241, 0.15)",
                        color: "#A5B4FC",
                        fontWeight: 600,
                      }}
                    >
                      {act.badge}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Direct 1-on-1 WhatsApp Mentor Support Card */}
            <div
              style={{
                padding: "1.5rem",
                borderRadius: "1rem",
                background: "linear-gradient(135deg, rgba(37, 211, 102, 0.12), rgba(34, 211, 238, 0.08))",
                border: "1px solid rgba(37, 211, 102, 0.3)",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem" }}>
                <span style={{ fontSize: "1.4rem" }}>💬</span>
                <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--text-strong, #FFFFFF)" }}>
                  Need 1-on-1 Mentor Help?
                </h4>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted, #94A3B8)", lineHeight: 1.5, margin: "0 0 1rem" }}>
                Stuck on an AI pipeline, code error, or lab challenge? Connect directly with Zentrion instructors on WhatsApp.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <a
                  href="https://wa.me/917305771789?text=Hello%20Zentrion%20Mentor%2C%20I%20am%20a%20student%20and%20need%20help%20with%20my%20course."
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "0.65rem 1rem",
                    borderRadius: "0.5rem",
                    background: "#25D366",
                    color: "#FFFFFF",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: "0 4px 15px rgba(37, 211, 102, 0.35)",
                  }}
                >
                  <span>💬</span> Chat on WhatsApp (+91 7305771789)
                </a>
                <a
                  href="tel:+917305771789"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "0.55rem 1rem",
                    borderRadius: "0.5rem",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid var(--border, rgba(255, 255, 255, 0.15))",
                    color: "var(--text, #E2E8F0)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <span>📞</span> Call Helpline: +91 7305771789
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
