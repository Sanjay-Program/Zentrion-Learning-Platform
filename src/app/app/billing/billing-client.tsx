"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/webclient";
import { Button } from "@/components/ui";
import { ConfirmDialog } from "@/components/interactive";

/** Cancel button with confirmation for a subscription. */
export function BillingClient({ subscriptionId }: { subscriptionId: number }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = async () => {
    setBusy(true);
    setError(null);
    try {
      await apiFetch("/api/v1/billing/subscription", {
        method: "POST",
        body: JSON.stringify({ subscriptionId }),
      });
      setCancelled(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancellation failed");
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  };

  if (cancelled) {
    return <span className="badge">cancellation requested</span>;
  }

  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setConfirmOpen(true)}>
        Cancel subscription
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        title="Cancel subscription"
        message="You will keep access until the end of the current billing period. This cannot be undone automatically."
        confirmLabel="Cancel subscription"
        danger
        onConfirm={() => void cancel()}
        onClose={() => setConfirmOpen(false)}
      />
      {error && (
        <p role="alert" style={{ color: "var(--danger)", margin: "var(--space-2) 0 0", width: "100%" }}>
          {error}
        </p>
      )}
      {busy && <span className="text-muted text-sm">Cancelling…</span>}
    </>
  );
}
