"use client";

import { useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/webclient";
import { Button, Card } from "@/components/ui";

interface LabSession {
  id: number;
  labId: number;
  status: string;
  startedAt: string | null;
  expiresAt: string | null;
  finishedAt: string | null;
  submittedAt: string | null;
  state: Record<string, unknown>;
  events: { id: number; eventType: string; details: string | null; createdAt: string }[];
  grade: { scorePercent: number; rubricScores: unknown[]; feedback: string | null } | null;
  evidence: { id: number; kind: string; reference: string; details: string | null }[];
}

/** Simulated terminal console for a running lab session. */
export function LabConsoleClient({
  labSlug,
  initialSession,
}: {
  labSlug: string;
  initialSession: LabSession;
}) {
  const [session, setSession] = useState(initialSession);
  const [command, setCommand] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isRunning = session.status === "running";

  const post = async (body: Record<string, unknown>) => {
    const res = await apiFetch<{ session: LabSession }>(
      `/api/v1/labs/sessions/${session.id}`,
      { method: "POST", body: JSON.stringify(body) },
    );
    setSession(res.session);
    return res.session;
  };

  const sendCommand = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = command.trim();
    if (!trimmed || !isRunning || busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      // Record the command as a terminal event, then simulate output.
      await post({
        action: "event",
        eventType: "terminal.command",
        details: trimmed,
      });
      const updated = await post({
        action: "state",
        state: {
          ...session.state,
          lastCommand: trimmed,
          lastOutput: `$ ${trimmed}\n(simulated output for ${labSlug})`,
        },
      });
      if (trimmed.toLowerCase() === "milestone") {
        await post({ action: "event", eventType: "milestone", details: "Manual milestone" });
        setNotice("Milestone recorded — it counts toward the rubric.");
      }
      void updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Command failed");
    } finally {
      setBusy(false);
      setCommand("");
    }
  };

  const submit = async () => {
    if (!isRunning || busy) return;
    if (!window.confirm("Submit this session for grading?")) return;
    setBusy(true);
    setError(null);
    try {
      await post({ action: "submit" });
      setNotice("Session submitted — see the grade below.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setBusy(false);
    }
  };

  const close = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/v1/labs/sessions/${session.id}`, { method: "DELETE" });
      setSession((prev) => ({ ...prev, status: "finished" }));
      setNotice("Session closed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Close failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card raised>
      <div
        className="flex justify-between items-center"
        style={{
          padding: "var(--space-3) var(--space-4)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span className="badge">{session.status}</span>
        <span className="text-muted text-sm">
          sandbox: {String(session.state.sandbox ?? "unknown")}
        </span>
      </div>

      <div
        style={{
          padding: "var(--space-4)",
          minHeight: 240,
          maxHeight: 320,
          overflowY: "auto",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "var(--text-sm)",
          background: "var(--surface-2, var(--border))",
        }}
      >
        <p className="text-muted" style={{ margin: "0 0 var(--space-2)" }}>
          Zentrion simulated environment — session #{session.id} started{" "}
          {session.startedAt ? new Date(session.startedAt).toLocaleString() : "—"}
        </p>
        {session.events.map((event) => (
          <p key={event.id} style={{ margin: "0 0 var(--space-1)" }}>
            <span className="text-muted">[{event.eventType}]</span>{" "}
            {event.details ?? ""}
          </p>
        ))}
        {typeof session.state.lastOutput === "string" && (
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            {session.state.lastOutput}
          </p>
        )}
      </div>

      {isRunning ? (
        <form onSubmit={sendCommand} className="flex" style={{ gap: "var(--space-2)", padding: "var(--space-4)", borderTop: "1px solid var(--border)" }}>
          <span style={{ alignSelf: "center", fontFamily: "var(--font-mono, monospace)" }}>$</span>
          <input
            aria-label="Lab command"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Type a command… (try: milestone)"
            style={{
              flex: 1,
              padding: "var(--space-2) var(--space-3)",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
              background: "transparent",
              color: "inherit",
              fontFamily: "var(--font-mono, monospace)",
            }}
          />
          <Button type="submit" disabled={busy || !command.trim()}>
            Run
          </Button>
        </form>
      ) : (
        <div style={{ padding: "var(--space-4)", borderTop: "1px solid var(--border)" }}>
          <p className="text-muted" style={{ margin: 0 }}>
            Session ended.
          </p>
        </div>
      )}

      <div
        className="flex gap-2"
        style={{ padding: "var(--space-4)", borderTop: "1px solid var(--border)", flexWrap: "wrap" }}
      >
        <Button variant="secondary" onClick={() => void submit()} disabled={!isRunning || busy}>
          Submit for grading
        </Button>
        <Button variant="ghost" onClick={() => void close()} disabled={!isRunning || busy}>
          Close session
        </Button>
      </div>

      {error && (
        <p role="alert" style={{ color: "var(--danger)", margin: "0 var(--space-4) var(--space-4)" }}>
          {error}
        </p>
      )}
      {notice && (
        <p style={{ color: "var(--success)", margin: "0 var(--space-4) var(--space-4)" }}>
          {notice}
        </p>
      )}
    </Card>
  );
}
