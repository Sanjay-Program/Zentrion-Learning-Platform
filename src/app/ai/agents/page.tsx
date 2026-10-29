import { requireUser } from "@/lib/server";
import { listAgents, listTools } from "@/lib/ai";
import { Breadcrumbs, PageHeader } from "@/components/ui";
import { AgentsClient } from "./agents-client";

export const metadata = { title: "Agent Builder" };

export default async function AgentsPage() {
  const user = await requireUser();
  const [agents, tools] = await Promise.all([listAgents(user.id), listTools()]);

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "AI Workspace", href: "/ai" }, { label: "Agents" }]} />
      <PageHeader
        eyebrow="Agentic AI"
        title="Agent Builder"
        description="Define agents with objectives, tools, step limits and token budgets. Runs are traced step by step."
      />
      <AgentsClient initialAgents={agents} tools={tools} />
    </main>
  );
}
