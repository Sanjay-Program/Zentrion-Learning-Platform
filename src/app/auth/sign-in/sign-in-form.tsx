"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert } from "@/components/ui";

/** Sign-in form matching Zentrion Learntech aesthetic with 1-Click Demo Login and Theme Support. */
export function SignInForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message || "Sign in failed. Check your credentials.");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Network connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    performLogin(demoEmail, demoPass);
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 140px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1.5rem",
        background: "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15), transparent 70%), var(--bg, #060913)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "2.5rem",
          borderRadius: "1.25rem",
          background: "var(--card-bg, rgba(10, 15, 29, 0.85))",
          border: "1px solid var(--border-strong, rgba(255, 255, 255, 0.1))",
          boxShadow: "var(--card-shadow, 0 25px 50px -12px rgba(0, 0, 0, 0.7))",
          backdropFilter: "blur(16px)",
          textAlign: "center",
        }}
      >
        {/* Brand Header */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "0.5rem",
              background: "linear-gradient(135deg, #6366F1, #22D3EE)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              color: "#fff",
              fontSize: "1.2rem",
            }}
          >
            Z
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.02em", color: "var(--text-strong, #FFFFFF)" }}>
            Zentrion <span style={{ color: "#22D3EE", fontSize: "0.85rem", fontWeight: 600 }}>LEARNTECH</span>
          </span>
        </div>

        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-strong, #FFFFFF)", marginBottom: "0.35rem" }}>
          Welcome Back
        </h1>
        <p style={{ color: "var(--text-muted, #94A3B8)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          Sign in to continue your learning journey.
        </p>

        {/* 1-Click Quick Demo Login Pill Bar */}
        <div
          style={{
            background: "rgba(99, 102, 241, 0.08)",
            border: "1px solid rgba(99, 102, 241, 0.25)",
            borderRadius: "0.75rem",
            padding: "0.85rem",
            marginBottom: "1.5rem",
            textAlign: "left",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#818CF8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              ⚡ 1-Click Quick Demo Login
            </span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-subtle, #64748B)" }}>Instant Access</span>
          </div>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin("learner@zentrion.dev", "Learner12345!")}
              style={{
                flex: 1,
                padding: "0.45rem 0.6rem",
                borderRadius: "0.4rem",
                background: "rgba(99, 102, 241, 0.2)",
                border: "1px solid rgba(99, 102, 241, 0.4)",
                color: "#A5B4FC",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              👤 Learner
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin("instructor@zentrion.dev", "Instructor12345!")}
              style={{
                flex: 1,
                padding: "0.45rem 0.6rem",
                borderRadius: "0.4rem",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.35)",
                color: "#34D399",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              🎓 Instructor
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin("admin@zentrion.dev", "Admin12345!")}
              style={{
                flex: 1,
                padding: "0.45rem 0.6rem",
                borderRadius: "0.4rem",
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                color: "#F87171",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {error && <div style={{ marginBottom: "1.25rem", textAlign: "left" }}><Alert tone="danger">{error}</Alert></div>}

        <form onSubmit={submit} noValidate style={{ textAlign: "left" }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label
              htmlFor="email"
              style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text, #CBD5E1)", marginBottom: "0.4rem" }}
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "0.6rem",
                background: "var(--input-bg, rgba(15, 23, 42, 0.6))",
                border: "1px solid var(--input-border, rgba(255, 255, 255, 0.12))",
                color: "var(--input-text, #FFFFFF)",
                fontSize: "0.95rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
              <label
                htmlFor="password"
                style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text, #CBD5E1)" }}
              >
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                style={{ fontSize: "0.8rem", color: "#818CF8", textDecoration: "none" }}
              >
                Forgot password?
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{
                  width: "100%",
                  padding: "0.75rem 2.8rem 0.75rem 1rem",
                  borderRadius: "0.6rem",
                  background: "var(--input-bg, rgba(15, 23, 42, 0.6))",
                  border: "1px solid var(--input-border, rgba(255, 255, 255, 0.12))",
                  color: "var(--input-text, #FFFFFF)",
                  fontSize: "0.95rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                title={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted, #94A3B8)",
                  cursor: "pointer",
                  fontSize: "1rem",
                  padding: "4px",
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
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
              boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)",
              marginTop: "0.25rem",
              transition: "opacity 0.2s ease",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "1.75rem 0 1.25rem",
            color: "var(--text-subtle, #64748B)",
            fontSize: "0.8rem",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "var(--border, rgba(255, 255, 255, 0.08))" }} />
          <span style={{ padding: "0 0.75rem" }}>or continue with</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border, rgba(255, 255, 255, 0.08))" }} />
        </div>

        {/* Social Buttons */}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button
            type="button"
            title="Continue with Google"
            style={{
              flex: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.65rem",
              borderRadius: "0.6rem",
              background: "var(--surface, rgba(15, 23, 42, 0.8))",
              border: "1px solid var(--border, rgba(255, 255, 255, 0.1))",
              color: "var(--text, #FFFFFF)",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            <span style={{ fontWeight: 800, color: "#EA4335", marginRight: "0.4rem" }}>G</span> Google
          </button>
          <button
            type="button"
            title="Continue with GitHub"
            style={{
              flex: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.65rem",
              borderRadius: "0.6rem",
              background: "var(--surface, rgba(15, 23, 42, 0.8))",
              border: "1px solid var(--border, rgba(255, 255, 255, 0.1))",
              color: "var(--text, #FFFFFF)",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            <span style={{ marginRight: "0.4rem" }}>🐙</span> GitHub
          </button>
          <button
            type="button"
            title="Continue with Apple"
            style={{
              flex: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.65rem",
              borderRadius: "0.6rem",
              background: "var(--surface, rgba(15, 23, 42, 0.8))",
              border: "1px solid var(--border, rgba(255, 255, 255, 0.1))",
              color: "var(--text, #FFFFFF)",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            <span style={{ marginRight: "0.4rem" }}></span> Apple
          </button>
        </div>

        <p style={{ color: "var(--text-muted, #94A3B8)", fontSize: "0.875rem", marginTop: "1.75rem", marginBottom: 0 }}>
          Don&apos;t have an account?{" "}
          <Link
            href={`/auth/sign-up?next=${encodeURIComponent(next)}`}
            style={{ color: "#818CF8", fontWeight: 600, textDecoration: "none" }}
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
