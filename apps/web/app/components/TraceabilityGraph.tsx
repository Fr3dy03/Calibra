"use client";

import { useState } from "react";
import type { TraceEdge, TraceNode } from "@/lib/data";
import { Badge, cn, statusTone } from "./ui";

/* ------------------------------------------------------------------ */
/* TraceabilityGraph                                                   */
/*                                                                     */
/* Deterministic vertical evidence chain:                              */
/*   INSTRUMENT → CALIBRATION RECORD → REFERENCE STANDARD →             */
/*   REFERENCE LABORATORY → ISSUING LABORATORY                          */
/*                                                                     */
/* The node array is rendered in the given order; the edge array        */
/* must represent the chain (edges[i] links nodes[i] → nodes[i+1]).     */
/* Clicking a node highlights it and its adjacent edges. No randomness, */
/* no layout engine — the same data always renders the same picture.    */
/* ------------------------------------------------------------------ */

const kindMeta: Record<TraceNode["kind"], { label: string; glyph: JSX.Element }> = {
  instrument: {
    label: "Instrument",
    glyph: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <circle cx="7" cy="7" r="4.6" stroke="#285DAD" strokeWidth="1.4" />
        <circle cx="7" cy="7" r="1.4" fill="#168A91" />
        <path d="M7 0.5v2.6M7 10.9v2.6M0.5 7h2.6M10.9 7h2.6" stroke="#285DAD" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  certificate: {
    label: "Calibration record",
    glyph: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <rect x="2" y="1" width="10" height="12" rx="1" stroke="#285DAD" strokeWidth="1.4" />
        <path d="M4.2 4.4h5.6M4.2 7h5.6M4.2 9.6h3.4" stroke="#168A91" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  standard: {
    label: "Reference standard",
    glyph: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M3 2.2h8v2.6l-2.6 2.9V12H5.6V7.7L3 4.8V2.2Z" stroke="#285DAD" strokeWidth="1.3" />
        <circle cx="6.6" cy="9.8" r="1" fill="#168A91" />
      </svg>
    ),
  },
  "reference-lab": {
    label: "Reference laboratory",
    glyph: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M2 12.4V4.8L7 1.6l5 3.2v7.6H2Z" stroke="#285DAD" strokeWidth="1.3" />
        <path d="M5.4 12.4V9h3.2v3.4" stroke="#168A91" strokeWidth="1.2" />
      </svg>
    ),
  },
  "issuing-lab": {
    label: "Issuing laboratory",
    glyph: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M2 12.4V4.8L7 1.6l5 3.2v7.6H2Z" stroke="#285DAD" strokeWidth="1.3" />
        <path d="M5.4 12.4V9h3.2v3.4M8.6 6H5.4" stroke="#168A91" strokeWidth="1.2" />
      </svg>
    ),
  },
};

export default function TraceabilityGraph({
  nodes,
  edges,
  className,
}: {
  nodes: TraceNode[];
  edges: TraceEdge[];
  className?: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  const nodeClass = (i: number) => {
    if (selected === null) return "border-border hover:border-cobalt/40";
    if (selected === i) return "border-cobalt shadow-lift ring-1 ring-cobalt/30";
    if (Math.abs(selected - i) === 1) return "border-cobalt/50";
    return "border-border opacity-45";
  };

  return (
    <div
      className={cn("rounded border border-border bg-bg/40 p-4 sm:p-6", className)}
      role="region"
      aria-label="Traceability graph"
    >
      <div className="mx-auto max-w-2xl">
        {nodes.map((node, i) => {
          const edge = i < edges.length ? edges[i] : null;
          const meta = kindMeta[node.kind];
          return (
            <div key={`${node.id}-${i}`}>
              <button
                type="button"
                onClick={() => setSelected(selected === i ? null : i)}
                aria-pressed={selected === i}
                className={cn(
                  "block w-full rounded border bg-surface px-4 py-3.5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt/40",
                  nodeClass(i)
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded border border-cobaltLight bg-cobaltLight/60">
                      {meta.glyph}
                    </span>
                    <div className="min-w-0">
                      <p className="mono text-[9px] font-semibold uppercase tracking-[0.16em] text-cobalt">
                        {meta.label}
                      </p>
                      <p className="mono mt-0.5 truncate text-sm font-semibold text-text">
                        {node.title}
                      </p>
                      {node.subtitle && (
                        <p className="mt-0.5 text-[12px] text-muted">{node.subtitle}</p>
                      )}
                    </div>
                  </div>
                  {node.status && (
                    <Badge tone={statusTone(node.status.tone)}>
                      {node.status.label}
                    </Badge>
                  )}
                </div>
                {node.meta.length > 0 && (
                  <dl className="mt-3 grid gap-x-6 gap-y-1.5 border-t border-border/70 pt-2.5 sm:grid-cols-2">
                    {node.meta.map((m, j) => (
                      <div key={j} className="flex min-w-0 items-baseline justify-between gap-3">
                        <dt className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted/80">
                          {m.label}
                        </dt>
                        <dd className="mono truncate text-right text-[12px] text-text">
                          {m.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </button>

              {/* Edge connector: vertical line, arrowhead, relationship label */}
              {edge && (
                <div
                  className="flex items-center justify-center gap-3 py-2"
                  aria-label={`Relationship: ${edge.label}`}
                >
                  <span
                    className="mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted/80"
                    aria-hidden
                  >
                    {edge.label}
                  </span>
                  <svg
                    width="14"
                    height="30"
                    viewBox="0 0 14 30"
                    fill="none"
                    aria-hidden
                    className={cn(
                      selected === i || selected === i + 1 ? "[&>line]:stroke-cobalt [&>path]:stroke-cobalt" : "[&>line]:stroke-border [&>path]:stroke-muted/70"
                    )}
                  >
                    <line x1="7" y1="0" x2="7" y2="23" strokeWidth="2" />
                    <path d="M2.5 22.5 7 28.5l4.5-6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="mono text-[10px] text-muted/40" aria-hidden>
                    edge {i + 1}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-[12px] text-muted">
        Click a node to trace its links. The chain is derived from the instrument
        registry, certificate anchors and laboratory accreditation evidence.
      </p>
    </div>
  );
}
