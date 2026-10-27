"use client";

import Link from "next/link";
import { Button } from "@/components/ui";

interface AppError extends Error {
  code?: string;
  status?: number;
  digest?: string;
}

export default function RootError({ error, reset }: { error: AppError; reset: () => void }) {
  const unauthorized = error.status === 401 || error.code === "unauthorized";
  const forbidden = error.status === 403 || error.code === "forbidden";

  if (unauthorized) {
    return (
      <main className="container-narrow" style={{ padding: "var(--space-16) var(--space-6)", textAlign: "center" }}>
        <p className="eyebrow">Sign in required</p>
        <h1>Authentication required</h1>
        <p className="lead">Please sign in to view this page.</p>
        <div className="flex justify-center gap-3 mt-8">
          <Button href="/auth/sign-in">Sign in</Button>
          <Button variant="secondary" href="/">Back to home</Button>
        </div>
      </main>
    );
  }

  if (forbidden) {
    return (
      <main className="container-narrow" style={{ padding: "var(--space-16) var(--space-6)", textAlign: "center" }}>
        <p className="eyebrow">Access denied</p>
        <h1>You don&apos;t have access</h1>
        <p className="lead">
          Your account doesn&apos;t have permission to view this page.
          Contact your administrator if you believe this is a mistake.
        </p>
        <div className="flex justify-center gap-3 mt-8">
          <Link href="/app" className="btn btn-primary">Go to My Learning</Link>
          <Button variant="secondary" href="/">Back to home</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container-narrow" style={{ padding: "var(--space-16) var(--space-6)", textAlign: "center" }}>
      <p className="eyebrow">Something went wrong</p>
      <h1>Unexpected error</h1>
      <p className="lead">
        An unexpected error occurred. Our team has been notified
        {error.digest ? <> (reference: <code className="inline">{error.digest}</code></> : null}.
      </p>
      <div className="flex justify-center gap-3 mt-8">
        <Button onClick={reset}>Try again</Button>
        <Button variant="secondary" href="/">Back to home</Button>
      </div>
    </main>
  );
}
