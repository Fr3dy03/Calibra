import { BulletList, Eyebrow, FeatureGrid, MarketingSection, PageHero } from "@/components/marketing";
import { Badge, Card, TD, TH, THead, TR, TBody, Table, TableWrap } from "@/components/ui";
import { laboratoryById } from "@/lib/data";

export const metadata = { title: "Laboratories — CalibraGraph" };

export default function LaboratoriesPage() {
  const rml = laboratoryById("LAB-RML-2001");
  return (
    <>
      <PageHero
        eyebrow="Laboratories"
        title="Laboratory profiles that stand on evidence, not adjectives"
        lede="A laboratory's standing in CalibraGraph is built from stored records: accreditation references, calibrated scope lines with measured CMC values, approved signer registry and the certificates actually issued. Nothing on a profile page is a self-declared claim."
      />

      <MarketingSection
        eyebrow="Profiles"
        title="What a laboratory profile contains"
      >
        <FeatureGrid
          columns={3}
          items={[
            { title: "Accreditation evidence", body: "Scheme (ISO/IEC 17025:2017), accreditation number, ILAC MRA endorsement reference and validity end date — stored as records with their source." },
            { title: "Scope table", body: "Measurement field, covered range and CMC per line — e.g. DC/LF voltage 10 µV – 1 kV, CMC 4.2 µV/V. The scope is what the certificates must stay inside." },
            { title: "Signer registry", body: "Approved personnel with role, staff identifier, signature scheme and the date authorisation began. Certificates reference these entries, never merely a name in a font." },
            { title: "Certificate history", body: "Every certificate the laboratory has issued through the platform — current, superseded, expired — countable and auditable at any moment." },
            { title: "Reference standards insight", body: "Which standards the laboratory maintains, their current state and their chains to national institutes, surfaced through the traceability views." },
            { title: "Intake readiness", body: "What the laboratory needs at intake: asset reference, owner, location, function and range — the same fields the instrument registration form collects." },
          ]}
        />
      </MarketingSection>

      <MarketingSection
        eyebrow="Example profile"
        title="Rhein Metrology Laboratory (RML-2001)"
        intro="A realistic excerpt from the demo dataset to show how profile fields render — scope, personnel and accreditation as stored records."
      >
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-text">{rml?.name}</p>
              <p className="mono mt-0.5 text-[11px] text-muted">
                {rml?.code} · {rml?.location}, {rml?.country}
              </p>
            </div>
            <Badge tone="current">Accredited · evidence on record</Badge>
          </div>
          <div className="px-5 py-4">
            <Eyebrow>Accreditation</Eyebrow>
            <p className="mono mt-1.5 text-[13px] text-text">
              {rml?.accreditation.endorsement}
            </p>
            <p className="mt-1 text-[12.5px] text-muted">
              Scheme {rml?.accreditation.scheme} · valid until{" "}
              <span className="mono">{rml?.accreditation.validUntil}</span> · status
              recalculated from stored records, not asserted by this site.
            </p>
          </div>
          <div className="border-t border-border px-5 pb-5 pt-4">
            <Eyebrow>Scope (extract)</Eyebrow>
            <div className="mt-2 overflow-hidden">
              <TableWrap>
                <Table className="min-w-[520px]">
                  <THead>
                    <TH>Measurement field</TH>
                    <TH>Range</TH>
                    <TH numeric>CMC</TH>
                  </THead>
                  <TBody>
                    {rml?.scope.map((s) => (
                      <TR key={s.field}>
                        <TD>{s.field}</TD>
                        <TD mono>{s.range}</TD>
                        <TD numeric>{s.cmc}</TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </TableWrap>
            </div>
          </div>
        </Card>
        <p className="mt-3 text-[12px] text-muted">
          Full profile, personnel registry and certificate history are available in
          the application: <span className="mono">/app/laboratories/LAB-RML-2001</span>.
        </p>
      </MarketingSection>

      <MarketingSection
        eyebrow="Working mode"
        title="How laboratories work with the platform"
      >
        <BulletList
          items={[
            {
              lead: "Register once, keep the registry live.",
              body: "Instrument records arrive at intake or through direct registration; owners and locations are updated by the instrument's colleagues — not by the platform guessing.",
            },
            {
              lead: "Issue through evidence.",
              body: "Ingestion wizard or direct issuance, always with the signer-authorisation statement and the signer resolved against the registry. Certificates without a registry signatory cannot be issued.",
            },
            {
              lead: "Answer assessors from records.",
              body: "Accreditation assessor rounds and customer audits draw on the same tables the platform shows: certificate lists per instrument, signer authorisations, scope lines with CMCs and reference standard states.",
            },
            {
              lead: "Stay exportable.",
              body: "Reports (certificate inventory, laboratory workload, due forecast) export as CSV; certificates export as schema-conformant XML. The laboratory's evidence is never locked in.",
            },
          ]}
        />
      </MarketingSection>

      <MarketingSection
        eyebrow="Honest footer"
        title="Accreditation status is evidence-based, not self-declared"
        className="pb-4"
      >
        <p className="max-w-3xl text-[15px] leading-relaxed text-muted">
          CalibraGraph displays accreditation status as it appears in stored
          records — scheme, number, endorsement reference, validity date — and
          marks simulated entries explicitly. The platform does not award, renew
          or judge accreditation; it makes whatever is on record visible and
          verifiable alongside the certificates that depend on it.
        </p>
      </MarketingSection>
    </>
  );
}
