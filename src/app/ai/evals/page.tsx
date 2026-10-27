import { requireUser } from "@/lib/server";
import { listEvalDatasets } from "@/lib/ai";
import { Breadcrumbs, PageHeader } from "@/components/ui";
import { EvalsClient } from "./evals-client";

export const metadata = { title: "Evaluation Harness — Zentrion" };

export default async function EvalsPage() {
  const user = await requireUser();
  const datasets = await listEvalDatasets(user.id);

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "AI Workspace", href: "/ai" }, { label: "Evals" }]} />
      <PageHeader
        eyebrow="LLM evaluation"
        title="Evaluation Harness"
        description="Define datasets of inputs and expected outputs, then score model responses for regression testing."
      />
      <EvalsClient initialDatasets={datasets} />
    </main>
  );
}
