import { getDb } from "@/db/client";
import { auditEvents, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { User } from "@/lib/auth";

export interface AuditInput {
  actorId?: number | null;
  actorRole?: string | null;
  entityType?: string | null;
  entityId?: number | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

/**
 * Record an auditable event. Audit logging is append-only
 * and never fails the calling operation.
 */
export async function audit(
  action: string,
  input: AuditInput = {},
): Promise<void> {
  try {
    const db = getDb();
    await db.insert(auditEvents).values({
      actorId: input.actorId ?? null,
      actorRole: input.actorRole ?? null,
      action,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
      details: input.details ? JSON.stringify(input.details) : null,
      ipAddress: input.ipAddress ?? null,
    }).run();
  } catch (err) {
    console.warn("[audit] failed to record event:", err instanceof Error ? err.message : err);
  }
}

/** Fetch recent audit events (admin). */
export async function listAuditEvents(limit = 50, offset = 0) {
  const db = getDb();
  return db
    .select({
      id: auditEvents.id,
      actorId: auditEvents.actorId,
      action: auditEvents.action,
      entityType: auditEvents.entityType,
      entityId: auditEvents.entityId,
      details: auditEvents.details,
      ipAddress: auditEvents.ipAddress,
      createdAt: auditEvents.createdAt,
    })
    .from(auditEvents)
    .orderBy(auditEvents.id)
    .limit(limit)
    .offset(offset)
    .all();
}

/** Resolve display name for an actor id (best effort). */
export async function actorName(actorId: number | null): Promise<string> {
  if (!actorId) return "system";
  const db = getDb();
  const user = await db.select().from(users).where(eq(users.id, actorId)).limit(1).get();
  return user?.displayName ?? "unknown";
}

/** In-app notification helper. */
export async function notify(
  userId: number,
  type: string,
  title: string,
  body?: string,
  reference?: { type: string; id: number },
): Promise<void> {
  try {
    const db = getDb();
    const { notifications } = await import("@/db/schema");
    await db.insert(notifications).values({
      userId,
      type,
      title,
      body: body ?? null,
      referenceType: reference?.type ?? null,
      referenceId: reference?.id ?? null,
    }).run();
  } catch (err) {
    console.warn("[notify] failed:", err instanceof Error ? err.message : err);
  }
}

export type { User };
