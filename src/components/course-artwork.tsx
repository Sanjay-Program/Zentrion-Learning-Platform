import React from "react";

export interface CourseVisualTheme {
  primaryGradient: string;
  accentColor: string;
  badgeText: string;
  iconType: "agent" | "rag" | "prompt" | "security" | "automation" | "foundations" | "default";
  projectArtifact: string;
}

export const COURSE_THEMES: Record<string, CourseVisualTheme> = {
  "agentic-ai-engineering": {
    primaryGradient: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)",
    accentColor: "#c084fc",
    badgeText: "Priority 1 · Agent Architecture",
    iconType: "agent",
    projectArtifact: "Autonomous Research & Support Agent",
  },
  "build-ai-apps-apis-rag": {
    primaryGradient: "linear-gradient(135deg, #0ea5e9 0%, #059669 50%, #10b981 100%)",
    accentColor: "#34d399",
    badgeText: "Priority 1 · APIs & Vector RAG",
    iconType: "rag",
    projectArtifact: "Production Document Q&A Application",
  },
  "prompt-and-context-engineering": {
    primaryGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #4f46e5 100%)",
    accentColor: "#fbbf24",
    badgeText: "Foundational · Context Mastery",
    iconType: "prompt",
    projectArtifact: "Versioned Prompt Library & Eval Harness",
  },
  "ai-cybersecurity-and-llm-security": {
    primaryGradient: "linear-gradient(135deg, #dc2626 0%, #991b1b 50%, #4338ca 100%)",
    accentColor: "#f87171",
    badgeText: "Defensive · Threat Analysis",
    iconType: "security",
    projectArtifact: "Alert Triage Agent & Lab Validator",
  },
  "ai-business-automation": {
    primaryGradient: "linear-gradient(135deg, #0d9488 0%, #0284c7 50%, #6366f1 100%)",
    accentColor: "#2dd4bf",
    badgeText: "Workplace · Workflow Systems",
    iconType: "automation",
    projectArtifact: "End-to-End Intake & Support Workflow",
  },
  "ai-foundations-and-fluency": {
    primaryGradient: "linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #8b5cf6 100%)",
    accentColor: "#60a5fa",
    badgeText: "Core · Workplace Fluency",
    iconType: "foundations",
    projectArtifact: "Personal AI Productivity Operating System",
  },
};

export const COURSE_IMAGE_MAP: Record<string, string> = {
  "agentic-ai-engineering": "/images/course-covers/A-agentic-ai.png",
  "build-an-autonomous-agent": "/images/course-covers/A-agentic-ai.png",
  "build-ai-apps-apis-rag": "/images/course-covers/B-ai-application-development-rag.png",
  "build-a-rag-chatbot": "/images/course-covers/B-ai-application-development-rag.png",
  "prompt-and-context-engineering": "/images/course-covers/C-prompt-engineering.png",
  "versioned-prompt-library": "/images/course-covers/C-prompt-engineering.png",
  "ai-cybersecurity-and-llm-security": "/images/course-covers/D-ai-cybersecurity.png",
  "defensive-alert-triage-assistant": "/images/course-covers/D-ai-cybersecurity.png",
  "ai-business-automation": "/images/course-covers/E-ai-business-automation.png",
  "lead-intake-automation-workflow": "/images/course-covers/E-ai-business-automation.png",
  "ai-foundations-and-fluency": "/images/lesson-diagrams/01-neural-network.png",
  "personal-ai-productivity-system": "/images/lesson-diagrams/01-neural-network.png",
};


const SLUG_ALIASES: Record<string, string> = {
  "build-an-autonomous-agent": "agentic-ai-engineering",
  "build-a-rag-chatbot": "build-ai-apps-apis-rag",
  "versioned-prompt-library": "prompt-and-context-engineering",
  "defensive-alert-triage-assistant": "ai-cybersecurity-and-llm-security",
  "lead-intake-automation-workflow": "ai-business-automation",
  "personal-ai-productivity-system": "ai-foundations-and-fluency",
};

export function getCourseTheme(slug: string): CourseVisualTheme {
  const target = SLUG_ALIASES[slug] || slug;
  return (
    COURSE_THEMES[target] ?? {
      primaryGradient: "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
      accentColor: "#9ca3af",
      badgeText: "Curriculum Track",
      iconType: "default",
      projectArtifact: "Practical Capstone Deliverable",
    }
  );
}


export function CourseArtwork({
  slug,
  title,
  size = "md",
  className = "",
}: {
  slug: string;
  title?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const theme = getCourseTheme(slug);
  const imageSrc = COURSE_IMAGE_MAP[slug];
  const height = size === "sm" ? 140 : size === "lg" ? 250 : 180;

  return (
    <div
      className={`course-artwork ${className}`}
      style={{
        position: "relative",
        width: "100%",
        height: `${height}px`,
        background: theme.primaryGradient,
        borderRadius: size === "sm" ? "var(--radius-md) var(--radius-md) 0 0" : "var(--radius-lg)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "var(--space-4)",
        color: "#ffffff",
        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.15)",
      }}
    >
      {/* Real Course Artwork Cover Image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={title || theme.badgeText}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            opacity: size === "sm" ? 0.75 : 0.85,
          }}
        />
      )}

      {/* High-Legibility Dark Overlay Scrim */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(to top, rgba(11, 16, 32, 0.95) 0%, rgba(11, 16, 32, 0.5) 55%, rgba(11, 16, 32, 0.25) 100%)",
          pointerEvents: "none",
        }}
      />
      {/* Decorative Geometric Vector Grid */}
      <svg
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "60%",
          height: "100%",
          opacity: 0.18,
          pointerEvents: "none",
        }}
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle cx="160" cy="40" r="80" stroke="#ffffff" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="160" cy="40" r="50" stroke="#ffffff" strokeWidth="2" />
        <circle cx="160" cy="40" r="20" fill="#ffffff" />
        <line x1="160" y1="40" x2="60" y2="140" stroke="#ffffff" strokeWidth="1.5" />
        <rect x="40" y="120" width="40" height="40" rx="8" stroke="#ffffff" strokeWidth="2" />
        <path d="M120 180 L180 120" stroke="#ffffff" strokeWidth="2" />
      </svg>

      {/* Top Banner: Track badge & Artifact Tag */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 1 }}>
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            background: "rgba(0, 0, 0, 0.35)",
            backdropFilter: "blur(6px)",
            padding: "0.25rem 0.55rem",
            borderRadius: "9999px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          {theme.badgeText}
        </span>
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(4px)",
            padding: "0.2rem 0.5rem",
            borderRadius: "4px",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          ✦ Portfolio Project
        </span>
      </div>

      {/* Center/Bottom: Deliverable Highlight */}
      <div style={{ zIndex: 1 }}>
        <div
          style={{
            fontSize: "0.75rem",
            color: "rgba(255, 255, 255, 0.8)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "0.2rem",
          }}
        >
          Capstone Deliverable:
        </div>
        <div
          style={{
            fontSize: size === "sm" ? "0.85rem" : "1.05rem",
            fontWeight: 700,
            color: "#ffffff",
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
          }}
        >
          {theme.projectArtifact}
        </div>
      </div>
    </div>
  );
}
