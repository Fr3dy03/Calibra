import { BulletList, Eyebrow, MarketingSection, PageHero } from "@/components/marketing";
import { Badge, Card } from "@/components/ui";
import TraceabilityGraph from "@/app/components/TraceabilityGraph";
import { flukeTraceEdges, flukeTraceNodes } from "@/lib/data";

export const metadata = { title: "Instrument Traceability — CalibraGraph" };

export default function InstrumentTraceabilityPage() {
  return (
    <>
      <PageHero
        eyebrow="Instrument traceability"
        title="A chain of calibration evidence, drawn the way it is audited"
        lede="Traceability is the backbone of every metrology discussion. CalibraGraph models the chain explicitly — from the instrument on the bench up to the national standard, via the calibration record, the reference standard used and the laboratory that issued the result."
      />

      <MarketingSection
        eyebrow="The chain"
        title="Instrument → calibration record → reference standard → laboratory"
        intro="This is a real record from the demo dataset: digital multimeter Fluke 8846A, S/N 2451A7821, calibrated by Rhein Metrology Laboratory against a 10 V DC voltage standard, traceable to the Josephson array voltage standard at PTB."
      >
        <TraceabilityGraph nodes={flukeTraceNodes} edges={flukeTraceEdges} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Registry"
        title="What an instrument record holds, and what it shows up in"
        intro="A CalibraGraph instrument record is a registry entry first — identification, function and ownership — and everything else (calibration history, due dates, certificates, traceability graph) hangs off it."
      >
        <BulletList
          items={[
            {
              lead: "Identification that survives people and moves.",
              body: "Manufacturer, model, serial reference, asset reference, location, owner. Serials can be “masked publicly” — the registry stores the full serial, and the public verification surfaces a masked form (e.g. 2451***21) so identification does not leak custody data.",
            },
            {
              lead: "Measurement function and range as fields, not free text.",
              body: "A digital multimeter is function “DC voltage / AC voltage”, range ±1000 V — machine-readable, so due-date logic and scope checks operate on data rather than on strings.",
            },
            {
              lead: "A calibration history you can read like a logbook.",
              body: "Each calibration event links to its certificate; superseded revisions stay visible with their status; the current certificate is pinned. When an assessor asks for “the last three calibrations of this instrument”, it is one table.",
            },
            {
              lead: "Upcoming due dates, per organisation policy.",
              body: "Due-date reminders at 30/14/7 days before due, plus a queue for overdue instruments. Lapses are segmented (7/30/60/90 days, overdue, none) so nothing slips silently.",
            },
          ]}
        />
      </MarketingSection>

      <MarketingSection
        eyebrow="Reference standards"
        title="The calibration is only as traceable as the standard behind it"
        intro="Every measurement result on CalibraGraph was compared against a named reference standard. That standard's record contains its own calibration date, its own due date, its uncertainty and its own chain to a national metrology institute — displayed in full, not referenced vaguely."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-5">
            <Eyebrow>Reference standard</Eyebrow>
            <p className="mono mt-2 text-sm font-semibold text-text">RML Ref RM-0151</p>
            <p className="mt-1 text-[13px] text-muted">10 V DC voltage standard, Fluke, S/N 7125-1184</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="current">In calibration</Badge>
              <Badge tone="neutral">Due 2027-10-01</Badge>
            </div>
          </Card>
          <Card className="p-5">
            <Eyebrow>Standard uncertainty</Eyebrow>
            <p className="mono mt-2 text-sm font-semibold text-text">1.2 µV/V (k = 2)</p>
            <p className="mt-1 text-[13px] text-muted">
              The standard's expanded uncertainty enters the calibration budget and
              shows in the certificate's uncertainty statement.
            </p>
          </Card>
          <Card className="p-5">
            <Eyebrow>National link</Eyebrow>
            <p className="mono mt-2 text-sm font-semibold text-text">PTB · Braunschweig</p>
            <p className="mt-1 text-[13px] text-muted">
              Josephson array voltage standard — the national reference for DC
              voltage, via reference certificate DCC-PTB-2025-1104.
            </p>
          </Card>
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Try it"
        title="Examine an instrument end to end"
        intro="Open the Fluke 8846A in the application: overview, specifications, calibration history with every revision, the current certificate, and the traceability graph in context."
      >
        <div className="flex flex-wrap gap-3">
          <a
            href="/app/instruments/INS-0101"
            className="inline-flex items-center justify-center rounded border border-white/15 bg-gradient-to-r from-violet via-blue to-cyan px-3.5 py-2 text-sm font-medium text-white shadow-glow transition-all hover:brightness-110"
          >
            Open the Fluke 8846A record
          </a>
          <a
            href="/app/traceability"
            className="inline-flex items-center justify-center rounded border border-border bg-surface px-3.5 py-2 text-sm font-medium text-text transition-colors hover:border-cobalt hover:text-cobalt"
          >
            Reference standards registry
          </a>
        </div>
      </MarketingSection>

      <MarketingSection eyebrow="Boundaries" title="What traceability does not claim here" className="pb-4">
        <p className="max-w-3xl text-[15px] leading-relaxed text-muted">
          The graph shows evidence — registry entries, certificates, anchors and
          accreditation records as they are stored. It does not re-measure
          anything, and it does not turn a verified record into a verified
          measurement. Where accreditation is simulated in this demo dataset, the
          interface says so explicitly. That restraint is a design goal: claims
          belong to laboratory documents, links between them belong to us.
        </p>
      </MarketingSection>
    </>
  );
}

