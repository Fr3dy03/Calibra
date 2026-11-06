import Link from "next/link";
import { BrandGlyph } from "./Brand";

const sitemap = [
  { href: "/platform", label: "Platform" },
  { href: "/digital-calibration", label: "Digital Calibration" },
  { href: "/instrument-traceability", label: "Traceability" },
  { href: "/laboratories", label: "Laboratories" },
  { href: "/certificate-verification", label: "Verification" },
  { href: "/standards", label: "Standards" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="mt-20 bg-[#263643] text-white">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand + BOT Chain attribution */}
          <div>
            <div className="flex items-center gap-2.5">
              <BrandGlyph size={24} />
              <span className="text-sm font-semibold tracking-tight text-white">
                CalibraGraph
              </span>
            </div>
            <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-white/70">
              Calibration certificates and instrument traceability as structured,
              independently verifiable records. Built for laboratories, quality
              teams and metrology professionals.
            </p>

            <div className="mt-7">
              <p className="mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
                Infrastructure partner
              </p>
              <a
                href="https://www.botchain.ai/en/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                title="BOT Chain — botchain.ai"
              >
                {/* BOT Chain white wordmark, 1031x205 source art, rendered at 28px height */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brands/bot-chain.svg"
                  alt="BOT Chain"
                  width={141}
                  height={28}
                  style={{ height: 28, width: "auto" }}
                  className="opacity-90 transition-opacity hover:opacity-100"
                />
              </a>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px]">
                <a
                  href="https://scan.botchain.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-white/70"
                >
                  BOT Chain Explorer
                </a>
                <span className="text-white/60">Built on BOT Chain</span>
              </div>
            </div>
          </div>

          {/* Platform links */}
          <nav aria-label="Platform">
            <p className="mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
              Platform
            </p>
            <ul className="mt-4 space-y-2.5 text-[13px]">
              {sitemap.slice(0, 5).map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/75 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/app/instruments/new" className="text-white/75 transition-colors hover:text-white">
                  Register an Instrument
                </Link>
              </li>
            </ul>
          </nav>

          {/* Legal + verification */}
          <nav aria-label="Resources">
            <p className="mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
              Resources
            </p>
            <ul className="mt-4 space-y-2.5 text-[13px]">
              {sitemap.slice(5).map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/75 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/app/verification" className="text-white/75 transition-colors hover:text-white">
                  Verify a Certificate
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/75 transition-colors hover:text-white">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/75 transition-colors hover:text-white">
                  Terms
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-6 text-[12px] text-white/55">
          <p>© 2026 CalibraGraph. Calibration history of record.</p>
          <p className="mono">
            <span aria-hidden>◆</span> Anchored on BOT Chain Testnet · chain 968
          </p>
        </div>
      </div>
    </footer>
  );
}
