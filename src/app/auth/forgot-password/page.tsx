"use client";

import { useState, type FormEvent } from "react";
import { Button, Card, Field, Input, PageHeader } from "@/components/ui";
import { useToast } from "@/components/interactive";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const csrf = document.cookie.split("; ").find((c) => c.startsWith("zcsrftoken="))?.split("=")[1];
      const res = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf ?? "" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Could not send reset link");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)", maxWidth: 26 * 16 }}>
      <PageHeader eyebrow="Account" title="Reset your password" />
      <Card>
        {done ? (
          <div className="alert alert-success" role="status">
            If an account exists for <strong>{email}</strong>, a password reset link is on its way.
            Check your inbox (and spam folder).
          </div>
        ) : (
          <form onSubmit={submit}>
            <p className="text-muted mb-6">
              Enter your account email and we will send you a secure reset link.
            </p>
            <Field label="Email" htmlFor="email" required error={error ?? undefined}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Button type="submit" disabled={busy} className="w-full mt-4">
              {busy ? "Sending…" : "Send reset link"}
            </Button>
            <p className="text-sm text-muted mt-4" style={{ textAlign: "center" }}>
              <Link href="/auth/sign-in">Back to sign in</Link>
            </p>
          </form>
        )}
      </Card>
      <span className="hidden" aria-hidden="true">{JSON.stringify(toast)}</span>
    </main>
  );
}
