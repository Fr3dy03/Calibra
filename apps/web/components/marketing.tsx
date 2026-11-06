import { Card } from "./ui";
import { cn } from "./ui";

/* ------------------------------------------------------------------ */
/* Shared marketing building blocks                                    */
/* ------------------------------------------------------------------ */

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "mono text-[11px] font-semibold uppercase tracking-[0.18em] text-cobalt",
        className
      )}
    >
      {children}
    </p>
  );
}

export function MarketingSection({
  id,
  eyebrow,
  title,
  intro,
  children,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  intro?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("border-t border-border py-14 sm:py-16", className)}>
      <div className="container-page">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        {title && (
          <h2 className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight text-text sm:text-[28px] sm:leading-tight">
            {title}
          </h2>
        )}
        {intro && (
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{intro}</p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

export function PageHero({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="border-b border-border bg-bg">
      <div className="container-page py-16 sm:py-20">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-text sm:text-4xl sm:leading-tight">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{lede}</p>
        {children && <div className="mt-7">{children}</div>}
      </div>
    </section>
  );
}

export function Copy({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-none space-y-4 text-[15px] leading-relaxed text-muted [&_a]:text-cobalt [&_a]:underline [&_a]:underline-offset-4 [&_code]:mono [&_code]:text-[13px] [&_code]:text-text [&_strong]:font-semibold [&_strong]:text-text">
      {children}
    </div>
  );
}

export function FeatureGrid({
  items,
  columns = 3,
}: {
  items: { title: string; body: string }[];
  columns?: 2 | 3;
}) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-2 lg:grid-cols-3"
      )}
    >
      {items.map((it) => (
        <Card key={it.title} className="p-5">
          <h3 className="text-sm font-semibold text-text">{it.title}</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{it.body}</p>
        </Card>
      ))}
    </div>
  );
}

export function BulletList({
  items,
}: {
  items: { lead: string; body: string }[];
}) {
  return (
    <ul className="space-y-4">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" aria-hidden />
          <p className="text-[15px] leading-relaxed text-muted">
            <strong className="font-semibold text-text">{it.lead}</strong> {it.body}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function StatRow({ items }: { items: { value: string; label: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded border border-border bg-border lg:grid-cols-4">
      {items.map((s) => (
        <div key={s.label} className="bg-surface px-5 py-4">
          <dd className="mono text-xl font-semibold text-cobalt">{s.value}</dd>
          <dt className="mt-1 text-[12px] font-medium text-muted">{s.label}</dt>
        </div>
      ))}
    </dl>
  );
}
