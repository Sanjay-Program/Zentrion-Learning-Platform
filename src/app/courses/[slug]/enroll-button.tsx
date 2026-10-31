"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useToast } from "@/components/interactive";
import { Button } from "@/components/ui";
import { formatPrice } from "@/lib/utils";

/**
 * Enrolment control. Free courses enrol immediately via the API;
 * paid courses route to checkout.
 */
export function EnrollButton({
  courseId,
  priceCents,
  enrolled,
  slug,
  variant,
  label,
}: {
  courseId: number;
  priceCents: number;
  enrolled: boolean;
  slug: string;
  variant?: "block";
  label?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const className = variant === "block" ? "btn btn-primary btn-block" : "btn btn-primary";

  if (enrolled) {
    return <Button variant="secondary" href={`/app/courses/${slug}`} className={variant === "block" ? "w-full" : undefined}>
      Enrolled ✓
    </Button>;
  }

  const handleEnroll = async () => {
    if (priceCents > 0) {
      router.push(`/checkout?course=${courseId}`);
      return;
    }
    startTransition(async () => {
      try {
        const csrf = document.cookie
          .split("; ")
          .find((c) => c.startsWith("zcsrftoken="))
          ?.split("=")[1];
        const res = await fetch("/api/v1/courses/enroll", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrf ?? "",
          },
          body: JSON.stringify({ courseId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message ?? "Enrolment failed");
        toast.push("Enrolled — start learning!", "success");
        router.refresh();
      } catch (err) {
        toast.push(err instanceof Error ? err.message : "Enrolment failed", "danger");
      }
    });
  };

  return (
    <button
      type="button"
      className={className}
      disabled={pending}
      onClick={handleEnroll}
      style={{
        padding: "0.85rem 1.5rem",
        fontSize: "1rem",
        fontWeight: 700,
        borderRadius: "0.6rem",
        cursor: pending ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
        color: "#FFFFFF",
        boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)",
        border: "none",
        width: variant === "block" ? "100%" : "auto",
        transition: "all 0.2s ease",
      }}
    >
      {pending
        ? "Securing seat…"
        : label
          ? label
          : priceCents > 0
            ? `Enroll Now — ${formatPrice(priceCents)}`
            : "Enroll free"}
    </button>
  );
}
