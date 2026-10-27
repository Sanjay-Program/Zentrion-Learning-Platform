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
} from "@/components/ui";
import { Dialog } from "@/components/interactive";
import { formatDate } from "@/lib/utils";

interface KnowledgeBase {
  id: number;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
  documentCount: number;
}

export function KnowledgeClient({
  initialBases,
}: {
  initialBases: KnowledgeBase[];
}) {
  const [bases, setBases] = useState(initialBases);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch<{ knowledgeBase: KnowledgeBase }>(
        "/api/v1/ai/knowledge",
        { method: "POST", body: JSON.stringify({ name, description }) },
      );
      setBases((prev) => [res.knowledgeBase, ...prev]);
      setOpen(false);
      setName("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Delete this knowledge base and all its documents?")) return;
    try {
      await apiFetch(`/api/v1/ai/knowledge/${id}`, { method: "DELETE" });
      setBases((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: "var(--space-6)" }}>
        <p className="text-muted" style={{ margin: 0 }}>
          {bases.length} knowledge base{bases.length === 1 ? "" : "s"}
        </p>
        <Button onClick={() => setOpen(true)}>New knowledge base</Button>
      </div>

      {bases.length === 0 ? (
        <Card>
          <EmptyState
            title="No knowledge bases"
            description="Create a base, then ingest text documents to make them retrievable."
            action={<Button onClick={() => setOpen(true)}>Create knowledge base</Button>}
          />
        </Card>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "var(--space-5)" }}>
          {bases.map((b) => (
            <Card key={b.id} raised>
              <div className="flex justify-between items-start">
                <div>
                  <h3 style={{ marginBottom: "var(--space-1)" }}>
                    <Link href={`/ai/knowledge/${b.id}`}>{b.name}</Link>
                  </h3>
                  <p className="text-muted text-sm">
                    {b.documentCount} document{b.documentCount === 1 ? "" : "s"} ·{" "}
                    {b.status} · created {formatDate(b.createdAt)}
                  </p>
                </div>
                <span className={b.status === "active" ? "badge badge-success" : "badge"}>
                  {b.status}
                </span>
              </div>
              {b.description && <p className="text-sm text-muted">{b.description}</p>}
              <div className="flex gap-2" style={{ marginTop: "var(--space-3)" }}>
                <Link href={`/ai/knowledge/${b.id}`} className="btn btn-secondary btn-sm">
                  Manage
                </Link>
                <Button size="sm" variant="ghost" onClick={() => void remove(b.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title="New knowledge base">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Field label="Name" htmlFor="kb-name">
            <Input id="kb-name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Description" htmlFor="kb-description">
            <Input id="kb-description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          {error && <p role="alert" style={{ color: "var(--danger)" }}>{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => void create()} disabled={busy || !name.trim()}>
              {busy ? "Creating…" : "Create"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
