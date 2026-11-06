import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/AppShell";
import {
  Badge,
  Card,
  KeyValueList,
  TD,
  TH,
  THead,
  TR,
  TBody,
  Table,
  TableWrap,
  statusTone,
} from "@/components/ui";
import ConfirmAction from "@/components/ConfirmAction";
import {
  certificateByNumber,
  instrumentById,
  laboratoryById,
} from "@/lib/data";

export default function CertificateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const cert = certificateByNumber(params.id);
  if (!cert) notFound();

  const instrument = instrumentById(cert.instrumentId);
  const lab = laboratoryById(cert.laboratoryId);
  const st = statusTone(cert.status);

  return (
    <>
      <PageHeading
        eyebrow="Digital Calibration Certificate"
        title={cert.number}
        description={`${instrument?.name ?? "Instrument"} · calibrated ${cert.calibrationDate} by ${lab?.name ?? cert.laboratoryId}`}
        actions={
          <>
            <Link
              href="/app/verification"
              className="rounded border border-border px-3 py-1.5 text-[12px] font-medium text-cobalt transition-colors hover:border-cobalt"
            >
              Open verification
            </Link>
            <ConfirmAction
              icon="⏸"
              actionLabel="Supersede"
              title="Supersede this certificate"
              body="Superseding issues a new revision that explicitly replaces this one. This record stays visible and is marked superseded — values are never overwritten. Use only if an administrative correction is genuinely required."
              confirmLabel="Prepare new revision"
            />
            <ConfirmAction
              icon="⚠"
              actionLabel="Revoke"
              title="Revoke this certificate"
              body="Revocation marks the certificate as formally invalid from now on. The record, its digests and its anchor remain permanently for evidence. This action should follow your laboratory's own invalid-document procedure."
              confirmLabel="Revoke certificate"
            />
          </>
        }
      />

      {/* Paper-like certificate sheet */}
      <Card className="certificate-sheet overflow-hidden">
        {/* Header block */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-cobalt px-5 py-5 sm:px-7">
          <div>
            <p className="mono text-[10px] font-semibold uppercase tracking-[0.18em] text-cobalt">
              {lab?.name} · {lab?.code}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-text">
              Digital Calibration Certificate
            </h2>
            <p className="mono mt-0.5 text-[11px] text-muted">
              DCC · {cert.standards.join(" · ")}
            </p>
          </div>
          <div className="text-right">
            <p className="mono text-lg font-semibold text-cobalt">{cert.number}</p>
            <p className="mono mt-0.5 text-[11px] text-muted">Revision {cert.revision}</p>
            <div className="mt-2">
              <Badge tone={st}>{cert.status}</Badge>
            </div>
          </div>
        </div>

        {/* Administrative data */}
        <div className="border-b border-border/70 px-5 py-5 sm:px-7">
          <p className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted">
            Administrative data
          </p>
          <KeyValueList
            className="px-0 py-0"
            pad={false}
            items={[
              { label: "Issuing laboratory", value: `${lab?.name} · ${lab?.code}` },
              {
                label: "Accreditation",
                value: <span className="mono">{lab?.accreditation.endorsement}</span>,
              },
              { label: "Issuer", value: cert.issuer },
              { label: "Respons. person", value: cert.responsiblePerson },
              { label: "Calibration date", value: <span className="mono">{cert.calibrationDate}</span> },
              { label: "Issue date", value: <span className="mono">{cert.issueDate}</span> },
              { label: "Valid until", value: <span className="mono">{cert.dueDate}</span> },
              {
                label: "Customer / owner",
                value: instrument ? `${instrument.owner} · ${instrument.assetRef}` : "—",
              },
            ]}
          />
        </div>

        {/* Instrument block */}
        <div className="border-b border-border/70 px-5 py-5 sm:px-7">
          <p className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted">
            Instrument
          </p>
          <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            <div>
              <p className="text-[14px] font-medium text-text">
                {instrument?.name ?? cert.instrumentId}
              </p>
              <p className="mono mt-0.5 text-[12.5px] text-muted">
                S/N {instrument?.serial} ·{" "}
                <Link href={`/app/instruments/${cert.instrumentId}`} className="text-cobalt hover:underline">
                  {cert.instrumentId}
                </Link>
              </p>
            </div>
            <div>
              <p className="mono text-[12.5px] text-text">{instrument?.func}</p>
              <p className="mono mt-0.5 text-[12.5px] text-muted">
                Range {instrument?.rangeMin} … {instrument?.rangeMax} {instrument?.unit} ·{" "}
                Resolution {instrument?.resolution}
              </p>
            </div>
          </div>
        </div>

        {/* Measurement results */}
        <div className="border-b border-border/70 px-5 py-5 sm:px-7">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted">
              Measurement results
            </p>
            <p className="mono text-[11px] text-muted">{cert.measurand}</p>
          </div>
          <TableWrap>
            <Table className="min-w-[680px]">
              <THead>
                <TH>Measured point</TH>
                <TH numeric>Reference value</TH>
                <TH numeric>Indicated value</TH>
                <TH numeric>Error</TH>
                <TH numeric>U (k = 2)</TH>
                <TH>Unit</TH>
              </THead>
              <TBody>
                {cert.measurements.map((m, i) => (
                  <TR key={i}>
                    <TD mono>{m.point}</TD>
                    <TD numeric>{m.reference}</TD>
                    <TD numeric>{m.indicated}</TD>
                    <TD numeric>{m.error}</TD>
                    <TD numeric>{m.uncertainty}</TD>
                    <TD mono className="whitespace-nowrap text-muted">{m.unit}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableWrap>

          {/* Expanded uncertainty statement */}
          <div className="mt-4 rounded border border-border bg-bg px-4 py-3">
            <p className="text-[13.5px] leading-relaxed text-text">
              The expanded uncertainty of measurement is stated as{" "}
              <span className="mono font-semibold">U = {cert.uncertaintyStatement.expanded}</span>{" "}
              (coverage factor <span className="mono">{cert.uncertaintyStatement.coverageFactor}</span>,
              coverage {cert.uncertaintyStatement.coverage}), estimated using the{" "}
              {cert.uncertaintyStatement.distribution}. The uncertainty evaluation follows
              procedure {cert.procedure.split("—")[0].trim()}.
            </p>
          </div>
        </div>

        {/* Reference standard + conditions */}
        <div className="grid gap-x-10 border-b border-border/70 px-5 py-5 sm:grid-cols-2 sm:px-7">
          <div>
            <p className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted">
              Reference standard
            </p>
            <p className="mono text-[13px] font-semibold text-text">RML Ref RM-0151</p>
            <p className="text-[13px] text-muted">10 V DC voltage standard · Fluke, S/N 7125-1184</p>
            <p className="mono mt-2 text-[12px] leading-relaxed text-muted">
              Traceable to PTB, Braunschweig — national standard: Josephson array
              voltage standard (DC voltage) · ref. cert.{" "}
              <span className="text-text">DCC-PTB-2025-1104</span>
            </p>
          </div>
          <div>
            <p className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted">
              Conditions
            </p>
            <dl className="space-y-2 text-[13px]">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Ambient temperature</dt>
                <dd className="mono text-text">{cert.conditions.temperature}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Relative humidity</dt>
                <dd className="mono text-text">{cert.conditions.humidity}</dd>
              </div>
              {cert.conditions.pressure && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Air pressure</dt>
                  <dd className="mono text-text">{cert.conditions.pressure}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Comments */}
        {cert.comments.length > 0 && (
          <div className="border-b border-border/70 px-5 py-5 sm:px-7">
            <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted">
              Comments
            </p>
            <ul className="space-y-2 text-[13px] leading-relaxed text-muted">
              {cert.comments.map((c, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-cobalt" aria-hidden>—</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Digests */}
        <div className="border-b border-border/70 bg-bg/60 px-5 py-5 sm:px-7">
          <p className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted">
            Digests · {cert.digest.algorithm}
          </p>
          <div className="space-y-3 text-[12.5px]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted/80">
                Certificate payload digest
              </p>
              <p className="mono mt-0.5 break-all text-text">{cert.digest.certificate}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted/80">
                Document rendering digest
              </p>
              <p className="mono mt-0.5 break-all text-text">{cert.digest.document}</p>
            </div>
            {cert.onchain && (
              <div className="rounded border border-teal/25 bg-tealLight px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold text-teal">
                    ✓ Record matches digest
                  </p>
                  <p className="mono text-[11px] text-teal/90">
                    Anchored {cert.onchain.anchoredAt}
                  </p>
                </div>
                <dl className="mt-2 space-y-1.5 text-[12.5px]">
                  <div className="flex flex-wrap justify-between gap-x-6">
                    <dt className="text-teal/80">Network</dt>
                    <dd className="mono text-text">
                      {cert.onchain.network} · chain {cert.onchain.chainId}
                    </dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-x-6">
                    <dt className="text-teal/80">Block</dt>
                    <dd className="mono text-text">{cert.onchain.block}</dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-x-6">
                    <dt className="text-teal/80">Transaction</dt>
                    <dd className="mono break-all text-text">{cert.onchain.tx}</dd>
                  </div>
                </dl>
                <p className="mt-1.5 text-[12px] text-teal/80">
                  Verify independently in the{" "}
                  <a href="https://scan.botchain.ai/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                    BOT Chain Explorer
                  </a>
                  . Built on BOT Chain.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Supersession history */}
        <div className="px-5 py-5 sm:px-7">
          <p className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted">
            Supersession history
          </p>
          {cert.number === "DCC-RML-2026-0417" ? (
            <ul className="space-y-2.5 text-[13px]">
              <li className="flex flex-wrap items-center gap-2">
                <Badge tone="neutral">superseded</Badge>
                <Link href="/app/certificates/DCC-RML-2025-0583" className="mono text-cobalt hover:underline">
                  DCC-RML-2025-0583
                </Link>
                <span className="text-muted">
                  rev 1 · superseded by this revision on 2026-03-16 — retained permanently.
                </span>
              </li>
              <li className="flex flex-wrap items-center gap-2">
                <Badge tone="current">current</Badge>
                <span className="mono text-text">DCC-RML-2026-0417</span>
                <span className="text-muted">rev 1 · this record · valid to 2027-03-11</span>
              </li>
            </ul>
          ) : cert.supersededBy ? (
            <ul className="space-y-2.5 text-[13px]">
              <li className="flex flex-wrap items-center gap-2">
                <Badge tone="neutral">superseded</Badge>
                <span className="mono text-text">{cert.number}</span>
                <span className="text-muted">rev {cert.revision} · this record</span>
              </li>
              <li className="flex flex-wrap items-center gap-2">
                <Badge tone="current">current</Badge>
                <Link href={`/app/certificates/${cert.supersededBy}`} className="mono text-cobalt hover:underline">
                  {cert.supersededBy}
                </Link>
                <span className="text-muted">— this certificate is superseded and retained for history.</span>
              </li>
            </ul>
          ) : (
            <p className="text-[13px] text-muted">
              This certificate has no superseding revision. Its successor, when issued,
              will reference this record explicitly.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-bg/60 px-5 py-4 sm:px-7">
          <p className="mono text-[11px] text-muted">
            Procedure {cert.procedure} · issued under ISO/IEC 17025:2017
          </p>
          <p className="mono text-[11px] text-muted">
            Rendered from the structured record — not a scan
          </p>
        </div>
      </Card>
    </>
  );
}
