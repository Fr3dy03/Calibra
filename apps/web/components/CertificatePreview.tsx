import Link from "next/link";
import { Badge, Card, cn, statusTone } from "./ui";
import { certificates, instrumentById, laboratoryById } from "@/lib/data";

/**
 * Paper-certificate-shaped preview of a Digital Calibration Certificate.
 * Static by design — renders the structured record, no interactivity.
 */
export default function CertificatePreview({
  certNumber = "DCC-RML-2026-0417",
  showVerifiedBadge = false,
  compact = false,
  className,
}: {
  certNumber?: string;
  showVerifiedBadge?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const cert = certificates.find((c) => c.number === certNumber);
  if (!cert) return null;

  const instrument = instrumentById(cert.instrumentId);
  const lab = laboratoryById(cert.laboratoryId);
  const verified = Boolean(showVerifiedBadge);

  return (
    <Card className={cn("certificate-sheet overflow-hidden", className)}>
      {/* Letterhead */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-cobalt px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-text">{lab?.name}</p>
          <p className="mono mt-0.5 text-[10.5px] uppercase tracking-[0.14em] text-muted">
            Digital Calibration Certificate · DCC
          </p>
        </div>
        <div className="text-right">
          <p className="mono text-sm font-semibold text-cobalt">{cert.number}</p>
          <p className="mono mt-0.5 text-[10.5px] text-muted">Revision {cert.revision}</p>
        </div>
      </div>

      {/* Administrative + instrument block */}
      <div className="grid gap-y-4 px-5 py-4 sm:grid-cols-2">
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted">
            Instrument
          </p>
          <p className="mt-1 text-[13.5px] font-medium leading-snug text-text">
            {instrument?.name}
          </p>
          <p className="mono mt-0.5 text-[12px] text-muted">
            S/N {instrument?.serial}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted">
            Measurement function / range
          </p>
          <p className="mono mt-1 text-[12.5px] text-text">
            {instrument?.func}
          </p>
          <p className="mono mt-0.5 text-[12.5px] text-text">
            {instrument?.rangeMin} … {instrument?.rangeMax} {instrument?.unit}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 border-t border-border/70 pt-3 sm:col-span-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
              Calibration date
            </p>
            <p className="mono mt-0.5 text-[12.5px] text-text">{cert.calibrationDate}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
              Valid until
            </p>
            <p className="mono mt-0.5 text-[12.5px] text-text">{cert.dueDate}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
              Reference standard
            </p>
            <p className="mono mt-0.5 text-[12.5px] leading-snug text-text">
              RML Ref RM-0151 · 10 V DC voltage standard · traceable to PTB, Josephson array
            </p>
          </div>
        </div>
      </div>

      {/* Measurement results */}
      {!compact && (
        <div className="border-t border-border/70 px-5 py-4">
          <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-wide text-muted">
            Measurement results (extract)
          </p>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase tracking-wide text-muted">
                <th className="py-1.5 pr-2 font-semibold">Point</th>
                <th className="numeric py-1.5 pr-2 font-semibold">Reference</th>
                <th className="numeric py-1.5 pr-2 font-semibold">Indicated</th>
                <th className="numeric py-1.5 pr-2 font-semibold">Error</th>
                <th className="numeric py-1.5 font-semibold">U (k = 2)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {cert.measurements.slice(0, 3).map((m) => (
                <tr key={m.point} className="text-[12.5px]">
                  <td className="py-1.5 pr-2 mono text-muted">{m.point}</td>
                  <td className="numeric py-1.5 pr-2 mono text-text">{m.reference}</td>
                  <td className="numeric py-1.5 pr-2 mono text-text">{m.indicated}</td>
                  <td className="numeric py-1.5 pr-2 mono text-text">
                    {m.error} µV
                  </td>
                  <td className="numeric py-1.5 mono text-text">{m.uncertainty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Uncertainty statement */}
      <div className="border-t border-border bg-bg/50 px-5 py-3">
        <p className="text-[12px] leading-relaxed text-muted">
          Expanded uncertainty{" "}
          <span className="mono text-text">U = {cert.uncertaintyStatement.expanded}</span>{" "}
          (<span className="mono">{cert.uncertaintyStatement.coverageFactor}</span>, coverage{" "}
          {cert.uncertaintyStatement.coverage}). Normal {cert.uncertaintyStatement.distribution.split("(bilinear")[0].trim()}.
        </p>
      </div>

      {/* Footer: digest + status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3.5">
        <div className="min-w-0">
          <p className="mono text-[9.5px] uppercase tracking-[0.14em] text-muted">
            Digest · {cert.digest.algorithm}
          </p>
          <p className="mono mt-0.5 truncate text-[11.5px] text-text">
            {cert.digest.certificate.slice(0, 24)}…{cert.digest.certificate.slice(-12)}
          </p>
        </div>
        {verified ? (
          <Badge tone="current">Verified · On-chain record intact</Badge>
        ) : cert.onchain ? (
          <Badge tone="current">
            Anchored · block {cert.onchain.block}
          </Badge>
        ) : (
          <Badge tone={statusTone(cert.status)}>
            {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
          </Badge>
        )}
      </div>
    </Card>
  );
}
