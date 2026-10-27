import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server";
import { deleteNote } from "@/lib/learning";
import { ForbiddenError } from "@/lib/errors";
import { handle } from "@/lib/api";
import { audit } from "@/lib/audit";

/** Delete one of the current user's notes. */
export const DELETE = handle(async (request: NextRequest, ctx) => {
  const user = await requireUser();
  const { id } = (await ctx.params) ?? {};
  const noteId = Number(id ?? new URL(request.url).searchParams.get("id"));

  const deleted = await deleteNote(noteId, user.id);
  if (!deleted) {
    throw new ForbiddenError("Note not found or access denied");
  }
  await audit("note.deleted", { actorId: user.id, entityType: "note", entityId: noteId });
  return { status: "deleted" };
});
