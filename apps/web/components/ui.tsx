import Link from "next/link";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

export function Card({
  children,
  className,
  as: As = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}) {
  return (
    <As className={cn("rounded border border-border bg-surface shadow-card", className)}>
      {children}
    </As>
  );
}

export function CardHeader({
  title,
  eyebrow,
  action,
  className,
}: {
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-5",
        className
      )}
    >
      <div>
        {eyebrow && (
          <p className="mono text-[10px] font-semibold uppercase tracking-[0.14em] text-cobalt">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-0.5 text-sm font-semibold text-text">{title}</h2>
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Status toning — teal current/issued · ochre pending/due soon ·      */
/*   red revoked/overdue/expired · cobalt info · gray imported/super.  */
/* ------------------------------------------------------------------ */

const toneClasses: Record<string, string> = {
  current: "border-teal/30 bg-tealLight text-teal",
  pending: "border-ochre/30 bg-ochreLight text-ochre",
  critical: "border-critical/30 bg-critical/10 text-critical",
  info: "border-cobalt/30 bg-cobaltLight text-cobalt",
  neutral: "border-border bg-bg text-muted",
};

const toneDot: Record<string, string> = {
  current: "bg-teal",
  pending: "bg-ochre",
  critical: "bg-critical",
  info: "bg-cobalt",
  neutral: "bg-muted",
};

export function Badge({
  tone = "neutral",
  children,
  dot = true,
  className,
}: {
  tone?: string;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4",
        toneClasses[tone] ?? toneClasses.neutral,
        className
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", toneDot[tone] ?? toneDot.neutral)} />}
      {children}
    </span>
  );
}

/** Map a CertificateStatus (or instrument state) to a badge tone. */
export function statusTone(status: string): string {
  switch (status) {
    case "current":
    case "issued":
    case "in calibration":
      return "current";
    case "pending":
    case "due-soon":
    case "due-soon/pending":
      return "pending";
    case "revoked":
    case "overdue":
    case "expired":
      return "critical";
    case "imported":
    case "superseded":
      return "neutral";
    default:
      return "info";
  }
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

const buttonVariants = {
  primary: "bg-cobalt text-white border-cobalt hover:bg-[#224d8d]",
  secondary: "bg-surface text-text border-border hover:border-cobalt hover:text-cobalt",
  ghost: "bg-transparent text-cobalt border-transparent hover:bg-cobaltLight",
  danger: "bg-surface text-critical border-critical/40 hover:bg-critical/10",
} as const;

const buttonSizes = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3.5 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
} as const;

export function Button({
  variant = "primary",
  size = "md",
  className,
  href,
  children,
  ...rest
}: {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  className?: string;
  href?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded border font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt/40 disabled:opacity-50",
    buttonVariants[variant],
    buttonSizes[size],
    className
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Table primitives                                                    */
/* ------------------------------------------------------------------ */

export function TableWrap({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("table-scroll", className)}>{children}</div>;
}

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <table className={cn("w-full min-w-[560px] border-collapse text-sm", className)}>
      {children}
    </table>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-border bg-bg/60 text-left text-[11px] uppercase tracking-wide text-muted">
        {children}
      </tr>
    </thead>
  );
}

export function TH({
  children,
  className,
  numeric,
}: {
  children?: React.ReactNode;
  className?: string;
  numeric?: boolean;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "whitespace-nowrap px-4 py-2.5 font-semibold",
        numeric && "text-right",
        className
      )}
    >
      {children}
    </th>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function TR({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={cn("border-b border-border last:border-0 hover:bg-bg/70", className)}>{children}</tr>;
}

export function TD({
  children,
  className,
  numeric,
  mono,
}: {
  children?: React.ReactNode;
  className?: string;
  numeric?: boolean;
  mono?: boolean;
}) {
  return (
    <td
      className={cn(
        "px-4 py-2.5 align-middle",
        numeric && "numeric font-mono text-[13px]",
        mono && "mono text-[13px]",
        className
      )}
    >
      {children}
    </td>
  );
}

export function EmptyState({ title, note }: { title: string; note?: string }) {
  return (
    <div className="px-4 py-10 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-tealLight">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="8" cy="8" r="5.5" stroke="#168A91" strokeWidth="1.4" />
        </svg>
      </div>
      <p className="text-sm font-medium text-text">{title}</p>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </div>
  );
}

/** Static skeleton used while a table is (conceptually) loading. */
export function LoadingRows({ cols = 5 }: { cols?: number }) {
  return (
    <tbody>
      {Array.from({ length: 3 }).map((_, r) => (
        <tr key={r} className="border-b border-border last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3">
              <div className="h-3.5 w-full max-w-[140px] animate-pulse rounded bg-bg" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

/* ------------------------------------------------------------------ */
/* Form primitives                                                     */
/* ------------------------------------------------------------------ */

export function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="field-label">
      {children}
      {hint && <span className="ml-2 normal-case tracking-normal text-muted/80">{hint}</span>}
    </label>
  );
}

export function Field({
  label,
  hint,
  htmlFor,
  children,
  required,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <FieldLabel htmlFor={htmlFor} hint={hint}>
        {label}
        {required && <span className="text-critical"> *</span>}
      </FieldLabel>
      {children}
    </div>
  );
}

export function KeyValueList({
  items,
  columns = 2,
  className,
  pad = true,
}: {
  items: { label: string; value: React.ReactNode }[];
  columns?: 1 | 2 | 3;
  className?: string;
  pad?: boolean;
}) {
  return (
    <dl
      className={cn(
        "grid gap-x-8 gap-y-3",
        pad && "px-4 py-4 sm:px-5",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-3",
        className
      )}
    >
      {items.map((it, i) => (
        <div key={i} className="min-w-0">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">{it.label}</dt>
          <dd className="mt-0.5 break-words text-sm text-text">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
