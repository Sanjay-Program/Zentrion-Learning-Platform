"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/webclient";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Textarea,
} from "@/components/ui";
import { Dialog } from "@/components/interactive";
import { formatDate } from "@/lib/utils";

export interface AgentDefinition {
  id: number;
  name: string;
  description: string | null;
  objective: string | null;
  instructions: string | null;
  model: string;
  toolIds: number[];
  maxSteps: number;
  timeLimitSeconds: number;
  tokenBudget: number | null;
  requireApproval: boolean;
  updatedAt: string;
}

export interface ToolDefinition {
  id: number;
  name: string;
  description: string | null;
  permission: string | null;
  timeoutSeconds: number;
  sideEffects: string;
}

const getSettings = () => ({ defaultModel: "gpt-4o-mini" });

export function AgentsClient({
  initialAgents,
  tools,
}: {
  initialAgents: AgentDefinition[];
  tools: ToolDefinition[];
}) {
  const [agents, setAgents] = useState(initialAgents);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [objective, setObjective] = useState("");
  const [instructions, setInstructions] = useState("");
  const [model, setModel] = useState(getSettings().defaultModel);
  const [toolIds, setToolIds] = useState<number[]>([]);
  const [maxSteps, setMaxSteps] = useState(8);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(120);
  const [tokenBudget, setTokenBudget] = useState("");
  const [requireApproval, setRequireApproval] = useState(false);

  const openCreate = () => {
    setName("");
    setDescription("");
    setObjective("");
    setInstructions("");
    setModel(getSettings().defaultModel);
    setToolIds([]);
    setMaxSteps(8);
    setTimeLimitSeconds(120);
    setTokenBudget("");
    setRequireApproval(false);
    setOpen(true);
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch<{ agent: AgentDefinition }>("/api/v1/ai/agents", {
        method: "POST",
        body: JSON.stringify({
          name,
          description,
          objective,
          instructions,
          model,
          toolIds,
          maxSteps: Number(maxSteps),
          timeLimitSeconds: Number(timeLimitSeconds),
          tokenBudget: tokenBudget ? Number(tokenBudget) : null,
          requireApproval,
        }),
      });
      setAgents((prev) => [res.agent, ...prev]);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create agent");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Delete this agent and its runs?")) return;
    try {
      await apiFetch(`/api/v1/ai/agents/${id}`, { method: "DELETE" });
      setAgents((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const toggleTool = (toolId: number) => {
    setToolIds((prev) =>
      prev.includes(toolId) ? prev.filter((t) => t !== toolId) : [...prev, toolId],
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: "var(--space-6)" }}>
        <p className="text-muted" style={{ margin: 0 }}>
          {agents.length} agent{agents.length === 1 ? "" : "s"} · {tools.length} approved tools available
        </p>
        <Button onClick={openCreate}>New agent</Button>
      </div>

      {agents.length === 0 ? (
        <Card>
          <EmptyState
            title="No agents yet"
            description="Agents combine a model, an objective and tools to perform multi-step tasks."
            action={<Button onClick={openCreate}>Create agent</Button>}
          />
        </Card>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "var(--space-5)" }}>
          {agents.map((a) => (
            <Card key={a.id} raised>
              <div className="flex justify-between items-start">
                <div>
                  <h3 style={{ marginBottom: "var(--space-1)" }}>
                    <Link href={`/ai/agents/${a.id}`}>{a.name}</Link>
                  </h3>
                  <p className="text-muted text-sm">
                    {a.model} · {a.maxSteps} steps · {a.timeLimitSeconds}s limit
                    {a.tokenBudget ? ` · ${a.tokenBudget} token budget` : ""}
                  </p>
                </div>
                {a.requireApproval && <Badge tone="info">Approval required</Badge>}
              </div>
              {a.description && <p className="text-sm text-muted">{a.description}</p>}
              {a.objective && (
                <p className="text-sm" style={{ fontStyle: "italic" }}>
                  {a.objective}
                </p>
              )}
              <div className="flex gap-2 flex-wrap" style={{ margin: "var(--space-3) 0" }}>
                {a.toolIds.map((toolId) => {
                  const tool = tools.find((t) => t.id === toolId);
                  return <Badge key={toolId}>{tool?.name ?? `tool:${toolId}`}</Badge>;
                })}
                {a.toolIds.length === 0 && <Badge tone="info">no tools</Badge>}
              </div>
              <p className="text-muted text-sm">Updated {formatDate(a.updatedAt)}</p>
              <div className="flex gap-2">
                <Link href={`/ai/agents/${a.id}`} className="btn btn-secondary btn-sm">
                  Open
                </Link>
                <Button size="sm" variant="ghost" onClick={() => void remove(a.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title="New agent">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Field label="Name" htmlFor="agent-name">
            <Input id="agent-name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Description" htmlFor="agent-description">
            <Input id="agent-description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Field label="Objective" htmlFor="agent-objective"
            hint="What the agent is trying to achieve.">
            <Textarea id="agent-objective" rows={2} value={objective} onChange={(e) => setObjective(e.target.value)} />
          </Field>
          <Field label="Instructions" htmlFor="agent-instructions"
            hint="System-level guidance for the model.">
            <Textarea id="agent-instructions" rows={4} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
          </Field>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-4)" }}>
            <Field label="Model" htmlFor="agent-model">
              <Input id="agent-model" value={model} onChange={(e) => setModel(e.target.value)} />
            </Field>
            <Field label="Max steps" htmlFor="agent-max-steps">
              <Input id="agent-max-steps" type="number" min={1} max={50} value={maxSteps} onChange={(e) => setMaxSteps(Number(e.target.value))} />
            </Field>
            <Field label="Time limit (s)" htmlFor="agent-time-limit">
              <Input id="agent-time-limit" type="number" min={10} max={3600} value={timeLimitSeconds} onChange={(e) => setTimeLimitSeconds(Number(e.target.value))} />
            </Field>
          </div>
          <Field label="Token budget (optional)" htmlFor="agent-token-budget">
            <Input id="agent-token-budget" type="number" min={1} value={tokenBudget} onChange={(e) => setTokenBudget(e.target.value)} />
          </Field>
          <Field label="Tools" htmlFor="agent-tools">
            <div className="flex gap-2 flex-wrap">
              {tools.map((tool) => (
                <label key={tool.id} className="badge" style={{ cursor: "pointer", border: "1px solid var(--border)", padding: "var(--space-1) var(--space-3)" }}>
                  <input
                    type="checkbox"
                    checked={toolIds.includes(tool.id)}
                    onChange={() => toggleTool(tool.id)}
                    style={{ marginRight: "var(--space-2)" }}
                  />
                  {tool.name}
                </label>
              ))}
              {tools.length === 0 && <span className="text-muted text-sm">No approved tools registered.</span>}
            </div>
          </Field>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={requireApproval}
              onChange={(e) => setRequireApproval(e.target.checked)}
            />
            <span>Require human approval before tool execution</span>
          </label>
          {error && <p role="alert" style={{ color: "var(--danger)" }}>{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => void save()} disabled={busy || !name.trim()}>
              {busy ? "Creating…" : "Create agent"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
