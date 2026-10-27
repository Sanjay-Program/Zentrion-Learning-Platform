import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle } from "@/lib/api";
import { listAdminUsers, requireAdmin } from "@/lib/admin";

/** List/search users with roles (admin only). */
export const GET = handle(async (request: NextRequest) => {
  const user = await requireUser();
  await requireAdmin(user);
  const search = request.nextUrl.searchParams.get("search") ?? undefined;
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "50");
  const offset = Number(request.nextUrl.searchParams.get("offset") ?? "0");
  const users = await listAdminUsers(user, { search, limit, offset });
  return { users };
});
