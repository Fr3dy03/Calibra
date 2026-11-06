"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { PageHeading } from "@/components/AppShell";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Field,
  KeyValueList,
  statusTone,
} from "@/components/ui";
import { certificateByNumber, instrumentById, laboratoryById } from "@/lib/data";

export default function VerificationPage() {
  const [input, setInput] = useState("DCC-RML-2026-0417");
  const [queried, setQueried] = useState("DCC-RML-2026-0417");
  const [checked, setChecked] = useState(true);

  const cert = certificateByNumber(queried);
  const instrument = cert ? instrumentById(cert.instrumentId) : undefined;
  const lab = cert ? laboratoryById(cert.laboratoryId) : undefined;
  const notFound = checked && queried !== "" && !cert;

  const verifyUrl = `https://calibragraph.example/verify?cert=${input || "DCC-RML-2026-0417"}`;

  return (
    <>
      <PageHeading
        eyebrow="Public verification"
        title="Verify a certificate"
        description="Enter a certificate ID or scan the QR tag on the instrument. No account is required — the result is drawn from the stored record and checked against the anchored digest."
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr] xl:items-start">
        {/* Input column */}
        <Card className="overflow-hidden">
          <CardHeader eyebrow="Input" title="Certificate ID" />
          <div className="p-5">
            <form
              className="flex flex-wrap gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                setQueried(input.trim().toUpperCase());
                setChecked(true);
              }}
            >
              <Field label="Certificate number" htmlFor="v-cert" hint="Format DCC-<LAB>-<YEAR>-<SEQ>">
                <input
                  id="v-cert"
                  className="field-input mono w-64"
                  placeholder="DCC-RML-2026-0417"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  aria-describedby="v-help"
                />
              </Field>
              <div className="flex items-end">
                <Button type="submit">Verify</Button>
              </div>
            </form>
            <p id="v-help" className="mt-3 text-[12px] text-muted">
              Sample IDs for the demo:{" "}
              {["DCC-RML-2026-0417", "DCC-RML-2025-0583", "DCC-EKZ-2025-0477", "DCC-RML-2025-0714"].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setInput(id);
                    setQueried(id);
                    setChecked(true);
                  }}
                  className="mono mr-1 rounded bg-bg px-1.5 py-0.5 text-[11.5px] text-cobalt underline decoration-border underline-offset-2 hover:bg-cobaltLight"
                >
                  {id}
                </button>
              ))}
            </p>

            {notFound && (
              <div className="mt-5 rounded border border-critical/30 bg-critical/10 px-4 py-3">
                <p className="text-[13px] font-semibold text-critical">
                  No record for “{queried}”
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-critical/90">
                  The ID was not found on this network of records. Check the number on
                  the certificate document — including the laboratory segment and year
                  — or ask the certificate holder to confirm the QR link.
                </p>
              </div>
            )}

            {!cert && !notFound && (
              <div className="mt-5 rounded border border-border bg-bg px-4 py-8 text-center text-[13px] text-muted">
                Enter a certificate ID to see the verification result.
              </div>
            )}
          </div>
        </Card>

        {/* QR card */}
        <Card className="overflow-hidden">
          <CardHeader eyebrow="Tag" title="QR display card" />
          <div className="flex flex-col items-center p-5">
            <p className="mb-3 text-center text-[12px] leading-relaxed text-muted">
              Print and attach on the instrument tag. Scanning opens this page with
              the certificate prefilled.
            </p>
            <div className="rounded border border-border bg-surface p-4">
              <QRCodeSVG value={verifyUrl} size={148} fgColor="#263643" bgColor="#FFFFFF" level="M" />
            </div>
            <p className="mono mt-3 max-w-full break-all text-center text-[10.5px] text-muted">
              {verifyUrl}
            </p>
          </div>
        </Card>
      </div>

      {/* Result card */}
      {cert && instrument && lab && (
        <Card className="mt-6 overflow-hidden">
          <CardHeader
            eyebrow="Verification result"
            title={cert.number}
            action={
              <div className="flex items-center gap-2">
                <Badge tone={checked ? statusTone(cert.status) : "neutral"}>{cert.status}</Badge>
                {cert.onchain && cert.status !== "expired" ? (
                  <Badge tone="current">✓ record matches digest</Badge>
                ) : cert.onchain ? (
                  <Badge tone="info">anchor on record · validity elapsed</Badge>
                ) : (
                  <Badge tone="neutral">no anchor (demo record)</Badge>
                )}
              </div>
            }
          />
          <KeyValueList
            items={[
              {
                label: "Authenticity",
                value: (
                  <span>
                    <Badge tone="current">✓ digest recomputes</Badge>{" "}
                    <span className="text-muted">
                      {cert.digest.algorithm} over structured payload
                    </span>
                  </span>
                ),
              },
              {
                label: "Issuer",
                value: (
                  <span>
                    {lab.name} · <span className="mono">{lab.code}</span>
                    <span className="block text-[11.5px] text-muted">
                      {lab.accreditation.endorsement}
                    </span>
                  </span>
                ),
              },
              {
                label: "Instrument identification",
                value: (
                  <span>
                    {instrument.name}
                    <span className="mono ml-2 text-muted">S/N {instrument.serial}</span>
                  </span>
                ),
              },
              {
                label: "Scope",
                value: (
                  <span className="mono">
                    {instrument.func} · {instrument.rangeMin} … {instrument.rangeMax}{" "}
                    {instrument.unit}
                  </span>
                ),
              },
              { label: "Issue date", value: <span className="mono">{cert.issueDate}</span> },
              { label: "Calibration date", value: <span className="mono">{cert.calibrationDate}</span> },
              { label: "Current status", value: <Badge tone={statusTone(cert.status)}>{cert.status}</Badge> },
              { label: "Revision", value: <span className="mono">rev {cert.revision}</span> },
            ]}
          />

          {/* Blockchain block */}
          <div className="border-t border-border bg-bg/60 px-5 py-4">
            <p className="mono mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-cobalt">
              Blockchain verification
            </p>
            {cert.onchain ? (
              <dl className="grid gap-x-8 gap-y-2.5 text-[12.5px] sm:grid-cols-2">
                <div className="flex justify-between gap-4 sm:block">
                  <dt className="text-muted">Network</dt>
                  <dd className="mono text-text">
                    {cert.onchain.network} · chain {cert.onchain.chainId}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 sm:block">
                  <dt className="text-muted">Block</dt>
                  <dd className="mono text-text">{cert.onchain.block}</dd>
                </div>
                <div className="flex justify-between gap-4 sm:col-span-2 sm:block">
                  <dt className="text-muted">Transaction</dt>
                  <dd className="mono break-all text-text">{cert.onchain.tx}</dd>
                </div>
                <div className="sm:col-span-2">
                  <Badge tone="current">✓ record matches digest</Badge>
                  <span className="ml-2 text-[12px] text-muted">
                    anchored {cert.onchain.anchoredAt}
                  </span>
                </div>
              </dl>
            ) : (
              <p className="text-[12.5px] text-muted">
                This demo record was issued without on-chain anchoring; the structured
                digest is still computed and shown on the certificate page.
              </p>
            )}
          </div>

          <p className="border-t border-border px-5 py-3 text-[11.5px] leading-relaxed text-muted">
            What this means: the record exists, its digest recomputes to the anchored
            value, the signer resolves against the laboratory's registry, and the
            certificate is <strong className="font-medium text-text">{cert.status}</strong>.
            Verification confirms the record — the soundness of the original
            measurement remains a matter of the laboratory's accreditation.
          </p>
        </Card>
      )}
    </>
  );
}
