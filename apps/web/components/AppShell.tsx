"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Brand from "./Brand";
import { cn } from "./ui";

type NavItem = { href: string; label: string; hint?: string };

const sections: { title: string; items: NavItem[] }[] = [
  {
    title: "Monitor",
    items: [
      { href: "/app", label: "Dashboard", hint: "Overview" },
      { href: "/app/calibrations/due", label: "Due Soon", hint: "Queue" },
    ],
  },
  {
    title: "Records",
    items: [
      { href: "/app/instruments", label: "Instruments" },
      { href: "/app/calibrations", label: "Calibration Records" },
      { href: "/app/certificates", label: "Certificates" },
    ],
  },
  {
    title: "Traceability",
    items: [
      { href: "/app/laboratories", label: "Laboratories" },
      { href: "/app/traceability", label: "Reference Standards" },
      { href: "/app/traceability", label: "Traceability", hint: "Graph" },
      { href: "/app/verification", label: "Verification" },
    ],
  },
  {
    title: "Data",
    items: [
      { href: "/app/reports", label: "Reports" },
      { href: "/app/settings", label: "Settings" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(href + "/");
}

function useActive() {
  return usePathname();
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useActive();
  return (
    <nav aria-label="Application" className="space-y-7 pb-10">
      {sections.map((sec) => (
        <div key={sec.title}>
          <p className="mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted/70">
            {sec.title}
          </p>
          <ul className="mt-2 space-y-0.5">
            {sec.items.map((item, i) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href + item.label + i}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded px-2.5 py-1.5 text-[13.5px] font-medium transition-colors",
                      active
                        ? "bg-cobaltLight text-cobalt"
                        : "text-muted hover:bg-bg hover:text-text"
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span>{item.label}</span>
                      {item.hint && (
                        <span className="mono text-[9px] uppercase tracking-wider text-muted/70">
                          {item.hint}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function MobileTabNav() {
  const pathname = useActive();
  const flat = sections.flatMap((s) => s.items.map((i) => ({ ...i, group: s.title })));
  return (
    <nav aria-label="Application (mobile)" className="mobile-nav border-t border-border bg-surface">
      <div className="flex gap-1 overflow-x-auto px-3 py-2">
        {flat.map((item, i) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href + item.label + i}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "whitespace-nowrap rounded px-2.5 py-1.5 text-[12.5px] font-medium",
                active ? "bg-cobaltLight text-cobalt" : "text-muted"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Brand href="/app" />
            <span className="mono hidden rounded border border-border bg-bg px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] text-muted sm:block">
              Workspace · Demo dataset
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/app/verification"
              className="mono hidden text-[12px] font-medium text-cobalt hover:underline sm:block"
            >
              Verify
            </Link>
            <div className="flex items-center gap-2 rounded border border-border bg-bg px-2.5 py-1.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cobalt text-[10px] font-semibold text-white">
                QL
              </span>
              <span className="hidden text-[12px] font-medium text-text sm:block">
                Quidline Labs GmbH
              </span>
            </div>
            <Link href="/" className="text-[12px] font-medium text-muted hover:text-cobalt">
              Public site
            </Link>
          </div>
        </div>
      </header>

      <div className="container-page flex gap-8 py-6">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block" aria-label="Sections">
          <div className="sticky top-24">
            <SidebarNav />
          </div>
        </aside>

        {/* Mobile section nav (fixed bottom bar) */}
        <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
          <MobileTabNav />
        </div>

        <main className="min-w-0 flex-1 pb-24 lg:pb-0">{children}</main>
      </div>
    </div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mono text-[10px] font-semibold uppercase tracking-[0.16em] text-cobalt">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-text sm:text-2xl">
          {title}
        </h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
