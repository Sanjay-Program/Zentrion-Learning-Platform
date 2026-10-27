import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle } from "@/lib/api";
import {
  archiveConversation,
  deleteConversation,
  getConversation,
} from "@/lib/ai";

/** Get one conversation with its messages. */
export const GET = handle(async (_request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const conversationId = Number(id);
  const conversation = await getConversation(conversationId, user.id);
  return { conversation };
});

/** Archive or delete a conversation. */
export const POST = handle(async (request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const conversationId = Number(id);
  const { action } = (await request.json().catch(() => ({}))) as { action?: string };
  if (action === "archive") {
    await archiveConversation(conversationId, user.id);
    return { status: "archived" };
  }
  return { status: "unchanged" };
});

export const DELETE = handle(async (_request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const conversationId = Number(id);
  await deleteConversation(conversationId, user.id);
  return { status: "deleted" };
});
