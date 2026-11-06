import Link from "next/link";
import Brand from "./Brand";
import { Button } from "./ui";

const nav = [
  { href: "/platform", label: "Platform" },
  { href: "/digital-calibration", label: "Digital Calibration" },
  { href: "/instrument-traceability", label: "Traceability" },
  { href: "/laboratories", label: "Laboratories" },
  { href: "/certificate-verification", label: "Verification" },
  { href: "/standards", label: "Standards" },
  { href: "/faq", label: "FAQ" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-bg/70 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Brand />
        <nav aria-label="Main" className="hidden items-center gap-5 xl:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-[13px] font-medium text-muted transition-colors hover:text-cobalt"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button href="/app/verification" variant="ghost" size="sm" className="hidden sm:inline-flex">
            Verify
          </Button>
          <Button href="/app/instruments/new" size="sm">
            Register an Instrument
          </Button>
        </div>
      </div>
      {/* Condensed nav for small screens */}
      <nav aria-label="Main (compact)" className="border-t border-border/70 lg:hidden">
        <div className="container-page flex gap-4 overflow-x-auto py-2 text-[13px]">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="whitespace-nowrap font-medium text-muted transition-colors hover:text-cobalt"
            >
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
