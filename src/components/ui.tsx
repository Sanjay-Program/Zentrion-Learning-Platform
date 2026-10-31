import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { cx, truncate } from "@/lib/utils";
import { CourseArtwork } from "@/components/course-artwork";
import { getCoursePricing } from "@/lib/course-pricing";

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  title?: string;
  style?: CSSProperties;
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  type = "button",
  disabled,
  onClick,
  className,
  ariaLabel,
  title,
  style,
}: ButtonProps) {
  const classes = cx("btn", `btn-${variant}`, size !== "md" && `btn-${size}`, className);
  if (href) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel} title={title} aria-disabled={disabled} style={style}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      style={style}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Form controls
// ---------------------------------------------------------------------------

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
  required,
}: {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
}) {
  return (
    <div className="field">
      {label && (
        <label htmlFor={htmlFor} className="label">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && (
        <p className="field-error" role="alert">
          <span aria-hidden="true">⚠</span> {error}
        </p>
      )}
    </div>
  );
}

export function Input({
  id,
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return <input id={id} className={cx("input", error && "input-error", className)} aria-invalid={!!error} {...props} />;
}

export function Textarea({
  id,
  error,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return <textarea id={id} className={cx("textarea", error && "input-error", className)} aria-invalid={!!error} {...props} />;
}

export function Select({
  id,
  error,
  children,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return (
    <select id={id} className={cx("select", error && "input-error", className)} aria-invalid={!!error} {...props}>
      {children}
    </select>
  );
}

export function Checkbox({
  id,
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div>
      <label htmlFor={id} className="checkbox">
        <input id={id} type="checkbox" {...props} />
        <span>{label}</span>
      </label>
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

export function Card({
  children,
  className,
  hover,
  raised,
  style,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  raised?: boolean;
  style?: React.CSSProperties;
  as?: "div" | "article" | "section";
}) {
  return (
    <Tag className={cx(raised ? "card-raised" : "card", hover && "card-hover", className)} style={style}>
      {children}
    </Tag>
  );
}

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------

const BADGE_TONES = ["primary", "accent", "success", "warning", "danger", "info"] as const;

export function Badge({
  children,
  tone,
  className,
}: {
  children: ReactNode;
  tone?: (typeof BADGE_TONES)[number];
  className?: string;
}) {
  return (
    <span className={cx("badge", tone && `badge-${tone}`, className)}>
      {children}
    </span>
  );
}

export function LevelBadge({ level }: { level: string }) {
  const tone =
    level === "beginner" ? "success" : level === "intermediate" ? "warning" : level === "advanced" ? "danger" : "info";
  return <Badge tone={tone}>{level}</Badge>;
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export function Progress({ value, label }: { value: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div>
      {label && (
        <div className="flex justify-between mb-2">
          <span className="text-sm text-muted">{label}</span>
          <span className="text-sm font-semibold">{clamped}%</span>
        </div>
      )}
      <div className="progress" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-bar" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      role="img"
      aria-label={name}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--primary-subtle)",
        color: "var(--primary)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size * 0.4,
        flexShrink: 0,
      }}
    >
      {initials || "?"}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Alert
// ---------------------------------------------------------------------------

export function Alert({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "success" | "warning" | "danger";
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx("alert", `alert-${tone}`)} role={tone === "danger" ? "alert" : "status"}>
      <div>
        {title && <strong className="block mb-2">{title}</strong>}
        <div>{children}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state & skeleton
// ---------------------------------------------------------------------------

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Skeleton({ width, height = 16, className }: { width?: string | number; height?: number; className?: string }) {
  return <div className={cx("skeleton", className)} style={{ width, height }} aria-hidden="true" />;
}

// ---------------------------------------------------------------------------
// Breadcrumbs
// ---------------------------------------------------------------------------

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}>
            {i > 0 && <span aria-hidden="true">/</span>}
            {isLast || !item.href ? (
              <span aria-current={isLast ? "page" : undefined}>{item.label}</span>
            ) : (
              <Link href={item.href}>{item.label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Course card (shared catalogue card)
// ---------------------------------------------------------------------------

export function CourseCard({
  slug,
  title,
  subtitle,
  level,
  hours,
  priceCents,
}: {
  slug: string;
  title: string;
  subtitle?: string | null;
  level: string;
  hours?: number | null;
  priceCents: number;
}) {
  const pricing = getCoursePricing(slug);

  return (
    <div
      style={{
        borderRadius: "1rem",
        background: "rgba(10, 15, 29, 0.9)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
      }}
      className="glass-card-hover"
    >
      <div style={{ position: "relative" }}>
        <CourseArtwork slug={slug} title={title} size="sm" />
        <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          <span
            style={{
              padding: "0.25rem 0.65rem",
              borderRadius: "9999px",
              background: "linear-gradient(135deg, #EF4444, #DC2626)",
              color: "#FFFFFF",
              fontSize: "0.72rem",
              fontWeight: 800,
              boxShadow: "0 2px 8px rgba(239, 68, 68, 0.5)",
            }}
          >
            🔥 {pricing.seatsRemaining} seats left
          </span>
          <span
            style={{
              padding: "0.25rem 0.6rem",
              borderRadius: "9999px",
              background: "rgba(16, 185, 129, 0.9)",
              color: "#FFFFFF",
              fontSize: "0.7rem",
              fontWeight: 800,
            }}
          >
            {pricing.discountPct}% OFF
          </span>
        </div>
      </div>

      <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem" }}>
            <span style={{ color: "#FBBF24", fontWeight: 700 }}>★ 4.9</span>
            <span style={{ color: "#94A3B8" }}>(12.8K verified)</span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "#38BDF8", fontWeight: 700, textTransform: "capitalize" }}>
            {level}
          </span>
        </div>

        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.4rem", lineHeight: 1.35 }}>
          <Link href={`/courses/${slug}`} style={{ color: "#FFFFFF", textDecoration: "none" }}>
            {truncate(title, 75)}
          </Link>
        </h3>

        {subtitle && (
          <p style={{ color: "#94A3B8", fontSize: "0.85rem", lineHeight: 1.45, marginBottom: "0.75rem", flex: 1 }}>
            {truncate(subtitle, 110)}
          </p>
        )}

        {/* Urgency Deadline Pill */}
        <div
          style={{
            fontSize: "0.72rem",
            color: "#F59E0B",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            marginBottom: "0.75rem",
            background: "rgba(245, 158, 11, 0.1)",
            padding: "0.25rem 0.5rem",
            borderRadius: "0.35rem",
            border: "1px solid rgba(245, 158, 11, 0.25)",
            width: "fit-content",
          }}
        >
          <span>⏳</span> Offer until 10th October only
        </div>

        <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "0.85rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
              <span style={{ fontSize: "1.35rem", fontWeight: 900, color: "#22D3EE" }}>
                {pricing.formattedPrice}
              </span>
              <span style={{ fontSize: "0.85rem", color: "#64748B", textDecoration: "line-through", fontWeight: 600 }}>
                {pricing.formattedOriginalPrice}
              </span>
            </div>
            <div style={{ fontSize: "0.68rem", color: "#10B981", fontWeight: 600 }}>
              100% Money-Back Guarantee
            </div>
          </div>

          <Link
            href={`/courses/${slug}`}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              color: "#FFFFFF",
              fontSize: "0.85rem",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 0 15px rgba(99, 102, 241, 0.4)",
              transition: "all 0.2s ease",
            }}
          >
            Enroll Now →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export function Pagination({
  page,
  pages,
  basePath,
  searchParams,
}: {
  page: number;
  pages: number;
  basePath: string;
  searchParams?: Record<string, string>;
}) {
  if (pages <= 1) return null;
  const params = new URLSearchParams(searchParams);
  const href = (p: number) => {
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  };
  const items: number[] = [];
  const add = (p: number) => {
    if (p >= 1 && p <= pages && !items.includes(p)) items.push(p);
  };
  add(1);
  for (let p = page - 2; p <= page + 2; p++) add(p);
  add(pages);
  items.sort((a, b) => a - b);
  return (
    <nav aria-label="Pagination" className="flex" style={{ gap: "var(--space-1)" }}>
      <Link className="btn btn-secondary btn-sm" href={href(Math.max(1, page - 1))} aria-label="Previous page">
        ← Prev
      </Link>
      {items.map((p, i) =>
        i > 0 && items[i - 1] < p - 1 ? (
          <span key={`gap-${p}`} aria-hidden="true" style={{ padding: "0 var(--space-1)" }}>…</span>
        ) : null,
      )}
      {items.map((p) => (
        <Link
          key={p}
          className={cx("btn btn-sm", p === page ? "btn-primary" : "btn-secondary")}
          href={href(p)}
          aria-label={`Page ${p}`}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </Link>
      ))}
      <Link className="btn btn-secondary btn-sm" href={href(Math.min(pages, page + 1))} aria-label="Next page">
        Next →
      </Link>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Page header
// ---------------------------------------------------------------------------

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-8" style={{ flexWrap: "wrap", gap: "var(--space-4)" }}>
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="lead">{description}</p>}
      </div>
      {actions && <div className="flex">{actions}</div>}
    </div>
  );
}
