import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle } from "@/lib/api";
import { listAdminAuditEvents, requireAdmin } from "@/lib/admin";

/** Paginated audit log (admin/auditor only). */
export const GET = handle(async (request: NextRequest) => {
  const user = await requireUser();
  await requireAdmin(user);
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "100");
  const offset = Number(request.nextUrl.searchParams.get("offset") ?? "0");
  const events = await listAdminAuditEvents(user, { limit, offset });
  return { events };
});
