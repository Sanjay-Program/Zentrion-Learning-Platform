"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/webclient";
import { Badge, Card, EmptyState } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

interface AuditEvent {
  id: number;
  action: string;
  actorName: string;
  entityType: string | null;
  entityId: number | null;
  details: string | null;
  createdAt: string;
}

/** Scrollable audit event list. */
export function AuditClient() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ events: AuditEvent[] }>("/api/v1/admin/audit?limit=200")
      .then((res) => setEvents(res.events))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load audit log"),
      )
      .finally(() => setBusy(false));
  }, []);

  if (busy) return <Card><p className="text-muted">Loading audit log…</p></Card>;
  if (error) return <p role="alert" style={{ color: "var(--danger)" }}>{error}</p>;
  if (events.length === 0) {
    return (
      <Card>
        <EmptyState title="No audit events" description="Actions will appear here as they happen." />
      </Card>
    );
  }

  return (
    <Card raised style={{ maxHeight: 640, overflowY: "auto" }}>
      <ol style={{ paddingLeft: "var(--space-6)", margin: 0 }}>
        {events.map((event) => (
          <li
            key={event.id}
            style={{
              padding: "var(--space-3) 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div className="flex justify-between items-center" style={{ gap: "var(--space-3)", flexWrap: "wrap" }}>
              <span className="font-semibold text-sm">{event.action}</span>
              <span className="text-muted text-sm">
                {formatDateTime(event.createdAt)}
              </span>
            </div>
            <p className="text-muted text-sm" style={{ margin: "var(--space-1) 0 0" }}>
              Actor: {event.actorName}
              {event.entityType && (
                <>
                  {" "}· <Badge>{event.entityType}{event.entityId ? ` #${event.entityId}` : ""}</Badge>
                </>
              )}
            </p>
            {event.details && (
              <p className="text-sm" style={{ margin: "var(--space-1) 0 0", wordBreak: "break-word" }}>
                {event.details}
              </p>
            )}
          </li>
        ))}
      </ol>
    </Card>
  );
}
