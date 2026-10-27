"use client";

import { useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/webclient";
import { Button, Field, Input } from "@/components/ui";

/** Run button + model selector for an evaluation dataset. */
export function EvalDetailClient({ datasetId }: { datasetId: number }) {
  const [model, setModel] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    totalCases: number;
    passed: number;
    passRate: number;
  } | null>(null);

  const run = async (e: FormEvent) => {
    e.preventDefault();
    setRunning(true);
    setError(null);
    setSummary(null);
    try {
      const res = await apiFetch<{
        totalCases: number;
        passed: number;
        passRate: number;
      }>(`/api/v1/ai/evals/${datasetId}/run`, {
        method: "POST",
        body: JSON.stringify(model ? { model } : {}),
      });
      setSummary(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Evaluation failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <form onSubmit={run} className="flex" style={{ gap: "var(--space-2)", alignItems: "flex-end" }}>
      <Field label="Model override (optional)" htmlFor="eval-model">
        <Input
          id="eval-model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="Default model"
        />
      </Field>
      <Button type="submit" disabled={running}>
        {running ? "Running…" : "Run evaluation"}
      </Button>
      {error && (
        <p role="alert" style={{ color: "var(--danger)", margin: "var(--space-2) 0 0", width: "100%" }}>
          {error}
        </p>
      )}
      {summary && (
        <p style={{ color: "var(--success)", margin: "var(--space-2) 0 0", width: "100%" }}>
          Run complete: {summary.passed}/{summary.totalCases} passed ({summary.passRate}%)
        </p>
      )}
    </form>
  );
}
