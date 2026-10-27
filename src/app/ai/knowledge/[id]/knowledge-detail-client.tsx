"use client";

import { useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/webclient";
import { Button, Field, Textarea } from "@/components/ui";

interface KnowledgeBase {
  id: number;
  name: string;
  documents: { id: number; filename: string; status: string; chunkCount: number }[];
  chunks: { id: number; documentId: number; chunkIndex: number; content: string }[];
}

/** Ingest form for a knowledge base. */
export function KnowledgeDetailClient({ kbId }: { kbId: number }) {
  const [filename, setFilename] = useState("notes.txt");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<KnowledgeBase | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const res = await apiFetch<{ knowledgeBase: KnowledgeBase }>(
        `/api/v1/ai/knowledge/${kbId}`,
        {
          method: "POST",
          body: JSON.stringify({ filename, content }),
        },
      );
      setDone(res.knowledgeBase);
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ingest failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="grid" style={{ gridTemplateColumns: "200px 1fr", gap: "var(--space-4)" }}>
        <Field label="Filename" htmlFor="ingest-filename">
          <input
            id="ingest-filename"
            className="input"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
          />
        </Field>
      </div>
      <Field label="Document text" htmlFor="ingest-content">
        <Textarea
          id="ingest-content"
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste the full document text here…"
        />
      </Field>
      <Button type="submit" disabled={busy || !content.trim() || !filename.trim()}>
        {busy ? "Ingesting…" : "Ingest document"}
      </Button>

      {error && (
        <p role="alert" style={{ color: "var(--danger)", marginTop: "var(--space-4)" }}>
          {error}
        </p>
      )}
      {done && (
        <p style={{ color: "var(--success)", marginTop: "var(--space-4)" }}>
          Ingested &quot;{done.documents[done.documents.length - 1]?.filename ?? filename}&quot; —{" "}
          {done.documents[done.documents.length - 1]?.chunkCount ?? 0} chunks indexed.
        </p>
      )}
    </form>
  );
}
