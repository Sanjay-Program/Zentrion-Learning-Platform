import Link from "next/link";

export default function NotFound() {
  const POPULAR_COURSES = [
    {
      title: "Artificial Intelligence Foundations",
      slug: "ai-foundations-and-fluency",
      price: "₹999",
      originalPrice: "₹1,999",
      discount: "50% OFF",
      seats: "7 seats left",
      badge: "Most Popular",
      category: "AI & ML",
      icon: "🤖",
    },
    {
      title: "Prompt & Context Engineering",
      slug: "prompt-and-context-engineering",
      price: "₹499",
      originalPrice: "₹999",
      discount: "50% OFF",
      seats: "9 seats left",
      badge: "High Demand",
      category: "Prompt Eng",
      icon: "⚡",
    },
    {
      title: "Cybersecurity & SOC Defense Labs",
      slug: "ai-cybersecurity-and-llm-security",
      price: "₹1,499",
      originalPrice: "₹2,999",
      discount: "50% OFF",
      seats: "5 seats left",
      badge: "Security Labs",
      category: "Cybersecurity",
      icon: "🛡️",
    },
    {
      title: "Data Science & Predictive AI",
      slug: "data-science-ai",
      price: "₹799",
      originalPrice: "₹1,599",
      discount: "50% OFF",
      seats: "8 seats left",
      badge: "Career Track",
      category: "Data Science",
      icon: "📊",
    },
    {
      title: "Full-Stack GenAI Applications",
      slug: "ai-business-automation",
      price: "₹1,299",
      originalPrice: "₹2,499",
      discount: "50% OFF",
      seats: "6 seats left",
      badge: "Production Ready",
      category: "Full-Stack",
      icon: "💻",
    },
    {
      title: "Frontend Development & GenAI UI",
      slug: "frontend-development-genai",
      price: "₹599",
      originalPrice: "₹1,199",
      discount: "50% OFF",
      seats: "11 seats left",
      badge: "UI/UX Special",
      category: "Frontend",
      icon: "🎨",
    },
  ];

  return (
    <div
      style={{
        background: "var(--bg, #060913)",
        color: "var(--text, #F8FAFC)",
        minHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "4rem 1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow effects */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(600px, 90vw)",
          height: "350px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(34, 211, 238, 0.08) 50%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1, maxWidth: "64rem", margin: "0 auto", textAlign: "center" }}>
        
        {/* Glowing 404 Glitch Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 1.25rem", borderRadius: "9999px", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.35)", color: "#FCA5A5", fontSize: "0.88rem", fontWeight: 700, marginBottom: "1.5rem" }}>
          <span className="flame-pulse">⚠️</span> Error 404 — Quantum Coordinate Not Found
        </div>

        <h1
          style={{
            fontSize: "clamp(3.5rem, 10vw, 7rem)",
            fontWeight: 900,
            lineHeight: 1,
            margin: "0 0 1rem",
            letterSpacing: "-0.04em",
            background: "linear-gradient(135deg, #FFFFFF 20%, #94A3B8 50%, #6366F1 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          404
        </h1>

        <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", fontWeight: 800, color: "#FFFFFF", marginBottom: "1rem", letterSpacing: "-0.02em" }}>
          Lost in the Quantum Frontier?
        </h2>

        <p style={{ color: "#94A3B8", fontSize: "1.1rem", maxWidth: "34rem", margin: "0 auto 2.5rem", lineHeight: 1.65 }}>
          The module or endpoint you requested doesn&apos;t exist or has migrated to a new coordinate. Let&apos;s get you back on track with our hands-on engineering labs.
        </p>

        {/* Quick Search */}
        <div style={{ maxWidth: "28rem", margin: "0 auto 2.5rem" }}>
          <form action="/courses" method="get" style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="search"
              name="q"
              placeholder="Search AI, Cybersecurity, Prompts..."
              aria-label="Search courses"
              style={{
                flex: 1,
                padding: "0.75rem 1.25rem",
                borderRadius: "0.75rem",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#FFFFFF",
                fontSize: "0.95rem",
                outline: "none",
                boxSizing: "border-box",
              }}
              className="input-glow"
            />
            <button
              type="submit"
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "0.75rem",
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                color: "#FFFFFF",
                border: "none",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Search
            </button>
          </form>
        </div>

        {/* Navigation Action Buttons */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3.5rem" }}>
          <Link
            href="/"
            style={{
              padding: "0.85rem 1.75rem",
              borderRadius: "0.75rem",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#FFFFFF",
              fontWeight: 700,
              textDecoration: "none",
              fontSize: "0.95rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            🏠 Return to Home
          </Link>
          <Link
            href="/courses"
            style={{
              padding: "0.85rem 1.75rem",
              borderRadius: "0.75rem",
              background: "linear-gradient(135deg, #6366F1, #22D3EE)",
              color: "#FFFFFF",
              fontWeight: 700,
              textDecoration: "none",
              fontSize: "0.95rem",
              boxShadow: "0 0 25px rgba(99, 102, 241, 0.4)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            🚀 Browse All Courses (50% OFF)
          </Link>
          <a
            href="https://wa.me/917305771789?text=Hello%2C%20I%20hit%20a%20404%20error%20on%20Zentrion%20and%20need%20assistance"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "0.85rem 1.75rem",
              borderRadius: "0.75rem",
              background: "rgba(37, 211, 102, 0.15)",
              border: "1px solid rgba(37, 211, 102, 0.4)",
              color: "#4ADE80",
              fontWeight: 700,
              textDecoration: "none",
              fontSize: "0.95rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            💬 WhatsApp Support
          </a>
        </div>

        {/* Popular Enrolled Courses Grid */}
        <div style={{ textAlign: "left", marginTop: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
              🔥 Or Jump Into Our Flagship Early-Bird Cohorts:
            </h3>
            <span style={{ fontSize: "0.85rem", color: "#FCD34D", fontWeight: 700 }}>
              ⏳ Early-bird pricing valid until 10th October only
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 18rem), 1fr))", gap: "1rem" }}>
            {POPULAR_COURSES.map((course) => (
              <Link
                key={course.slug}
                href={`/courses/${course.slug}`}
                style={{
                  textDecoration: "none",
                  display: "block",
                  padding: "1.25rem",
                  borderRadius: "1rem",
                  background: "rgba(15, 23, 42, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  transition: "all 0.2s ease",
                }}
                className="course-card-hover"
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "1.75rem" }}>{course.icon}</span>
                  <span style={{ padding: "0.2rem 0.55rem", borderRadius: "9999px", background: "rgba(99, 102, 241, 0.2)", border: "1px solid rgba(99, 102, 241, 0.4)", color: "#818CF8", fontSize: "0.72rem", fontWeight: 700 }}>
                    {course.badge}
                  </span>
                </div>
                <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.75rem", lineHeight: 1.4 }}>
                  {course.title}
                </h4>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "1.3rem", fontWeight: 900, color: "#22D3EE" }}>{course.price}</span>
                  <span style={{ fontSize: "0.85rem", textDecoration: "line-through", color: "#64748B" }}>{course.originalPrice}</span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10B981", background: "rgba(16, 185, 129, 0.12)", padding: "0.15rem 0.4rem", borderRadius: "0.25rem" }}>
                    {course.discount}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", color: "#FCA5A5", fontWeight: 600 }}>
                  <span className="flame-pulse">🔥 {course.seats}</span>
                  <span style={{ color: "#38BDF8" }}>Enroll →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Platform Trust Reassurance */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1.5rem",
            flexWrap: "wrap",
            marginTop: "3rem",
            paddingTop: "2rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            color: "#94A3B8",
            fontSize: "0.85rem",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            🛡️ 100% 7-Day Money-Back Guarantee
          </span>
          <span>•</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            📜 Verifiable QR Credential
          </span>
          <span>•</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            ⚡ In-Browser GPU Sandboxes
          </span>
          <span>•</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            🔒 256-Bit SSL Encrypted Checkout
          </span>
        </div>

      </div>
    </div>
  );
}
