import { listCategories, listCourses } from "@/lib/catalogue";
import { CourseCard, Pagination } from "@/components/ui";
import { BreadcrumbJsonLd } from "@/components/seo-schema";
import Link from "next/link";

const BASE_URL = process.env.APP_BASE_URL || "https://zentrion.dev";

export const metadata = {
  title: "AI, Cybersecurity & Full-Stack Courses — 50% OFF Early Bird (Until 10th Oct)",
  description: "Browse flagship courses in AI Foundations (₹999), Cybersecurity (₹1,499), Prompt Engineering (₹499), Data Science (₹799), Full-Stack (₹1,299), and Frontend (₹599). Hands-on sandbox labs with verifiable QR credentials.",
  alternates: {
    canonical: `${BASE_URL}/courses`,
  },
  openGraph: {
    title: "AI, Cybersecurity & Full-Stack Courses — Zentrion Learntech",
    description: "Save up to 50% on all flagship courses until 10th October only. Sandboxed browser labs, verified QR credentials, and 100% 7-day money-back guarantee.",
    url: `${BASE_URL}/courses`,
    siteName: "Zentrion Learntech",
    images: [
      {
        url: `${BASE_URL}/images/logo/08-app-icon-favicon.png`,
        width: 800,
        height: 600,
        alt: "Zentrion Learntech Courses",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Courses — Zentrion Learntech (Offer until 10th Oct)",
    description: "Hands-on AI, cybersecurity, and engineering tracks with real capstone projects.",
  },
};

const LEVELS = ["beginner", "intermediate", "advanced"];

const CATEGORY_ICONS: Record<string, string> = {
  "ai": "🤖",
  "cybersecurity": "🛡️",
  "data-science": "📊",
  "prompt-engineering": "⚡",
  "web-development": "🌐",
  "cloud": "☁️",
  "automation": "🔄",
  "default": "📚",
};

const LEVEL_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  beginner: { bg: "rgba(16,185,129,0.12)", color: "#10B981", border: "rgba(16,185,129,0.3)" },
  intermediate: { bg: "rgba(245,158,11,0.12)", color: "#F59E0B", border: "rgba(245,158,11,0.3)" },
  advanced: { bg: "rgba(239,68,68,0.12)", color: "#EF4444", border: "rgba(239,68,68,0.3)" },
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; level?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const searchParamsResolved = sp;
  const page = Math.max(1, Number(searchParamsResolved.page) || 1);
  const pageSize = 9;
  const [courses, categories] = await Promise.all([
    listCourses({
      q: searchParamsResolved.q,
      category: searchParamsResolved.category,
      level: searchParamsResolved.level,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    }),
    listCategories(),
  ]);

  const all = await listCourses({ q: searchParamsResolved.q, category: searchParamsResolved.category, level: searchParamsResolved.level, limit: 1000 });
  const pages = Math.max(1, Math.ceil(all.length / pageSize));

  const hasFilters = !!(searchParamsResolved.q || searchParamsResolved.category || searchParamsResolved.level);

  return (
    <div style={{ background: "var(--bg, #060913)", color: "var(--text, #F8FAFC)", minHeight: "100vh" }}>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Courses", url: "/courses" },
        ]}
      />
      {/* ============================================================ */}
      {/* URGENCY ADMISSION BANNER                                     */}
      {/* ============================================================ */}
      <div
        style={{
          background: "linear-gradient(90deg, rgba(239, 68, 68, 0.2) 0%, rgba(99, 102, 241, 0.2) 50%, rgba(245, 158, 11, 0.2) 100%)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
          padding: "0.65rem 1rem",
          textAlign: "center",
          fontSize: "0.85rem",
          color: "#F8FAFC",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontWeight: 800, color: "#FCA5A5" }} className="flame-pulse">🔥 Early-Bird Admissions Open</span>
        <span style={{ color: "#64748B" }}>·</span>
        <span style={{ fontWeight: 600 }}>Special Pricing valid until <strong style={{ color: "#FCD34D" }}>10th October only</strong></span>
        <span style={{ color: "#64748B" }}>·</span>
        <span style={{ color: "#34D399", fontWeight: 700 }}>⚡ Limited seats remaining per batch</span>
      </div>

      {/* ============================================================ */}
      {/* HEADER SECTION                                               */}
      {/* ============================================================ */}
      <section
        style={{
          position: "relative",
          padding: "3.5rem 0 2.5rem",
          overflow: "hidden",
          background: "radial-gradient(ellipse 70% 50% at 50% -5%, rgba(99, 102, 241, 0.18), transparent 70%)",
        }}
      >
        <div className="hero-grid-bg" style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.3 }} />
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#64748B", marginBottom: "1.5rem" }}>
            <Link href="/" style={{ color: "#64748B", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span style={{ color: "#94A3B8" }}>Courses</span>
            {searchParamsResolved.category && <><span>/</span><span style={{ color: "#0891B2", textTransform: "capitalize" }}>{searchParamsResolved.category.replace(/-/g, " ")}</span></>}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1.5rem", marginBottom: "2rem" }}>
            <div>
              <div className="section-eyebrow" style={{ display: "inline-flex", marginBottom: "0.75rem" }}>📚 Course Catalogue</div>
              <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
                {hasFilters ? "Search Results" : "All Courses & Flagship Tracks"}
              </h1>
              <p style={{ color: "#94A3B8", fontSize: "1rem", margin: 0 }}>
                {all.length > 0
                  ? `${all.length} course${all.length !== 1 ? "s" : ""} found${hasFilters ? " for your filters" : " · Special cohort pricing until 10th October only"}`
                  : "Explore our most in-demand AI, cybersecurity and future tech courses."}
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {[
                { label: "🔥 Trending", href: "/courses?level=advanced", active: searchParamsResolved.level === "advanced" },
                { label: "🟢 For Beginners", href: "/courses?level=beginner", active: searchParamsResolved.level === "beginner" },
                { label: "🔬 With Labs", href: "/labs", active: false },
              ].map((chip) => (
                <Link
                  key={chip.label}
                  href={chip.href}
                  style={{
                    padding: "0.4rem 0.9rem",
                    borderRadius: "9999px",
                    background: chip.active ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)",
                    border: chip.active ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.08)",
                    color: chip.active ? "#818CF8" : "#94A3B8",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  {chip.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Platform Trust Reassurance Strip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
              paddingTop: "1.25rem",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div className="trust-chip">🛡️ 100% 7-Day Money-Back Guarantee</div>
            <div className="trust-chip">📜 Verifiable QR Credential</div>
            <div className="trust-chip">⚡ 100% Cloud Sandbox Labs</div>
            <div className="trust-chip">👥 120,000+ Alumni Across Tech</div>
            <div className="trust-chip">🔒 256-Bit SSL Encrypted Checkout</div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FILTER BAR                                                   */}
      {/* ============================================================ */}
      <section style={{ background: "rgba(10,15,29,0.95)", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 0, zIndex: 20, backdropFilter: "blur(16px)" }}>
        <div className="container" style={{ padding: "1rem 1.5rem" }}>
          <form method="get" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            {/* Search */}
            <div style={{ position: "relative", flex: "1 1 18rem" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "#64748B", pointerEvents: "none" }}>🔍</span>
              <input
                type="search"
                name="q"
                defaultValue={searchParamsResolved.q ?? ""}
                placeholder="Search courses, topics, skills..."
                style={{
                  width: "100%",
                  padding: "0.65rem 1rem 0.65rem 2.25rem",
                  borderRadius: "0.65rem",
                  background: "rgba(15,23,42,0.7)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#FFFFFF",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s ease",
                }}
                aria-label="Search courses"
                className="input-glow"
              />
            </div>

            {/* Category dropdown */}
            <select
              name="category"
              defaultValue={searchParamsResolved.category ?? ""}
              aria-label="Filter by category"
              style={{
                padding: "0.65rem 1rem",
                borderRadius: "0.65rem",
                background: "rgba(15,23,42,0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#CBD5E1",
                fontSize: "0.85rem",
                outline: "none",
                cursor: "pointer",
              }}
              className="input-glow"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>

            {/* Level filter buttons */}
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <span style={{ color: "#64748B", fontSize: "0.82rem", fontWeight: 600, alignSelf: "center" }}>Level:</span>
              {["", ...LEVELS].map((l) => {
                const levelStyle = l ? LEVEL_COLORS[l] : { bg: "rgba(99,102,241,0.12)", color: "#6366F1", border: "rgba(99,102,241,0.3)" };
                const isActive = (searchParamsResolved.level ?? "") === l;
                return (
                  <a
                    key={l || "all"}
                    href={`/courses?${new URLSearchParams({ ...(searchParamsResolved.q ? { q: searchParamsResolved.q } : {}), ...(searchParamsResolved.category ? { category: searchParamsResolved.category } : {}), ...(l ? { level: l } : {}) }).toString()}`}
                    style={{
                      padding: "0.4rem 0.75rem",
                      borderRadius: "0.4rem",
                      background: isActive ? levelStyle.bg : "transparent",
                      border: `1px solid ${isActive ? levelStyle.border : "rgba(255,255,255,0.07)"}`,
                      color: isActive ? levelStyle.color : "#64748B",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      textDecoration: "none",
                      textTransform: "capitalize",
                      transition: "all 0.15s ease",
                      cursor: "pointer",
                    }}
                  >
                    {l || "All"}
                  </a>
                );
              })}
            </div>

            <button
              type="submit"
              style={{
                padding: "0.65rem 1.5rem",
                borderRadius: "0.65rem",
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "0.85rem",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 0 15px rgba(99,102,241,0.35)",
                transition: "all 0.2s ease",
              }}
            >
              Search
            </button>

            {hasFilters && (
              <a href="/courses" style={{ padding: "0.65rem 1rem", borderRadius: "0.65rem", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#94A3B8", fontSize: "0.82rem", fontWeight: 600, textDecoration: "none" }}>
                ✕ Clear
              </a>
            )}
          </form>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CATEGORY QUICK FILTERS (if no query active)                 */}
      {/* ============================================================ */}
      {!hasFilters && categories.length > 0 && (
        <section style={{ padding: "2rem 0 1rem", background: "var(--bg-subtle, #0a0f24)" }}>
          <div className="container">
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {categories.map((cat) => {
                const icon = CATEGORY_ICONS[cat.slug] ?? CATEGORY_ICONS["default"];
                return (
                  <Link
                    key={cat.slug}
                    href={`/courses?category=${cat.slug}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 1.1rem",
                      borderRadius: "9999px",
                      background: "rgba(10,15,29,0.8)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#94A3B8",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                    }}
                    className="glass-card-hover"
                  >
                    <span>{icon}</span>
                    {cat.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* COURSE GRID                                                  */}
      {/* ============================================================ */}
      <section style={{ padding: "2rem 0 5rem", background: "var(--bg, #060913)" }}>
        <div className="container">
          {courses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "5rem 2rem", borderRadius: "1.25rem", background: "rgba(10,15,29,0.7)", border: "1px solid rgba(255,255,255,0.07)", marginTop: "1.5rem" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: "1.25rem" }}>🔍</div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.75rem" }}>No courses found</h2>
              <p style={{ color: "#94A3B8", marginBottom: "1.5rem" }}>
                No courses match your search. Try adjusting your filters or search terms.
              </p>
              <a href="/courses" style={{ display: "inline-flex", padding: "0.75rem 1.75rem", borderRadius: "0.75rem", background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: "0.95rem" }}>
                Browse All Courses
              </a>
            </div>
          ) : (
            <>
              <div
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(20rem, 1fr))", gap: "1.5rem" }}
              >
                {courses.map((c) => (
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

              {/* Pagination */}
              {pages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: "3rem" }}>
                  <Pagination page={page} pages={pages} basePath="/courses" searchParams={searchParamsResolved as Record<string, string>} />
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* WHY ZENTRION COMPARISON MATRIX                               */}
      {/* ============================================================ */}
      <section style={{ padding: "4.5rem 0", background: "rgba(10, 15, 29, 0.75)", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex", marginBottom: "1rem" }}>
              💎 Unmatched Value
            </div>
            <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 800, color: "#FFFFFF", marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>
              Why Zentrion Outperforms Generic Learning
            </h2>
            <p style={{ color: "#94A3B8", maxWidth: "38rem", margin: "0 auto", fontSize: "1rem", lineHeight: 1.6 }}>
              Compare how our sandbox-first, AI-mentored curriculum beats passive video libraries and overpriced bootcamps.
            </p>
          </div>

          <div style={{ overflowX: "auto", borderRadius: "1rem", border: "1px solid rgba(255, 255, 255, 0.1)", background: "rgba(15, 23, 42, 0.6)", WebkitOverflowScrolling: "touch" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "640px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(20, 27, 45, 0.9)" }}>
                  <th style={{ padding: "1.25rem 1.5rem", color: "#94A3B8", fontWeight: 700, fontSize: "0.9rem" }}>Core Criteria</th>
                  <th style={{ padding: "1.25rem 1.5rem", color: "#22D3EE", fontWeight: 800, fontSize: "1rem", background: "rgba(99, 102, 241, 0.15)", borderLeft: "2px solid #6366F1", borderRight: "2px solid #6366F1" }}>
                    🚀 Zentrion Learntech
                  </th>
                  <th style={{ padding: "1.25rem 1.5rem", color: "#94A3B8", fontWeight: 700, fontSize: "0.9rem" }}>Generic Video Courses</th>
                  <th style={{ padding: "1.25rem 1.5rem", color: "#94A3B8", fontWeight: 700, fontSize: "0.9rem" }}>Offline / Bootcamps</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: "0.9rem", color: "#CBD5E1" }}>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                  <td style={{ padding: "1.2rem 1.5rem", fontWeight: 600 }}>Hands-on Cloud Labs</td>
                  <td style={{ padding: "1.2rem 1.5rem", background: "rgba(99, 102, 241, 0.08)", borderLeft: "2px solid #6366F1", borderRight: "2px solid #6366F1", color: "#34D399", fontWeight: 700 }}>
                    ✅ In-browser GPU/Linux sandboxes, zero local setup
                  </td>
                  <td style={{ padding: "1.2rem 1.5rem", color: "#EF4444" }}>❌ Passive videos only (setup required)</td>
                  <td style={{ padding: "1.2rem 1.5rem", color: "#F59E0B" }}>⚠️ Manual local installation</td>
                </tr>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                  <td style={{ padding: "1.2rem 1.5rem", fontWeight: 600 }}>Pricing</td>
                  <td style={{ padding: "1.2rem 1.5rem", background: "rgba(99, 102, 241, 0.08)", borderLeft: "2px solid #6366F1", borderRight: "2px solid #6366F1", color: "#38BDF8", fontWeight: 800 }}>
                    ✨ ₹499 – ₹1,499 (Offer until 10th Oct)
                  </td>
                  <td style={{ padding: "1.2rem 1.5rem" }}>₹3,000 – ₹10,000+ per course</td>
                  <td style={{ padding: "1.2rem 1.5rem", color: "#EF4444" }}>₹45,000 – ₹1,50,000 upfront</td>
                </tr>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                  <td style={{ padding: "1.2rem 1.5rem", fontWeight: 600 }}>Certificate Verification</td>
                  <td style={{ padding: "1.2rem 1.5rem", background: "rgba(99, 102, 241, 0.08)", borderLeft: "2px solid #6366F1", borderRight: "2px solid #6366F1", color: "#34D399", fontWeight: 700 }}>
                    ✅ Cryptographic QR code on Polygon ledger
                  </td>
                  <td style={{ padding: "1.2rem 1.5rem", color: "#EF4444" }}>❌ Unverified PDF download</td>
                  <td style={{ padding: "1.2rem 1.5rem", color: "#94A3B8" }}>⚠️ Paper / unindexed certificate</td>
                </tr>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                  <td style={{ padding: "1.2rem 1.5rem", fontWeight: 600 }}>Instant AI Mentor & Feedback</td>
                  <td style={{ padding: "1.2rem 1.5rem", background: "rgba(99, 102, 241, 0.08)", borderLeft: "2px solid #6366F1", borderRight: "2px solid #6366F1", color: "#34D399", fontWeight: 700 }}>
                    ✅ 24/7 AI tutor + automated unit tests
                  </td>
                  <td style={{ padding: "1.2rem 1.5rem", color: "#EF4444" }}>❌ No code evaluation</td>
                  <td style={{ padding: "1.2rem 1.5rem", color: "#F59E0B" }}>⚠️ Delayed TA office hours</td>
                </tr>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                  <td style={{ padding: "1.2rem 1.5rem", fontWeight: 600 }}>Risk Guarantee</td>
                  <td style={{ padding: "1.2rem 1.5rem", background: "rgba(99, 102, 241, 0.08)", borderLeft: "2px solid #6366F1", borderRight: "2px solid #6366F1", color: "#34D399", fontWeight: 700 }}>
                    ✅ 100% 7-Day Money-Back Guarantee
                  </td>
                  <td style={{ padding: "1.2rem 1.5rem", color: "#94A3B8" }}>⚠️ Complex refund policies</td>
                  <td style={{ padding: "1.2rem 1.5rem", color: "#EF4444" }}>❌ Strictly non-refundable</td>
                </tr>
                <tr>
                  <td style={{ padding: "1.2rem 1.5rem", fontWeight: 600 }}>Access Duration</td>
                  <td style={{ padding: "1.2rem 1.5rem", background: "rgba(99, 102, 241, 0.08)", borderLeft: "2px solid #6366F1", borderRight: "2px solid #6366F1", color: "#34D399", fontWeight: 700 }}>
                    ✅ Lifetime access + quarterly content updates
                  </td>
                  <td style={{ padding: "1.2rem 1.5rem", color: "#94A3B8" }}>⚠️ Monthly recurring fee or archived</td>
                  <td style={{ padding: "1.2rem 1.5rem", color: "#EF4444" }}>❌ Access revoked after 6 months</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CTA STRIP                                                    */}
      {/* ============================================================ */}
      <section style={{ padding: "4rem 0", background: "#0A0F1D", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "2rem", padding: "2.5rem 3rem", borderRadius: "1.25rem", background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(34,211,238,0.06))", border: "1px solid rgba(99,102,241,0.25)" }}>
            <div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "0.4rem" }}>Can&apos;t find what you&apos;re looking for?</h3>
              <p style={{ color: "#94A3B8", fontSize: "0.95rem", margin: 0 }}>
                Chat with our AI advisor or speak to a learning consultant on WhatsApp.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <a href="https://wa.me/917305771789?text=Hello%2C%20I%20need%20help%20choosing%20a%20course" target="_blank" rel="noopener noreferrer"
                style={{ padding: "0.75rem 1.5rem", borderRadius: "0.65rem", background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}>
                💬 Get Guided by Expert
              </a>
              <Link href="/ai" style={{ padding: "0.75rem 1.5rem", borderRadius: "0.65rem", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#F8FAFC", fontWeight: 600, textDecoration: "none", fontSize: "0.9rem" }}>
                🤖 Ask AI Advisor
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
