import { notFound } from "next/navigation";
import { requireUser } from "@/lib/server";
import { getKnowledgeBase } from "@/lib/ai";
import { Breadcrumbs, Card, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { KnowledgeDetailClient } from "./knowledge-detail-client";

export const metadata = { title: "Knowledge Base" };

export default async function KnowledgeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const kb = await getKnowledgeBase(Number(id), user.id).catch(() => null);
  if (!kb) notFound();

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "AI Workspace", href: "/ai" },
          { label: "Knowledge", href: "/ai/knowledge" },
          { label: kb.name },
        ]}
      />
      <PageHeader
        eyebrow={`${kb.documents.length} documents · ${kb.chunks.length} chunks`}
        title={kb.name}
        description={kb.description ?? undefined}
      />

      <Card raised style={{ marginBottom: "var(--space-6)" }}>
        <h3 style={{ marginBottom: "var(--space-4)" }}>Ingest a document</h3>
        <p className="text-muted text-sm" style={{ marginBottom: "var(--space-4)" }}>
          Paste the document text. It is stored, split into overlapping
          chunks (800 chars / 100 overlap), and indexed for retrieval.
        </p>
        <KnowledgeDetailClient kbId={kb.id} />
      </Card>

      <section>
        <h2 style={{ marginBottom: "var(--space-4)" }}>Documents</h2>
        {kb.documents.length === 0 ? (
          <Card>
            <p className="text-muted">No documents ingested yet.</p>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {kb.documents.map((doc) => (
              <Card key={doc.id}>
                <div className="flex justify-between items-center" style={{ gap: "var(--space-3)", flexWrap: "wrap" }}>
                  <div>
                    <p className="font-semibold">{doc.filename}</p>
                    <p className="text-muted text-sm">
                      {doc.mimeType} · {doc.chunkCount} chunks · {doc.status} ·{" "}
                      {formatDateTime(doc.createdAt)}
                    </p>
                  </div>
                  <span className={doc.status === "ready" ? "badge badge-success" : "badge"}>
                    {doc.status}
                  </span>
                </div>
                {doc.error && (
                  <p role="alert" style={{ color: "var(--danger)", margin: "var(--space-2) 0 0" }}>
                    {doc.error}
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
