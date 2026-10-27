"use client";

import { useTransition } from "react";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Field, Textarea } from "@/components/ui";
import { useToast } from "@/components/interactive";
import type { LearnerNote } from "@/lib/learning";
import { formatDate } from "@/lib/utils";

/** Notes editor for the current lesson. */
export function NotesPanel({
  notes: initialNotes,
  lessonId,
}: {
  notes: LearnerNote[];
  lessonId: number;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState(initialNotes);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    startTransition(async () => {
      try {
        const csrf = document.cookie
          .split("; ")
          .find((c) => c.startsWith("zcsrftoken="))
          ?.split("=")[1];
        const res = await fetch(`/api/v1/lessons/${lessonId}/notes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrf ?? "",
          },
          body: JSON.stringify({ content: content.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message ?? "Could not save note");
        setNotes([data.note, ...notes]);
        setContent("");
        toast.push("Note saved", "success");
        router.refresh();
      } catch (err) {
        toast.push(err instanceof Error ? err.message : "Failed", "danger");
      }
    });
  };

  const remove = async (noteId: number) => {
    startTransition(async () => {
      try {
        const csrf = document.cookie
          .split("; ")
          .find((c) => c.startsWith("zcsrftoken="))
          ?.split("=")[1];
        const res = await fetch(`/api/v1/notes/${noteId}`, {
          method: "DELETE",
          headers: { "x-csrf-token": csrf ?? "" },
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error?.message ?? "Could not delete note");
        }
        setNotes(notes.filter((n) => n.id !== noteId));
        toast.push("Note deleted", "success");
        router.refresh();
      } catch (err) {
        toast.push(err instanceof Error ? err.message : "Failed", "danger");
      }
    });
  };

  return (
    <Card>
      <h3 style={{ marginBottom: "var(--space-3)" }}>Lesson notes</h3>
      <form onSubmit={save}>
        <Field label="New note" htmlFor="note-content">
          <Textarea
            id="note-content"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Summarise key points, mark timestamps, add questions…"
          />
        </Field>
        <Button type="submit" disabled={pending || !content.trim()} className="w-full mt-2">
          {pending ? "Saving…" : "Save note"}
        </Button>
      </form>

      <div style={{ marginTop: "var(--space-5)" }}>
        {notes.length === 0 ? (
          <p className="text-muted text-sm">No notes yet.</p>
        ) : (
          notes.map((note) => (
            <article
              key={note.id}
              style={{
                borderTop: "1px solid var(--border)",
                padding: "var(--space-3) 0",
              }}
            >
              <p style={{ whiteSpace: "pre-line", margin: "0 0 var(--space-1)" }}>
                {note.content}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-muted text-sm">{formatDate(note.createdAt)}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => remove(note.id)}
                  aria-label="Delete note"
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </Card>
  );
}
