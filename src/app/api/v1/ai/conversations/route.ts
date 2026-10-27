import { requireUser } from "@/lib/server";
import { handle } from "@/lib/api";
import { listConversations } from "@/lib/ai";

/** List the current user's AI conversations. */
export const GET = handle(async () => {
  const user = await requireUser();
  const conversations = await listConversations(user.id);
  return { conversations };
});
