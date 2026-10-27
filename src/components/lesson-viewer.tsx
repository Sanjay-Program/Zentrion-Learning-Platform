"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, Badge, Button } from "@/components/ui";
import { InteractiveAutomationWidget, InlineLessonAiAssistant } from "@/components/interactive-automation";

export interface LessonViewerProps {
  title: string;
  durationMinutes: number | null;
  lessonType: string;
  content: string | null;
  courseSlug: string;
}

interface ParsedSection {
  title: string;
  content: string;
  sectionNumber?: number;
}

function parseLessonContent(raw: string | null): ParsedSection[] {
  if (!raw) return [];

  // Match ## 1. Learning Objectives or ### 1. or ## Learning Objectives
  const lines = raw.split("\n");
  const sections: ParsedSection[] = [];
  let currentTitle = "Overview";
  let currentLines: string[] = [];
  let currentNum: number | undefined = undefined;

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(?:(\d+)\.\s*)?(.+)$/);
    if (headingMatch) {
      if (currentLines.length > 0 || currentTitle !== "Overview") {
        sections.push({
          title: currentTitle,
          content: currentLines.join("\n").trim(),
          sectionNumber: currentNum,
        });
        currentLines = [];
      }
      currentNum = headingMatch[1] ? parseInt(headingMatch[1], 10) : undefined;
      currentTitle = headingMatch[2].trim();
    } else {
      currentLines.push(line);
    }
  }

  if (currentLines.length > 0 || currentTitle !== "Overview") {
    sections.push({
      title: currentTitle,
      content: currentLines.join("\n").trim(),
      sectionNumber: currentNum,
    });
  }

  return sections;
}

export function LessonViewer({
  title,
  durationMinutes,
  lessonType,
  content,
  courseSlug,
}: LessonViewerProps) {
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const sections = parseLessonContent(content);

  const toggleReveal = (idx: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getSectionIcon = (num?: number, secTitle?: string) => {
    const lower = (secTitle || "").toLowerCase();
    if (num === 1 || lower.includes("objective")) return "🎯";
    if (num === 2 || lower.includes("concept") || lower.includes("explanation")) return "📖";
    if (num === 3 || lower.includes("worked example")) return "💡";
    if (num === 4 || lower.includes("interactive practice") || lower.includes("practice")) return "⚡";
    if (num === 5 || lower.includes("knowledge check") || lower.includes("quiz")) return "❓";
    if (num === 6 || lower.includes("practical assignment") || lower.includes("assignment")) return "🛠️";
    if (num === 7 || lower.includes("ai tutor") || lower.includes("tutor")) return "🤖";
    if (num === 8 || lower.includes("rubric") || lower.includes("assessment")) return "📊";
    if (num === 9 || lower.includes("further reading") || lower.includes("reading")) return "📚";
    if (num === 10 || lower.includes("next step")) return "🚀";
    return "✦";
  };

  const getLessonDiagram = (secNum?: number, secTitle?: string) => {
    const isConceptOrExample = secNum === 2 || secNum === 3;
    if (!isConceptOrExample) return null;

    const lower = (secTitle || "").toLowerCase();

    if (courseSlug === "agentic-ai-engineering") {
      if (secNum === 3 || lower.includes("eval") || lower.includes("benchmark")) {
        return {
          src: "/images/lesson-diagrams/05-ai-evaluation.svg",
          alt: "AI Evaluation & Benchmark Harness Architecture",
          caption: "Architecture Blueprint: Benchmark Dataset, LLM-as-Judge Scorer & Regression Guardrails",
          badge: "Evaluation Framework",
        };
      }
      return {
        src: "/images/lesson-diagrams/04-agent-lifecycle.svg",
        alt: "Autonomous Agent ReAct Lifecycle Architecture",
        caption: "Architecture Blueprint: The Autonomous Agent ReAct Execution Loop (Thought → Tool Call → Observation)",
        badge: "Agent Architecture",
      };
    }

    if (courseSlug === "build-ai-apps-apis-rag") {
      if (secNum === 3 || lower.includes("eval") || lower.includes("judge")) {
        return {
          src: "/images/lesson-diagrams/05-ai-evaluation.svg",
          alt: "RAG Evaluation Architecture",
          caption: "Architecture Blueprint: Ground-Truth Evaluation & Hallucination Scoring Guardrails",
          badge: "RAG Evaluation",
        };
      }
      return {
        src: "/images/lesson-diagrams/03-rag-pipeline.svg",
        alt: "Production RAG Retrieval Pipeline Architecture",
        caption: "Architecture Blueprint: Document Ingestion, Chunking, Embeddings, Vector Search & LLM Response",
        badge: "RAG Pipeline",
      };
    }

    if (courseSlug === "prompt-and-context-engineering") {
      if (secNum === 3 || lower.includes("eval") || lower.includes("benchmark")) {
        return {
          src: "/images/lesson-diagrams/05-ai-evaluation.svg",
          alt: "Prompt Evaluation Harness Architecture",
          caption: "Architecture Blueprint: Systematic Prompt Regression Suite & Scoring Rubric",
          badge: "Prompt Evaluation",
        };
      }
      return {
        src: "/images/lesson-diagrams/02-prompt-anatomy.svg",
        alt: "Production Prompt Anatomy Architecture",
        caption: "Architecture Blueprint: Context Structuring, Delimiters & Few-Shot In-Context Flow",
        badge: "Context Engineering",
      };
    }

    if (courseSlug === "ai-cybersecurity-and-llm-security") {
      if (secNum === 3 || lower.includes("soc") || lower.includes("triage") || lower.includes("incident") || lower.includes("siem")) {
        return {
          src: "/images/lesson-diagrams/08-soc-investigation.svg",
          alt: "SOC Alert Triage & Incident Handling Architecture",
          caption: "Architecture Blueprint: AI-Augmented SOC Telemetry Ingestion, Threat Containment & Audit Playbook",
          badge: "SOC Operations",
        };
      }
      return {
        src: "/images/lesson-diagrams/06-trust-boundaries.svg",
        alt: "AI Trust Boundaries and Threat Modeling Architecture",
        caption: "Architecture Blueprint: Trust Boundary Isolation, Untrusted Inputs, Sandboxed Tools & Output Encoding",
        badge: "Threat Modeling",
      };
    }

    if (courseSlug === "ai-business-automation") {
      return {
        src: "/images/lesson-diagrams/07-business-automation.svg",
        alt: "Event-Driven Business Automation Workflow",
        caption: "Architecture Blueprint: Webhook Triggers, Payload Normalisation, Automated Validation & Human Review Gate",
        badge: "Automation Workflow",
      };
    }

    if (courseSlug === "ai-foundations-and-fluency") {
      return {
        src: "/images/lesson-diagrams/01-neural-network.svg",
        alt: "Neural Network Architecture Diagram",
        caption: "Architecture Blueprint: Multi-Head Transformer Token Representations & Attention Mechanism",
        badge: "Foundational Architecture",
      };
    }

    return null;
  };


  if (sections.length <= 1) {
    return (
      <Card className="mb-6">
        <div style={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>
          {content ?? "Lesson content is being prepared."}
        </div>
      </Card>
    );
  }

  return (
    <div className="lesson-structure-flow">
      {/* 10-Part Standard Lesson Navigator Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          marginBottom: "var(--space-4)",
          padding: "var(--space-3) var(--space-4)",
          background: "var(--bg-subtle)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)",
          overflowX: "auto",
        }}
      >
        <span style={{ fontWeight: 700, color: "var(--text-strong)" }}>Lesson Structure:</span>
        <span>1. Objectives</span> ·
        <span>2. Concept</span> ·
        <span>3. Example</span> ·
        <span>4. Practice</span> ·
        <span>5. Knowledge Check</span> ·
        <span>6. Assignment</span> ·
        <span>7. AI Tutor</span> ·
        <span>8. Rubric</span> ·
        <span>9. References</span> ·
        <span>10. Next</span>
      </div>

      {sections.map((sec, idx) => {
        const isKnowledgeCheck =
          sec.sectionNumber === 5 || sec.title.toLowerCase().includes("knowledge check");
        const isPractice =
          sec.sectionNumber === 4 || sec.title.toLowerCase().includes("practice");
        const isAiTutor =
          sec.sectionNumber === 7 || sec.title.toLowerCase().includes("ai tutor");
        const isAssignment =
          sec.sectionNumber === 6 || sec.title.toLowerCase().includes("assignment");
        const isRubric =
          sec.sectionNumber === 8 || sec.title.toLowerCase().includes("rubric");

        const diagram = getLessonDiagram(sec.sectionNumber, sec.title);

        return (
          <Card
            key={idx}
            className="mb-6"
            style={{
              borderLeft: isAiTutor
                ? "4px solid var(--primary)"
                : isPractice || isKnowledgeCheck
                ? "4px solid var(--accent)"
                : isAssignment
                ? "4px solid var(--warning)"
                : "1px solid var(--border)",
            }}
          >
            <div
              className="flex justify-between items-center mb-3"
              style={{ borderBottom: "1px solid var(--border)", paddingBottom: "var(--space-2)" }}
            >
              <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>{getSectionIcon(sec.sectionNumber, sec.title)}</span>
                <span>
                  {sec.sectionNumber ? `${sec.sectionNumber}. ` : ""}
                  {sec.title}
                </span>
              </h3>
              {sec.sectionNumber && (
                <span className="badge badge-secondary">Part {sec.sectionNumber} of 10</span>
              )}
            </div>

            {/* Special Interactive Section Renderers */}
            {isKnowledgeCheck ? (
              <div>
                <div style={{ whiteSpace: "pre-line", lineHeight: 1.7, marginBottom: "var(--space-4)" }}>
                  {sec.content}
                </div>
                <div style={{ marginTop: "var(--space-3)" }}>
                  <button
                    type="button"
                    onClick={() => toggleReveal(idx)}
                    className="btn btn-secondary btn-sm"
                  >
                    {revealedAnswers[idx] ? "Hide Answer Explanations" : "Reveal Answer & Explanations"}
                  </button>
                  {revealedAnswers[idx] && (
                    <div
                      className="alert alert-info mt-3"
                      style={{ fontSize: "var(--text-sm)", lineHeight: 1.6 }}
                    >
                      <strong>Self-Check Guidance:</strong> Compare your reasoning against the
                      underlying principles explained in Part 2 and Part 3. Ensure your answers account
                      for deterministic output constraints and boundary conditions.
                    </div>
                  )}
                </div>
              </div>
            ) : isAiTutor ? (
              <div>
                <div style={{ whiteSpace: "pre-line", lineHeight: 1.7, marginBottom: "var(--space-4)" }}>
                  {sec.content}
                </div>
                <InlineLessonAiAssistant />
                <div
                  style={{
                    marginTop: "var(--space-4)",
                    padding: "var(--space-4)",
                    background: "rgba(99, 102, 241, 0.1)",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "var(--space-3)",
                    border: "1px solid rgba(99, 102, 241, 0.25)",
                  }}
                >
                  <div>
                    <strong style={{ color: "#FFFFFF" }}>Need custom model execution?</strong>
                    <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "#94A3B8" }}>
                      Switch models, author system prompts, or run agent loops in the full AI Lab workspace.
                    </p>
                  </div>
                  <Link href="/ai" className="btn btn-primary btn-sm">
                    Open AI Lab ↗
                  </Link>
                </div>
              </div>
            ) : isPractice ? (
              <div>
                <div style={{ whiteSpace: "pre-line", lineHeight: 1.7, marginBottom: "var(--space-3)" }}>
                  {sec.content}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(sec.content, idx)}
                  className="btn btn-secondary btn-sm"
                >
                  {copiedIndex === idx ? "✓ Copied to clipboard" : "Copy Practice Exercise"}
                </button>
                <InteractiveAutomationWidget courseSlug={courseSlug} />
              </div>
            ) : (
              <div>
                <div style={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>
                  {sec.content}
                </div>
                {diagram && (
                  <div
                    style={{
                      marginTop: "var(--space-6)",
                      marginBottom: "var(--space-2)",
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                      overflow: "hidden",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <div
                      style={{
                        padding: "var(--space-3) var(--space-4)",
                        background: "var(--bg-subtle)",
                        borderBottom: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "var(--space-2)",
                        flexWrap: "wrap",
                      }}
                    >
                      <span className="badge badge-primary" style={{ fontSize: "11px", letterSpacing: "0.03em" }}>
                        {diagram.badge}
                      </span>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 500 }}>
                        Curriculum Architecture Blueprint
                      </span>
                    </div>
                    <div
                      style={{
                        padding: "var(--space-4)",
                        background: "#ffffff",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src={diagram.src}
                        alt={diagram.alt}
                        style={{
                          width: "100%",
                          maxWidth: "800px",
                          height: "auto",
                          borderRadius: "var(--radius-md)",
                          display: "block",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        padding: "var(--space-2) var(--space-4)",
                        background: "var(--bg-subtle)",
                        borderTop: "1px solid var(--border)",
                        fontSize: "var(--text-xs)",
                        color: "var(--text-muted)",
                        fontStyle: "italic",
                      }}
                    >
                      {diagram.caption}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
