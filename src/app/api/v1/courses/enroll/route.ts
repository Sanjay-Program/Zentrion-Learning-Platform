import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/server";
import { getDb } from "@/db/client";
import { courses, enrollments, entitlements } from "@/db/schema";
import {
  ConflictError,
  NotFoundError,
  PaymentRequiredError,
  ValidationError,
} from "@/lib/errors";
import { handle, parseBody } from "@/lib/api";
import { audit, notify } from "@/lib/audit";

const enrollSchema = z.object({ courseId: z.number().int().positive() });

/**
 * Enrol the current user in a course.
 * Free courses enrol directly; paid courses require an entitlement
 * (from checkout) or an active Pro subscription.
 */
export const POST = handle(async (request: NextRequest) => {
  const user = await requireUser();
  const body = await parseBody(request);
  const parsed = enrollSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Invalid enrolment request");
  }
  const { courseId } = parsed.data;

  const db = getDb();
  const course = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1).get();
  if (!course || course.status !== "published") {
    throw new NotFoundError("Course not found");
  }

  const isEnrolled = await db
    .select({ courseId: enrollments.courseId })
    .from(enrollments)
    .where(eq(enrollments.userId, user.id))
    .all();
  if (isEnrolled.some((e) => e.courseId === courseId)) {
    throw new ConflictError("You are already enrolled in this course");
  }

  // Paid courses need an entitlement or an active subscription.
  if (course.priceCents > 0) {
    const entitlementsRows = await db
      .select()
      .from(entitlements)
      .where(eq(entitlements.userId, user.id))
      .all();
    const now = new Date().toISOString();
    const hasPro = entitlementsRows.some(
      (ent) =>
        ent.resourceType === "subscription" &&
        (!ent.expiresAt || ent.expiresAt > now),
    );
    const ownsCourse = entitlementsRows.some(
      (ent) => ent.resourceType === "course" && ent.resourceId === courseId,
    );
    if (!hasPro && !ownsCourse) {
      throw new PaymentRequiredError("Purchase this course or subscribe to Pro first");
    }
  }

  const [enrollment] = await db
    .insert(enrollments)
    .values({ userId: user.id, courseId, status: "active", source: "direct" })
    .returning();

  await audit("course.enrolled", { actorId: user.id, entityType: "course", entityId: courseId });
  await notify(user.id, "enrollment", "Enrolled!", `You enrolled in "${course.title}".`, {
    type: "course",
    id: courseId,
  });

  return { status: "enrolled", enrollmentId: enrollment.id, courseId };
});
