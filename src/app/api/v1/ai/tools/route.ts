import { requireUser } from "@/lib/server";
import { handle } from "@/lib/api";
import { listTools } from "@/lib/ai";

/** List the approved agent tool registry. */
export const GET = handle(async () => {
  await requireUser();
  const tools = await listTools();
  return { tools };
});
