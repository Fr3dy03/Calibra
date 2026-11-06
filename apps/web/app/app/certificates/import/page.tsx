"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PageHeading } from "@/components/AppShell";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Field,
  TD,
  TH,
  THead,
  TR,
  TBody,
  Table,
  TableWrap,
} from "@/components/ui";

/* ------------------------------------------------------------------ */
/* Ingestion wizard — 4 steps, entirely client-side state.             */
/*   1 Upload XML → 2 Schema detection & validation report →           */
/*   3 Extracted field review → 4 Issue summary                        */
/* ------------------------------------------------------------------ */

type Finding = { severity: "error" | "warning" | "info"; path: string; message: string };

const sampleFindings: Finding[] = [
  {
    severity: "error",
    path: "/dcc:digitalsignature",
    message: "Cryptographic signature block missing — the document cannot be linked to a signer registry entry until a signer is recorded at issue time.",
  },
  {
    severity: "warning",
    path: "/dcc:coreData/dcc:customer",
    message: "Customer field empty; owner will be taken from the instrument registry on issue.",
  },
  {
    severity: "warning",
    path: "/dcc:measurementResults[2]/dcc:usedMethods",
    message: "Method reference uses the legacy compact form (RML-V-DC-2201 without version prefix) — accepted, flagging for review.",
  },
  {
    severity: "info",
    path: "/dcc:administrativeData/dcc:items",
    message: "Instrument identification matches registry entry INS-0101 (S/N 2451A7821).",
  },
];

export default function ImportCertificatesPage() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<{ name: string; size: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [approved, setApproved] = useState(false);
  const [issued, setIssued] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const schemaVersion = "dcc:v3.3.0";
  const errorCount = useMemo(
    () => sampleFindings.filter((f) => f.severity === "error").length,
    []
  );

  const acceptFile = (f: File | null) => {
    if (!f) return;
    setFile({ name: f.name, size: `${(f.size / 1024).toFixed(1)} kB` });
    setStep(1);
  };

  const severityBadge = (s: Finding["severity"]) =>
    s === "error" ? "critical" : s === "warning" ? "pending" : "info";

  return (
    <>
      <PageHeading
        eyebrow="Ingestion"
        title="Import Digital Calibration Certificate"
        description="Four steps: upload the XML, check the schema report, review the extracted fields, issue. All edits are client-side; issuance requires explicit issuer authorisation."
      />

      {/* Stepper */}
      <div className="mb-6 grid gap-px overflow-hidden rounded border border-border bg-border sm:grid-cols-4">
        {[
          ["1", "Upload XML"],
          ["2", "Schema & validation"],
          ["3", "Field review"],
          ["4", "Issue summary"],
        ].map(([n, label], i) => (
          <button
            key={n}
            type="button"
            onClick={() => (i === 0 || file ? setStep(i + 1) : null)}
            className={
              "flex items-center gap-2.5 bg-surface px-4 py-3 text-left transition-colors " +
              (step === i + 1 ? "opacity-100" : "opacity-70 hover:opacity-100") +
              (i === 0 || file ? "" : " cursor-not-allowed")
            }
          >
            <span
              className={
                "mono flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold " +
                (step > i + 1
                  ? "border-teal bg-tealLight text-teal"
                  : step === i + 1
                  ? "border-cobalt bg-cobalt text-white"
                  : "border-border text-muted")
              }
            >
              {step > i + 1 ? "✓" : n}
            </span>
            <span className="text-[12.5px] font-medium text-text">{label}</span>
          </button>
        ))}
      </div>

      {/* Step 1 — upload */}
      {step === 1 && (
        <Card>
          <CardHeader eyebrow="Step 1" title="Upload the document" />
          <div className="p-5">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                acceptFile(e.dataTransfer.files?.[0] ?? null);
              }}
              onClick={() => inputRef.current?.click()}
              className={
                "flex cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed px-6 py-14 text-center transition-colors " +
                (dragOver ? "border-cobalt bg-cobaltLight/60" : "border-border bg-bg hover:border-cobalt/50")
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
              }}
              aria-label="Upload XML file"
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden className="mb-3">
                <path d="M14 20V6m0 0-5.5 5.5M14 6l5.5 5.5" stroke="#285DAD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 22.5h20" stroke="#168A91" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <p className="text-sm font-medium text-text">Drag & drop the .xml document here</p>
              <p className="mt-1 text-[12.5px] text-muted">
                or click to browse — DCC documents from your existing certificate tooling
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".xml,text/xml,application/xml"
                className="hidden"
                onChange={(e) => acceptFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {file && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded border border-teal/30 bg-tealLight px-4 py-3">
                <div className="flex items-center gap-3">
                  <span aria-hidden className="text-lg">📄</span>
                  <div>
                    <p className="mono text-[13px] font-medium text-text">{file.name}</p>
                    <p className="text-[11.5px] text-teal/90">{file.size} · ready for schema detection</p>
                  </div>
                </div>
                <Button onClick={() => setStep(2)} size="sm">
                  Continue to validation →
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Step 2 — schema detection + validation report */}
      {step === 2 && (
        <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr] xl:items-start">
          <Card>
            <CardHeader eyebrow="Step 2" title="Schema detection" />
            <div className="space-y-4 p-5">
              <div className="rounded border border-border bg-bg px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Detected schema version
                </p>
                <p className="mono mt-1 text-[15px] font-semibold text-cobalt">{schemaVersion}</p>
                <p className="mt-1 text-[12px] text-muted">
                  Namespace <span className="mono">dcc</span> — PTB Digital Calibration
                  Certificate, validated against the XSD definition of this release.
                </p>
              </div>
              <div className="flex items-center justify-between rounded border border-critical/30 bg-critical/10 px-4 py-3">
                <p className="text-[13px] font-medium text-critical">
                  XSD validation: {errorCount} error{errorCount === 1 ? "" : "s"} found
                </p>
                <Badge tone="critical">Proceed after resolution</Badge>
              </div>
              <p className="text-[12.5px] leading-relaxed text-muted">
                Errors must be resolved or consciously carried into the issuance
                review — an unresolved schema error is shown again in the issue
                summary. Warnings and infos do not block, they inform.
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  ← Back
                </Button>
                <Button onClick={() => setStep(3)}>Review extracted fields →</Button>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader eyebrow="Validation report" title="Findings by severity" />
            <TableWrap>
              <Table className="min-w-[520px]">
                <THead>
                  <TH>Severity</TH>
                  <TH>Path</TH>
                  <TH>Message</TH>
                </THead>
                <TBody>
                  {sampleFindings.map((f, i) => (
                    <TR key={i}>
                      <TD>
                        <Badge tone={severityBadge(f.severity)}>{f.severity}</Badge>
                      </TD>
                      <TD mono className="text-[12px]">{f.path}</TD>
                      <TD className="text-[12.5px] text-muted">{f.message}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </TableWrap>
          </Card>
        </div>
      )}

      {/* Step 3 — extracted fields review */}
      {step === 3 && (
        <Card className="overflow-hidden">
          <CardHeader
            eyebrow="Step 3"
            title="Extracted fields review"
            action={<Badge tone="neutral">Imported · not yet issued</Badge>}
          />
          <div className="grid gap-6 p-5 lg:grid-cols-2">
            <div className="space-y-4">
              <Field label="Certificate number" htmlFor="i-number">
                <input id="i-number" className="field-input mono" defaultValue="DCC-RML-2026-0417" />
              </Field>
              <Field label="Laboratory" htmlFor="i-lab">
                <input id="i-lab" className="field-input" defaultValue="Rhein Metrology Laboratory" />
              </Field>
              <Field label="Issuer (authorised signer)" htmlFor="i-issuer">
                <input id="i-issuer" className="field-input" defaultValue="Dr. Anja Hofmann" />
              </Field>
              <Field label="Respons. person" htmlFor="i-resp">
                <input id="i-resp" className="field-input" defaultValue="Stefan Klein (RML-S-0288, Technical Signatory)" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Calibration date" htmlFor="i-cal">
                  <input id="i-cal" type="date" className="field-input mono" defaultValue="2026-03-12" />
                </Field>
                <Field label="Valid until" htmlFor="i-due">
                  <input id="i-due" type="date" className="field-input mono" defaultValue="2027-03-11" />
                </Field>
              </div>
              <Field label="Customer / owner" htmlFor="i-customer" hint="Empty in document — registry owner applies">
                <input id="i-customer" className="field-input" defaultValue="J. Weber — Production QC" />
              </Field>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="field-label mb-0">Measurement results</p>
                <Badge tone="neutral">Read-only</Badge>
              </div>
              <div className="overflow-hidden rounded border border-border">
                <TableWrap>
                  <Table className="min-w-[420px]">
                    <THead>
                      <TH>Point</TH>
                      <TH numeric>Reference</TH>
                      <TH numeric>Indicated</TH>
                      <TH numeric>Error</TH>
                      <TH numeric>U (k = 2)</TH>
                    </THead>
                    <TBody>
                      {[
                        ["100 mV", "100.00000", "100.00021", "+0.21", "1.15"],
                        ["1 V", "1.000000", "1.000013", "+13.0", "1.60"],
                        ["10 V", "10.000000", "10.000047", "+47.0", "4.10"],
                        ["100 V", "100.0000", "99.999620", "-380", "29.0"],
                        ["1 kV", "1000.000", "1000.0008", "+800", "260"],
                      ].map((r) => (
                        <TR key={r[0]}>
                          <TD mono>{r[0]}</TD>
                          <TD numeric>{r[1]}</TD>
                          <TD numeric>{r[2]}</TD>
                          <TD numeric>{r[3]}</TD>
                          <TD numeric>{r[4]}</TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                </TableWrap>
              </div>
              <div className="mt-3 rounded border border-teal/25 bg-tealLight px-4 py-3">
                <p className="text-[12.5px] leading-relaxed text-teal/90">
                  <strong className="font-semibold">Values are immutable after issuance.</strong>{" "}
                  Measured values, errors, uncertainties and units are read-only from
                  here on. If a value must change after issuance, a revising
                  certificate supersedes this one — nothing is overwritten.
                </p>
              </div>
              <div className="mt-5 flex gap-2">
                <Button variant="secondary" onClick={() => setStep(2)}>
                  ← Back
                </Button>
                <Button onClick={() => setStep(4)}>Continue →</Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Step 4 — issue summary */}
      {step === 4 && (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr] xl:items-start">
          <Card className="overflow-hidden">
            <CardHeader eyebrow="Step 4" title="Issue summary" />
            <div className="p-5">
              <dl className="space-y-2.5 text-[13px]">
                {[
                  ["Certificate", "DCC-RML-2026-0417 · rev 1"],
                  ["Schema", "dcc:v3.3.0 · validated with 1 carried finding"],
                  ["Instrument", "Fluke 8846A — S/N 2451A7821 (registry INS-0101)"],
                  ["Range", "±1000 V (DC/AC voltage)"],
                  ["Points", "5 measured points, uncertainty U = 11.5 µV/V (k = 2)"],
                  ["Laboratory", "Rhein Metrology Laboratory · RML-2001"],
                  ["Signer", "Stefan Klein · RML-S-0288 · ECDSA P-256"],
                  ["Anchor", "Digest anchoring queued to BOT Chain Testnet · chain 968"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-border/70 pb-2.5 last:border-0">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">{k}</dt>
                    <dd className="mono max-w-md text-right text-[12.5px] text-text">{v}</dd>
                  </div>
                ))}
              </dl>

              <label className="mt-6 flex items-start gap-2.5 rounded border border-ochre/40 bg-ochreLight px-4 py-3.5 text-[13px] leading-relaxed">
                <input
                  type="checkbox"
                  className="mt-1 h-3.5 w-3.5 accent-cobalt"
                  checked={approved}
                  onChange={(e) => setApproved(e.target.checked)}
                />
                <span className="text-text/90">
                  I am an authorised issuer for this laboratory, and I confirm the
                  extracted fields reproduce the calibration result to be issued.
                </span>
              </label>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setStep(3)}>
                  ← Back
                </Button>
                <Button disabled={!approved || issued} onClick={() => setIssued(true)}>
                  {issued ? "Certificate issued ✓" : "Issue certificate"}
                </Button>
              </div>

              {issued && (
                <div className="mt-4 rounded border border-teal/30 bg-tealLight px-4 py-3 text-[13px]">
                  <p className="font-semibold text-teal">Issued — digest anchored</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-teal/90">
                    The structured payload digest{" "}
                    <span className="mono break-all text-text">
                      4b1d8f30a57e62c94e0f1d8b7a63c5f20d94e8b16a73f52c40e81d69b3f7a25c
                    </span>{" "}
                    was queued for anchoring. Measurement values are now locked.
                  </p>
                  <Link
                    href="/app/certificates/DCC-RML-2026-0417"
                    className="mt-2 inline-block text-[13px] font-medium text-cobalt underline underline-offset-4"
                  >
                    Open the issued certificate →
                  </Link>
                </div>
              )}
            </div>
          </Card>

          <Card className="border-ochre/30 bg-ochreLight/60 p-5">
            <p className="mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ochre">
              Carried findings
            </p>
            <ul className="mt-3 space-y-3 text-[13px] leading-relaxed text-text/80">
              <li>
                <strong className="text-text">Signature block missing (error):</strong> at
                issue time the document is signed against the signer registry — this dispatch
                resolves the finding; the issuance record stores signer and scheme.
              </li>
              <li>
                <strong className="text-text">Customer empty (warning):</strong> the owner
                field of registry entry INS-0101 has been applied as customer/owner.
              </li>
            </ul>
            <p className="mt-4 text-[12.5px] text-text/70">
              The two warnings are informational and remain listed; they will appear
              identically if the document is re-ingested later.
            </p>
          </Card>
        </div>
      )}
    </>
  );
}
