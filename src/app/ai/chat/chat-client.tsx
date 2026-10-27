"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/webclient";
import { Button, Card, Select, Field } from "@/components/ui";
import { formatDate } from "@/lib/utils";

interface Conversation {
  id: number;
  title: string | null;
  mode: string;
  contextCourseId: number | null;
  updatedAt: string;
  messageCount: number;
}

interface Message {
  id: number;
  role: string;
  content: string;
  model: string | null;
  createdAt: string;
}

interface ConversationDetail extends Omit<Conversation, "messageCount"> {
  messages: Message[];
}

const MODES = [
  { value: "explain", label: "Explain" },
  { value: "quiz", label: "Quiz me" },
  { value: "summarize", label: "Summarize" },
  { value: "translate", label: "Translate" },
  { value: "debug", label: "Debug" },
];

export function ChatClient({
  conversations,
  activeId,
  contextCourseId,
}: {
  conversations: Conversation[];
  activeId?: number;
  contextCourseId?: number;
}) {
  const [active, setActive] = useState<ConversationDetail | null>(null);
  const [mode, setMode] = useState("explain");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeId) return;
    apiFetch<{ conversation: ConversationDetail }>(`/api/v1/ai/conversations/${activeId}`)
      .then((res) => {
        setActive(res.conversation);
        setMode(res.conversation.mode);
      })
      .catch((err) => setError(err.message));
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [active?.messages.length]);

  const send = async () => {
    const message = input.trim();
    if (!message || sending) return;
    setSending(true);
    setError(null);
    setInput("");
    try {
      const res = await apiFetch<{ conversation: ConversationDetail }>("/api/v1/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          conversationId: active?.id,
          message,
          mode,
          contextCourseId: contextCourseId ?? null,
        }),
      });
      setActive(res.conversation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid" style={{ gridTemplateColumns: "280px 1fr", gap: "var(--space-6)" }}>
      <aside>
        <Card style={{ padding: "var(--space-4)" }}>
          <div className="flex justify-between items-center" style={{ marginBottom: "var(--space-4)" }}>
            <h3 style={{ margin: 0 }}>Conversations</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActive(null);
                window.history.replaceState({}, "", "/ai/chat");
              }}
            >
              New
            </Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {conversations.map((c) => (
              <button
                key={c.id}
                className={active?.id === c.id ? "nav-link active" : "nav-link"}
                style={{
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "var(--space-2)",
                  borderRadius: "var(--radius)",
                }}
                onClick={() => {
                  window.history.replaceState({}, "", `/ai/chat?id=${c.id}`);
                  apiFetch<{ conversation: ConversationDetail }>(`/api/v1/ai/conversations/${c.id}`)
                    .then((res) => {
                      setActive(res.conversation);
                      setMode(res.conversation.mode);
                    })
                    .catch((err) => setError(err.message));
                }}
              >
                <span style={{ display: "block", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.title}
                </span>
                <span className="text-muted text-sm">
                  {c.mode} · {c.messageCount} msgs
                </span>
              </button>
            ))}
            {conversations.length === 0 && (
              <p className="text-muted text-sm">No conversations yet.</p>
            )}
          </div>
        </Card>
      </aside>

      <section>
        <Card raised style={{ display: "flex", flexDirection: "column", height: 640 }}>
          <div
            className="flex justify-between items-center"
            style={{
              padding: "var(--space-4)",
              borderBottom: "1px solid var(--border)",
              gap: "var(--space-3)",
              flexWrap: "wrap",
            }}
          >
            <h3 style={{ margin: 0 }}>{active?.title ?? "New conversation"}</h3>
            <Field label="Mode" htmlFor="chat-mode">
              <Select
                id="chat-mode"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                {MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "var(--space-4)" }}>
            {!active && (
              <div className="text-muted" style={{ textAlign: "center", marginTop: "var(--space-16)" }}>
                <p className="font-semibold" style={{ color: "inherit" }}>
                  Ask anything — the tutor adapts to the mode you pick.
                </p>
                <p className="text-sm">
                  Try: &quot;Explain retrieval-augmented generation&quot; or switch to Quiz mode
                  for a knowledge check.
                </p>
              </div>
            )}
            {active?.messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: "var(--space-4)",
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "var(--space-3)",
                    borderRadius: "var(--radius)",
                    background: m.role === "user" ? "var(--primary)" : "var(--surface-2, var(--border))",
                    color: m.role === "user" ? "var(--on-primary, #fff)" : "inherit",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <p style={{ margin: 0 }}>{m.content}</p>
                  <p className="text-sm" style={{ margin: "var(--space-2) 0 0", opacity: 0.7 }}>
                    {m.role === "assistant" && m.model ? `${m.model} · ` : ""}
                    {formatDate(m.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            {sending && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "var(--space-4)" }}>
                <div style={{ padding: "var(--space-3)", borderRadius: "var(--radius)", background: "var(--border)" }}>
                  <p style={{ margin: 0 }} className="text-muted">
                    Thinking…
                  </p>
                </div>
              </div>
            )}
            {error && (
              <p role="alert" style={{ color: "var(--danger)" }}>
                {error}
              </p>
            )}
          </div>

          <div
            style={{
              padding: "var(--space-4)",
              borderTop: "1px solid var(--border)",
            }}
          >
            <div className="flex" style={{ gap: "var(--space-2)" }}>
              <textarea
                aria-label="Message"
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder="Message the AI tutor…"
                style={{
                  flex: 1,
                  resize: "none",
                  padding: "var(--space-3)",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                  background: "var(--surface, transparent)",
                  color: "inherit",
                }}
              />
              <Button onClick={() => void send()} disabled={sending || !input.trim()}>
                {sending ? "Sending…" : "Send"}
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
