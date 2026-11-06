import { BulletList, Eyebrow, FeatureGrid, MarketingSection, PageHero } from "@/components/marketing";
import { Card, TD, TH, THead, TR, TBody, Table, TableWrap } from "@/components/ui";

export const metadata = { title: "Standards — CalibraGraph" };

export default function StandardsPage() {
  return (
    <>
      <PageHero
        eyebrow="Standards & compatibility"
        title="PTB DCC v3.3.0 (XSD) — validated on the way in, emitted on the way out"
        lede="CalibraGraph aligns with the Digital Calibration Certificate specification maintained by Physikalisch-Technische Bundesanstalt, the German national metrology institute. Structured, schema-checked documents today; no bespoke format you will outgrow next quarter."
      />

      <MarketingSection
        eyebrow="DCC"
        title="Why structured certificates, in one paragraph and one table"
        intro="A scanned PDF answers “what did it say?” — a structured DCC also answers “what does it contain?” The second question is the one every downstream system has."
      >
        <div className="overflow-hidden rounded border border-border">
          <TableWrap>
            <Table className="min-w-[600px]">
              <THead>
                <TH>Capability</TH>
                <TH>Scanned PDF</TH>
                <TH>Structured DCC</TH>
              </THead>
              <TBody>
                <TR>
                  <TD>Field-level reading by systems</TD>
                  <TD>No — OCR with uncertainty</TD>
                  <TD>Yes — typed fields (dcc:v3.3.0)</TD>
                </TR>
                <TR>
                  <TD>Unit-checkable values</TD>
                  <TD>Ambiguous</TD>
                  <TD>
                    Unit annotation per value
                  </TD>
                </TR>
                <TR>
                  <TD>Digest computation for integrity</TD>
                  <TD>Possible on the bytes, meaningless on the content</TD>
                  <TD>Meaningful: payload digest, deterministic render</TD>
                </TR>
                <TR>
                  <TD>Automatic exchange between tools</TD>
                  <TD>Not without custom extraction</TD>
                  <TD>Schema-conformant XML import/export</TD>
                </TR>
                <TR>
                  <TD>Audit reading experience</TD>
                  <TD>Familiar</TD>
                  <TD>
                    Familiar — the UI renders a paper-shaped certificate
                  </TD>
                </TR>
              </TBody>
            </Table>
          </TableWrap>
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Schema work"
        title="How the platform treats the schema"
      >
        <FeatureGrid
          columns={3}
          items={[
            { title: "Ingestion: validate, report, decide", body: "Uploaded XML is checked against the gcc-namespace DCC v3.3.0 XSD. Findings are listed with severity — error, warning, info — and nothing is issued while an error stands." },
            { title: "Issuance: schema-conformant by construction", body: "Certificates are written as DCC-structured documents; the payload digest refers to the structured content, so downstream validators can recompute it independently." },
            { title: "Versioning: explicit, not silent", body: "The detected schema version is displayed in the ingestion report (dcc:v3.3.0 in the sample). Upgrades are front-end visible transitions, not quiet format drift." },
          ]}
        />
      </MarketingSection>

      <MarketingSection
        eyebrow="Broader alignment"
        title="Beyond the DCC: the vocabulary of the practice"
      >
        <BulletList
          items={[
            {
              lead: "ISO/IEC 17025 as interface language.",
              body: "Laboratory records carry scheme, accreditation number and validity; certificates carry procedure reference, responsible signatory and signer registry entries. Assessors find the fields where ISO/IEC 17025 expectations put them.",
            },
            {
              lead: "GUM-style uncertainty statements.",
              body: "Expanded uncertainty with coverage factor k and coverage probability, plus the evaluation distribution — stated as a complete sentence next to the numeric columns.",
            },
            {
              lead: "ILAC MRA as the endorsement vocabulary.",
              body: "Accreditation references follow the mutual-recognition style of the ILAC arrangement. Simulated entries are labelled as simulated, once, in the same line — not hidden in a footnote.",
            },
            {
              lead: "Units everywhere, no exceptions.",
              body: "Following DCC's unit-annotated structure, the platform rejects unit-free numbers. A value lands next to its unit in tables, key-value rows and exports alike.",
            },
          ]}
        />
      </MarketingSection>

      <MarketingSection
        eyebrow="Exit paths"
        title="Data you can leave with"
        className="pb-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-text">Certificates → XML</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              Any certificate can be exported as schema-conformant DCC XML with its
              digest. An archive outside the platform can later recompute the
              digest and stay confident in what it holds.
            </p>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-text">Tables → CSV</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              Due forecasts, certificate inventory and laboratory workload export
              as plain CSV from the reports page — no export licence, no premium
              tier, no «contact sales» to obtain your own data.
            </p>
          </Card>
        </div>
      </MarketingSection>
    </>
  );
}
