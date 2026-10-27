/**
 * Cybersecurity labs: provisioning simulated environments,
 * session lifecycle, event capture, evidence, and grading.
 */
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  challengeAttempts,
  challengeDefinitions,
  labDefinitions,
  labEvents,
  labEvidence,
  labGrades,
  labSessions,
} from "@/db/schema";
import { getSettings } from "@/lib/config";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { hashToken } from "@/lib/auth";
import { toIso, addMinutes } from "@/lib/utils";

export interface LabDetail {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  labType: string;
  difficulty: string;
  objectives: string[];
  instructions: string | null;
  estimatedMinutes: number;
  engineConfig: Record<string, unknown>;
  gradingRubric: unknown[];
  ttlMinutes: number;
  safetyClassification: string;
  isPublished: boolean;
}

export async function getLabBySlug(slug: string): Promise<LabDetail | null> {
  const db = getDb();
  const lab = await db
    .select()
    .from(labDefinitions)
    .where(and(eq(labDefinitions.slug, slug), eq(labDefinitions.isPublished, true)))
    .limit(1)
    .get();
  return lab ?? null;
}

export interface LabSessionDetail {
  id: number;
  labId: number;
  status: string;
  environmentVersion: string;
  startedAt: string | null;
  expiresAt: string | null;
  finishedAt: string | null;
  state: Record<string, unknown>;
  submittedAt: string | null;
  createdAt: string;
  events: { id: number; eventType: string; details: string | null; createdAt: string }[];
  grade: { scorePercent: number; rubricScores: unknown[]; feedback: string | null } | null;
  evidence: { id: number; kind: string; reference: string; details: string | null }[];
}

export async function getLabSession(
  sessionId: number,
  userId: number,
): Promise<LabSessionDetail | null> {
  const db = getDb();
  const session = await db
    .select()
    .from(labSessions)
    .where(and(eq(labSessions.id, sessionId), eq(labSessions.userId, userId)))
    .limit(1)
    .get();
  if (!session) return null;
  const events = await db
    .select()
    .from(labEvents)
    .where(eq(labEvents.sessionId, sessionId))
    .orderBy(labEvents.id)
    .all();
  const grade =
    (await db
      .select()
      .from(labGrades)
      .where(eq(labGrades.sessionId, sessionId))
      .limit(1)
      .get()) ?? null;
  const evidence = await db
    .select()
    .from(labEvidence)
    .where(eq(labEvidence.sessionId, sessionId))
    .orderBy(labEvidence.id)
    .all();
  return { ...session, events, grade, evidence };
}

/** List the user's sessions for a lab (active + finished). */
export async function listLabSessions(labId: number, userId: number) {
  const db = getDb();
  return db
    .select()
    .from(labSessions)
    .where(and(eq(labSessions.labId, labId), eq(labSessions.userId, userId)))
    .orderBy(desc(labSessions.id))
    .limit(20)
    .all();
}

/** Provision a new lab session (simulated executor). */
export async function startLabSession(labId: number, userId: number) {
  const settings = getSettings();
  const db = getDb();
  const lab = await db
    .select()
    .from(labDefinitions)
    .where(eq(labDefinitions.id, labId))
    .limit(1)
    .get();
  if (!lab) throw new NotFoundError("Lab not found");

  const started = new Date();
  const expires = addMinutes(started, Math.min(lab.ttlMinutes, settings.labMaxSessionMinutes));

  const result = await db
    .insert(labSessions)
    .values({
      labId,
      userId,
      status: "running",
      environmentVersion: "1.0",
      startedAt: toIso(started),
      expiresAt: toIso(expires),
      state: {
        executor: settings.labExecutor,
        provisionedAt: toIso(started),
        sandbox: `lab-${labId}-${userId}-${Date.now()}`,
      },
    })
    .run();
  const sessionId = Number(result.lastInsertRowid);

  await db
    .insert(labEvents)
    .values({
      sessionId,
      eventType: "session.started",
      details: JSON.stringify({ executor: settings.labExecutor, ttlMinutes: lab.ttlMinutes }),
    })
    .run();

  return getLabSession(sessionId, userId);
}

/** Record an event against a running session. */
export async function recordLabEvent(
  sessionId: number,
  userId: number,
  eventType: string,
  details?: string,
) {
  const db = getDb();
  const session = await db
    .select()
    .from(labSessions)
    .where(and(eq(labSessions.id, sessionId), eq(labSessions.userId, userId)))
    .limit(1)
    .get();
  if (!session) throw new NotFoundError("Lab session not found");
  if (session.status !== "running") throw new ValidationError("Session is not running");

  await db
    .insert(labEvents)
    .values({ sessionId, eventType, details })
    .run();
  return getLabSession(sessionId, userId);
}

/** Update session state (e.g. terminal output snapshots). */
export async function updateLabState(
  sessionId: number,
  userId: number,
  state: Record<string, unknown>,
) {
  const db = getDb();
  await db
    .update(labSessions)
    .set({ state: { ...state } })
    .where(and(eq(labSessions.id, sessionId), eq(labSessions.userId, userId)))
    .run();
  return getLabSession(sessionId, userId);
}

/** Submit a session for grading against the rubric. */
export async function submitLabSession(sessionId: number, userId: number) {
  const db = getDb();
  const session = await db
    .select()
    .from(labSessions)
    .where(and(eq(labSessions.id, sessionId), eq(labSessions.userId, userId)))
    .limit(1)
    .get();
  if (!session) throw new NotFoundError("Lab session not found");
  if (session.status !== "running") throw new ValidationError("Session already closed");

  const lab = await db
    .select()
    .from(labDefinitions)
    .where(eq(labDefinitions.id, session.labId))
    .limit(1)
    .get();
  const rubric = (lab?.gradingRubric ?? []) as { criterion?: string; points?: number }[];

  // Simulated grading: score based on recorded evidence events.
  const events = await db
    .select()
    .from(labEvents)
    .where(eq(labEvents.sessionId, sessionId))
    .all();
  const milestoneEvents = events.filter((e) => e.eventType === "milestone").length;
  const rubricScores = rubric.map((r, i) => ({
    criterion: r.criterion ?? `Criterion ${i + 1}`,
    points: r.points ?? 0,
    earned: milestoneEvents > i ? r.points ?? 0 : 0,
  }));
  const maxPoints = rubricScores.reduce((sum, r) => sum + Number(r.points ?? 0), 0);
  const earned = rubricScores.reduce((sum, r) => sum + Number(r.earned ?? 0), 0);
  const scorePercent = maxPoints > 0 ? Math.round((earned / maxPoints) * 100) : 0;

  await db
    .update(labSessions)
    .set({ status: "submitted", submittedAt: toIso(new Date()), finishedAt: toIso(new Date()) })
    .where(eq(labSessions.id, sessionId))
    .run();
  await db
    .insert(labGrades)
    .values({
      sessionId,
      scorePercent,
      rubricScores,
      feedback:
        scorePercent >= 70
          ? "Solid work — all key milestones demonstrated."
          : "Review the objectives and try again; focus on the unchecked rubric items.",
    })
    .run();
  await db
    .insert(labEvents)
    .values({ sessionId, eventType: "session.submitted", details: JSON.stringify({ scorePercent }) })
    .run();

  return getLabSession(sessionId, userId);
}

/** Close an expired or abandoned session. */
export async function closeLabSession(sessionId: number, userId: number) {
  const db = getDb();
  await db
    .update(labSessions)
    .set({ status: "finished", finishedAt: toIso(new Date()) })
    .where(and(eq(labSessions.id, sessionId), eq(labSessions.userId, userId)))
    .run();
  return getLabSession(sessionId, userId);
}

// ---------------------------------------------------------------------------
// CTF challenges
// ---------------------------------------------------------------------------

export async function getChallengeBySlug(slug: string) {
  const db = getDb();
  const challenge = await db
    .select()
    .from(challengeDefinitions)
    .where(and(eq(challengeDefinitions.slug, slug), eq(challengeDefinitions.isPublished, true)))
    .limit(1)
    .get();
  if (!challenge) return null;
  const attempts = await db
    .select({ id: challengeAttempts.id, correct: challengeAttempts.correct, createdAt: challengeAttempts.createdAt })
    .from(challengeAttempts)
    .where(eq(challengeAttempts.challengeId, challenge.id))
    .orderBy(desc(challengeAttempts.id))
    .limit(20)
    .all();
  return { ...challenge, attempts };
}

/** Submit a flag. Flags are hashed and compared to the stored hash. */
export async function submitFlag(
  challengeId: number,
  userId: number,
  flag: string,
) {
  const db = getDb();
  const challenge = await db
    .select()
    .from(challengeDefinitions)
    .where(eq(challengeDefinitions.id, challengeId))
    .limit(1)
    .get();
  if (!challenge) throw new NotFoundError("Challenge not found");
  if (!challenge.isPublished) throw new ValidationError("Challenge is not published");

  const userAttempts = await db
    .select({ id: challengeAttempts.id })
    .from(challengeAttempts)
    .where(
      and(
        eq(challengeAttempts.challengeId, challengeId),
        eq(challengeAttempts.userId, Number(userId)),
      ),
    )
    .all();
  if (userAttempts.length >= challenge.maxAttempts) {
    throw new ValidationError("Maximum attempts reached for this challenge");
  }

  const submittedHash = await hashToken(flag.trim());
  const correct = submittedHash === challenge.flagHash;

  await db
    .insert(challengeAttempts)
    .values({
      challengeId,
      userId: Number(userId),
      submittedFlagHash: submittedHash,
      correct,
    })
    .run();

  return { correct, attemptsUsed: userAttempts.length + 1, maxAttempts: challenge.maxAttempts };
}
