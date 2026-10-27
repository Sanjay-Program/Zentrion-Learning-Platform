"use client";

import { useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/webclient";
import { Button, Card, Field, Input } from "@/components/ui";

/** Flag submission form for a CTF challenge. */
export function ChallengeClient({
  challengeId,
  maxAttempts,
}: {
  challengeId: number;
  maxAttempts: number;
}) {
  const [flag, setFlag] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    correct: boolean;
    attemptsUsed: number;
    maxAttempts: number;
  } | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await apiFetch<{
        correct: boolean;
        attemptsUsed: number;
        maxAttempts: number;
      }>(`/api/v1/challenges/${challengeId}/attempt`, {
        method: "POST",
        body: JSON.stringify({ flag }),
      });
      setResult(res);
      if (!res.correct) setFlag("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card raised>
      <h3 style={{ marginBottom: "var(--space-4)" }}>Submit flag</h3>
      <form onSubmit={submit} className="flex" style={{ gap: "var(--space-2)", flexWrap: "wrap" }}>
        <Field label="Flag" htmlFor="flag-input">
          <Input
            id="flag-input"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
            placeholder="flag{...}"
            autoComplete="off"
          />
        </Field>
        <Button type="submit" disabled={busy || !flag.trim()}>
          {busy ? "Checking…" : "Submit"}
        </Button>
      </form>

      {result && (
        <p
          role="status"
          style={{
            color: result.correct ? "var(--success)" : "var(--danger)",
            marginTop: "var(--space-4)",
          }}
        >
          {result.correct
            ? "Correct flag — points awarded!"
            : `Incorrect flag. ${result.maxAttempts - result.attemptsUsed} attempts remaining.`}
        </p>
      )}
      {error && (
        <p role="alert" style={{ color: "var(--danger)", marginTop: "var(--space-4)" }}>
          {error}
        </p>
      )}
      <p className="text-muted text-sm" style={{ marginTop: "var(--space-4)", marginBottom: 0 }}>
        Flags are hashed before storage. {maxAttempts} attempts maximum per user.
      </p>
    </Card>
  );
}
