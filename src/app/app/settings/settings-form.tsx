"use client";

import { useRouter } from "next/navigation";
import { useTransition, type FormEvent } from "react";import { Button, Card } from "@/components/ui";
import { useToast } from "@/components/interactive";

export interface SettingsInitial {
  displayName: string;
  bio: string;
  location: string;
  careerGoal: string;
  experienceLevel: string;
  weeklyHours: number | null;
  interests: string;
  theme: string;
  language: string;
  emailNotifications: boolean;
  marketingEmails: boolean;
  aiDataRetention: boolean;
  reducedMotion: boolean;
}

/** Save button that submits the settings form via the API. */
export function SettingsForm({ initial }: { initial: SettingsInitial }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const save = async (e: FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const target = e.target as HTMLFormElement;
        const data = new FormData(target);
        const csrf = document.cookie
          .split("; ")
          .find((c) => c.startsWith("zcsrftoken="))
          ?.split("=")[1];
        const res = await fetch("/api/v1/settings", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrf ?? "",
          },
          body: JSON.stringify({
            displayName: data.get("displayName"),
            bio: data.get("bio"),
            location: data.get("location"),
            careerGoal: data.get("careerGoal"),
            experienceLevel: data.get("experienceLevel"),
            weeklyHours: data.get("weeklyHours"),
            interests: String(data.get("interests") ?? "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            theme: data.get("theme"),
            language: data.get("language"),
            emailNotifications: data.get("emailNotifications") === "on",
            marketingEmails: data.get("marketingEmails") === "on",
            aiDataRetention: data.get("aiDataRetention") === "on",
            reducedMotion: data.get("reducedMotion") === "on",
          }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error?.message ?? "Could not save settings");
        toast.push("Settings saved", "success");
        router.refresh();
      } catch (err) {
        toast.push(err instanceof Error ? err.message : "Failed", "danger");
      }
    });
  };

  return (
    <form onSubmit={save}>
      <Card>
        <div className="flex justify-between items-center" style={{ gap: "var(--space-3)" }}>
          <p className="text-muted text-sm" style={{ margin: 0 }}>
            Save all changes above in one click.
          </p>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </Card>
    </form>
  );
}
