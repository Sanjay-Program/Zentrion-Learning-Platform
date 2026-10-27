import { NextRequest } from "next/server";
import { getSessionToken, validateSession, revokeSession, clearSessionCookie } from "@/lib/auth";
import { handle, json, requestMeta } from "@/lib/api";
import { getDb } from "@/db/client";
import { audit } from "@/lib/audit";

export const POST = handle(async (request: NextRequest) => {
  const token = await getSessionToken();
  const user = await validateSession(token);
  if (token) {
    await revokeSession(token);
  }
  if (user) {
    await audit("user.logout", { actorId: user.id });
  }
  const response = json({ status: "logged_out" });
  clearSessionCookie(response.cookies);
  return response;
});
