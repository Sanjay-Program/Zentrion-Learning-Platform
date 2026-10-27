import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle, parseBody } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
import {
  appendMessage,
  callAi,
  createConversation,
  getConversation,
  recordUsage,
} from "@/lib/ai";

const schema = z.object({
  conversationId: z.number().int().positive().optional(),
  title: z.string().min(1).max(120).optional(),
  mode: z.enum(["explain", "quiz", "summarize", "translate", "debug"]).optional(),
  message: z.string().min(1).max(8000),
  contextCourseId: z.number().int().positive().nullable().optional(),
});

const MODE_SYSTEM_PROMPTS: Record<string, string> = {
  explain:
    "You are a patient, expert tutor for Zentrion Learntech. Explain concepts clearly with examples, then check understanding with a short question.",
  quiz:
    "You are a quiz master. Ask one focused question at a time, wait for the answer, then give immediate feedback with a brief explanation.",
  summarize:
    "You are a summarizer. Produce concise, structured summaries with headings and bullet points.",
  translate:
    "You are a translation assistant. Translate the user's input to the target language they specify, preserving technical meaning.",
  debug:
    "You are a debugging partner. Ask for the error, reproduce steps, and suggest the smallest fix first.",
};

/** Send a message in an AI conversation and receive a streamed-quality reply. */
export const POST = handle(async (request: NextRequest) => {
  const user = await requireUser();
  const body = await parseBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ValidationError("Invalid request");

  const { message, mode, title, contextCourseId } = parsed.data;

  let conversationId = parsed.data.conversationId;
  if (!conversationId) {
    const created = await createConversation(user.id, {
      title: title ?? message.slice(0, 60),
      mode: mode ?? "explain",
      contextCourseId: contextCourseId ?? null,
    });
    conversationId = created.id;
  }

  await appendMessage(conversationId, { role: "user", content: message });

  const conversation = await getConversation(conversationId, user.id);
  const history = conversation.messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-10)
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  const completion = await callAi([
    {
      role: "system",
      content: MODE_SYSTEM_PROMPTS[conversation.mode] ?? MODE_SYSTEM_PROMPTS.explain,
    },
    ...history,
  ]);

  await appendMessage(conversationId, {
    role: "assistant",
    content: completion.content,
    model: completion.model,
    promptTokens: completion.promptTokens,
    completionTokens: completion.completionTokens,
  });
  await recordUsage(user.id, "chat", completion);

  const updated = await getConversation(conversationId, user.id);
  return { conversation: updated };
});
