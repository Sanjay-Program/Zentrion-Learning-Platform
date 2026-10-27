"use client";

import { useState } from "react";
import Link from "next/link";
import { MobileNav } from "@/components/interactive";
import { NAV_ITEMS } from "@/components/nav-items";

/** Mobile navigation trigger with drawer. Client component. */
export function MobileNavTrigger() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-sm mobile-only"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        style={{ padding: "0.375rem 0.5rem" }}
      >
        <span aria-hidden="true" style={{ fontSize: 18 }}>☰</span>
      </button>
      <MobileNav open={open} onClose={() => setOpen(false)}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="nav-link"
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
        <div style={{ borderTop: "1px solid var(--border)", marginTop: "var(--space-4)", paddingTop: "var(--space-4)" }}>
          <Link href="/auth/sign-in" className="nav-link" onClick={() => setOpen(false)}>
            Sign in
          </Link>
          <Link href="/auth/sign-up" className="nav-link" onClick={() => setOpen(false)}>
            Get started
          </Link>
        </div>
      </MobileNav>
    </>
  );
}
