"use client";

import { useState } from "react";
import Link from "next/link";

interface PricingInteractiveProps {
  monthlySlug?: string;
  annualSlug?: string;
  monthlyCents?: number;
  annualCents?: number;
}

export function PricingPlanCards({
  monthlySlug = "pro-monthly",
  annualSlug = "pro-annual",
  monthlyCents = 99900,
  annualCents = 958800,
}: PricingInteractiveProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  const monthlyDisplay = `₹${Math.round(monthlyCents / 100)}`;
  const annualMonthlyEquivalent = `₹${Math.round(annualCents / 1200)}`;
  const annualTotal = `₹${Math.round(annualCents / 100)}`;

  const activeProSlug = billingCycle === "annual" ? (annualSlug || "pro-annual") : (monthlySlug || "pro-monthly");

  return (
    <div>
      {/* Billing Switcher Toggle */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginBottom: "3.5rem", flexWrap: "wrap" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "0.35rem",
            background: "rgba(15, 23, 42, 0.9)",
            borderRadius: "9999px",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          }}
        >
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            style={{
              padding: "0.55rem 1.4rem",
              borderRadius: "9999px",
              border: "none",
              background: billingCycle === "monthly" ? "linear-gradient(135deg, #6366F1, #8B5CF6)" : "transparent",
              color: billingCycle === "monthly" ? "#FFFFFF" : "#94A3B8",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            style={{
              padding: "0.55rem 1.4rem",
              borderRadius: "9999px",
              border: "none",
              background: billingCycle === "annual" ? "linear-gradient(135deg, #6366F1, #8B5CF6)" : "transparent",
              color: billingCycle === "annual" ? "#FFFFFF" : "#94A3B8",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span>Annual Billing</span>
            <span
              style={{
                fontSize: "0.7rem",
                padding: "0.15rem 0.5rem",
                borderRadius: "9999px",
                background: "#10B981",
                color: "#FFFFFF",
                fontWeight: 800,
              }}
            >
              SAVE 20%
            </span>
          </button>
        </div>
      </div>

      {/* 3 Tier Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))", gap: "2rem", alignItems: "stretch", maxWidth: "76rem", margin: "0 auto" }}>
        
        {/* FREE TIER */}
        <div
          className="holo-card"
          style={{
            padding: "2.5rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(10, 15, 29, 0.9) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ width: 44, height: 44, borderRadius: "0.75rem", background: "rgba(34, 211, 238, 0.12)", border: "1px solid rgba(34, 211, 238, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>
                🌱
              </div>
              <div>
                <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>Free Tier</h3>
                <p style={{ color: "#94A3B8", fontSize: "0.82rem", margin: 0 }}>Foundational AI literacy for everyone</p>
              </div>
            </div>

            <div style={{ marginBottom: "1.75rem" }}>
              <span style={{ fontSize: "3rem", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.03em" }}>₹0</span>
              <span style={{ color: "#94A3B8", fontSize: "0.95rem", marginLeft: "0.5rem" }}>forever free</span>
              <p style={{ color: "#64748B", fontSize: "0.8rem", marginTop: "0.3rem" }}>No credit card or payment info required</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
              {[
                "Access to foundational AI and Python lessons",
                "Hands-on sandbox labs (basic limits)",
                "AI Tutor assistance (5 queries / day)",
                "Community discussion forums",
                "Public verifiable achievement badges",
              ].map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", fontSize: "0.9rem", color: "#CBD5E1" }}>
                  <span style={{ color: "#10B981", fontWeight: 800, fontSize: "1rem" }}>✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/auth/sign-up"
            style={{
              display: "block",
              textAlign: "center",
              padding: "0.9rem 1.5rem",
              borderRadius: "0.75rem",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#FFFFFF",
              fontWeight: 700,
              textDecoration: "none",
              fontSize: "0.95rem",
              transition: "all 0.2s ease",
            }}
          >
            Get Started Free →
          </Link>
        </div>

        {/* PRO TIER (Featured) */}
        <div
          className="holo-card"
          style={{
            padding: "2.5rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, rgba(20, 28, 55, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)",
            border: "2px solid #6366F1",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.25)",
            position: "relative",
            transform: "translateY(-6px)",
          }}
        >
          {/* Most Popular Ribbon */}
          <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
            <span
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "9999px",
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                color: "#FFFFFF",
                fontSize: "0.75rem",
                fontWeight: 800,
                letterSpacing: "0.05em",
                boxShadow: "0 0 15px rgba(99, 102, 241, 0.5)",
              }}
            >
              ⭐ MOST POPULAR
            </span>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ width: 44, height: 44, borderRadius: "0.75rem", background: "rgba(99, 102, 241, 0.2)", border: "1px solid rgba(99, 102, 241, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>
                ⚡
              </div>
              <div>
                <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>Zentrion Pro</h3>
                <p style={{ color: "#38BDF8", fontSize: "0.82rem", margin: 0, fontWeight: 600 }}>For engineers, career switchers & creators</p>
              </div>
            </div>

            <div style={{ marginBottom: "1.75rem" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                <span style={{ fontSize: "3rem", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.03em" }}>
                  {billingCycle === "annual" ? annualMonthlyEquivalent : monthlyDisplay}
                </span>
                <span style={{ color: "#94A3B8", fontSize: "0.95rem" }}>/ month</span>
              </div>
              {billingCycle === "annual" ? (
                <p style={{ color: "#10B981", fontSize: "0.82rem", marginTop: "0.3rem", fontWeight: 600 }}>
                  Billed annually at {annualTotal} (Save ₹2,400/yr)
                </p>
              ) : (
                <p style={{ color: "#94A3B8", fontSize: "0.82rem", marginTop: "0.3rem" }}>
                  Billed monthly. Cancel anytime with 1-click.
                </p>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
              {[
                "All 7+ Flagship Courses (Agentic AI, Cyber, LLM Security)",
                "Unlimited sandboxed GPU labs & CTF terminals",
                "Advanced AI Workspace with full RAG pipeline access",
                "Weekly interactive live masterclasses & recordings",
                "Cryptographic certificates with QR verification",
                "Portfolio builder with production GitHub repositories",
                "Priority 24/7 technical and mentor Q&A support",
              ].map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", fontSize: "0.9rem", color: "#FFFFFF" }}>
                  <span style={{ color: "#22D3EE", fontWeight: 800, fontSize: "1rem" }}>✓</span>
                  <span style={{ fontWeight: 500 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <Link
            href={`/checkout?product=${activeProSlug}`}
            style={{
              display: "block",
              textAlign: "center",
              padding: "0.95rem 1.5rem",
              borderRadius: "0.75rem",
              background: "linear-gradient(135deg, #6366F1 0%, #10B981 100%)",
              color: "#FFFFFF",
              fontWeight: 800,
              textDecoration: "none",
              fontSize: "1rem",
              boxShadow: "0 0 25px rgba(99, 102, 241, 0.45)",
              transition: "all 0.2s ease",
            }}
          >
            Upgrade to Pro Now →
          </Link>
        </div>

        {/* ENTERPRISE & COLLEGE TIER */}
        <div
          className="holo-card"
          style={{
            padding: "2.5rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(10, 15, 29, 0.9) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ width: 44, height: 44, borderRadius: "0.75rem", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>
                🏢
              </div>
              <div>
                <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>Institution</h3>
                <p style={{ color: "#94A3B8", fontSize: "0.82rem", margin: 0 }}>For tech companies, colleges & universities</p>
              </div>
            </div>

            <div style={{ marginBottom: "1.75rem" }}>
              <span style={{ fontSize: "3rem", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.03em" }}>Custom</span>
              <p style={{ color: "#64748B", fontSize: "0.8rem", marginTop: "0.3rem" }}>Volume seat discounts, tailored SLAs & invoicing</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
              {[
                "Multi-tenant departmental portal & white-labeling",
                "Okta, Azure AD, Google SSO & SCIM user sync",
                "Custom lab scenarios matching internal cloud architecture",
                "Cohort skills-gap & NAAC/NBA compliance exports",
                "Dedicated Customer Success Manager & quarterly QBRs",
                "Full REST API and webhook integrations",
              ].map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", fontSize: "0.9rem", color: "#CBD5E1" }}>
                  <span style={{ color: "#10B981", fontWeight: 800, fontSize: "1rem" }}>✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <Link
              href="/for-enterprises"
              style={{
                display: "block",
                textAlign: "center",
                padding: "0.85rem 1.25rem",
                borderRadius: "0.75rem",
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.35)",
                color: "#818CF8",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: "0.9rem",
              }}
            >
              Enterprise Solutions →
            </Link>
            <Link
              href="/for-colleges"
              style={{
                display: "block",
                textAlign: "center",
                padding: "0.85rem 1.25rem",
                borderRadius: "0.75rem",
                background: "rgba(34, 211, 238, 0.12)",
                border: "1px solid rgba(34, 211, 238, 0.3)",
                color: "#22D3EE",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: "0.9rem",
              }}
            >
              Colleges & Universities →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export function PricingFaqAccordion({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "48rem", margin: "0 auto" }}>
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={faq.q}
            style={{
              borderRadius: "1rem",
              background: isOpen ? "rgba(15, 23, 42, 0.95)" : "rgba(10, 15, 29, 0.6)",
              border: isOpen ? "1px solid rgba(99, 102, 241, 0.35)" : "1px solid rgba(255, 255, 255, 0.08)",
              overflow: "hidden",
              transition: "all 0.25s ease",
            }}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              style={{
                width: "100%",
                padding: "1.25rem 1.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "transparent",
                border: "none",
                color: "#FFFFFF",
                fontSize: "1.05rem",
                fontWeight: 700,
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <span>{faq.q}</span>
              <span style={{ fontSize: "1.25rem", color: isOpen ? "#22D3EE" : "#64748B", transition: "transform 0.2s ease", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                ↓
              </span>
            </button>
            {isOpen && (
              <div style={{ padding: "0 1.5rem 1.25rem", color: "#94A3B8", fontSize: "0.95rem", lineHeight: 1.7 }}>
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
