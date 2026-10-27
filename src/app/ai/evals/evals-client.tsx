"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/webclient";
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Textarea,
} from "@/components/ui";
import { Dialog } from "@/components/interactive";
import { formatDate } from "@/lib/utils";

interface EvalDataset {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  caseCount: number;
}

interface EvalCase {
  inputText: string;
  expectedOutput?: string;
}

export function EvalsClient({
  initialDatasets,
}: {
  initialDatasets: EvalDataset[];
}) {
  const [datasets, setDatasets] = useState(initialDatasets);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [casesText, setCasesText] = useState("");

  const create = async () => {
    setBusy(true);
    setError(null);
    let cases: EvalCase[];
    try {
      // Accept either JSON array or line-per-case text (expected output after "|").
      if (casesText.trim().startsWith("[")) {
        cases = JSON.parse(casesText) as EvalCase[];
      } else {
        cases = casesText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [inputText, expectedOutput] = line.split("|").map((s) => s.trim());
            return { inputText, expectedOutput: expectedOutput || "" };
          });
      }
      if (!Array.isArray(cases) || cases.length === 0) {
        throw new Error("Add at least one case");
      }
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Invalid cases format");
      return;
    }
    try {
      const res = await apiFetch<{ dataset: EvalDataset }>("/api/v1/ai/evals", {
        method: "POST",
        body: JSON.stringify({ name, description, cases }),
      });
      setDatasets((prev) => [res.dataset, ...prev]);
      setOpen(false);
      setName("");
      setDescription("");
      setCasesText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Delete this evaluation dataset and its results?")) return;
    try {
      await apiFetch(`/api/v1/ai/evals/${id}`, { method: "DELETE" });
      setDatasets((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: "var(--space-6)" }}>
        <p className="text-muted" style={{ margin: 0 }}>
          {datasets.length} dataset{datasets.length === 1 ? "" : "s"}
        </p>
        <Button onClick={() => setOpen(true)}>New dataset</Button>
      </div>

      {datasets.length === 0 ? (
        <Card>
          <EmptyState
            title="No evaluation datasets"
            description="Each case pairs an input with the expected output. Runs score model responses by token overlap."
            action={<Button onClick={() => setOpen(true)}>Create dataset</Button>}
          />
        </Card>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "var(--space-5)" }}>
          {datasets.map((d) => (
            <Card key={d.id} raised>
              <h3 style={{ marginBottom: "var(--space-1)" }}>
                <Link href={`/ai/evals/${d.id}`}>{d.name}</Link>
              </h3>
              <p className="text-muted text-sm">
                {d.caseCount} cases · created {formatDate(d.createdAt)}
              </p>
              {d.description && <p className="text-sm text-muted">{d.description}</p>}
              <div className="flex gap-2" style={{ marginTop: "var(--space-3)" }}>
                <Link href={`/ai/evals/${d.id}`} className="btn btn-secondary btn-sm">
                  Open
                </Link>
                <Button size="sm" variant="ghost" onClick={() => void remove(d.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title="New evaluation dataset">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Field label="Name" htmlFor="eval-name">
            <Input id="eval-name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Description" htmlFor="eval-description">
            <Input id="eval-description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Field
            label="Cases"
            htmlFor="eval-cases"
            hint="One per line as: input | expected output — or paste a JSON array of {inputText, expectedOutput}."
          >
            <Textarea
              id="eval-cases"
              rows={10}
              value={casesText}
              onChange={(e) => setCasesText(e.target.value)}
              placeholder={"Explain RAG | Retrieval-augmented generation combines...\nWhat is a prompt injection? | ..."}
            />
          </Field>
          {error && <p role="alert" style={{ color: "var(--danger)" }}>{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => void create()} disabled={busy || !name.trim()}>
              {busy ? "Creating…" : "Create dataset"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

