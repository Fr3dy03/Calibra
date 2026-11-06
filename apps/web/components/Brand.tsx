import Link from "next/link";
import { cn } from "./ui";

/** Precision / crosshair instrument glyph — cobalt crosshair, teal metrology mark. */
export function BrandGlyph({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      {/* crosshair ring */}
      <circle cx="14" cy="14" r="9.25" stroke="#285DAD" strokeWidth="1.6" />
      {/* precision ticks */}
      <line x1="14" y1="2.75" x2="14" y2="6.25" stroke="#285DAD" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="14" y1="21.75" x2="14" y2="25.25" stroke="#285DAD" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="2.75" y1="14" x2="6.25" y2="14" stroke="#285DAD" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="21.75" y1="14" x2="25.25" y2="14" stroke="#285DAD" strokeWidth="1.6" strokeLinecap="round" />
      {/* centre reading mark (teal measurement point) */}
      <circle cx="14" cy="14" r="2.4" fill="#168A91" />
      <line x1="14" y1="7.5" x2="14" y2="11.2" stroke="#168A91" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="14" y1="16.8" x2="14" y2="20.5" stroke="#168A91" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function Brand({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt/40 rounded", className)}
    >
      <BrandGlyph />
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-semibold tracking-tight text-cobalt">
          Calibra<span className="text-teal">Graph</span>
        </span>
        <span className="mono mt-0.5 text-[9px] uppercase tracking-[0.18em] text-muted">
          Instrument traceability
        </span>
      </span>
    </Link>
  );
}
