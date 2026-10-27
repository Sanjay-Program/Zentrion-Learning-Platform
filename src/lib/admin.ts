/**
 * Admin domain: platform stats, user management, audit access.
 */
import { and, count, desc, eq, like, or } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  aiConversations,
  auditEvents,
  courses,
  enrollments,
  labSessions,
  orders,
  roles,
  userRoles,
  users,
} from "@/db/schema";
import { type User } from "@/lib/auth";
import { assignRole, requirePermission, userPermissions } from "@/lib/rbac";
import { ForbiddenError } from "@/lib/errors";
import { formatPrice } from "@/lib/utils";

/** Platform-wide overview statistics. */
export async function getAdminStats() {
  const db = getDb();
  const [
    userCount,
    courseCount,
    enrollmentCount,
    revenue,
    activeLabs,
    conversationCount,
  ] = await Promise.all([
    db.select({ n: count(users.id) }).from(users).get(),
    db.select({ n: count(courses.id) }).from(courses).get(),
    db.select({ n: count(enrollments.id) }).from(enrollments).get(),
    db
      .select({ total: count(orders.id) })
      .from(orders)
      .where(eq(orders.status, "paid"))
      .get(),
    db
      .select({ n: count(labSessions.id) })
      .from(labSessions)
      .where(eq(labSessions.status, "running"))
      .get(),
    db.select({ n: count(aiConversations.id) }).from(aiConversations).get(),
  ]);

  // Revenue in cents from paid orders (totalCents column).
  const revenueRows = await db
    .select({ totalCents: orders.totalCents })
    .from(orders)
    .where(eq(orders.status, "paid"))
    .all();
  const revenueCents = revenueRows.reduce((sum, r) => sum + (r.totalCents ?? 0), 0);

  const recentUsers = await db
    .select({ id: users.id, displayName: users.displayName, email: users.email, createdAt: users.createdAt })
    .from(users)
    .orderBy(desc(users.id))
    .limit(5)
    .all();

  return {
    users: userCount?.n ?? 0,
    courses: courseCount?.n ?? 0,
    enrollments: enrollmentCount?.n ?? 0,
    revenueCents,
    revenue: formatPrice(revenueCents),
    paidOrders: revenue?.total ?? 0,
    activeLabSessions: activeLabs?.n ?? 0,
    aiConversations: conversationCount?.n ?? 0,
    recentUsers,
  };
}

export interface AdminUserRow {
  id: number;
  email: string;
  displayName: string;
  isSuperuser: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  roles: { key: string }[];
}

/** Search/list users with their roles. */
export async function listAdminUsers(
  user: User,
  opts: { search?: string; limit?: number; offset?: number } = {},
): Promise<AdminUserRow[]> {
  await requirePermission(user, "user.manage");
  const db = getDb();
  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;
  const search = opts.search?.trim();

  const conditions = search
    ? or(
        like(users.email, `%${search}%`),
        like(users.displayName, `%${search}%`),
      )
    : undefined;

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      isSuperuser: users.isSuperuser,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .where(conditions)
    .orderBy(desc(users.id))
    .limit(limit)
    .offset(offset)
    .all();

  // Resolve role keys for each user via the roles table.
  return Promise.all(
    rows.map(async (row) => {
      const roleRows = await db
        .select({ key: roles.key })
        .from(userRoles)
        .innerJoin(roles, eq(roles.id, userRoles.roleId))
        .where(eq(userRoles.userId, row.id))
        .all();
      return { ...row, roles: roleRows };
    }),
  );
}

/** Assign a role to a user (admin only). */
export async function setUserRoles(
  actor: User,
  targetUserId: number,
  roleKeys: string[],
) {
  await requirePermission(actor, "user.manage");
  if (targetUserId === actor.id && !roleKeys.includes("admin")) {
    throw new ForbiddenError("You cannot remove your own admin role");
  }
  const db = getDb();
  await db.delete(userRoles).where(eq(userRoles.userId, targetUserId)).run();
  for (const key of roleKeys) {
    await assignRole(targetUserId, key);
  }
  const target = await db
    .select()
    .from(users)
    .where(eq(users.id, targetUserId))
    .limit(1)
    .get();
  return {
    id: targetUserId,
    email: target?.email ?? "",
    displayName: target?.displayName ?? "",
    roles: roleKeys,
  };
}

/** Paginated audit events with actor names. */
export async function listAdminAuditEvents(
  user: User,
  opts: { limit?: number; offset?: number } = {},
) {
  await requirePermission(user, "audit.read");
  const db = getDb();
  const limit = opts.limit ?? 100;
  const offset = opts.offset ?? 0;
  const events = await db
    .select()
    .from(auditEvents)
    .orderBy(desc(auditEvents.id))
    .limit(limit)
    .offset(offset)
    .all();

  const actorCache = new Map<number | null, string>();
  const enriched = await Promise.all(
    events.map(async (event) => {
      if (!event.actorId) {
        actorCache.set(null, "system");
        return { ...event, actorName: "system" };
      }
      if (actorCache.has(event.actorId)) {
        return { ...event, actorName: actorCache.get(event.actorId)! };
      }
      const actor = await db
        .select({ displayName: users.displayName, email: users.email })
        .from(users)
        .where(eq(users.id, event.actorId))
        .limit(1)
        .get();
      const name = actor ? `${actor.displayName} <${actor.email}>` : `user #${event.actorId}`;
      actorCache.set(event.actorId, name);
      return { ...event, actorName: name };
    }),
  );
  return enriched;
}

/** Check whether the user may access the admin area. */
export async function requireAdmin(user: User | null): Promise<void> {
  if (!user) throw new ForbiddenError("Authentication required");
  const perms = await userPermissions(user.id, user.isSuperuser);
  if (!perms.has("*") && !perms.has("user.manage") && !perms.has("audit.read")) {
    throw new ForbiddenError("Admin access required");
  }
}
