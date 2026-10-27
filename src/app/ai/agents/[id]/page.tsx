import { notFound } from "next/navigation";
import { requireUser } from "@/lib/server";
import { getAgent } from "@/lib/ai";
import { Breadcrumbs, Card, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { AgentDetailClient } from "./agent-detail-client";

export const metadata = { title: "Agent — Zentrion" };

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const agent = await getAgent(Number(id), user.id).catch(() => null);
  if (!agent) notFound();

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "AI Workspace", href: "/ai" },
          { label: "Agents", href: "/ai/agents" },
          { label: agent.name },
        ]}
      />
      <PageHeader
        eyebrow={agent.model}
        title={agent.name}
        description={agent.description ?? undefined}
      />

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>
        <Card>
          <h3 style={{ marginBottom: "var(--space-4)" }}>Configuration</h3>
          <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "var(--space-2) var(--space-4)", margin: 0 }}>
            <dt className="text-muted">Objective</dt>
            <dd style={{ margin: 0 }}>{agent.objective || "—"}</dd>
            <dt className="text-muted">Instructions</dt>
            <dd style={{ margin: 0, whiteSpace: "pre-wrap" }}>{agent.instructions || "—"}</dd>
            <dt className="text-muted">Max steps</dt>
            <dd style={{ margin: 0 }}>{agent.maxSteps}</dd>
            <dt className="text-muted">Time limit</dt>
            <dd style={{ margin: 0 }}>{agent.timeLimitSeconds}s</dd>
            <dt className="text-muted">Token budget</dt>
            <dd style={{ margin: 0 }}>{agent.tokenBudget ?? "unlimited"}</dd>
            <dt className="text-muted">Approval required</dt>
            <dd style={{ margin: 0 }}>{agent.requireApproval ? "Yes" : "No"}</dd>
            <dt className="text-muted">Tools</dt>
            <dd style={{ margin: 0 }}>
              {agent.toolIds.length ? agent.toolIds.join(", ") : "none"}
            </dd>
          </dl>
        </Card>

        <Card>
          <h3 style={{ marginBottom: "var(--space-4)" }}>Run agent</h3>
          <p className="text-muted text-sm" style={{ marginBottom: "var(--space-4)" }}>
            Provide the task input as JSON. The run executes synchronously with a
            bounded number of reasoning steps, and every step is recorded.
          </p>
          <AgentDetailClient agentId={agent.id} />
        </Card>
      </div>

      <section style={{ marginTop: "var(--space-10)" }}>
        <h2 style={{ marginBottom: "var(--space-4)" }}>Recent runs</h2>
        {agent.runs.length === 0 ? (
          <Card>
            <p className="text-muted">No runs yet.</p>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {agent.runs.map((run) => (
              <Card key={run.id}>
                <div className="flex justify-between items-center" style={{ gap: "var(--space-3)", flexWrap: "wrap" }}>
                  <div>
                    <p className="font-semibold">
                      Run #{run.id}{" "}
                      <span
                        className={
                          run.status === "completed"
                            ? "badge badge-success ml-2"
                            : run.status === "failed"
                              ? "badge badge-danger ml-2"
                              : "badge ml-2"
                        }
                      >
                        {run.status}
                      </span>
                    </p>
                    <p className="text-muted text-sm">
                      {run.stepsUsed} steps · {run.tokensUsed} tokens · started{" "}
                      {formatDateTime(run.startedAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/api/v1/ai/agents/${agent.id}/run?runId=${run.id}`}
                      className="btn btn-ghost btn-sm"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Trace (JSON)
                    </Link>
                  </div>
                </div>
                {run.output && (
                  <pre
                    style={{
                      margin: "var(--space-3) 0 0",
                      padding: "var(--space-3)",
                      background: "var(--border)",
                      borderRadius: "var(--radius)",
                      overflow: "auto",
                      maxHeight: 200,
                      fontSize: "var(--text-sm)",
                    }}
                  >
                    {run.output}
                  </pre>
                )}
                {run.error && (
                  <p role="alert" style={{ color: "var(--danger)", margin: "var(--space-3) 0 0" }}>
                    {run.error}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
