"use client";

import Link from "next/link";
import { Button } from "@/components/ui";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <div className="container-narrow" style={{ padding: "var(--space-16) var(--space-6)", textAlign: "center" }}>
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
        </div>
      </body>
    </html>
  );
}
