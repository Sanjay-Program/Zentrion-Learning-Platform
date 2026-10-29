"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert } from "@/components/ui";

/** Two-column Sign-up form matching Zentrion Learntech mockup aesthetic. */
export function SignUpForm({ next }: { next: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ displayName: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setFormError("");
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error?.details) setErrors(data.error.details);
        else setFormError(data.error?.message || "Registration failed");
        return;
      }
      // Auto sign-in after registration
      const login = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      if (login.ok) {
        router.push(next);
        router.refresh();
      } else {
        router.push(`/auth/verify-email?notice=check_inbox`);
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 140px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1.5rem",
        background: "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.08), transparent 70%), var(--bg, #060913)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "880px",
          borderRadius: "1.5rem",
          background: "var(--card-bg, #0A0F1D)",
          border: "1px solid var(--border-strong, rgba(0, 0, 0, 0.1))",
          boxShadow: "var(--card-shadow, 0 25px 60px -15px rgba(0, 0, 0, 0.8))",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))",
        }}
      >
        {/* Left Column: Form */}
        <div style={{ padding: "3rem 2.5rem", background: "var(--card-bg, rgba(10, 15, 29, 0.95))" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-strong, #FFFFFF)", marginBottom: "1.5rem" }}>
            Create Your Account
          </h1>

          {/* Social Sign Up Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <button
              type="button"
              style={{
                width: "100%",
                padding: "0.7rem",
                borderRadius: "0.6rem",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#FFFFFF",
                fontSize: "0.9rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                cursor: "pointer",
              }}
            >
              <span style={{ fontWeight: 800, color: "#EA4335" }}>G</span> Continue with Google
            </button>
            <button
              type="button"
              style={{
                width: "100%",
                padding: "0.7rem",
                borderRadius: "0.6rem",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#FFFFFF",
                fontSize: "0.9rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                cursor: "pointer",
              }}
            >
              <span>🐙</span> Continue with GitHub
            </button>
            <button
              type="button"
              style={{
                width: "100%",
                padding: "0.7rem",
                borderRadius: "0.6rem",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#FFFFFF",
                fontSize: "0.9rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                cursor: "pointer",
              }}
            >
              <span></span> Continue with Apple
            </button>
          </div>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "1.25rem 0",
              color: "#64748B",
              fontSize: "0.8rem",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "rgba(0, 0, 0, 0.08)" }} />
            <span style={{ padding: "0 0.75rem" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(0, 0, 0, 0.08)" }} />
          </div>

          {formError && <div style={{ marginBottom: "1rem" }}><Alert tone="danger">{formError}</Alert></div>}

          <form onSubmit={submit} noValidate>
            <div style={{ marginBottom: "1.1rem" }}>
              <label
                htmlFor="displayName"
                style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "0.35rem" }}
              >
                Full Name
              </label>
              <input
                id="displayName"
                type="text"
                placeholder="Full Name"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                required
                autoComplete="name"
                maxLength={120}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.6rem",
                  background: "rgba(15, 23, 42, 0.6)",
                  border: errors.displayName ? "1px solid #EF4444" : "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#FFFFFF",
                  fontSize: "0.95rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {errors.displayName && <p style={{ color: "#EF4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.displayName}</p>}
            </div>

            <div style={{ marginBottom: "1.1rem" }}>
              <label
                htmlFor="email"
                style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "0.35rem" }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
                maxLength={320}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.6rem",
                  background: "rgba(15, 23, 42, 0.6)",
                  border: errors.email ? "1px solid #EF4444" : "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#FFFFFF",
                  fontSize: "0.95rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {errors.email && <p style={{ color: "#EF4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.email}</p>}
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label
                htmlFor="password"
                style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "0.35rem" }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="new-password"
                minLength={10}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.6rem",
                  background: "rgba(15, 23, 42, 0.6)",
                  border: errors.password ? "1px solid #EF4444" : "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#FFFFFF",
                  fontSize: "0.95rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {errors.password && <p style={{ color: "#EF4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.85rem",
                borderRadius: "0.6rem",
                background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "1rem",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 0 20px rgba(99, 102, 241, 0.25)",
              }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <p style={{ color: "#64748B", fontSize: "0.75rem", marginTop: "0.85rem", textAlign: "center" }}>
              By creating an account, you agree to our{" "}
              <Link href="/terms" style={{ color: "#6366F1", textDecoration: "none" }}>Terms</Link> and{" "}
              <Link href="/privacy" style={{ color: "#6366F1", textDecoration: "none" }}>Privacy Policy</Link>.
            </p>
          </form>

          <p style={{ color: "#94A3B8", fontSize: "0.85rem", marginTop: "1.5rem", textAlign: "center" }}>
            Already have an account?{" "}
            <Link
              href={`/auth/sign-in?next=${encodeURIComponent(next)}`}
              style={{ color: "#6366F1", fontWeight: 600, textDecoration: "none" }}
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Right Column: Benefit Panel */}
        <div
          style={{
            padding: "3.5rem 2.5rem",
            background: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #31104b 100%)",
            borderLeft: "1px solid rgba(0, 0, 0, 0.08)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div style={{ marginBottom: "2rem" }}>
            <span
              style={{
                display: "inline-block",
                padding: "0.3rem 0.8rem",
                borderRadius: "9999px",
                background: "rgba(34, 211, 238, 0.06)",
                color: "#0891B2",
                border: "1px solid rgba(34, 211, 238, 0.2)",
                fontSize: "0.75rem",
                fontWeight: 700,
                marginBottom: "1rem",
              }}
            >
              Zentrion Learntech
            </span>
            <h2 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#FFFFFF", lineHeight: 1.25, marginBottom: "0.5rem" }}>
              Join the #1 AI Learning Platform
            </h2>
            <p style={{ color: "#CBD5E1", fontSize: "1rem" }}>
              Start your journey today.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {[
              "Access 7+ courses & hands-on modules",
              "Hands-on projects & simulated labs",
              "Live classes & mentorship",
              "Globally recognized certificates",
            ].map((benefit) => (
              <div key={benefit} style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.2)",
                    border: "1px solid #10B981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#10B981",
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  ✓
                </div>
                <span style={{ color: "#F1F5F9", fontSize: "0.95rem", fontWeight: 500 }}>
                  {benefit}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "3rem",
              padding: "1rem",
              borderRadius: "0.75rem",
              background: "rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div style={{ fontSize: "1.5rem" }}>🚀</div>
            <div>
              <div style={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.85rem" }}>Growing Learner Community</div>
              <div style={{ color: "#94A3B8", fontSize: "0.75rem" }}>Join Google, Microsoft & Amazon alumni</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
