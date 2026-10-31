"use client";

import { useState } from "react";
import Link from "next/link";

interface RoiTier {
  hoursSavedPerEng: number;
  contractorSavingsPct: number;
  speedMultiplier: number;
  baseCostPerSeat: number; // in USD approx or converted display
}

const TRACKS = [
  { id: "ai-agents", name: "AI Agents & Autonomous Systems", icon: "🤖", mult: 1.2 },
  { id: "cybersecurity", name: "Enterprise Cybersecurity & SOC Labs", icon: "🛡️", mult: 1.25 },
  { id: "genai-apps", name: "Full-Stack GenAI & RAG Applications", icon: "⚡", mult: 1.1 },
  { id: "all-inclusive", name: "Complete Enterprise All-Access Track", icon: "🌐", mult: 1.35 },
];

export function EnterpriseRoiCalculator() {
  const [teamSize, setTeamSize] = useState<number>(50);
  const [selectedTrack, setSelectedTrack] = useState<string>("ai-agents");
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [showInquiryModal, setShowInquiryModal] = useState<boolean>(false);

  const trackObj = TRACKS.find((t) => t.id === selectedTrack) || TRACKS[0];

  // Calculations
  const hoursSavedPerYearPerEng = Math.round(160 * trackObj.mult);
  const totalHoursSaved = teamSize * hoursSavedPerYearPerEng;
  
  // Cost savings calculation
  const avgHourlyCost = currency === "INR" ? 1800 : 65; // ₹1800/hr or $65/hr
  const totalValueCreated = Math.round((totalHoursSaved * avgHourlyCost * 0.45)); // Value of gained dev productivity
  const contractorSavings = Math.round((teamSize * (currency === "INR" ? 350000 : 4200)));

  const formatNumber = (num: number) => {
    if (currency === "INR") {
      if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
      if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakhs`;
      return `₹${num.toLocaleString("en-IN")}`;
    } else {
      if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
      if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
      return `$${num.toLocaleString("en-US")}`;
    }
  };

  return (
    <div
      id="roi-calculator"
      style={{
        borderRadius: "1.5rem",
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 15, 29, 0.9) 100%)",
        border: "1px solid rgba(99, 102, 241, 0.25)",
        boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.08)",
        padding: "2.5rem 2rem",
        backdropFilter: "blur(20px)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0.85rem", borderRadius: "9999px", background: "rgba(99, 102, 241, 0.12)", border: "1px solid rgba(99, 102, 241, 0.25)", color: "#818CF8", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            <span>🧮</span> Interactive Enterprise ROI Estimator
          </div>
          <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#FFFFFF", margin: 0, letterSpacing: "-0.02em" }}>
            Calculate Your Workforce Impact
          </h3>
          <p style={{ color: "#94A3B8", fontSize: "0.95rem", marginTop: "0.5rem", maxWidth: "34rem", lineHeight: 1.6 }}>
            Adjust team headcount and training domain to forecast annual engineering velocity, productivity gains, and budget savings.
          </p>
        </div>

        {/* Currency Switcher */}
        <div style={{ display: "flex", background: "rgba(255, 255, 255, 0.06)", borderRadius: "0.75rem", padding: "0.25rem", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <button
            type="button"
            onClick={() => setCurrency("INR")}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: "0.5rem",
              border: "none",
              background: currency === "INR" ? "linear-gradient(135deg, #6366F1, #8B5CF6)" : "transparent",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            ₹ INR
          </button>
          <button
            type="button"
            onClick={() => setCurrency("USD")}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: "0.5rem",
              border: "none",
              background: currency === "USD" ? "linear-gradient(135deg, #6366F1, #8B5CF6)" : "transparent",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            $ USD
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))", gap: "2.5rem", alignItems: "center" }}>
        {/* Controls Column */}
        <div>
          {/* Headcount Slider */}
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <label htmlFor="team-slider" style={{ color: "#E2E8F0", fontSize: "0.95rem", fontWeight: 700 }}>
                Engineering / Team Headcount
              </label>
              <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#22D3EE", background: "rgba(34, 211, 238, 0.1)", padding: "0.2rem 0.75rem", borderRadius: "0.5rem", border: "1px solid rgba(34, 211, 238, 0.3)" }}>
                {teamSize} engineers
              </span>
            </div>
            <input
              id="team-slider"
              type="range"
              min={15}
              max={1500}
              step={15}
              value={teamSize}
              onChange={(e) => setTeamSize(Number(e.target.value))}
              style={{
                width: "100%",
                height: "8px",
                borderRadius: "4px",
                accentColor: "#6366F1",
                cursor: "pointer",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B", fontSize: "0.75rem", marginTop: "0.4rem" }}>
              <span>15 (Pilot)</span>
              <span>250 (Mid-Size)</span>
              <span>500 (Scale)</span>
              <span>1,500+ (Enterprise)</span>
            </div>
          </div>

          {/* Track Selector */}
          <div>
            <label style={{ color: "#E2E8F0", fontSize: "0.95rem", fontWeight: 700, display: "block", marginBottom: "0.75rem" }}>
              Select Core Upskilling Domain
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {TRACKS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTrack(t.id)}
                  style={{
                    padding: "0.85rem 1rem",
                    borderRadius: "0.75rem",
                    border: selectedTrack === t.id ? "1px solid #6366F1" : "1px solid rgba(255, 255, 255, 0.1)",
                    background: selectedTrack === t.id ? "rgba(99, 102, 241, 0.18)" : "rgba(15, 23, 42, 0.6)",
                    color: selectedTrack === t.id ? "#FFFFFF" : "#94A3B8",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: selectedTrack === t.id ? 700 : 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
                  <span style={{ lineHeight: 1.3 }}>{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Metrics Card */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(16, 185, 129, 0.1))",
            borderRadius: "1.25rem",
            padding: "2rem",
            border: "1px solid rgba(99, 102, 241, 0.35)",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "1.25rem" }}>
            <div style={{ color: "#94A3B8", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: "0.25rem" }}>
              Annual Dev Time Recaptured
            </div>
            <div style={{ fontSize: "2.25rem", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
              {totalHoursSaved.toLocaleString()} <span style={{ fontSize: "1.1rem", color: "#38BDF8", fontWeight: 600 }}>hrs / year</span>
            </div>
            <div style={{ color: "#10B981", fontSize: "0.85rem", fontWeight: 600, marginTop: "0.25rem" }}>
              ⚡ Equivalent to adding {Math.round(totalHoursSaved / 1920)} full-time engineers
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <div style={{ color: "#94A3B8", fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase" }}>
                Productivity Gain
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#22D3EE", marginTop: "0.2rem" }}>
                {formatNumber(totalValueCreated)}
              </div>
            </div>

            <div>
              <div style={{ color: "#94A3B8", fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase" }}>
                Contractor Cost Saved
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#10B981", marginTop: "0.2rem" }}>
                {formatNumber(contractorSavings)}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
            <button
              type="button"
              onClick={() => setShowInquiryModal(true)}
              style={{
                flex: 1,
                minWidth: "12rem",
                padding: "0.85rem 1.25rem",
                borderRadius: "0.75rem",
                background: "linear-gradient(135deg, #6366F1 0%, #10B981 100%)",
                border: "none",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
                boxShadow: "0 0 25px rgba(99, 102, 241, 0.4)",
                textAlign: "center",
              }}
            >
              📥 Request Custom Proposal
            </button>
            <a
              href={`https://wa.me/917305771789?text=Hello%20Zentrion%2C%20I%20used%20the%20ROI%20calculator%20for%20${teamSize}%20engineers%20in%20${encodeURIComponent(trackObj.name)}.%20Please%20share%20proposal.`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "0.85rem 1.25rem",
                borderRadius: "0.75rem",
                background: "rgba(37, 211, 102, 0.15)",
                border: "1px solid rgba(37, 211, 102, 0.4)",
                color: "#25D366",
                fontWeight: 700,
                fontSize: "0.95rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              💬 WhatsApp Concierge
            </a>
          </div>
        </div>
      </div>

      {/* Inquiry Proposal Modal */}
      {showInquiryModal && (
        <EnterpriseProposalModal
          teamSize={teamSize}
          track={trackObj.name}
          onClose={() => setShowInquiryModal(false)}
        />
      )}
    </div>
  );
}

export function EnterpriseProposalModal({
  teamSize,
  track,
  onClose,
}: {
  teamSize: number;
  track: string;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(3, 7, 18, 0.8)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "32rem",
          background: "linear-gradient(135deg, #0A0F1D 0%, #0F172A 100%)",
          borderRadius: "1.5rem",
          border: "1px solid rgba(99, 102, 241, 0.35)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.2)",
          padding: "2.5rem 2rem",
          color: "#FFFFFF",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            background: "rgba(255, 255, 255, 0.1)",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            color: "#CBD5E1",
            cursor: "pointer",
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
            <h4 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "0.5rem" }}>
              Proposal Request Received!
            </h4>
            <p style={{ color: "#94A3B8", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              Thank you, <strong style={{ color: "#F8FAFC" }}>{name}</strong>. Our Enterprise Solutions Director will send your tailored proposal for <strong style={{ color: "#38BDF8" }}>{company}</strong> ({teamSize} seats in {track}) to <strong style={{ color: "#F8FAFC" }}>{email}</strong> within 4 business hours.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <a
                href={`https://wa.me/917305771789?text=Hello%20Zentrion%2C%20I%20just%20submitted%20a%20proposal%20request%20for%20${encodeURIComponent(company)}%20(${teamSize}%20engineers).`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.75rem",
                  background: "#25D366",
                  color: "#000",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  textDecoration: "none",
                }}
              >
                💬 Connect Instantly on WhatsApp
              </a>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "0.75rem 1.25rem",
                  borderRadius: "0.75rem",
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: "0.8rem", color: "#818CF8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>
              Custom Enterprise Package
            </div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "0.5rem" }}>
              Get Your Enterprise Proposal
            </h3>
            <p style={{ color: "#94A3B8", fontSize: "0.85rem", marginBottom: "1.5rem", lineHeight: 1.5 }}>
              Configured for <strong style={{ color: "#22D3EE" }}>{teamSize} seats</strong> in <strong style={{ color: "#A855F7" }}>{track}</strong> with SSO & custom labs.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#CBD5E1", fontWeight: 600, marginBottom: "0.3rem" }}>
                  Full Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Rachel Green"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.5rem",
                    background: "rgba(15, 23, 42, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#FFFFFF",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#CBD5E1", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Work Email *
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="rachel@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "0.5rem",
                      background: "rgba(15, 23, 42, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#FFFFFF",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#CBD5E1", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Company / Organisation *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Acme Inc."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "0.5rem",
                      background: "rgba(15, 23, 42, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#FFFFFF",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#CBD5E1", fontWeight: 600, marginBottom: "0.3rem" }}>
                  Phone / WhatsApp (Optional for faster response)
                </label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.5rem",
                    background: "rgba(15, 23, 42, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#FFFFFF",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  marginTop: "0.5rem",
                  padding: "0.9rem",
                  borderRadius: "0.75rem",
                  background: "linear-gradient(135deg, #6366F1, #10B981)",
                  border: "none",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: "pointer",
                  boxShadow: "0 0 25px rgba(99, 102, 241, 0.4)",
                }}
              >
                Send Proposal to My Email
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export const ENTERPRISE_FAQS = [
  {
    q: "How does SSO and User Provisioning work?",
    a: "Zentrion supports SAML 2.0 and OIDC protocols with zero-friction integration for Okta, Microsoft Entra ID (Azure AD), Google Workspace, and OneLogin. We also support SCIM 2.0 for automated user provisioning and de-provisioning directly from your HRMS.",
  },
  {
    q: "Can we build proprietary or bespoke lab environments for our developers?",
    a: "Yes. Our enterprise tier includes custom lab authoring. We can replicate your production cloud architectures (AWS, Azure, GCP), microservice dependencies, and internal security incident response playbooks in completely isolated sandbox containers.",
  },
  {
    q: "What security compliance and data privacy standards do you meet?",
    a: "Zentrion is ISO 27001-aligned and GDPR-compliant with 99.9% platform availability SLA. Enterprise customer data is tenant-isolated with Row-Level Security (RLS) in dedicated database namespaces. We sign BAAs and DPAs upon request.",
  },
  {
    q: "Do you offer offline AI tutor capabilities for air-gapped or sensitive environments?",
    a: "Yes. Our AI Tutor and evaluation harness support both local LLM endpoints (via Ollama or self-hosted vLLM) and air-gapped deployment configurations with zero external API data transmission.",
  },
  {
    q: "What is your typical deployment timeline from signature to employee rollout?",
    a: "Standard enterprise deployments are live in under 2 weeks. A dedicated Customer Success Manager handles SSO configuration, curriculum mapping to your engineering job levels, cohort provisioning, and executive kick-off masterclasses.",
  },
];

export function EnterpriseFaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const FAQS = ENTERPRISE_FAQS;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "48rem", margin: "0 auto" }}>
      {FAQS.map((faq, i) => {
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
