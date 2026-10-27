import { requireUser } from "@/lib/server";
import { handle } from "@/lib/api";
import { getAdminStats, requireAdmin } from "@/lib/admin";

/** Platform overview statistics (admin only). */
export const GET = handle(async () => {
  const user = await requireUser();
  await requireAdmin(user);
  const stats = await getAdminStats();
  return { stats };
});
