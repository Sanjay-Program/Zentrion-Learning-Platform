"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useToast } from "@/components/interactive";
import { Button } from "@/components/ui";
import { formatDate } from "@/lib/utils";

interface LessonControlsProps {
  enrollmentId: number;
  lessonId: number;
  completed: boolean;
  bookmarked: boolean;
  prevLesson: { id: number; title: string } | null;
  nextLesson: { id: number; title: string } | null;
  courseSlug: string;
}

/** Complete toggle, bookmark toggle, and prev/next navigation. */
export function LessonControls({
  enrollmentId,
  lessonId,
  completed,
  bookmarked,
  prevLesson,
  nextLesson,
  courseSlug,
}: LessonControlsProps) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const post = async (action: "complete" | "incomplete" | "bookmark") => {
    const csrf = document.cookie
      .split("; ")
      .find((c) => c.startsWith("zcsrftoken="))
      ?.split("=")[1];
    const res = await fetch(`/api/v1/lessons/${lessonId}/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrf ?? "",
      },
      body: JSON.stringify({ enrollmentId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message ?? "Request failed");
    return data;
  };

  const toggleComplete = () => {
    startTransition(async () => {
      try {
        await post(completed ? "incomplete" : "complete");
        toast.push(
          completed ? "Marked as not completed" : "Lesson completed!",
          "success",
        );
        router.refresh();
      } catch (err) {
        toast.push(err instanceof Error ? err.message : "Failed", "danger");
      }
    });
  };

  const toggleBookmark = () => {
    startTransition(async () => {
      try {
        await post("bookmark");
        toast.push(bookmarked ? "Bookmark removed" : "Bookmarked", "success");
        router.refresh();
      } catch (err) {
        toast.push(err instanceof Error ? err.message : "Failed", "danger");
      }
    });
  };

  return (
    <div
      className="flex"
      style={{ gap: "var(--space-3)", flexWrap: "wrap", alignItems: "center" }}
    >
      <Button
        variant={completed ? "secondary" : "primary"}
        onClick={toggleComplete}
        disabled={pending}
      >
        {completed ? "✓ Completed" : pending ? "Working…" : "Mark complete"}
      </Button>
      <Button variant="ghost" onClick={toggleBookmark} disabled={pending}>
        {bookmarked ? "★ Bookmarked" : "☆ Bookmark"}
      </Button>

      <div style={{ marginLeft: "auto" }} className="flex" aria-label="Lesson navigation">
        {prevLesson ? (
          <Button variant="secondary" href={`/app/courses/${courseSlug}/lessons/${prevLesson.id}`}>
            ← {prevLesson.title}
          </Button>
        ) : (
          <span />
        )}
        {nextLesson && (
          <Button variant="primary" href={`/app/courses/${courseSlug}/lessons/${nextLesson.id}`}>
            {nextLesson.title} →
          </Button>
        )}
      </div>
    </div>
  );
}

export function LessonMeta({ createdAt }: { createdAt: string }) {
  return <span className="text-muted text-sm">Added {formatDate(createdAt)}</span>;
}
