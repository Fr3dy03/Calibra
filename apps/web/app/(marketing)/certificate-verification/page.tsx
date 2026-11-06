import { BulletList, Eyebrow, FeatureGrid, MarketingSection, PageHero } from "@/components/marketing";
import { Badge, Card } from "@/components/ui";

export const metadata = { title: "Certificate Verification — CalibraGraph" };

export default function CertificateVerificationPage() {
  return (
    <>
      <PageHero
        eyebrow="Certificate verification"
        title="Independent verification, in one screen, by anyone"
        lede="Recipients, assessors and auditors do not need an account to confirm a certificate. A certificate ID or the QR tag on the instrument is enough to pull up the record and see what it claims — and what the recorded evidence supports."
      />

      <MarketingSection
        eyebrow="The check"
        title="What is verified — itemised"
        intro="Verification is not a vague badge. Each item below is stated explicitly on the result card, with values read from the stored record rather than shown as free text."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <Eyebrow>Result card fields</Eyebrow>
            </div>
            <ul className="divide-y divide-border px-5 py-1 text-[14px]">
              {[
                ["Authenticity", "The certificate exists and its SHA-256 digest recomputes to the same value as the anchored record."],
                ["Issuer", "Issuing laboratory, accreditation reference and the responsible signatory from the signer registry."],
                ["Instrument identification", "Instrument name, model and serial reference (masked publicly where configured)."],
                ["Scope", "Measurement function and calibrated range with units."],
                ["Issue date / calibration date", "When it was calibrated and when the certificate was formally issued."],
                ["Current status", "Current, superseded, expired or revoked — with revision number and, if applicable, a link to the superseding revision."],
              ].map(([k, v]) => (
                <li key={k} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <span className="font-medium text-text">{k}</span>
                  <span className="max-w-sm text-[13px] text-muted">{v}</span>
                </li>
              ))}
            </ul>
          </Card>

          <div>
            <Card className="p-5">
              <Eyebrow>Blockchain verification block</Eyebrow>
              <div className="mt-3 space-y-2 text-[13px]">
                <p className="flex justify-between gap-4">
                  <span className="text-muted">Network</span>
                  <span className="mono text-text">BOT Chain Testnet · chain 968</span>
                </p>
                <p className="flex justify-between gap-4">
                  <span className="text-muted">Block</span>
                  <span className="mono text-text">3804151</span>
                </p>
                <p className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
                  <span className="text-muted">Transaction</span>
                  <span className="mono break-all text-text">
                    0x8813f02a67c45d09e1b8c7f34a92d60b5e74f1c8a30d29b6e4c75f10d8a3b692
                  </span>
                </p>
                <p className="flex justify-between gap-4">
                  <span className="text-muted">Digest check</span>
                  <span>
                    <Badge tone="current">✓ record matches digest</Badge>
                  </span>
                </p>
              </div>
            </Card>
            <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
              The anchoring proves existence of an exact digest at a specific
              block. It does not store data on chain, does not require a wallet
              and cannot be used to reconstruct anything about the certificate.
            </p>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Two entrances"
        title="Type it, or scan it"
        intro="Both verification paths land on the same result; they differ only in how the certificate ID gets to the service."
      >
        <FeatureGrid
          columns={2}
          items={[
            { title: "Manual entry", body: "Paste or type the certificate number in the DCC-<LAB>-<YEAR>-<SEQ> convention. Partial errors produce a helpful, specific message instead of a generic failure state." },
            { title: "QR display card", body: "Every certificate detail page and verification page shows a QR encoding the verification link. Attach it on instrument tags so a field technician resolves the evidence in seconds." },
          ]}
        />
      </MarketingSection>

      <MarketingSection
        eyebrow="Trust model"
        title="What we can and cannot promise — said plainly"
        className="pb-4"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <Eyebrow>We promise</Eyebrow>
            <BulletList
              items={[
                { lead: "Recomputation over promises.", body: "Digest comparisons and signature checks are recomputed at verification time, not cached verdicts." },
                { lead: "Failure is informative.", body: "A mismatch says which input failed to match — digest, signer registry entry or anchor — so a genuine problem is diagnosable." },
              ]}
            />
          </div>
          <div>
            <Eyebrow>We do not promise</Eyebrow>
            <BulletList
              items={[
                { lead: "The truth of the measurement.", body: "Verification confirms the record: that a laboratory issued this certificate for this instrument and anchored it. Whether the laboratory's process was sound is what accreditation assessors, not software, establish." },
                { lead: "Unbreakable hardware tags.", body: "QR tags are printed matter; copy them and two tags carry the same link. The chain resolves to the same record — which is a feature of verification, not a flaw of custody." },
              ]}
            />
            <p className="mt-4 text-[13px] text-muted">
              Try it live:{" "}
              <a href="/app/verification" className="text-cobalt underline underline-offset-4">
                /app/verification
              </a>{" "}
              with sample ID <span className="mono text-text">DCC-RML-2026-0417</span>.
            </p>
          </div>
        </div>
      </MarketingSection>
    </>
  );
}
