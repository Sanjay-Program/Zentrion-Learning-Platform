"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AuthedUserMenuProps {
  user: {
    id: number;
    displayName: string;
    email: string;
  };
  roles: string[];
}

export function AuthedUserMenu({ user, roles }: AuthedUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isAdmin = roles.includes("admin") || roles.includes("superadmin");
  const isInstructor = roles.includes("instructor") || isAdmin;

  // Primary role badge label
  const roleBadge = isAdmin ? "Admin" : isInstructor ? "Instructor" : "Learner";

  const initials = user.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      {/* User Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User navigation menu"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          background: "rgba(255, 255, 255, 0.06)",
          border: "1px solid var(--border, rgba(255, 255, 255, 0.12))",
          borderRadius: "9999px",
          padding: "0.3rem 0.75rem 0.3rem 0.4rem",
          cursor: "pointer",
          color: "var(--text, #F8FAFC)",
          transition: "all 0.15s ease",
        }}
      >
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
            color: "#FFFFFF",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "0.8rem",
            boxShadow: "0 0 10px rgba(99, 102, 241, 0.4)",
          }}
        >
          {initials}
        </span>
        <span
          className="desktop-only"
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            maxWidth: "110px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {user.displayName.split(" ")[0]}
        </span>
        <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>{isOpen ? "▲" : "▼"}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "260px",
            borderRadius: "1rem",
            background: "var(--card-bg, rgba(10, 15, 29, 0.98))",
            border: "1px solid var(--border-strong, rgba(255, 255, 255, 0.15))",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(99, 102, 241, 0.15)",
            backdropFilter: "blur(20px)",
            padding: "0.75rem 0",
            zIndex: 100,
            animation: "fadeIn 0.15s ease-out",
          }}
        >
          {/* User Header Profile Card */}
          <div
            style={{
              padding: "0.5rem 1rem 0.75rem",
              borderBottom: "1px solid var(--border, rgba(255, 255, 255, 0.08))",
              marginBottom: "0.4rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
              <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-strong, #FFFFFF)" }}>
                {user.displayName}
              </span>
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  padding: "0.15rem 0.5rem",
                  borderRadius: "9999px",
                  background: isAdmin
                    ? "rgba(239, 68, 68, 0.15)"
                    : isInstructor
                    ? "rgba(16, 185, 129, 0.15)"
                    : "rgba(99, 102, 241, 0.15)",
                  color: isAdmin ? "#F87171" : isInstructor ? "#34D399" : "#A5B4FC",
                  border: `1px solid ${
                    isAdmin
                      ? "rgba(239, 68, 68, 0.3)"
                      : isInstructor
                      ? "rgba(16, 185, 129, 0.3)"
                      : "rgba(99, 102, 241, 0.3)"
                  }`,
                }}
              >
                {roleBadge}
              </span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted, #94A3B8)", display: "block" }}>
              {user.email}
            </span>
          </div>

          {/* Navigation Links Group */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Link
              href="/app"
              onClick={() => setIsOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.5rem 1rem",
                fontSize: "0.85rem",
                color: "var(--text, #E2E8F0)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              <span>📚</span> My Learning Dashboard
            </Link>

            <Link
              href="/ai"
              onClick={() => setIsOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.5rem 1rem",
                fontSize: "0.85rem",
                color: "var(--text, #E2E8F0)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              <span>🤖</span> AI Lab & Sandboxes
            </Link>

            <Link
              href="/live"
              onClick={() => setIsOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.5rem 1rem",
                fontSize: "0.85rem",
                color: "var(--text, #E2E8F0)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              <span>🔴</span> Live Class Studio
            </Link>

            <Link
              href="/labs"
              onClick={() => setIsOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.5rem 1rem",
                fontSize: "0.85rem",
                color: "var(--text, #E2E8F0)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              <span>🧪</span> Hands-on Security Labs
            </Link>

            <Link
              href="/challenges"
              onClick={() => setIsOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.5rem 1rem",
                fontSize: "0.85rem",
                color: "var(--text, #E2E8F0)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              <span>🏆</span> CTF Challenges & Flags
            </Link>

            <Link
              href="/projects"
              onClick={() => setIsOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.5rem 1rem",
                fontSize: "0.85rem",
                color: "var(--text, #E2E8F0)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              <span>💼</span> Capstone Projects
            </Link>

            <Link
              href="/certificates"
              onClick={() => setIsOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.5rem 1rem",
                fontSize: "0.85rem",
                color: "var(--text, #E2E8F0)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              <span>📜</span> Earned Certificates
            </Link>

            <Link
              href="/app/settings"
              onClick={() => setIsOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.5rem 1rem",
                fontSize: "0.85rem",
                color: "var(--text, #E2E8F0)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              <span>⚙️</span> Account Settings
            </Link>

            {isInstructor && (
              <Link
                href="/instructor"
                onClick={() => setIsOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.5rem 1rem",
                  fontSize: "0.85rem",
                  color: "#34D399",
                  textDecoration: "none",
                  fontWeight: 600,
                  borderTop: "1px solid var(--border, rgba(255, 255, 255, 0.08))",
                  marginTop: "0.3rem",
                  paddingTop: "0.5rem",
                }}
              >
                <span>🎓</span> Instructor Studio
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.5rem 1rem",
                  fontSize: "0.85rem",
                  color: "#F87171",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                <span>🛡️</span> Admin Console
              </Link>
            )}
          </div>

          {/* Sign Out Action */}
          <div
            style={{
              borderTop: "1px solid var(--border, rgba(255, 255, 255, 0.08))",
              marginTop: "0.4rem",
              paddingTop: "0.4rem",
            }}
          >
            <form action="/auth/sign-out" method="post" style={{ margin: 0 }}>
              <button
                type="submit"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.55rem 1rem",
                  fontSize: "0.85rem",
                  color: "#EF4444",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  textAlign: "left",
                }}
              >
                <span>🚪</span> Sign Out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
