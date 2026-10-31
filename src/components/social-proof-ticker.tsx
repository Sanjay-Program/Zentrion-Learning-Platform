"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ActivityItem {
  id: string;
  name: string;
  city: string;
  course: string;
  slug: string;
  price: string;
  timeAgo: string;
  avatarText: string;
}

const RECENT_ENROLLMENTS: ActivityItem[] = [
  {
    id: "1",
    name: "Rohit S.",
    city: "Bengaluru",
    course: "AI Foundations & Fluency",
    slug: "ai-foundations-and-fluency",
    price: "₹999",
    timeAgo: "3m ago",
    avatarText: "RS",
  },
  {
    id: "2",
    name: "Ananya M.",
    city: "Hyderabad",
    course: "Cybersecurity & LLM Security",
    slug: "ai-cybersecurity-and-llm-security",
    price: "₹1,499",
    timeAgo: "7m ago",
    avatarText: "AM",
  },
  {
    id: "3",
    name: "Sameer R.",
    city: "Mumbai",
    course: "Prompt & Context Engineering",
    slug: "prompt-and-context-engineering",
    price: "₹499",
    timeAgo: "12m ago",
    avatarText: "SR",
  },
  {
    id: "4",
    name: "Priya D.",
    city: "Pune",
    course: "Data Science & RAG Pipelines",
    slug: "build-ai-apps-apis-rag",
    price: "₹799",
    timeAgo: "16m ago",
    avatarText: "PD",
  },
  {
    id: "5",
    name: "Vikram N.",
    city: "Chennai",
    course: "Full-Stack AI Automation",
    slug: "ai-business-automation",
    price: "₹1,299",
    timeAgo: "21m ago",
    avatarText: "VN",
  },
  {
    id: "6",
    name: "Sneha B.",
    city: "Delhi NCR",
    course: "Modern Frontend with GenAI",
    slug: "frontend-development-genai",
    price: "₹599",
    timeAgo: "28m ago",
    avatarText: "SB",
  },
];

export function SocialProofTicker() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show after initial 4 seconds
    const initialTimer = setTimeout(() => {
      if (!dismissed) setVisible(true);
    }, 3500);

    // Rotate every 9 seconds
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % RECENT_ENROLLMENTS.length);
        if (!dismissed) setVisible(true);
      }, 500);
    }, 9000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [dismissed]);

  if (dismissed || !visible) return null;

  const item = RECENT_ENROLLMENTS[index];

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        left: "1.5rem",
        zIndex: 900,
        maxWidth: "340px",
        background: "rgba(11, 18, 38, 0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(99, 102, 241, 0.3)",
        borderRadius: "0.85rem",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.15)",
        padding: "0.85rem 1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        transition: "opacity 0.4s ease, transform 0.4s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
      }}
      className="social-proof-toast"
    >
      {/* Avatar Pill */}
      <div
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.8rem",
          fontWeight: 800,
          flexShrink: 0,
        }}
      >
        {item.avatarText}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.72rem", marginBottom: "0.15rem" }}>
          <span style={{ color: "#10B981", fontSize: "0.65rem" }}>●</span>
          <span style={{ color: "#10B981", fontWeight: 700 }}>Live Enrollment</span>
          <span style={{ color: "#64748B" }}>·</span>
          <span style={{ color: "#94A3B8" }}>{item.timeAgo}</span>
        </div>

        <div style={{ fontSize: "0.8rem", color: "#F8FAFC", lineHeight: 1.35, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          <strong style={{ color: "#FFFFFF" }}>{item.name}</strong> ({item.city})
        </div>

        <Link
          href={`/courses/${item.slug}`}
          style={{
            fontSize: "0.76rem",
            color: "#22D3EE",
            fontWeight: 700,
            textDecoration: "none",
            display: "block",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.course} — <span style={{ color: "#FBBF24" }}>{item.price}</span> →
        </Link>
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss activity notification"
        style={{
          background: "none",
          border: "none",
          color: "#64748B",
          cursor: "pointer",
          padding: "0.25rem",
          fontSize: "0.9rem",
          lineHeight: 1,
          alignSelf: "flex-start",
        }}
      >
        ✕
      </button>
    </div>
  );
}
