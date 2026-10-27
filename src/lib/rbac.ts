import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  permissions,
  rolePermissions,
  roles,
  userRoles,
} from "@/db/schema";
import type { User } from "@/lib/auth";

/**
 * Platform permission matrix.
 * Roles map to permission keys. "admin" implies every permission.
 * Organization-scoped permissions are enforced separately in the
 * organization service (org.manage, org.member.invite, ...).
 */
export const PERMISSION_MATRIX: Record<string, string[] | null> = {
  learner: [
    "course.read",
    "course.enroll",
    "lesson.read",
    "assessment.take",
    "project.submit",
    "lab.launch",
    "ai.use",
    "community.read",
    "community.post",
    "profile.read",
    "profile.edit",
  ],
  instructor: [
    "course.read",
    "course.enroll",
    "lesson.read",
    "assessment.take",
    "project.submit",
    "lab.launch",
    "ai.use",
    "community.read",
    "community.post",
    "profile.read",
    "profile.edit",
    "course.create",
    "course.edit.own",
    "lesson.edit.own",
    "assessment.create",
    "assessment.grade.own",
    "submission.grade.own",
    "instructor.analytics.read",
    "live.session.create",
  ],
  reviewer: ["course.read", "lesson.read", "course.review", "content.moderate"],
  support_agent: ["user.read", "support.ticket.read", "support.ticket.manage", "audit.read"],
  finance_operator: ["billing.view", "refund.process", "orders.read"],
  content_moderator: ["content.moderate", "community.moderate", "course.read"],
  security_admin: ["audit.read", "security.events.read", "user.read", "ai.configure", "lab.manage"],
  admin: null, // null = all permissions
};

export const DEFAULT_ROLE = "learner";

export const ALL_PERMISSIONS: string[] = Array.from(
  new Set(
    Object.values(PERMISSION_MATRIX)
      .filter((p): p is string[] => p !== null)
      .flat(),
  ),
).concat([
  "admin.impersonate",
  "platform.configure",
  "user.manage",
  "org.manage",
  "org.member.invite",
  "org.learning.assign",
  "org.reports.read",
  "org.billing.view",
]);

/** Idempotently create the permission matrix in the database. */
export async function ensureRolesAndPermissions(): Promise<void> {
  const db = getDb();

  for (const key of ALL_PERMISSIONS) {
    const existing = await db.select().from(permissions).where(eq(permissions.key, key)).limit(1).get();
    if (!existing) {
      await db.insert(permissions).values({ key, name: humanize(key), description: `Allows ${key}` }).run();
    }
  }

  for (const [roleKey, perms] of Object.entries(PERMISSION_MATRIX)) {
    let role = await db.select().from(roles).where(eq(roles.key, roleKey)).limit(1).get();
    if (!role) {
      const [inserted] = await db
        .insert(roles)
        .values({ key: roleKey, name: humanize(roleKey), scope: "platform" })
        .returning();
      role = inserted;
    }
    const permissionKeys = perms === null ? ALL_PERMISSIONS : perms;
    for (const pkey of permissionKeys) {
      const perm = await db.select().from(permissions).where(eq(permissions.key, pkey)).limit(1).get();
      if (!perm) continue;
      const link = await db
        .select()
        .from(rolePermissions)
        .where(and(eq(rolePermissions.roleId, role.id), eq(rolePermissions.permissionId, perm.id)))
        .limit(1)
        .get();
      if (!link) {
        await db.insert(rolePermissions).values({ roleId: role.id, permissionId: perm.id }).run();
      }
    }
  }
}

export async function assignRole(userId: number, roleKey: string): Promise<void> {
  const db = getDb();
  const role = await db.select().from(roles).where(eq(roles.key, roleKey)).limit(1).get();
  if (!role) return;
  const existing = await db
    .select()
    .from(userRoles)
    .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, role.id)))
    .limit(1)
    .get();
  if (!existing) {
    await db.insert(userRoles).values({ userId, roleId: role.id }).run();
  }
}

/** Resolve the effective permission set for a user. Returns {"*"} for admins. */
export async function userPermissions(userId: number, isSuperuser: boolean, roleKeys?: string[]): Promise<Set<string>> {
  if (isSuperuser) return new Set(["*"]);
  const db = getDb();
  const effective = roleKeys ?? (
    await db.select({ key: roles.key }).from(userRoles).innerJoin(roles, eq(userRoles.roleId, roles.id)).where(eq(userRoles.userId, userId)).all()
  ).map((r) => r.key);

  const perms = new Set<string>();
  for (const key of effective) {
    if (key === "admin") return new Set(["*"]);
    const role = await db.select().from(roles).where(eq(roles.key, key)).limit(1).get();
    if (!role) continue;
    const rows = await db
      .select({ key: permissions.key })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, role.id))
      .all();
    for (const r of rows) perms.add(r.key);
  }
  return perms;
}

export async function hasPermission(user: User, permission: string): Promise<boolean> {
  const perms = await userPermissions(user.id, user.isSuperuser, user.roles?.map((r) => r.key));
  return perms.has("*") || perms.has(permission);
}

export async function requirePermission(user: User | null, permission: string): Promise<void> {
  if (!user) {
    const { UnauthorizedError } = await import("@/lib/errors");
    throw new UnauthorizedError();
  }
  const ok = await hasPermission(user, permission);
  if (!ok) {
    const { ForbiddenError } = await import("@/lib/errors");
    throw new ForbiddenError();
  }
}

export function humanize(key: string): string {
  return key
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
