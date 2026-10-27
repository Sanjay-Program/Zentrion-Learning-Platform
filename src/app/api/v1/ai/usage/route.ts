import { requireUser } from "@/lib/server";
import { handle } from "@/lib/api";
import { getSettings } from "@/lib/config";
import { usageToday } from "@/lib/ai";

/** Current AI usage against the daily allowance. */
export const GET = handle(async () => {
  const user = await requireUser();
  const settings = getSettings();
  const usage = await usageToday(user.id);
  const total = usage.prompt + usage.completion;
  return {
    usage,
    totalTokens: total,
    dailyLimit: settings.aiMaxTokensPerDay,
    remaining: Math.max(0, settings.aiMaxTokensPerDay - total),
  };
});
