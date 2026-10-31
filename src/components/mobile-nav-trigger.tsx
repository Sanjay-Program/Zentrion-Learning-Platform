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
        <div style={{ borderTop: "1px solid var(--border)", marginTop: "var(--space-4)", paddingTop: "var(--space-4)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <Link
            href="/courses"
            className="nav-link"
            onClick={() => setOpen(false)}
            style={{ color: "#FCD34D", fontWeight: 700 }}
          >
            🔥 Flagship Courses (From ₹499)
          </Link>
          <Link
            href="/pricing"
            className="nav-link"
            onClick={() => setOpen(false)}
            style={{ color: "#38BDF8", fontWeight: 700 }}
          >
            💎 Pricing & Cohort Offers
          </Link>
          <a
            href="https://wa.me/917305771789?text=Hello%20Zentrion%2C%20I%20want%20to%20enroll%20in%20a%20course"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
            onClick={() => setOpen(false)}
            style={{ color: "#25D366", fontWeight: 700 }}
          >
            💬 WhatsApp Admissions
          </a>
        </div>
      </MobileNav>
    </>
  );
}
