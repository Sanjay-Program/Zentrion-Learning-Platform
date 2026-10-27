import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle, parseBody } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
import { setUserRoles } from "@/lib/admin";
import { getDb } from "@/db/client";
import { userRoles, roles, users } from "@/db/schema";
import { eq } from "drizzle-orm";

const schema = z.object({
  roles: z.array(z.string().min(1).max(60)).max(10),
});

/** Get a user's roles. */
export const GET = handle(async (_request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const db = getDb();
  const target = await db
    .select({ id: users.id, email: users.email, displayName: users.displayName })
    .from(users)
    .where(eq(users.id, Number(id)))
    .limit(1)
    .get();
  if (!target) throw new ValidationError("User not found");
  const roleRows = await db
    .select({ key: roles.key })
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .where(eq(userRoles.userId, target.id))
    .all();
  return { user: { ...target, roles: roleRows.map((r) => r.key) } };
});

/** Replace a user's roles (admin only). */
export const PUT = handle(async (request: NextRequest, ctx) => {
  const actor = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const body = await parseBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ValidationError("Invalid request");
  const result = await setUserRoles(actor, Number(id), parsed.data.roles);
  return result;
});
