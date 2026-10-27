"use client";

import { useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/webclient";
import { Button, Field, Textarea } from "@/components/ui";

interface Run {
  id: number;
  status: string;
  output: string | null;
  error: string | null;
  stepsUsed: number;
  tokensUsed: number;
  steps: { id: number; stepType: string; content: string | null; toolName: string | null }[];
}

/** Run form + live step trace for a single agent. */
export function AgentDetailClient({ agentId }: { agentId: number }) {
  const [input, setInput] = useState('{\n  "task": "Summarise the key risks of deploying this agent."\n}');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [run, setRun] = useState<Run | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setRunning(true);
    setError(null);
    setRun(null);
    try {
      let inputData: Record<string, unknown>;
      try {
        inputData = JSON.parse(input) as Record<string, unknown>;
      } catch {
        inputData = { task: input };
      }
      const res = await apiFetch<{ run: Run }>(`/api/v1/ai/agents/${agentId}/run`, {
        method: "POST",
        body: JSON.stringify({ inputData }),
      });
      setRun(res.run);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Run failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <Field label="Input data (JSON)" htmlFor="agent-input">
        <Textarea
          id="agent-input"
          rows={6}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </Field>
      <Button type="submit" disabled={running || !input.trim()}>
        {running ? "Running…" : "Run agent"}
      </Button>

      {error && (
        <p role="alert" style={{ color: "var(--danger)", marginTop: "var(--space-4)" }}>
          {error}
        </p>
      )}

      {run && (
        <div style={{ marginTop: "var(--space-6)" }}>
          <p className="font-semibold">
            Run #{run.id} — {run.status}
          </p>
          <p className="text-muted text-sm">
            {run.stepsUsed} steps · {run.tokensUsed} tokens
          </p>
          <ol style={{ paddingLeft: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {run.steps.map((step) => (
              <li key={step.id}>
                <span className="badge">{step.stepType}</span>
                {step.toolName && <span className="badge badge-secondary ml-2">{step.toolName}</span>}
                {step.content && (
                  <pre
                    style={{
                      margin: "var(--space-2) 0 0",
                      padding: "var(--space-2)",
                      background: "var(--border)",
                      borderRadius: "var(--radius)",
                      fontSize: "var(--text-sm)",
                      overflow: "auto",
                      maxHeight: 160,
                    }}
                  >
                    {step.content}
                  </pre>
                )}
              </li>
            ))}
          </ol>
          {run.output && (
            <div style={{ marginTop: "var(--space-4)" }}>
              <p className="font-semibold">Final output</p>
              <pre
                style={{
                  padding: "var(--space-3)",
                  background: "var(--border)",
                  borderRadius: "var(--radius)",
                  overflow: "auto",
                  maxHeight: 240,
                  fontSize: "var(--text-sm)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {run.output}
              </pre>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
