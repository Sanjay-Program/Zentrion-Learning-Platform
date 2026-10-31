import { requireUser } from "@/lib/server";
import {
  listPromptTemplates,
  listPublicPromptTemplates,
} from "@/lib/ai";
import { Breadcrumbs, PageHeader } from "@/components/ui";
import { PromptStudioClient } from "./studio-client";

export const metadata = { title: "Prompt Studio" };

export default async function PromptStudioPage() {
  const user = await requireUser();
  const [templates, publicTemplates] = await Promise.all([
    listPromptTemplates(user.id),
    listPublicPromptTemplates(),
  ]);

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "AI Workspace", href: "/ai" }, { label: "Prompt Studio" }]} />
      <PageHeader
        eyebrow="Prompt engineering"
        title="Prompt Studio"
        description="Author templates with {{variables}}, version every change, and run them live."
      />

      <details
        style={{
          marginBottom: "var(--space-6)",
          padding: "var(--space-4)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <summary style={{ cursor: "pointer", fontWeight: 600, color: "var(--text-strong)" }}>
          📐 Architecture Blueprint: Production Prompt Anatomy & Delimiters
        </summary>
        <div style={{ marginTop: "var(--space-4)", textAlign: "center", background: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(255, 255, 255, 0.1)", padding: "var(--space-3)", borderRadius: "var(--radius-md)" }}>
          <div style={{ borderRadius: "var(--radius-sm)", overflow: "hidden", background: "#FFFFFF", display: "inline-block", padding: "0.5rem" }}>
            <img
              src="/images/lesson-diagrams/02-prompt-anatomy.svg"
              alt="Prompt Anatomy and Delimiters"
              style={{ maxWidth: "100%", height: "auto", maxHeight: "280px", objectFit: "contain", display: "inline-block" }}
            />
          </div>
        </div>
      </details>

      <PromptStudioClient
        initialTemplates={templates}
        publicTemplates={publicTemplates}
      />
    </main>
  );
}
