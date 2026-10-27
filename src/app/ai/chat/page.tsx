import { redirect } from "next/navigation";
import { requireUser } from "@/lib/server";
import { listConversations } from "@/lib/ai";
import { Breadcrumbs } from "@/components/ui";
import { ChatClient } from "./chat-client";

export const metadata = { title: "AI Tutor — Zentrion" };

export default async function AiChatPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; course?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const conversations = await listConversations(user.id);
  const activeId = sp.id ? Number(sp.id) : undefined;
  const contextCourseId = sp.course ? Number(sp.course) : undefined;

  if (sp.id && !Number.isFinite(activeId)) {
    redirect("/ai/chat");
  }

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "AI Workspace", href: "/ai" }, { label: "Chat" }]} />
      <ChatClient
        key={activeId ?? "new"}
        conversations={conversations}
        activeId={activeId}
        contextCourseId={contextCourseId}
      />
    </main>
  );
}
