import { listCategories, listCourses } from "@/lib/catalogue";
import { CourseCard, Pagination } from "@/components/ui";
import Link from "next/link";

export const metadata = {
  title: "All Courses",
  description: "Browse AI, Cybersecurity, Data Science, and Future-Tech courses. Filter by level, category, and topic to find your perfect learning path.",
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
    <div style={{ background: "#ffffff", color: "#F8FAFC", minHeight: "100vh" }}>

      {/* ============================================================ */}
      {/* HEADER SECTION                                               */}
      {/* ============================================================ */}
      <section
        style={{
          position: "relative",
          padding: "4rem 0 3rem",
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

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1.5rem" }}>
            <div>
              <div className="section-eyebrow" style={{ display: "inline-flex", marginBottom: "0.75rem" }}>📚 Course Catalogue</div>
              <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
                {hasFilters ? "Search Results" : "All Courses"}
              </h1>
              <p style={{ color: "#94A3B8", fontSize: "1rem", margin: 0 }}>
                {all.length > 0
                  ? `${all.length} course${all.length !== 1 ? "s" : ""} found${hasFilters ? " for your filters" : " · Updated for 2026"}`
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
        <section style={{ padding: "2rem 0 1rem", background: "#ffffff" }}>
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
      <section style={{ padding: "2rem 0 5rem", background: "#ffffff" }}>
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
