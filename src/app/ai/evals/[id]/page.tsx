import { notFound } from "next/navigation";
import { requireUser } from "@/lib/server";
import { getEvalDataset } from "@/lib/ai";
import { Breadcrumbs, Card, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { EvalDetailClient } from "./eval-detail-client";

export const metadata = { title: "Evaluation" };

export default async function EvalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const dataset = await getEvalDataset(Number(id), user.id).catch(() => null);
  if (!dataset) notFound();

  const totalResults = dataset.results.length;
  const passedResults = dataset.results.filter((r) => r.passed).length;

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "AI Workspace", href: "/ai" },
          { label: "Evals", href: "/ai/evals" },
          { label: dataset.name },
        ]}
      />
      <PageHeader
        eyebrow={`${dataset.cases.length} cases`}
        title={dataset.name}
        description={dataset.description ?? undefined}
      />

      <Card raised style={{ marginBottom: "var(--space-6)" }}>
        <div className="flex justify-between items-center" style={{ gap: "var(--space-4)", flexWrap: "wrap" }}>
          <div>
            <p className="text-muted text-sm">Latest run summary</p>
            {totalResults > 0 ? (
              <p className="font-semibold" style={{ fontSize: "var(--text-3xl)" }}>
                {passedResults}/{totalResults} passed
                <span className="text-muted text-sm">
                  {" "}
                  ({Math.round((passedResults / totalResults) * 100)}%)
                </span>
              </p>
            ) : (
              <p className="font-semibold">No runs yet</p>
            )}
          </div>
          <EvalDetailClient datasetId={dataset.id} />
        </div>
      </Card>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>
        <section>
          <h2 style={{ marginBottom: "var(--space-4)" }}>Cases</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {dataset.cases.map((c) => (
              <Card key={c.id}>
                <p className="font-semibold" style={{ marginBottom: "var(--space-1)" }}>
                  Input
                </p>
                <p style={{ margin: "0 0 var(--space-2)" }}>{c.inputText}</p>
                <p className="text-muted text-sm">Expected output</p>
                <p className="text-sm" style={{ margin: 0 }}>
                  {c.expectedOutput || <span className="text-muted">—</span>}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 style={{ marginBottom: "var(--space-4)" }}>Results</h2>
          {dataset.results.length === 0 ? (
            <Card>
              <p className="text-muted">Run the evaluation to see results.</p>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {dataset.results.slice(0, 20).map((r) => (
                <Card key={r.id}>
                  <div className="flex justify-between items-center">
                    <span className={r.passed ? "badge badge-success" : "badge badge-danger"}>
                      {r.passed ? "pass" : "fail"}
                    </span>
                    <span className="text-muted text-sm">score {r.score}/100</span>
                  </div>
                  <p className="text-sm" style={{ margin: "var(--space-2) 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.actualOutput}
                  </p>
                  <p className="text-muted text-sm">
                    {r.model} · {formatDateTime(r.createdAt)}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
