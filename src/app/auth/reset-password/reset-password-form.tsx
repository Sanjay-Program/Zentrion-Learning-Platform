"use client";

import { useState, type FormEvent } from "react";
import { Button, Card, Field, Input, PageHeader } from "@/components/ui";
import Link from "next/link";

/** Reset-password form. The token arrives from the server page. */
export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    if (password.length < 10) {
      setError("Password must be at least 10 characters.");
      setBusy(false);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      setBusy(false);
      return;
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password must contain both letters and numbers.");
      setBusy(false);
      return;
    }
    try {
      const csrf = document.cookie.split("; ").find((c) => c.startsWith("zcsrftoken="))?.split("=")[1];
      const res = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf ?? "" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Reset failed");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)", maxWidth: 26 * 16 }}>
      <PageHeader eyebrow="Account" title="Set a new password" />
      <Card>
        {done ? (
          <div className="alert alert-success" role="status">
            Your password has been reset. Sign in with your new password.
          </div>
        ) : !token ? (
          <div className="alert alert-danger" role="alert">
            Missing reset token. Use the link from your reset email.
          </div>
        ) : (
          <form onSubmit={submit}>
            <Field label="New password" htmlFor="password" required error={error ?? undefined}
              hint="At least 10 characters, with letters and numbers.">
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
            <Field label="Confirm password" htmlFor="confirm" required>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </Field>
            <Button type="submit" disabled={busy} className="w-full mt-4">
              {busy ? "Resetting…" : "Reset password"}
            </Button>
          </form>
        )}
        <p className="text-sm text-muted mt-4" style={{ textAlign: "center" }}>
          <Link href="/auth/sign-in">Back to sign in</Link>
        </p>
      </Card>
    </main>
  );
}
