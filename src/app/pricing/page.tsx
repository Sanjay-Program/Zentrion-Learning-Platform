import { getDb } from "@/db/client";
import { prices, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { PricingPlanCards, PricingFaqAccordion } from "./pricing-interactive";

import { FaqJsonLd, BreadcrumbJsonLd } from "@/components/seo-schema";

const BASE_URL = process.env.APP_BASE_URL || "https://zentrion.dev";

export const metadata = {
  title: "Pricing Plans & Pro Membership — Zentrion Learntech",
  description: "Transparent pricing for AI, Cybersecurity & Future-Tech skills. Free tier, individual course enrollments (₹499–₹1,499), and unlimited Pro membership with 7-day money back guarantee.",
  alternates: {
    canonical: `${BASE_URL}/pricing`,
  },
  openGraph: {
    title: "Pricing & Plans — Zentrion Learntech",
    description: "Start free or upgrade to Pro for unlimited sandboxed labs, 2026 frontier AI courses, and verifiable QR credentials.",
    url: `${BASE_URL}/pricing`,
    siteName: "Zentrion Learntech",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing & Plans — Zentrion Learntech",
    description: "Individual courses and Pro membership plans.",
  },
};

const FEATURES_COMPARE = [
  { feature: "Access to free courses", free: true, pro: true, enterprise: true },
  { feature: "Hands-on browser labs", free: true, pro: true, enterprise: true },
  { feature: "AI Tutor (basic queries)", free: true, pro: true, enterprise: true },
  { feature: "Community discussion forums", free: true, pro: true, enterprise: true },
  { feature: "All premium flagship courses (7+)", free: false, pro: true, enterprise: true },
  { feature: "Unlimited GPU sandbox lab sessions", free: false, pro: true, enterprise: true },
  { feature: "Live weekly masterclasses & AMAs", free: false, pro: true, enterprise: true },
  { feature: "Downloadable course starter kits & code", free: false, pro: true, enterprise: true },
  { feature: "Cryptographic verifiable certificates", free: false, pro: true, enterprise: true },
  { feature: "AI Tutor (advanced RAG & deep analysis)", free: false, pro: true, enterprise: true },
  { feature: "Portfolio builder & GitHub sync", free: false, pro: true, enterprise: true },
  { feature: "Priority 24/7 technical support", free: false, pro: true, enterprise: true },
  { feature: "Custom internal learning paths", free: false, pro: false, enterprise: true },
  { feature: "Team & cohort management dashboard", free: false, pro: false, enterprise: true },
  { feature: "Skills-gap & NAAC/NBA compliance analytics", free: false, pro: false, enterprise: true },
  { feature: "Dedicated Customer Success Manager", free: false, pro: false, enterprise: true },
  { feature: "SSO (Okta, Azure AD, Google) & SCIM", free: false, pro: false, enterprise: true },
  { feature: "REST API & Webhooks access", free: false, pro: false, enterprise: true },
];

const FAQS = [
  {
    q: "Can I try before I buy?",
    a: "Yes! Our free tier gives you access to foundational lessons across every subject, the AI Workspace with daily limits, and simulated cybersecurity labs — no credit card required.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards, UPI, net banking, and secure card processing. All payments are encrypted and Zentrion never stores sensitive payment details.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Cancel your Pro subscription with one click at any time from your account settings. You'll retain full access until the end of your prepaid billing period.",
  },
  {
    q: "Do I get a verifiable certificate?",
    a: "Pro subscribers receive cryptographically verifiable certificates with unique QR codes for each completed course. Certificates can be embedded in portfolios or shared directly to LinkedIn.",
  },
  {
    q: "Is there a student or educator discount?",
    a: "Yes! Students and educators with a valid institutional email (.edu / .edu.in / .ac.in) receive 40% off the Pro plan. Contact support@zentrion.dev to claim your coupon.",
  },
  {
    q: "How does Institutional and Enterprise pricing work?",
    a: "Enterprise and College tiers are priced based on cohort size, required sandboxes, custom curricula, and SLAs. Check our dedicated solutions pages or WhatsApp our partnerships team.",
  },
];

export default async function PricingPage() {
  const db = getDb();
  const subs = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      description: products.description,
      amountCents: prices.amountCents,
      interval: prices.interval,
    })
    .from(products)
    .innerJoin(prices, eq(prices.productId, products.id))
    .where(eq(products.productType, "subscription"))
    .all();

  const paidCourseProducts = await db
    .select({ slug: products.slug, amountCents: prices.amountCents, name: products.name, description: products.description })
    .from(products)
    .innerJoin(prices, eq(prices.productId, products.id))
    .where(eq(products.productType, "course"))
    .all();
  const paidCourses = paidCourseProducts.filter((c) => c.amountCents > 0);

  const monthlySub = subs.find((s) => s.interval === "month");
  const annualSub = subs.find((s) => s.interval === "year");

  return (
    <div style={{ background: "var(--bg, #060913)", color: "var(--text, #F8FAFC)", minHeight: "100vh" }}>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Pricing & Plans", url: "/pricing" },
        ]}
      />
      <FaqJsonLd faqs={FAQS.map((f) => ({ question: f.q, answer: f.a }))} />

      {/* ============================================================ */}
      {/* HERO SECTION                                                  */}
      {/* ============================================================ */}
      <section
        style={{
          position: "relative",
          padding: "5.5rem 0 3.5rem",
          textAlign: "center",
          overflow: "hidden",
          background: "radial-gradient(ellipse 70% 50% at 50% -5%, rgba(99, 102, 241, 0.18), transparent 70%), radial-gradient(circle at 80% 50%, rgba(34, 211, 238, 0.1), transparent 50%)",
        }}
      >
        <div className="hero-grid-bg" style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.35 }} />
        <div className="animate-float" style={{ position: "absolute", top: "15%", left: "8%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(99, 102, 241, 0.08), transparent 70%)", zIndex: 0, pointerEvents: "none" }} />
        <div className="animate-float-medium" style={{ position: "absolute", top: "20%", right: "8%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(34, 211, 238, 0.1), transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div className="section-eyebrow" style={{ display: "inline-flex", marginBottom: "1.5rem" }}>
            <span>💎</span> Transparent, Predictable Investment
          </div>

          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              marginBottom: "1.25rem",
            }}
          >
            Invest in Your{" "}
            <span style={{ background: "linear-gradient(135deg, #22D3EE 0%, #818CF8 50%, #C084FC 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              AI Future
            </span>
          </h1>
          <p style={{ fontSize: "1.15rem", color: "#CBD5E1", maxWidth: "42rem", margin: "0 auto 2rem", lineHeight: 1.65 }}>
            Hundreds of free lessons, no credit card needed. Upgrade anytime for unlimited access to Agentic AI, in-browser GPU sandboxes, and cryptographic certificates.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap", color: "#94A3B8", fontSize: "0.85rem", fontWeight: 600 }}>
            <span>✅ Cancel anytime</span>
            <span>•</span>
            <span>🔒 Secure encrypted checkout</span>
            <span>•</span>
            <span>🎓 Verifiable credentials</span>
            <span>•</span>
            <span>⚡ Instant access</span>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ============================================================ */}
      {/* PRICING CARDS (INTERACTIVE)                                  */}
      {/* ============================================================ */}
      <section style={{ padding: "4rem 0 5rem", background: "var(--bg, #060913)" }}>
        <div className="container">
          <PricingPlanCards
            monthlySlug={monthlySub?.slug || "pro-monthly"}
            annualSlug={annualSub?.slug || "pro-annual"}
            monthlyCents={monthlySub?.amountCents || 99900}
            annualCents={annualSub?.amountCents || 958800}
          />
        </div>
      </section>

      <div className="section-divider" />

      {/* ============================================================ */}
      {/* DETAILED FEATURE COMPARISON TABLE                            */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "var(--bg-subtle, #0a0f24)" }}>
        <div className="container" style={{ maxWidth: "68rem" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Plan Comparison</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0.5rem" }}>
              Compare All Features
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "1rem" }}>
              Detailed breakdown of features included across each tier.
            </p>
          </div>

          <div
            style={{
              borderRadius: "1.25rem",
              background: "rgba(10, 15, 29, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              overflowX: "auto",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "500px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(15, 23, 42, 0.9)" }}>
                  <th style={{ padding: "1.25rem 1.5rem", color: "#FFFFFF", fontWeight: 700, fontSize: "0.95rem" }}>Feature</th>
                  <th style={{ padding: "1.25rem 1.5rem", color: "#FFFFFF", fontWeight: 700, textAlign: "center", width: "120px" }}>Free</th>
                  <th style={{ padding: "1.25rem 1.5rem", color: "#818CF8", fontWeight: 800, textAlign: "center", width: "120px" }}>Pro</th>
                  <th style={{ padding: "1.25rem 1.5rem", color: "#22D3EE", fontWeight: 700, textAlign: "center", width: "140px" }}>Institution</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES_COMPARE.map((row, i) => (
                  <tr
                    key={row.feature}
                    style={{
                      borderBottom: i < FEATURES_COMPARE.length - 1 ? "1px solid rgba(255, 255, 255, 0.06)" : "none",
                      background: i % 2 === 0 ? "transparent" : "rgba(255, 255, 255, 0.02)",
                    }}
                  >
                    <td style={{ padding: "1rem 1.5rem", color: "#CBD5E1", fontSize: "0.9rem" }}>
                      {row.feature}
                    </td>
                    <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                      {row.free ? (
                        <span style={{ color: "#10B981", fontWeight: 800, fontSize: "1.1rem" }}>✓</span>
                      ) : (
                        <span style={{ color: "#64748B" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                      {row.pro ? (
                        <span style={{ color: "#10B981", fontWeight: 800, fontSize: "1.1rem" }}>✓</span>
                      ) : (
                        <span style={{ color: "#64748B" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                      {row.enterprise ? (
                        <span style={{ color: "#22D3EE", fontWeight: 800, fontSize: "1.1rem" }}>✓</span>
                      ) : (
                        <span style={{ color: "#64748B" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ============================================================ */}
      {/* INDIVIDUAL COURSES SECTION (IF ANY)                          */}
      {/* ============================================================ */}
      {paidCourses.length > 0 && (
        <section style={{ padding: "4rem 0 5rem", background: "var(--bg, #060913)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <div className="section-eyebrow" style={{ display: "inline-flex" }}>Individual Course Purchases</div>
              <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0.5rem" }}>
                Standalone Course Access
              </h2>
              <p style={{ color: "#94A3B8" }}>Prefer lifetime access to a single course? Buy once, keep forever.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))", gap: "1.5rem" }}>
              {paidCourses.map((c) => (
                <div key={c.slug} className="holo-card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.5rem" }}>{c.name}</h3>
                    <p style={{ color: "#94A3B8", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "1rem" }}>{c.description}</p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "1rem" }}>
                    <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#22D3EE" }}>{formatPrice(c.amountCents)}</span>
                    <Link href={`/courses/${c.slug}`} style={{ padding: "0.45rem 1rem", borderRadius: "0.5rem", background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "#FFFFFF", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none" }}>
                      View Course →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* FREQUENTLY ASKED QUESTIONS                                   */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "var(--bg-subtle, #0a0f24)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Got Questions?</div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#FFFFFF", margin: "1rem 0 0" }}>
              Frequently Asked Questions
            </h2>
          </div>

          <PricingFaqAccordion faqs={FAQS} />
        </div>
      </section>

      {/* ============================================================ */}
      {/* FINAL CALL TO ACTION                                          */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "var(--bg, #060913)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container">
          <div
            style={{
              textAlign: "center",
              padding: "4.5rem 2rem",
              borderRadius: "1.5rem",
              background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(34,211,238,0.12))",
              border: "1px solid rgba(99,102,241,0.35)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            }}
          >
            <h2 style={{ fontSize: "clamp(2rem, 3.8vw, 2.75rem)", fontWeight: 900, color: "#FFFFFF", marginBottom: "1rem" }}>
              Start Learning AI & Cybersecurity Today
            </h2>
            <p style={{ color: "#CBD5E1", fontSize: "1.1rem", maxWidth: "36rem", margin: "0 auto 2.25rem", lineHeight: 1.65 }}>
              Join thousands of engineers building hands-on projects and advancing their careers.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/auth/sign-up"
                style={{
                  padding: "0.95rem 2.25rem",
                  borderRadius: "0.75rem",
                  background: "linear-gradient(135deg, #6366F1, #10B981)",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 0 30px rgba(99,102,241,0.5)",
                  fontSize: "1rem",
                }}
              >
                Get Started Free
              </Link>
              <Link
                href="/courses"
                style={{
                  padding: "0.95rem 2rem",
                  borderRadius: "0.75rem",
                  background: "rgba(15,23,42,0.8)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  textDecoration: "none",
                  fontSize: "1rem",
                }}
              >
                Browse Curriculum →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
