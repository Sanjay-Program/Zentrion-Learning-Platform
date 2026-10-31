import Link from "next/link";
import { getCurrentUser, getUserWithRoles } from "@/lib/auth";
import { ThemeToggle, MobileNav } from "@/components/interactive";
import { MobileNavTrigger } from "@/components/mobile-nav-trigger";
import { hasPermission } from "@/lib/rbac";
import { NAV_ITEMS } from "@/components/nav-items";
import { AuthedUserMenu } from "@/components/authed-user-menu";
import { FloatingWhatsAppWidget } from "@/components/whatsapp-widget";

function Logo() {
  return (
    <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", textDecoration: "none" }}>
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "0.6rem",
          background: "linear-gradient(135deg, #6366F1, #22D3EE)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF",
          fontWeight: 900,
          fontSize: "1.2rem",
          boxShadow: "0 0 15px rgba(99, 102, 241, 0.25)",
          flexShrink: 0,
        }}
      >
        Z
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontWeight: 800, fontSize: "1.15rem", color: "var(--text-strong, #FFFFFF)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          Zentrion
        </span>
        <span style={{ fontWeight: 700, color: "#0891B2", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          LEARNTECH
        </span>
      </div>
    </Link>
  );
}


async function AuthedMenu({ userId }: { userId: number }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const fullUser = await getUserWithRoles(userId);
  const roleKeys = fullUser?.roles?.map((r: any) => r.key) || [];
  return <AuthedUserMenu user={user} roles={roleKeys} />;
}

export async function Navbar() {
  const user = await getCurrentUser();
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--nav-bg, rgba(6, 9, 19, 0.95))",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--nav-border, rgba(0, 0, 0, 0.08))",
        width: "100%",
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}
    >
      {/* Top Admissions & WhatsApp Helpline Strip */}
      <div
        style={{
          background: "linear-gradient(90deg, rgba(99, 102, 241, 0.08), rgba(37, 211, 102, 0.12))",
          borderBottom: "1px solid var(--border, rgba(0, 0, 0, 0.08))",
          padding: "0.3rem 1rem",
          fontSize: "0.78rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
          <span style={{ color: "var(--text-muted, #94A3B8)", fontWeight: 500 }}>
            🚀 Admissions Open 2026: AI Agents, Enterprise Automation & Cybersecurity
          </span>
          <span className="desktop-only" style={{ color: "var(--border, rgba(255, 255, 255, 0.2))" }}>•</span>
          <a
            href="tel:+917305771789"
            style={{
              color: "#38BDF8",
              textDecoration: "none",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            <span>📞</span> +91 7305771789
          </a>
          <span style={{ color: "var(--border, rgba(255, 255, 255, 0.2))" }}>•</span>
          <a
            href="https://wa.me/917305771789?text=Hello%20Zentrion%20Learntech%2C%20I%20want%20to%20know%20more%20about%20your%20courses"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#25D366",
              textDecoration: "none",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            <span>💬</span> WhatsApp Us
          </a>
        </div>
      </div>

      <div
        className="container"
        style={{
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
        }}
      >
        {/* Left: Brand + Nav Items */}
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <Logo />
          <nav aria-label="Primary" className="desktop-nav" style={{ alignItems: "center", gap: "0.5rem" }}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  color: "var(--text, #CBD5E1)",
                  fontSize: "0.925rem",
                  fontWeight: 600,
                  padding: "0.45rem 0.85rem",
                  borderRadius: "0.5rem",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center: Search input in navbar */}
        <div className="desktop-nav" style={{ alignItems: "center", flex: "0 1 240px" }}>
          <form action="/courses" method="get" style={{ width: "100%", position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "12px",
                color: "#64748B",
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              type="search"
              name="q"
              placeholder="Search courses…"
              aria-label="Search courses"
              style={{
                width: "100%",
                padding: "0.5rem 0.85rem 0.5rem 2.2rem",
                fontSize: "0.85rem",
                borderRadius: "9999px",
                background: "var(--input-bg, rgba(15, 23, 42, 0.8))",
                border: "1px solid var(--input-border, rgba(255, 255, 255, 0.12))",
                color: "var(--input-text, #FFFFFF)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </form>
        </div>

        {/* Right: Auth Controls & Mobile Menu */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <ThemeToggle />
          {user ? (
            <AuthedMenu userId={user.id} />
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Link
                href="/courses"
                className="desktop-only"
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#FCD34D",
                  padding: "0.45rem 0.85rem",
                  borderRadius: "9999px",
                  background: "rgba(245, 158, 11, 0.12)",
                  border: "1px solid rgba(245, 158, 11, 0.35)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
              >
                <span className="flame-pulse">🔥</span> From ₹499
              </Link>
              <Link
                href="/courses"
                style={{
                  fontSize: "0.88rem",
                  padding: "0.5rem 1.25rem",
                  borderRadius: "0.6rem",
                  background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                  color: "#FFFFFF",
                  textDecoration: "none",
                  fontWeight: 700,
                  boxShadow: "0 0 20px rgba(99, 102, 241, 0.25)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <span>⚡</span> Enroll Now
              </Link>
            </div>
          )}
          <MobileNavTrigger />
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border, rgba(0, 0, 0, 0.08))",
        background: "var(--footer-bg, rgba(5, 8, 18, 0.95))",
        marginTop: "var(--space-20)",
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}
    >
      <div className="container" style={{ padding: "var(--space-12) var(--space-6) var(--space-8)" }}>
        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(11rem, 1fr))", gap: "var(--space-8)" }}
        >
          <div>
            <Logo />
            <p className="text-muted text-sm mt-4" style={{ maxWidth: 260, lineHeight: 1.6 }}>
              The #1 AI, Practical Skills & Cybersecurity Learning Platform. Build real AI agents, master defensive cybersecurity, and gain job-ready skills.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: "var(--text-sm)", color: "var(--text-strong, #FFFFFF)" }}>Learn</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "var(--space-2)" }}>
              <li><Link className="text-muted text-sm" href="/courses">Courses</Link></li>
              <li><Link className="text-muted text-sm" href="/paths">Learning paths</Link></li>
              <li><Link className="text-muted text-sm" href="/labs">Practical labs</Link></li>
              <li><Link className="text-muted text-sm" href="/projects">Projects</Link></li>
              <li><Link className="text-muted text-sm" href="/events">Live events</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: "var(--text-sm)", color: "var(--text-strong, #FFFFFF)" }}>Platform</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "var(--space-2)" }}>
              <li><Link className="text-muted text-sm" href="/ai">AI Lab Workspace</Link></li>
              <li><Link className="text-muted text-sm" href="/live">Live Class Studio</Link></li>
              <li><Link className="text-muted text-sm" href="/cyber">Cybersecurity Academy</Link></li>
              <li><Link className="text-muted text-sm" href="/for-colleges">For colleges</Link></li>
              <li><Link className="text-muted text-sm" href="/for-enterprises">For enterprises</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: "var(--text-sm)", color: "var(--text-strong, #FFFFFF)" }}>Company</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "var(--space-2)" }}>
              <li><Link className="text-muted text-sm" href="/about">About</Link></li>
              <li><Link className="text-muted text-sm" href="/blog">Blog</Link></li>
              <li><Link className="text-muted text-sm" href="/contact">Contact</Link></li>
              <li><Link className="text-muted text-sm" href="/help">Help centre</Link></li>
              <li><Link className="text-muted text-sm" href="/legal/security-disclosure">Security</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: "var(--text-sm)", color: "var(--text-strong, #FFFFFF)" }}>Helpline & Support</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "var(--space-2)" }}>
              <li>
                <a
                  href="tel:+917305771789"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    textDecoration: "none",
                    color: "#38BDF8",
                    fontSize: "var(--text-sm)",
                    fontWeight: 600,
                  }}
                >
                  <span>📞</span> +91 7305771789
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/917305771789?text=Hello%20Zentrion%20Learntech%2C%20I%20want%20to%20know%20more%20about%20your%20courses"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    textDecoration: "none",
                    color: "#25D366",
                    fontSize: "var(--text-sm)",
                    fontWeight: 700,
                  }}
                >
                  <span>💬</span> WhatsApp Support
                </a>
              </li>
              <li>
                <a href="mailto:support@zentrion.dev" className="text-muted text-sm" style={{ textDecoration: "none" }}>
                  ✉️ support@zentrion.dev
                </a>
              </li>
              <li>
                <span className="text-subtle text-xs">Mon – Sat, 9:00 AM – 9:00 PM IST</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Tech Stack & Responsive bar (matching mockup bottom strip) */}
        <div
          style={{
            borderTop: "1px solid var(--border, rgba(0, 0, 0, 0.08))",
            paddingTop: "var(--space-6)",
            marginTop: "var(--space-8)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "var(--space-4)",
            fontSize: "var(--text-xs)",
            color: "var(--text-subtle)",
          }}
        >
          <div>
            <span style={{ fontWeight: 600, color: "var(--text-muted)", marginRight: "8px" }}>
              Modern Tech Stack:
            </span>
            <span>Next.js · React · TypeScript · Node.js · Python · PostgreSQL · Redis · Docker · Cloudflare · Stripe · OpenAI & LLM APIs</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
            <span>💻 Web</span> · <span>📱 Tablet</span> · <span>📲 Mobile</span>
          </div>
        </div>

        <div
          className="flex justify-between mt-6"
          style={{
            borderTop: "1px solid var(--border, rgba(255, 255, 255, 0.05))",
            paddingTop: "var(--space-4)",
            flexWrap: "wrap",
            gap: "var(--space-4)",
          }}
        >
          <p className="text-subtle text-sm" style={{ margin: 0 }}>
            © {year} Zentrion Learntech. All rights reserved.
          </p>
          <p className="text-subtle text-sm" style={{ margin: 0 }}>
            Status: <Link href="/legal/status" style={{ color: "#10b981" }}>● All systems operational</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

import { SocialProofTicker } from "@/components/social-proof-ticker";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--bg, #060913)",
        color: "var(--text, #F8FAFC)",
        transition: "background 0.2s ease, color 0.2s ease",
      }}
    >
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <main id="main" style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
      <FloatingWhatsAppWidget />
      <SocialProofTicker />
    </div>
  );
}
