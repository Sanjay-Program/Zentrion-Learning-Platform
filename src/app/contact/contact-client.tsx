"use client";
import Link from "next/link";
import { useState } from "react";

const CONTACT_CARDS = [
  {
    icon: "📞",
    title: "Admissions Helpline",
    value: "+91 7305771789",
    href: "tel:+917305771789",
    color: "#38BDF8",
    desc: "Mon–Sat, 9 AM – 9 PM IST",
  },
  {
    icon: "💬",
    title: "WhatsApp Support",
    value: "Chat on WhatsApp",
    href: "https://wa.me/917305771789?text=Hello%20Zentrion%20Learntech%2C%20I%20want%20to%20know%20more%20about%20your%20courses",
    color: "#25D366",
    desc: "Instant response during business hours",
  },
  {
    icon: "✉️",
    title: "General Enquiries",
    value: "hello@zentrion.dev",
    href: "mailto:hello@zentrion.dev",
    color: "#6366F1",
    desc: "We reply within 2 business days",
  },
  {
    icon: "🔒",
    title: "Security Disclosure",
    value: "security@zentrion.dev",
    href: "mailto:security@zentrion.dev",
    color: "#10B981",
    desc: "Responsible disclosure. Priority response.",
  },
];

export default function ContactClientPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", topic: "general", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ background: "var(--bg, #060913)", color: "var(--text, #F8FAFC)", minHeight: "100vh" }}>

      {/* ============================================================ */}
      {/* HERO                                                          */}
      {/* ============================================================ */}
      <section
        style={{
          position: "relative",
          padding: "5rem 0 4rem",
          overflow: "hidden",
          background: "radial-gradient(ellipse 70% 40% at 50% -5%, rgba(99, 102, 241, 0.18), transparent 70%)",
        }}
      >
        <div className="hero-grid-bg" style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.3 }} />
        <div className="animate-float" style={{ position: "absolute", top: "10%", left: "5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#64748B", marginBottom: "2rem" }}>
            <Link href="/" style={{ color: "#64748B", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span style={{ color: "#94A3B8" }}>Contact</span>
          </div>

          <div style={{ textAlign: "center", maxWidth: "48rem", margin: "0 auto" }}>
            <div className="section-eyebrow" style={{ display: "inline-flex", marginBottom: "1.5rem" }}>
              <span>💌</span> Get In Touch
            </div>
            <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "1.25rem" }}>
              We&apos;re Here to{" "}
              <span style={{ background: "linear-gradient(135deg, #22D3EE 0%, #818CF8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Help You
              </span>
            </h1>
            <p style={{ fontSize: "1.1rem", color: "#94A3B8", lineHeight: 1.7 }}>
              Whether it&apos;s about courses, campus deployments, enterprise training, or technical support — our team responds fast.
            </p>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ============================================================ */}
      {/* CONTACT CHANNELS CARDS                                       */}
      {/* ============================================================ */}
      <section style={{ padding: "4rem 0 3rem", background: "#0A0F1D" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))", gap: "1.25rem" }}>
            {CONTACT_CARDS.map((c) => (
              <a
                key={c.title}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                style={{ textDecoration: "none" }}
              >
                <div className="holo-card" style={{ padding: "2rem", cursor: "pointer" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{c.icon}</div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.4rem" }}>{c.title}</h3>
                  <div style={{ color: c.color, fontWeight: 700, fontSize: "1rem", marginBottom: "0.4rem" }}>{c.value}</div>
                  <p style={{ color: "#64748B", fontSize: "0.82rem", margin: 0 }}>{c.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CONTACT FORM + INFO                                          */}
      {/* ============================================================ */}
      <section style={{ padding: "4rem 0 6rem", background: "var(--bg-subtle, #0a0f24)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(24rem, 1fr))", gap: "3rem", alignItems: "start" }}>

            {/* Form */}
            <div>
              <div className="section-eyebrow" style={{ display: "inline-flex", marginBottom: "1.5rem" }}>Send a Message</div>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "0.75rem" }}>
                Tell Us How We Can Help
              </h2>
              <p style={{ color: "#94A3B8", fontSize: "0.95rem", lineHeight: 1.65, marginBottom: "2rem" }}>
                Fill in the form and we&apos;ll get back to you within 2 business days.
              </p>

              {submitted ? (
                <div style={{ padding: "2.5rem", borderRadius: "1.25rem", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", textAlign: "center" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.5rem" }}>Message Received!</h3>
                  <p style={{ color: "#94A3B8", fontSize: "0.9rem", margin: 0 }}>
                    Thanks {formData.name ? formData.name.split(" ")[0] : "for reaching out"}! We&apos;ll get back to you at{" "}
                    <strong style={{ color: "#FFFFFF" }}>{formData.email}</strong> within 2 business days.
                  </p>
                  <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                    <Link href="/courses" style={{ padding: "0.65rem 1.25rem", borderRadius: "0.65rem", background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "#fff", fontWeight: 600, textDecoration: "none", fontSize: "0.9rem" }}>
                      Browse Courses
                    </Link>
                    <button onClick={() => setSubmitted(false)} style={{ padding: "0.65rem 1.25rem", borderRadius: "0.65rem", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#F8FAFC", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer" }}>
                      Send Another
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "0.4rem" }}>Full Name *</label>
                      <input
                        required
                        type="text"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.65rem", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.12)", color: "#FFFFFF", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
                        className="input-glow"
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "0.4rem" }}>Email *</label>
                      <input
                        required
                        type="email"
                        placeholder="you@email.com"
                        value={formData.email}
                        onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                        style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.65rem", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.12)", color: "#FFFFFF", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
                        className="input-glow"
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "0.4rem" }}>Phone (Optional)</label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                        style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.65rem", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.12)", color: "#FFFFFF", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
                        className="input-glow"
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "0.4rem" }}>Topic *</label>
                      <select
                        required
                        value={formData.topic}
                        onChange={e => setFormData(p => ({ ...p, topic: e.target.value }))}
                        style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.65rem", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.12)", color: "#CBD5E1", fontSize: "0.9rem", outline: "none", cursor: "pointer", boxSizing: "border-box" }}
                        className="input-glow"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="courses">Courses & Learning</option>
                        <option value="colleges">College Partnership</option>
                        <option value="enterprise">Enterprise Training</option>
                        <option value="technical">Technical Support</option>
                        <option value="billing">Billing & Payments</option>
                        <option value="security">Security Disclosure</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "0.4rem" }}>Message *</label>
                    <textarea
                      required
                      rows={6}
                      placeholder="Tell us what you need help with..."
                      value={formData.message}
                      onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                      style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.65rem", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.12)", color: "#FFFFFF", fontSize: "0.9rem", outline: "none", resize: "vertical", boxSizing: "border-box", minHeight: "140px", fontFamily: "inherit" }}
                      className="input-glow"
                    />
                  </div>

                  <button
                    type="submit"
                    style={{ padding: "0.9rem 2rem", borderRadius: "0.75rem", background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "#FFFFFF", fontWeight: 700, fontSize: "1rem", border: "none", cursor: "pointer", boxShadow: "0 0 25px rgba(99,102,241,0.4)", transition: "all 0.2s ease", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                  >
                    📨 Send Message
                  </button>

                  <p style={{ color: "#64748B", fontSize: "0.8rem", margin: 0 }}>
                    For urgent matters,{" "}
                    <a href="https://wa.me/917305771789" target="_blank" rel="noopener noreferrer" style={{ color: "#25D366", fontWeight: 600, textDecoration: "none" }}>WhatsApp us</a>{" "}
                    for an instant response.
                  </p>
                </form>
              )}
            </div>

            {/* Right: Info panels */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

              {/* Office hours */}
              <div className="holo-card" style={{ padding: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                  <div style={{ fontSize: "1.5rem" }}>🕐</div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>Support Hours</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {[
                    { label: "Phone & WhatsApp", value: "Mon–Sat, 9AM–9PM", color: "#FFFFFF" },
                    { label: "Email Response", value: "Within 2 business days", color: "#FFFFFF" },
                    { label: "Security Issues", value: "Priority (24 hrs)", color: "#10B981" },
                  ].map((item, i, arr) => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none", paddingBottom: i < arr.length - 1 ? "0.65rem" : 0 }}>
                      <span style={{ color: "#94A3B8", fontSize: "0.9rem" }}>{item.label}</span>
                      <span style={{ color: item.color, fontWeight: 600, fontSize: "0.9rem" }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick links */}
              <div className="holo-card" style={{ padding: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                  <div style={{ fontSize: "1.5rem" }}>🔗</div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>Quick Links</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                  {[
                    { label: "📚 Browse All Courses", href: "/courses" },
                    { label: "💰 View Pricing", href: "/pricing" },
                    { label: "🏫 For Colleges", href: "/for-colleges" },
                    { label: "🏢 For Enterprises", href: "/for-enterprises" },
                    { label: "❓ Help Centre", href: "/help" },
                  ].map((l) => (
                    <Link key={l.href} href={l.href} style={{ color: "#94A3B8", fontSize: "0.9rem", textDecoration: "none", padding: "0.35rem 0", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span>{l.label}</span>
                      <span style={{ color: "#6366F1" }}>→</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Company info */}
              <div className="holo-card" style={{ padding: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div style={{ fontSize: "1.5rem" }}>🏢</div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>Company</h3>
                </div>
                <div style={{ color: "#94A3B8", fontSize: "0.9rem", lineHeight: 1.7 }}>
                  <strong style={{ color: "#FFFFFF" }}>Zentrion Learntech Pvt. Ltd.</strong><br />
                  India · Serving learners globally<br />
                  <a href="mailto:support@zentrion.dev" style={{ color: "#6366F1", textDecoration: "none", fontWeight: 600 }}>support@zentrion.dev</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
