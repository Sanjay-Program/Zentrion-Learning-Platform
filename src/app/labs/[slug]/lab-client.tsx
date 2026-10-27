"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/webclient";
import { Button } from "@/components/ui";

interface LabSession {
  id: number;
  labId: number;
  status: string;
  startedAt: string | null;
  expiresAt: string | null;
  submittedAt: string | null;
  state: Record<string, unknown>;
}

/** Launch button + active-session indicator for a lab detail page. */
export function LabClient({
  slug,
  labId,
  initialSessions,
}: {
  slug: string;
  labId: number;
  initialSessions: LabSession[];
}) {
  const [sessions, setSessions] = useState(initialSessions);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<number | null>(null);

  const launch = async () => {
    setBusy(true);
    setError(null);
    setCreated(null);
    try {
      const res = await apiFetch<{ session: LabSession }>(
        `/api/v1/labs/${labId}/sessions`,
        { method: "POST" },
      );
      setSessions((prev) => [res.session, ...prev]);
      setCreated(res.session.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start lab");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex" style={{ gap: "var(--space-3)", flexWrap: "wrap", alignItems: "center" }}>
      <Button onClick={() => void launch()} disabled={busy}>
        {busy ? "Provisioning…" : "Launch lab environment"}
      </Button>
      {created && (
        <Link href={`/labs/${slug}/session/${created}`} className="btn btn-secondary">
          Open console →
        </Link>
      )}
      {error && (
        <p role="alert" style={{ color: "var(--danger)", margin: 0 }}>
          {error}
        </p>
      )}
      {sessions.some((s) => s.status === "running") && (
        <span className="badge badge-success">Active session available</span>
      )}
    </div>
  );
}
