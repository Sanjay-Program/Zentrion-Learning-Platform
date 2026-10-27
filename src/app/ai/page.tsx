import { requireUser } from "@/lib/server";
import { usageToday } from "@/lib/ai";
import { getSettings } from "@/lib/config";
import { AiLabWorkspace } from "./ai-lab-workspace";

export const metadata = { title: "AI Lab — Zentrion Learntech" };

export default async function AiWorkspacePage() {
  const user = await requireUser();
  const settings = getSettings();
  const usage = await usageToday(user.id);
  const totalTokens = usage.prompt + usage.completion;

  return (
    <AiLabWorkspace
      dailyTokens={totalTokens}
      maxTokens={settings.aiMaxTokensPerDay}
      provider={settings.aiProvider}
      model={settings.aiDefaultModel}
    />
  );
}
