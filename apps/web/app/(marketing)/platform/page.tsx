import { BulletList, Eyebrow, FeatureGrid, MarketingSection, PageHero, StatRow } from "@/components/marketing";
import { Card } from "@/components/ui";

export const metadata = { title: "Platform — CalibraGraph" };

export default function PlatformPage() {
  return (
    <>
      <PageHero
        eyebrow="Platform"
        title="One record system for the calibration evidence you are asked to prove"
        lede="CalibraGraph is a laboratory information system focused on one job: making calibration history complete, structured and verifiable — for your instruments, your laboratories, and the assessors who write findings either way."
      />

      {/* What it is */}
      <MarketingSection
        eyebrow="Overview"
        title="What the platform holds"
        intro="Every object in CalibraGraph corresponds to something that exists in a metrology practice — never an abstraction for its own sake."
      >
        <FeatureGrid
          items={[
            {
              title: "Instrument registry",
              body: "Category, manufacturer, model, serial reference (optionally masked publicly), measurement function, range, resolution, location, owner and asset reference. One entry per instrument, no duplicates.",
            },
            {
              title: "Calibration events",
              body: "Each service event is a record: when, where, by which laboratory, under which procedure, against which reference standard — the full event card, comparable across instruments.",
            },
            {
              title: "Digital Calibration Certificates",
              body: "Structured documents following the PTB DCC schema, rendered like a paper certificate but readable as data, anchored via digest and exportable at any time.",
            },
            {
              title: "Laboratory profiles",
              body: "Accreditation scheme and number, scope with CMC values, approved signer registry — kept as stored records, evidence-based, not self-declared.",
            },
            {
              title: "Reference standards",
              body: "Voltage standards, piston gauges, mass sets, resistance standards and every other standard with its range, uncertainty, calibration dates, and its own traceability chain to a national institute.",
            },
            {
              title: "Verification",
              body: "A public page where anyone holding a certificate ID or QR tag can confirm authenticity, issuer, instrument, scope, dates and on-chain match — without login.",
            },
          ]}
        />
      </MarketingSection>

      {/* Numbers */}
      <MarketingSection
        eyebrow="Demo dataset"
        title="A realistic dataset to explore"
        intro="The application ships with a sample dataset of plausible calibration records so every screen can be evaluated against real-looking numbers rather than lorem-ammo placeholders."
        className="border-t-0"
      >
        <StatRow
          items={[
            { value: "42", label: "Instruments registered" },
            { value: "38", label: "Current certificates" },
            { value: "5", label: "Due in 30 days" },
            { value: "2", label: "Overdue" },
          ]}
        />
      </MarketingSection>

      {/* Non-goals */}
      <MarketingSection
        eyebrow="Position"
        title="What CalibraGraph deliberately is not"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-text">Not a raw-data acquisition system</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              The platform stores evaluated, signed results — not oscilloscope traces.
              Your measurement process keeps producing the evaluations; the platform
              keeps the history of record. Instrument reads are inputs to the
              laboratory's evaluation, and evaluation stays inside the laboratory,
              where it belongs.
            </p>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-text">Not a ledger for every tag</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              Anchoring is used once per certificate, for the digest, and nothing
              else. No per-scan electricity, no per-sited token — you anchor a
              document when you issue it, the block and tx are displayed, and that
              is the whole story on chain.
            </p>
          </Card>
        </div>
      </MarketingSection>

      {/* Qualit features */}
      <MarketingSection eyebrow="Design" title="Base qualities that run through every screen">
        <BulletList
          items={[
            {
              lead: "Numeric tables are honest tables.",
              body: "Values are right-aligned, tabular, monospaced, and units always accompany the values they qualify — the conditions of a real metrology report, not a dashboard decoration.",
            },
            {
              lead: "Serials, digests and IDs are exact.",
              body: "Instrument serials, certificate numbers and SHA-256 digests render in a fixed-width typeface so character position is verifiable at a glance.",
            },
            {
              lead: "States are explicit.",
              body: "Current, pending, overdue, revoked, expired, imported, superseded. A colour-coded status badge is shown everywhere status matters — the wrong answer to “is this certificate still valid?” is not a display issue, it is the product failure.",
            },
          ]}
        />
      </MarketingSection>

      <MarketingSection eyebrow="Next" title="Where to look next" className="pb-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { href: "/digital-calibration", title: "Digital Calibration", body: "How certificates are structured, issued and revisioned." },
            { href: "/instrument-traceability", title: "Instrument Traceability", body: "The chain from an instrument to a national standard." },
            { href: "/certificate-verification", title: "Verification", body: "How a third party confirms a certificate on their own." },
          ].map((l) => (
            <Card key={l.href} className="p-5" as="li">
              <Eyebrow>{l.title}</Eyebrow>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">{l.body}</p>
            </Card>
          ))}
        </div>
      </MarketingSection>
    </>
  );
}
