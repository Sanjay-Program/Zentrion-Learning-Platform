import { requireUser } from "@/lib/server";
import { listKnowledgeBases } from "@/lib/ai";
import { Breadcrumbs, PageHeader } from "@/components/ui";
import { KnowledgeClient } from "./knowledge-client";

export const metadata = { title: "Knowledge Bases" };

export default async function KnowledgePage() {
  const user = await requireUser();
  const knowledgeBases = await listKnowledgeBases(user.id);

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "AI Workspace", href: "/ai" }, { label: "Knowledge" }]} />
      <PageHeader
        eyebrow="RAG"
        title="Knowledge Bases"
        description="Ingest documents, chunk and index them, then ground conversations in your own material."
      />
      <KnowledgeClient initialBases={knowledgeBases} />
    </main>
  );
}
