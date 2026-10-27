"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cx } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Theme toggle (light / dark / system), persisted in localStorage
// ---------------------------------------------------------------------------

type Theme = "light" | "dark" | "system";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
  try {
    document.cookie = `zentn-theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {}
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem("zentn-theme") as Theme | null) ||
      (document.documentElement.getAttribute("data-theme") as Theme | null);
    const initial = stored ?? "dark";
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  const cycle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    applyTheme(next);
    try {
      localStorage.setItem("zentn-theme", next);
    } catch {}
  };

  if (!mounted) {
    return (
      <div
        style={{
          width: "40px",
          height: "36px",
          borderRadius: "0.5rem",
          background: "rgba(255, 255, 255, 0.05)",
        }}
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Current: ${isDark ? "Dark theme" : "Light theme"}. Click to switch to ${isDark ? "Light" : "Dark"} mode.`}
      title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.35rem",
        padding: "0.45rem 0.75rem",
        borderRadius: "9999px",
        background: isDark ? "rgba(15, 23, 42, 0.7)" : "rgba(241, 245, 249, 0.9)",
        border: isDark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(15, 23, 42, 0.15)",
        color: isDark ? "#F8FAFC" : "#0F172A",
        fontSize: "0.85rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: isDark ? "0 0 10px rgba(0, 0, 0, 0.3)" : "0 2px 6px rgba(0, 0, 0, 0.06)",
      }}
    >
      <span style={{ fontSize: "1rem" }}>{isDark ? "🌙" : "☀️"}</span>
      <span style={{ fontSize: "0.75rem", textTransform: "capitalize" }}>
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Dialog (accessible: focus trap-lite, Escape to close, labelled)
// ---------------------------------------------------------------------------

export function Dialog({
  open,
  onClose,
  title,
  children,
  actions,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>("button, [href], input, select, textarea")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="dialog-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog" role="dialog" aria-modal="true" aria-label={title} ref={dialogRef}>
        <h2 className="dialog-title">{title}</h2>
        <div>{children}</div>
        {actions && <div className="dialog-actions">{actions}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  danger,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      actions={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={cx("btn", danger ? "btn-danger" : "btn-primary")}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-muted" style={{ margin: 0 }}>
        {message}
      </p>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange?: (id: string) => void;
}) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`tab-${tab.id}`}
          aria-selected={active === tab.id}
          aria-controls={`panel-${tab.id}`}
          className={cx("tab")}
          onClick={() => onChange?.(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dropdown menu
// ---------------------------------------------------------------------------

export function Dropdown({
  trigger,
  items,
  align = "end",
}: {
  trigger: ReactNode;
  items: { label: string; onClick?: () => void; href?: string; danger?: boolean }[];
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <span onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
        {trigger}
      </span>
      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            [align]: 0,
            top: "calc(100% + var(--space-1))",
            minWidth: "12rem",
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            padding: "var(--space-1)",
            zIndex: 50,
          }}
        >
          {items.map((item, i) =>
            item.href ? (
              <a
                key={i}
                href={item.href}
                role="menuitem"
                className="nav-link"
                style={{ display: "flex", width: "100%", color: item.danger ? "var(--danger)" : undefined }}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ) : (
              <button
                key={i}
                type="button"
                role="menuitem"
                className="nav-link"
                style={{
                  display: "flex",
                  width: "100%",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  color: item.danger ? "var(--danger)" : undefined,
                }}
                onClick={() => {
                  setOpen(false);
                  item.onClick?.();
                }}
              >
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toasts
// ---------------------------------------------------------------------------

type Toast = { id: number; message: string; tone: "info" | "success" | "danger" };

const ToastContext = createContext<{ push: (message: string, tone?: Toast["tone"]) => void }>({
  push: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const push = useCallback((message: string, tone: Toast["tone"] = "info") => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: "fixed",
          bottom: "var(--space-6)",
          right: "var(--space-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
          zIndex: 100,
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cx("alert", `alert-${toast.tone}`)}
            style={{ margin: 0, minWidth: 16 * 16, boxShadow: "var(--shadow-lg)" }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Mobile navigation (drawer)
// ---------------------------------------------------------------------------

export function MobileNav({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="dialog-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <nav
        aria-label="Mobile navigation"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: "min(20rem, 85vw)",
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          padding: "var(--space-6)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-1)",
        }}
      >
        <div className="flex justify-between mb-6">
          <strong>Menu</strong>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close menu">
            ✕
          </button>
        </div>
        {children}
      </nav>
    </div>
  );
}
