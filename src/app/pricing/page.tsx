import { getDb } from "@/db/client";
import { prices, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export const metadata = {
  title: "Pricing",
  description: "Transparent pricing for AI, Cybersecurity & Future-Tech learning. Free tier, individual courses, and Pro plans available.",
};

const FEATURES_COMPARE = [
  { feature: "Access to free courses", free: true, pro: true, enterprise: true },
  { feature: "Hands-on browser labs", free: true, pro: true, enterprise: true },
  { feature: "AI Tutor (basic)", free: true, pro: true, enterprise: true },
  { feature: "Community forums", free: true, pro: true, enterprise: true },
  { feature: "All premium courses (7+)", free: false, pro: true, enterprise: true },
  { feature: "Unlimited lab sessions", free: false, pro: true, enterprise: true },
  { feature: "Live masterclass access", free: false, pro: true, enterprise: true },
  { feature: "Downloadable resources", free: false, pro: true, enterprise: true },
  { feature: "Industry certificates", free: false, pro: true, enterprise: true },
  { feature: "AI Tutor (advanced RAG)", free: false, pro: true, enterprise: true },
  { feature: "Portfolio builder", free: false, pro: true, enterprise: true },
  { feature: "Priority support", free: false, pro: true, enterprise: true },
  { feature: "Custom learning paths", free: false, pro: false, enterprise: true },
  { feature: "Team cohort management", free: false, pro: false, enterprise: true },
  { feature: "Admin analytics dashboard", free: false, pro: false, enterprise: true },
  { feature: "Dedicated CSM", free: false, pro: false, enterprise: true },
  { feature: "SSO & SAML integration", free: false, pro: false, enterprise: true },
  { feature: "API access", free: false, pro: false, enterprise: true },
];

const FAQS = [
  {
    q: "Can I try before I buy?",
    a: "Yes! Our free tier gives you access to hundreds of free lessons across every subject, the AI Workspace with daily limits, and simulated cybersecurity labs — no credit card required.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards, UPI, net banking, and Razorpay. All payments are processed securely and Zentrion never stores card details.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Cancel your Pro subscription at any time from your account settings. You'll keep access until the end of your billing period.",
  },
  {
    q: "Do I get a certificate?",
    a: "Pro subscribers receive cryptographically verifiable certificates for each completed course. Certificates include a unique QR code and can be shared directly to LinkedIn.",
  },
  {
    q: "Is there a student discount?",
    a: "Yes! Students with a valid .edu email or institution ID get 40% off Pro. Contact support@zentrion.dev with your student ID to claim.",
  },
  {
    q: "What is Enterprise pricing?",
    a: "Enterprise is custom-priced based on team size, required features, and SLAs. Contact us at support@zentrion.dev or WhatsApp us for a tailored quote.",
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

  return (
    <div style={{ background: "#ffffff", color: "#0f172a", minHeight: "100vh" }}>

      {/* ============================================================ */}
      {/* HERO SECTION                                                  */}
      {/* ============================================================ */}
      <section
        style={{
          position: "relative",
          padding: "5rem 0 4rem",
          textAlign: "center",
          overflow: "hidden",
          background: "radial-gradient(ellipse 70% 50% at 50% -5%, rgba(99, 102, 241, 0.12), transparent 70%), radial-gradient(circle at 80% 50%, rgba(34, 211, 238, 0.06), transparent 50%)",
        }}
      >
        {/* Grid bg */}
        <div className="hero-grid-bg" style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.4 }} />

        {/* Floating orbs */}
        <div className="animate-float" style={{ position: "absolute", top: "15%", left: "8%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(99, 102, 241, 0.08), transparent 70%)", zIndex: 0, pointerEvents: "none" }} />
        <div className="animate-float-medium" style={{ position: "absolute", top: "20%", right: "8%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(34, 211, 238, 0.1), transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div className="section-eyebrow" style={{ display: "inline-flex", marginBottom: "1.5rem" }}>
            <span>💎</span> Simple, Honest Pricing
          </div>

          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
              fontWeight: 900,
              color: "#0f172a",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: "1.25rem",
            }}
          >
            Invest in Your
            <span style={{ background: "linear-gradient(135deg, #22D3EE 0%, #818CF8 50%, #C084FC 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline-block", paddingLeft: "0.4rem" }}>
              AI Future
            </span>
          </h1>
          <p style={{ fontSize: "1.15rem", color: "#475569", maxWidth: "40rem", margin: "0 auto 2rem", lineHeight: 1.65 }}>
            Hundreds of free lessons, no credit card needed. Upgrade anytime for unlimited premium access, live classes, certificates and AI-powered mentorship.
          </p>

          {/* Trust micro-badges */}
          <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            {["✅ Cancel anytime", "🔒 Secure payments", "🎓 Verifiable certificates", "⚡ Instant access"].map((item) => (
              <span key={item} style={{ fontSize: "0.85rem", color: "#475569", fontWeight: 500 }}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ============================================================ */}
      {/* PRICING CARDS                                                 */}
      {/* ============================================================ */}
      <section style={{ padding: "4rem 0 5rem", background: "#ffffff" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))", gap: "1.5rem", alignItems: "start", maxWidth: "75rem", margin: "0 auto" }}>

            {/* FREE PLAN */}
            <div className="holo-card" style={{ padding: "2.5rem" }}>
              <div style={{ marginBottom: "1.75rem" }}>
                <div className="icon-box icon-box-cyan" style={{ marginBottom: "1rem" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22D3EE" strokeWidth="2"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/><path d="M12 8v4l3 3"/></svg>
                </div>
                <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.35rem" }}>Free Tier</h2>
                <p style={{ color: "#475569", fontSize: "0.9rem", lineHeight: 1.5, margin: 0 }}>Get started with hundreds of free lessons. No card needed.</p>
              </div>

              <div style={{ marginBottom: "2rem" }}>
                <span style={{ fontSize: "3rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em" }}>₹0</span>
                <span style={{ color: "#64748b", fontSize: "0.9rem", marginLeft: "0.4rem" }}>forever</span>
              </div>

              <div style={{ marginBottom: "2rem" }}>
                {[
                  "Free courses across all subjects",
                  "Simulated cybersecurity labs",
                  "AI Workspace (daily limits)",
                  "Community forums & peer support",
                  "Public project showcases",
                ].map((f) => (
                  <div className="feature-check" key={f}>
                    <div className="feature-check-icon">✓</div>
                    <span style={{ color: "#334155", fontSize: "0.9rem" }}>{f}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/auth/sign-up"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "0.85rem 1.5rem",
                  borderRadius: "0.75rem",
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#0f172a",
                  fontWeight: 700,
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
              >
                Get Started Free →
              </Link>
            </div>

            {/* PRO PLAN(s) from DB */}
            {subs.length > 0 ? subs.map((sub, i) => (
              <div
                key={sub.id}
                className="holo-card pricing-card-active"
                style={{ padding: "2.5rem", position: "relative", overflow: "hidden" }}
              >
                <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
                  <span style={{ padding: "0.3rem 0.75rem", borderRadius: "9999px", background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "#fff", fontSize: "0.72rem", fontWeight: 700 }}>
                    MOST POPULAR
                  </span>
                </div>

                {/* Glow overlay */}
                <div style={{ position: "absolute", top: "-40px", right: "-40px", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(99, 102, 241, 0.08), transparent 70%)", pointerEvents: "none" }} />

                <div style={{ marginBottom: "1.75rem", position: "relative" }}>
                  <div className="icon-box" style={{ marginBottom: "1rem" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  </div>
                  <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.35rem" }}>{sub.name}</h2>
                  <p style={{ color: "#475569", fontSize: "0.9rem", lineHeight: 1.5, margin: 0 }}>Full access to every course, lab, live session and AI tool.</p>
                </div>

                <div style={{ marginBottom: "2rem" }}>
                  <span style={{ fontSize: "3rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em" }}>{formatPrice(sub.amountCents)}</span>
                  <span style={{ color: "#64748b", fontSize: "0.9rem", marginLeft: "0.4rem" }}>/ {sub.interval === "year" ? "year" : "month"}</span>
                  {sub.interval === "year" && (
                    <div style={{ marginTop: "0.35rem", fontSize: "0.8rem", color: "#10B981", fontWeight: 600 }}>
                      🎉 Save 40% vs monthly billing
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: "2rem" }}>
                  {[
                    "All premium courses",
                    "Unlimited lab sessions",
                    "Live masterclasses & recordings",
                    "AI Tutor with advanced RAG",
                    "Industry-recognized certificates",
                    "Portfolio builder & career tools",
                    "Priority 24/7 support",
                    "Downloadable resources",
                  ].map((f) => (
                    <div className="feature-check" key={f}>
                      <div className="feature-check-icon">✓</div>
                      <span style={{ color: "#334155", fontSize: "0.9rem" }}>{f}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={`/checkout?product=${sub.slug}`}
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "0.9rem 1.5rem",
                    borderRadius: "0.75rem",
                    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                    color: "#0f172a",
                    fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: "0 0 25px rgba(99, 102, 241, 0.3)",
                    fontSize: "1rem",
                    transition: "all 0.2s ease",
                  }}
                >
                  Get Pro Now →
                </Link>
              </div>
            )) : (
              /* Static Pro card fallback if DB empty */
              <div className="holo-card pricing-card-active" style={{ padding: "2.5rem", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
                  <span style={{ padding: "0.3rem 0.75rem", borderRadius: "9999px", background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "#fff", fontSize: "0.72rem", fontWeight: 700 }}>MOST POPULAR</span>
                </div>
                <div style={{ position: "absolute", top: "-40px", right: "-40px", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(99, 102, 241, 0.08), transparent 70%)", pointerEvents: "none" }} />

                <div style={{ marginBottom: "1.75rem" }}>
                  <div className="icon-box" style={{ marginBottom: "1rem" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  </div>
                  <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.35rem" }}>Zentrion Pro</h2>
                  <p style={{ color: "#475569", fontSize: "0.9rem", lineHeight: 1.5, margin: 0 }}>Full access to every course, lab, live session and AI tool.</p>
                </div>
                <div style={{ marginBottom: "2rem" }}>
                  <span style={{ fontSize: "3rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em" }}>₹4,999</span>
                  <span style={{ color: "#64748b", fontSize: "0.9rem", marginLeft: "0.4rem" }}>/month</span>
                </div>
                <div style={{ marginBottom: "2rem" }}>
                  {["All premium courses", "Unlimited lab sessions", "Live masterclasses", "AI Tutor advanced", "Industry certificates", "Portfolio builder", "Priority support"].map((f) => (
                    <div className="feature-check" key={f}><div className="feature-check-icon">✓</div><span style={{ color: "#334155", fontSize: "0.9rem" }}>{f}</span></div>
                  ))}
                </div>
                <Link href="/contact" style={{ display: "block", textAlign: "center", padding: "0.9rem", borderRadius: "0.75rem", background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "#fff", fontWeight: 700, textDecoration: "none", boxShadow: "0 0 8px rgba(99,102,241,0.1)" }}>
                  Contact for Access →
                </Link>
              </div>
            )}

            {/* ENTERPRISE */}
            <div className="holo-card" style={{ padding: "2.5rem" }}>
              <div style={{ marginBottom: "1.75rem" }}>
                <div className="icon-box icon-box-amber" style={{ marginBottom: "1rem" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                </div>
                <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.35rem" }}>Enterprise</h2>
                <p style={{ color: "#475569", fontSize: "0.9rem", lineHeight: 1.5, margin: 0 }}>For colleges, corporates, and teams of 10+. Custom SLAs and admin tools.</p>
              </div>

              <div style={{ marginBottom: "2rem" }}>
                <span style={{ fontSize: "2.25rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>Custom</span>
                <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>Talk to us for a tailored quote</div>
              </div>

              <div style={{ marginBottom: "2rem" }}>
                {[
                  "Everything in Pro",
                  "Custom learning paths",
                  "Team cohort management",
                  "Admin analytics dashboard",
                  "Dedicated success manager",
                  "SSO & SAML integration",
                  "API access & webhooks",
                  "Whitelabel option",
                ].map((f) => (
                  <div className="feature-check" key={f}>
                    <div className="feature-check-icon" style={{ background: "rgba(245, 158, 11, 0.15)", borderColor: "rgba(245, 158, 11, 0.4)", color: "#F59E0B" }}>✓</div>
                    <span style={{ color: "#334155", fontSize: "0.9rem" }}>{f}</span>
                  </div>
                ))}
              </div>

              <a
                href="https://wa.me/917305771789?text=Hello%20Zentrion%2C%20I%20need%20enterprise%20pricing"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "0.85rem 1.5rem",
                  borderRadius: "0.75rem",
                  background: "rgba(245, 158, 11, 0.12)",
                  border: "1px solid rgba(245, 158, 11, 0.4)",
                  color: "#F59E0B",
                  fontWeight: 700,
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
              >
                💬 Talk to Sales →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FEATURE COMPARISON TABLE                                     */}
      {/* ============================================================ */}
      <section style={{ padding: "4rem 0 5rem", background: "#f8fafc", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>Full Feature Comparison</div>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: "1rem 0 0.5rem" }}>What&apos;s Included in Each Plan</h2>
            <p style={{ color: "#475569" }}>Compare every feature across Free, Pro, and Enterprise.</p>
          </div>

          <div style={{ overflowX: "auto", borderRadius: "1.25rem", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 20px 60px rgba(0,0,0,0.1)" }}>
            <table className="compare-table" style={{ width: "100%", borderCollapse: "collapse", background: "rgba(255,255,255,0.9)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <th style={{ padding: "1.25rem 1.5rem", textAlign: "left", color: "#0f172a", fontWeight: 700, fontSize: "1rem" }}>Feature</th>
                  <th style={{ padding: "1.25rem 1rem", textAlign: "center", color: "#475569", fontWeight: 700, fontSize: "0.9rem", minWidth: 100 }}>Free</th>
                  <th style={{ padding: "1.25rem 1rem", textAlign: "center", color: "#6366F1", fontWeight: 700, fontSize: "0.9rem", minWidth: 100, background: "rgba(99,102,241,0.06)" }}>
                    Pro ⚡
                  </th>
                  <th style={{ padding: "1.25rem 1rem", textAlign: "center", color: "#F59E0B", fontWeight: 700, fontSize: "0.9rem", minWidth: 100 }}>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES_COMPARE.map((row, i) => (
                  <tr key={row.feature} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
                    <td style={{ padding: "0.9rem 1.5rem", color: "#334155", fontSize: "0.9rem" }}>{row.feature}</td>
                    <td style={{ padding: "0.9rem 1rem", textAlign: "center" }}>
                      <span className={row.free ? "compare-check" : "compare-dash"}>{row.free ? "✓" : "—"}</span>
                    </td>
                    <td style={{ padding: "0.9rem 1rem", textAlign: "center", background: "rgba(99,102,241,0.04)" }}>
                      <span className={row.pro ? "compare-check" : "compare-dash"}>{row.pro ? "✓" : "—"}</span>
                    </td>
                    <td style={{ padding: "0.9rem 1rem", textAlign: "center" }}>
                      <span className="compare-check">✓</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* INDIVIDUAL COURSE PURCHASES (if any)                         */}
      {/* ============================================================ */}
      {paidCourses.length > 0 && (
        <section style={{ padding: "4rem 0 5rem", background: "#ffffff", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="container">
            <div style={{ marginBottom: "2.5rem" }}>
              <div className="section-eyebrow" style={{ display: "inline-flex" }}>À La Carte</div>
              <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: "1rem 0 0.5rem" }}>Individual Course Purchases</h2>
              <p style={{ color: "#475569" }}>Own these courses outright — one-time payment, lifetime access, no subscription needed.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(20rem, 1fr))", gap: "1.25rem" }}>
              {paidCourses.map((c) => (
                <div key={c.slug} className="holo-card" style={{ padding: "1.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>{c.name}</h3>
                    <p style={{ color: "#475569", fontSize: "0.8rem", margin: 0 }}>Lifetime access · Certificate included</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a" }}>{formatPrice(c.amountCents)}</div>
                    <Link href={`/courses/${c.slug}`} style={{ color: "#6366F1", fontSize: "0.8rem", fontWeight: 600, textDecoration: "none" }}>View course →</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* TRUST SECTION                                                 */}
      {/* ============================================================ */}
      <section style={{ padding: "4rem 0", background: "#f8fafc", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))", gap: "1.5rem" }}>
            {[
              { icon: "🔒", title: "Secure Payments", desc: "All transactions secured with industry-standard encryption. We never store card data." },
              { icon: "📜", title: "Verified Certificates", desc: "Blockchain-verifiable certificates with unique QR codes shareable on LinkedIn." },
              { icon: "♻️", title: "Cancel Anytime", desc: "No lock-in contracts. Cancel your subscription instantly from your account settings." },
              { icon: "🌍", title: "Global Access", desc: "Learn from anywhere. Platform available 24/7 with 99.9% uptime SLA." },
            ].map((item) => (
              <div key={item.title} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1.5rem", borderRadius: "1rem", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.06)" }}>
                <span style={{ fontSize: "1.75rem", flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.35rem" }}>{item.title}</h3>
                  <p style={{ color: "#475569", fontSize: "0.85rem", lineHeight: 1.55, margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FAQ SECTION                                                   */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "#ffffff", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="container" style={{ maxWidth: "52rem" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex" }}>FAQ</div>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: "1rem 0 0.5rem" }}>Frequently Asked Questions</h2>
            <p style={{ color: "#475569" }}>Everything you need to know before getting started.</p>
          </div>

          <div style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: "1.25rem", background: "rgba(255,255,255,0.85)", overflow: "hidden" }}>
            {FAQS.map((faq, i) => (
              <div key={faq.q} style={{ padding: "1.5rem 2rem", borderBottom: i < FAQS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1.4 }}>{faq.q}</h3>
                  <span style={{ color: "#6366F1", fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>+</span>
                </div>
                <p style={{ color: "#475569", fontSize: "0.9rem", lineHeight: 1.65, margin: "0.75rem 0 0" }}>{faq.a}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <p style={{ color: "#475569", fontSize: "0.9rem" }}>
              Still have questions?{" "}
              <a href="https://wa.me/917305771789" target="_blank" rel="noopener noreferrer" style={{ color: "#25D366", fontWeight: 600, textDecoration: "none" }}>
                Chat with us on WhatsApp →
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* BOTTOM CTA                                                    */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 0", background: "#f8fafc", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="container">
          <div style={{ textAlign: "center", padding: "4rem 2rem", borderRadius: "1.5rem", background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,211,238,0.08))", border: "1px solid rgba(99,102,241,0.3)", boxShadow: "0 20px 60px rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 900, color: "#0f172a", marginBottom: "1rem" }}>
              Start Learning for Free Today
            </h2>
            <p style={{ color: "#475569", fontSize: "1.1rem", maxWidth: "34rem", margin: "0 auto 2rem", lineHeight: 1.65 }}>
              Join thousands of learners. No credit card required. Upgrade to Pro when you&apos;re ready.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/auth/sign-up" style={{ padding: "0.9rem 2rem", borderRadius: "0.75rem", background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "#fff", fontWeight: 700, textDecoration: "none", boxShadow: "0 0 8px rgba(99,102,241,0.1)", fontSize: "1rem" }}>
                Create Free Account
              </Link>
              <Link href="/courses" style={{ padding: "0.9rem 2rem", borderRadius: "0.75rem", background: "rgba(248,250,252,0.6)", border: "1px solid rgba(0,0,0,0.15)", color: "#0f172a", fontWeight: 600, textDecoration: "none", fontSize: "1rem" }}>
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
