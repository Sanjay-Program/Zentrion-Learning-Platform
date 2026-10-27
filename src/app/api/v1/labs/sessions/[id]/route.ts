import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { handle, parseBody } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
import {
  closeLabSession,
  getLabSession,
  recordLabEvent,
  submitLabSession,
  updateLabState,
} from "@/lib/labs";

const eventSchema = z.object({
  eventType: z.string().min(1).max(80),
  details: z.string().max(4000).optional(),
});

const stateSchema = z.object({
  state: z.record(z.unknown()),
});

/** Get a lab session with its events, grade, and evidence. */
export const GET = handle(async (_request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const session = await getLabSession(Number(id), user.id);
  if (!session) throw new ValidationError("Session not found");
  return { session };
});

/**
 * Perform an action on a session:
 * - record an event (eventType + details)
 * - update state
 * - submit for grading
 * - close
 */
export const POST = handle(async (request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const sessionId = Number(id);
  const body = await parseBody(request);
  const { action } = body as { action?: string };

  switch (action) {
    case "event": {
      const parsed = eventSchema.safeParse(body);
      if (!parsed.success) throw new ValidationError("Invalid event");
      const session = await recordLabEvent(
        sessionId,
        user.id,
        parsed.data.eventType,
        parsed.data.details,
      );
      return { session };
    }
    case "state": {
      const parsed = stateSchema.safeParse(body);
      if (!parsed.success) throw new ValidationError("Invalid state");
      const session = await updateLabState(sessionId, user.id, parsed.data.state);
      return { session };
    }
    case "submit": {
      const session = await submitLabSession(sessionId, user.id);
      return { session };
    }
    case "close": {
      const session = await closeLabSession(sessionId, user.id);
      return { session };
    }
    default:
      throw new ValidationError("Unknown action. Use event, state, submit, or close.");
  }
});

/** Close a session. */
export const DELETE = handle(async (_request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const session = await closeLabSession(Number(id), user.id);
  if (!session) throw new ValidationError("Session not found");
  return { status: "closed" };
});
