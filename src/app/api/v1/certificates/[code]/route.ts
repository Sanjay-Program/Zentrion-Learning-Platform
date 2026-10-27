import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle } from "@/lib/api";
import { getDb } from "@/db/client";
import { certificates, courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NotFoundError } from "@/lib/errors";

/** Verify a certificate by its verification code. */
export const GET = handle(async (_request: NextRequest, ctx) => {
  await requireUser();
  const { code } = (await ctx.params) ?? {};
  const db = getDb();
  const certificate = await db
    .select({
      id: certificates.id,
      verificationCode: certificates.verificationCode,
      issuedAt: certificates.issuedAt,
      revoked: certificates.revoked,
      revokedReason: certificates.revokedReason,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      userId: certificates.userId,
    })
    .from(certificates)
    .innerJoin(courses, eq(courses.id, certificates.courseId))
    .where(eq(certificates.verificationCode, String(code)))
    .limit(1)
    .get();
  if (!certificate) throw new NotFoundError("Certificate not found");
  return { certificate };
});
