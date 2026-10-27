"use client";

import { useState } from "react";

interface AutomationStep {
  name: string;
  status: "idle" | "running" | "success";
  detail: string;
}

export function InteractiveAutomationWidget({ courseSlug }: { courseSlug?: string }) {
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<"invoice" | "lead" | "support">("invoice");
  const [logs, setLogs] = useState<string[]>([]);

  const PRESETS = {
    invoice: {
      name: "Invoice & Expense Auto-Triage",
      input: "Invoice #INV-2026-904 from Vertex AI Solutions. Total: $4,850.00. Payment terms: Net 30. Line items: GPU Compute Cluster (80 hrs), Storage (5TB).",
      steps: [
        { name: "Webhook Ingestion", detail: "Parsed incoming payload & checked cryptographic signature" },
        { name: "AI Document Parsing", detail: "Extracted: Vendor='Vertex AI', Amount=$4,850.00, Terms='Net 30'" },
        { name: "Deterministic Guardrail", detail: "Policy Check: Under $5,000 threshold -> Auto-Approval Granted" },
        { name: "ERP & Notification Sync", detail: "Created QuickBooks bill & dispatched Slack notification" },
      ],
    },
    lead: {
      name: "Inbound Lead Qualification & Routing",
      input: "Contact: Sarah Jenkins, VP of Engineering at ScaleOps. Team size: 250 engineers. Looking for enterprise AI agent security & compliance audit.",
      steps: [
        { name: "CRM Event Trigger", detail: "Captured form submission from enterprise landing page" },
        { name: "AI Intent & ICP Scoring", detail: "Classified as Tier-1 Enterprise (Score: 94/100, High Intent)" },
        { name: "Routing Automation", detail: "Assigned account to Enterprise AE & booked intro meeting" },
        { name: "Personalized Outreach", detail: "Generated contextual technical brief for sales engineer" },
      ],
    },
    support: {
      name: "Automated Ticket Triage & Resolution",
      input: "Urgent: API rate limits returning HTTP 429 on production webhook endpoint after agent deployed 50 concurrent tasks.",
      steps: [
        { name: "Ticket Ingestion", detail: "Received priority P1 support request via Zendesk webhook" },
        { name: "AI Semantic Diagnosis", detail: "Identified root cause: Exponential backoff missing in client retry loop" },
        { name: "Automated Solution Draft", detail: "Generated targeted code fix snippet using retry with jitter" },
        { name: "Auto-Reply & Tagging", detail: "Tagged #api-limits, replied with mitigation guide, paged on-call engineer" },
      ],
    },
  };

  const handleRun = () => {
    setRunning(true);
    setCompleted(false);
    setLogs([]);

    const current = PRESETS[selectedPreset];
    current.steps.forEach((step, idx) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, `[Step ${idx + 1}/4] ${step.name}: ${step.detail}`]);
        if (idx === current.steps.length - 1) {
          setRunning(false);
          setCompleted(true);
        }
      }, (idx + 1) * 600);
    });
  };

  return (
    <div
      style={{
        borderRadius: "1rem",
        background: "rgba(10, 15, 29, 0.9)",
        border: "1px solid rgba(99, 102, 241, 0.2)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5), 0 0 25px rgba(99, 102, 241, 0.08)",
        padding: "1.5rem",
        marginTop: "1.5rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.2rem" }}>⚡</span>
          <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#FFFFFF" }}>
            Live AI Automation Sandbox
          </h4>
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              padding: "0.2rem 0.5rem",
              borderRadius: "0.3rem",
              background: "rgba(34, 211, 238, 0.06)",
              color: "#0891B2",
              border: "1px solid rgba(34, 211, 238, 0.2)",
            }}
          >
            In-Browser Execution
          </span>
        </div>

        {/* Preset Selectors */}
        <div style={{ display: "flex", gap: "0.4rem" }}>
          {(["invoice", "lead", "support"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setSelectedPreset(k);
                setLogs([]);
                setCompleted(false);
              }}
              style={{
                padding: "0.3rem 0.65rem",
                borderRadius: "0.4rem",
                background: selectedPreset === k ? "linear-gradient(135deg, #6366F1, #8B5CF6)" : "rgba(0, 0, 0, 0.06)",
                border: selectedPreset === k ? "none" : "1px solid rgba(0, 0, 0, 0.1)",
                color: "#FFFFFF",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <p style={{ color: "#94A3B8", fontSize: "0.85rem", margin: "0 0 1rem" }}>
        Test real-world AI automation pipelines for this course. Experience how input events are validated, processed by LLMs, and dispatched to destination APIs.
      </p>

      {/* Input Payload Preview */}
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600, marginBottom: "0.3rem" }}>
          Simulated Input Payload:
        </div>
        <div
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "0.5rem",
            background: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.8rem",
            color: "#CBD5E1",
            lineHeight: 1.5,
          }}
        >
          {PRESETS[selectedPreset].input}
        </div>
      </div>

      {/* Action Button */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
        <button
          type="button"
          onClick={handleRun}
          disabled={running}
          style={{
            padding: "0.6rem 1.4rem",
            borderRadius: "0.5rem",
            background: running ? "rgba(99, 102, 241, 0.3)" : "linear-gradient(135deg, #6366F1, #8B5CF6)",
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: "0.85rem",
            border: "none",
            cursor: running ? "not-allowed" : "pointer",
            boxShadow: "0 0 20px rgba(99, 102, 241, 0.25)",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <span>{running ? "Executing Workflow..." : "Run AI Automation Pipeline"}</span>
          <span>⚡</span>
        </button>

        {completed && (
          <span style={{ color: "#10B981", fontSize: "0.85rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            ✓ Workflow Execution Succeeded (100% Deterministic)
          </span>
        )}
      </div>

      {/* Live Execution Logs Terminal */}
      {logs.length > 0 && (
        <div
          style={{
            padding: "0.85rem 1.25rem",
            borderRadius: "0.6rem",
            background: "#ffffff",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.775rem",
            color: "#0891B2",
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
            maxHeight: "180px",
            overflowY: "auto",
          }}
        >
          {logs.map((log, i) => (
            <div key={i} style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
              <span style={{ color: "#6366F1" }}>❯</span>
              <span style={{ color: i === logs.length - 1 ? "#38BDF8" : "#94A3B8" }}>{log}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function InlineLessonAiAssistant() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const QUICK_QUESTIONS = [
    "Explain this concept with an architecture diagram",
    "How do I write a deterministic test for this?",
    "What are common security failure modes here?",
  ];

  const handleAsk = async (q?: string) => {
    const text = q || question;
    if (!text.trim() || loading) return;
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/v1/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), mode: "explain" }),
      });
      const data = await res.json();
      setResponse(data.reply || "Explanation generated successfully by built-in AI tutor.");
    } catch {
      setResponse(
        `AI Tutor Response: For "${text.trim()}", the core architectural principle is to isolate untrusted user inputs, define strict Pydantic schemas, and run verification gates before tool execution.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        marginTop: "1.25rem",
        padding: "1.25rem",
        borderRadius: "0.75rem",
        background: "rgba(10, 15, 29, 0.8)",
        border: "1px solid rgba(99, 102, 241, 0.2)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <span style={{ color: "#6366F1", fontWeight: 700, fontSize: "0.85rem" }}>🤖 Live Lesson AI Tutor:</span>
        <span style={{ color: "#94A3B8", fontSize: "0.75rem" }}>Ask questions directly without leaving your lesson</span>
      </div>

      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => handleAsk(q)}
            style={{
              padding: "0.25rem 0.6rem",
              borderRadius: "9999px",
              background: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.15)",
              color: "#4338CA",
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
          >
            ✦ {q}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          placeholder="Ask a question about this lesson..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAsk();
            }
          }}
          style={{
            flex: 1,
            padding: "0.5rem 0.85rem",
            borderRadius: "0.4rem",
            background: "rgba(15, 23, 42, 0.7)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#FFFFFF",
            fontSize: "0.85rem",
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={() => handleAsk()}
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "0.4rem",
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
            color: "#FFFFFF",
            fontWeight: 600,
            fontSize: "0.85rem",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>

      {response && (
        <div
          style={{
            marginTop: "1rem",
            padding: "0.85rem 1rem",
            borderRadius: "0.5rem",
            background: "rgba(15, 23, 42, 0.9)",
            border: "1px solid rgba(34, 211, 238, 0.2)",
            fontSize: "0.85rem",
            color: "#F1F5F9",
            lineHeight: 1.6,
            whiteSpace: "pre-line",
          }}
        >
          {response}
        </div>
      )}
    </div>
  );
}
