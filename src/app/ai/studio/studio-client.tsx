"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/webclient";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import { Dialog } from "@/components/interactive";
import { formatDate } from "@/lib/utils";

export interface PromptTemplate {
  id: number;
  title: string;
  description: string | null;
  template: string;
  variables: string[];
  tags: string[];
  visibility: string;
  createdAt: string;
  updatedAt: string;
}

interface TemplateWithVersions extends PromptTemplate {
  versions: { id: number; versionNumber: number; changelog: string | null; createdAt: string }[];
}

/** Extract variables for preview when the template changes. */
function extractVars(template: string): string[] {
  const found = new Set<string>();
  for (const m of template.matchAll(/\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g)) {
    found.add(m[1]);
  }
  return Array.from(found);
}

export function PromptStudioClient({
  initialTemplates,
  publicTemplates,
}: {
  initialTemplates: PromptTemplate[];
  publicTemplates: PromptTemplate[];
}) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<TemplateWithVersions | null>(null);
  const [runOpen, setRunOpen] = useState(false);
  const [running, setRunning] = useState<PromptTemplate | null>(null);
  const [runResult, setRunResult] = useState<{ rendered: string; output: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState("");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [changelog, setChangelog] = useState("");

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setDescription("");
    setTemplate("");
    setTags("");
    setVisibility("private");
    setChangelog("");
    setEditorOpen(true);
  };

  const openEdit = async (t: PromptTemplate) => {
    try {
      const res = await apiFetch<{ template: TemplateWithVersions }>(`/api/v1/ai/prompts/${t.id}`);
      setEditing(res.template);
      setTitle(res.template.title);
      setDescription(res.template.description ?? "");
      setTemplate(res.template.template);
      setTags(res.template.tags.join(", "));
      setVisibility(res.template.visibility);
      setChangelog("");
      setEditorOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const payload = {
        title,
        description,
        template,
        tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
        visibility,
        changelog,
      };
      if (editing) {
        const res = await apiFetch<{ template: PromptTemplate }>(`/api/v1/ai/prompts/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setTemplates((prev) => prev.map((t) => (t.id === res.template.id ? res.template : t)));
      } else {
        const res = await apiFetch<{ template: PromptTemplate }>("/api/v1/ai/prompts", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setTemplates((prev) => [res.template, ...prev]);
      }
      setEditorOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Delete this prompt template and its versions?")) return;
    try {
      await apiFetch(`/api/v1/ai/prompts/${id}`, { method: "DELETE" });
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const openRun = (t: PromptTemplate) => {
    setRunning(t);
    setRunResult(null);
    setRunOpen(true);
  };

  const doRun = async () => {
    if (!running) return;
    setBusy(true);
    setError(null);
    try {
      const vars: Record<string, string> = {};
      for (const v of extractVars(running.template)) {
        const value = window.prompt(`Value for {{${v}}}:`) ?? "";
        vars[v] = value;
      }
      const res = await apiFetch<{ rendered: string; completion: { content: string } }>(
        `/api/v1/ai/prompts/${running.id}/run`,
        { method: "POST", body: JSON.stringify({ variables: vars }) },
      );
      setRunResult({ rendered: res.rendered, output: res.completion.content });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Run failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: "var(--space-6)" }}>
        <p className="text-muted" style={{ margin: 0 }}>
          {templates.length} of your templates · {publicTemplates.length} in the public gallery
        </p>
        <Button onClick={openCreate}>New template</Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <EmptyState
            title="No prompt templates"
            description="Create your first template to get started. Use {{variables}} to parameterise prompts."
            action={<Button onClick={openCreate}>Create template</Button>}
          />
        </Card>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "var(--space-5)" }}>
          {templates.map((t) => (
            <Card key={t.id} raised>
              <div className="flex justify-between items-start" style={{ gap: "var(--space-2)" }}>
                <div>
                  <h3 style={{ marginBottom: "var(--space-1)" }}>{t.title}</h3>
                  <p className="text-muted text-sm">
                    {t.visibility} · updated {formatDate(t.updatedAt)}
                  </p>
                </div>
                {t.visibility === "public" && <Badge tone="primary">Public</Badge>}
              </div>
              {t.description && (
                <p className="text-sm text-muted">{t.description}</p>
              )}
              <p className="text-sm" style={{ fontFamily: "var(--font-mono, monospace)", background: "var(--border)", padding: "var(--space-2)", borderRadius: "var(--radius)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                {t.template}
              </p>
              <div className="flex gap-2 flex-wrap" style={{ margin: "var(--space-3) 0" }}>
                {t.variables.map((v) => (
                  <Badge key={v}>{`{{${v}}}`}</Badge>
                ))}
                {t.tags.map((tag) => (
                  <Badge key={tag} tone="info">{tag}</Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => void openEdit(t)}>Edit</Button>
                <Button size="sm" onClick={() => openRun(t)}>Run</Button>
                <Button size="sm" variant="ghost" onClick={() => void remove(t.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {publicTemplates.length > 0 && (
        <section style={{ marginTop: "var(--space-10)" }}>
          <h2 style={{ marginBottom: "var(--space-4)" }}>Public gallery</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {publicTemplates.map((t) => (
              <Card key={t.id}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{t.title}</p>
                    <p className="text-muted text-sm">{t.description ?? ""}</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => openRun(t)}>
                    Run
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <Dialog
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editing ? "Edit template" : "New template"}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Field label="Title" htmlFor="prompt-title">
            <Input id="prompt-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Description" htmlFor="prompt-description">
            <Input id="prompt-description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Field label="Template" htmlFor="prompt-template"
            hint="Use {{variable}} placeholders — they are extracted automatically.">
            <Textarea
              id="prompt-template"
              rows={10}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
            />
          </Field>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <Field label="Tags (comma separated)" htmlFor="prompt-tags">
              <Input id="prompt-tags" value={tags} onChange={(e) => setTags(e.target.value)} />
            </Field>
            <Field label="Visibility" htmlFor="prompt-visibility">
              <Select id="prompt-visibility" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                <option value="private">Private</option>
                <option value="public">Public</option>
              </Select>
            </Field>
          </div>
          {editing && (
            <Field label="Changelog" htmlFor="prompt-changelog" hint="Saved with the new version.">
              <Input id="prompt-changelog" value={changelog} onChange={(e) => setChangelog(e.target.value)} />
            </Field>
          )}
          {error && <p role="alert" style={{ color: "var(--danger)" }}>{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditorOpen(false)}>Cancel</Button>
            <Button onClick={() => void save()} disabled={busy || !title.trim() || !template.trim()}>
              {busy ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={runOpen}
        onClose={() => setRunOpen(false)}
        title={running ? `Run: ${running.title}` : "Run prompt"}
      >
        {runResult ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <Field label="Rendered prompt" htmlFor="run-rendered">
              <Textarea id="run-rendered" rows={4} value={runResult.rendered} readOnly />
            </Field>
            <Field label="Model output" htmlFor="run-output">
              <Textarea id="run-output" rows={10} value={runResult.output} readOnly />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setRunOpen(false)}>Close</Button>
              <Button onClick={() => void doRun()} disabled={busy}>Run again</Button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <p className="text-muted">
              You will be prompted for each variable, then the rendered prompt is sent to the model.
            </p>
            {error && <p role="alert" style={{ color: "var(--danger)" }}>{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setRunOpen(false)}>Cancel</Button>
              <Button onClick={() => void doRun()} disabled={busy}>Run</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
