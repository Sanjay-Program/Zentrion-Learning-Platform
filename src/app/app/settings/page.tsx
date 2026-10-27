import { requireUser } from "@/lib/server";
import { getUserWithRoles } from "@/lib/auth";
import { getDb } from "@/db/client";
import { userPreferences, userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Breadcrumbs, Card, Field, PageHeader, Select, Textarea, Input } from "@/components/ui";
import { SettingsForm } from "./settings-form";

export const metadata = { title: "Settings — Zentrion" };

export default async function SettingsPage() {
  const user = await requireUser();
  const full = await getUserWithRoles(user.id);
  const db = getDb();
  const profile = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id))
    .limit(1)
    .get();
  const preferences = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, user.id))
    .limit(1)
    .get();

  const roles = (full?.roles ?? []).map((r) => r.key).join(", ") || "learner";

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)", maxWidth: 44 * 16 }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My Learning", href: "/app" }, { label: "Settings" }]} />
      <PageHeader eyebrow="Account" title="Settings" description="Profile, learning preferences, and privacy controls." />

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        <Card>
          <h3 style={{ marginBottom: "var(--space-4)" }}>Profile</h3>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <Field label="Display name" htmlFor="display-name">
              <Input id="display-name" defaultValue={user.displayName} />
            </Field>
            <Field label="Email" htmlFor="settings-email">
              <Input id="settings-email" type="email" value={user.email} disabled />
            </Field>
            <Field label="Career goal" htmlFor="career-goal">
              <Input id="career-goal" defaultValue={profile?.careerGoal ?? ""} />
            </Field>
            <Field label="Experience level" htmlFor="experience-level">
              <Select id="experience-level" defaultValue={profile?.experienceLevel ?? ""}>
                <option value="">Select…</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
            </Field>
            <Field label="Weekly study hours" htmlFor="weekly-hours">
              <Input id="weekly-hours" type="number" min={0} max={80} defaultValue={profile?.weeklyHours ?? undefined} />
            </Field>
            <Field label="Location" htmlFor="location">
              <Input id="location" defaultValue={profile?.location ?? ""} />
            </Field>
          </div>
          <Field label="Bio" htmlFor="bio">
            <Textarea id="bio" rows={3} defaultValue={profile?.bio ?? ""} />
          </Field>
          <Field label="Interests (comma separated)" htmlFor="interests"
            hint="Drives your recommendations — e.g. ai, prompt-engineering, cybersecurity">
            <Input id="interests" defaultValue={(profile?.interests ?? []).join(", ")} />
          </Field>
          <p className="text-muted text-sm">Roles: {roles}</p>
        </Card>

        <Card>
          <h3 style={{ marginBottom: "var(--space-4)" }}>Preferences</h3>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <Field label="Theme" htmlFor="pref-theme">
              <Select id="pref-theme" defaultValue={preferences?.theme ?? "system"}>
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </Select>
            </Field>
            <Field label="Language" htmlFor="pref-language">
              <Select id="pref-language" defaultValue={preferences?.language ?? "en"}>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </Select>
            </Field>
          </div>
          <label className="checkbox">
            <input id="pref-email-notifications" type="checkbox" defaultChecked={preferences?.emailNotifications ?? true} />
            <span>Email me about course updates and events</span>
          </label>
          <label className="checkbox">
            <input id="pref-marketing" type="checkbox" defaultChecked={preferences?.marketingEmails ?? false} />
            <span>Send me product news (optional)</span>
          </label>
          <label className="checkbox">
            <input id="pref-ai-retention" type="checkbox" defaultChecked={preferences?.aiDataRetention ?? true} />
            <span>Allow AI conversations to be retained for continuity</span>
          </label>
          <label className="checkbox">
            <input id="pref-reduced-motion" type="checkbox" defaultChecked={preferences?.reducedMotion ?? false} />
            <span>Reduce motion</span>
          </label>
        </Card>

        <SettingsForm
          initial={{
            displayName: user.displayName,
            bio: profile?.bio ?? "",
            location: profile?.location ?? "",
            careerGoal: profile?.careerGoal ?? "",
            experienceLevel: profile?.experienceLevel ?? "",
            weeklyHours: profile?.weeklyHours ?? null,
            interests: (profile?.interests ?? []).join(", "),
            theme: preferences?.theme ?? "system",
            language: preferences?.language ?? "en",
            emailNotifications: preferences?.emailNotifications ?? true,
            marketingEmails: preferences?.marketingEmails ?? false,
            aiDataRetention: preferences?.aiDataRetention ?? true,
            reducedMotion: preferences?.reducedMotion ?? false,
          }}
        />
      </div>
    </main>
  );
}
