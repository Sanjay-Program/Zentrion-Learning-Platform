"use client";

import { useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/webclient";
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Textarea,
} from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

interface Submission {
  id: number;
  content: string | null;
  status: string;
  submittedAt: string;
  lessonId: number | null;
  lessonTitle: string | null;
  courseId: number;
  courseTitle: string;
  learnerId: number;
  learnerName: string;
  learnerEmail: string;
  grade: { scorePercent: number; feedback: string | null } | null;
}

/** Grading queue with inline grade form. */
export function SubmissionsClient({
  initialSubmissions,
}: {
  initialSubmissions: Submission[];
}) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [grading, setGrading] = useState<number | null>(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startGrading = (s: Submission) => {
    setGrading(s.id);
    setScore(s.grade ? String(s.grade.scorePercent) : "");
    setFeedback(s.grade?.feedback ?? "");
    setError(null);
  };

  const submitGrade = async (e: FormEvent) => {
    e.preventDefault();
    if (grading === null) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch<{
        submissionId: number;
        scorePercent: number;
        feedback: string;
        status: string;
      }>(`/api/v1/instructor/submissions/${grading}/grade`, {
        method: "POST",
        body: JSON.stringify({
          scorePercent: Number(score),
          feedback,
        }),
      });
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === res.submissionId
            ? {
                ...s,
                status: res.status,
                grade: { scorePercent: res.scorePercent, feedback: res.feedback },
              }
            : s,
        ),
      );
      setGrading(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to grade");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {submissions.length === 0 ? (
        <Card>
          <EmptyState
            title="Nothing to grade"
            description="Submissions from learners in your courses will appear here."
          />
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {submissions.map((s) => (
            <Card key={s.id} raised>
              <div className="flex justify-between items-start" style={{ gap: "var(--space-3)", flexWrap: "wrap" }}>
                <div>
                  <p className="font-semibold">
                    {s.learnerName}{" "}
                    <span className="text-muted text-sm">&lt;{s.learnerEmail}&gt;</span>
                  </p>
                  <p className="text-muted text-sm">
                    {s.lessonTitle ?? "Project submission"} · {s.courseTitle} ·{" "}
                    submitted {formatDateTime(s.submittedAt)}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  {s.grade && (
                    <span
                      className={
                        s.grade.scorePercent >= 60 ? "badge badge-success" : "badge badge-danger"
                      }
                    >
                      {s.grade.scorePercent}%
                    </span>
                  )}
                  <span className={s.status === "submitted" ? "badge" : "badge badge-info"}>
                    {s.status}
                  </span>
                </div>
              </div>

              {s.content && (
                <div
                  style={{
                    margin: "var(--space-4) 0",
                    padding: "var(--space-3)",
                    background: "var(--surface-2, var(--border))",
                    borderRadius: "var(--radius)",
                    whiteSpace: "pre-wrap",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  {s.content}
                </div>
              )}

              {s.grade && (
                <p className="text-muted text-sm" style={{ marginBottom: "var(--space-3)" }}>
                  Feedback: {s.grade.feedback || "—"}
                </p>
              )}

              {grading === s.id ? (
                <form onSubmit={submitGrade}>
                  <div className="grid" style={{ gridTemplateColumns: "160px 1fr", gap: "var(--space-4)" }}>
                    <Field label="Score (0–100)" htmlFor={`score-${s.id}`} required>
                      <Input
                        id={`score-${s.id}`}
                        type="number"
                        min={0}
                        max={100}
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                      />
                    </Field>
                    <Field label="Feedback" htmlFor={`feedback-${s.id}`}>
                      <Textarea
                        id={`feedback-${s.id}`}
                        rows={3}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                      />
                    </Field>
                  </div>
                  {error && (
                    <p role="alert" style={{ color: "var(--danger)" }}>{error}</p>
                  )}
                  <div className="flex gap-2" style={{ marginTop: "var(--space-3)" }}>
                    <Button type="submit" disabled={busy || score === ""}>
                      {busy ? "Saving…" : "Save grade"}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setGrading(null)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => startGrading(s)}>
                    {s.grade ? "Re-grade" : "Grade"}
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
