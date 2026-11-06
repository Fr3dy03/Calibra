import Link from "next/link";
import { Button, Card, TD, TH, THead, TR, TBody, Table, TableWrap } from "@/components/ui";
import { CertificatePreview } from "@/components/CertificatePreview";
import { BulletList, Eyebrow, FeatureGrid, MarketingSection } from "@/components/marketing";

export default function HomePage() {
  return (
    <>
      {/* Hero ---------------------------------------------------------- */}
      <section className="border-b border-border">
        <div className="container-page grid gap-12 py-16 sm:py-24 lg:grid-cols-[1.05fr_1fr] lg:items-start">
          <div>
            <Eyebrow>Calibration history of record</Eyebrow>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-text sm:text-[44px] sm:leading-[1.15]">
              Every measurement has a history.{" "}
              <span className="text-cobalt">Make it verifiable.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Connect instruments, laboratories and calibration evidence through
              structured, independently verifiable records.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/app/instruments/new" size="lg">
                Register an Instrument
              </Button>
              <Button href="/app/verification" variant="secondary" size="lg">
                Verify a Certificate
              </Button>
            </div>
            <dl className="mt-12 grid max-w-xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
              {[
                { v: "17,609", l: "values anchored" },
                { v: "132", l: "certificates under management" },
                { v: "11", l: "accredited laboratories" },
                { v: "v3.3.0", l: "PTB DCC schema" },
              ].map((s) => (
                <div key={s.l}>
                  <dd className="mono text-lg font-semibold text-text">{s.v}</dd>
                  <dt className="mt-0.5 text-[12px] text-muted">{s.l}</dt>
                </div>
              ))}
            </dl>
            <p className="mt-8 max-w-md text-[12.5px] leading-relaxed text-muted/80">
              Sample figures shown on this site come from a demonstration dataset.
              Numbers, certificates and anchors are illustrative and never invented
              beyond what is stated.
            </p>
          </div>

          {/* Sample Digital Calibration Certificate */}
          <div>
            <p className="mono mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              Sample · Digital Calibration Certificate
            </p>
            <CertificatePreview showVerifiedBadge />
            <p className="mt-3 text-[12px] text-muted">
              Rendered from a structured DCC record.{" "}
              <Link href="/app/certificates/DCC-RML-2026-0417" className="text-cobalt underline underline-offset-4">
                Open the full certificate
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* 1 · Fragmentation --------------------------------------------- */}
      <MarketingSection
        id="fragmentation"
        eyebrow="01 · The problem"
        title="Calibration records are fragmented — until someone asks for them"
        intro="In most organisations, calibration evidence lives in paper binders, scanned PDFs, spreadsheets and laboratory portals. Each source holds a piece of the history, none holds all of it, and audits are spent reassembling what should already be assembled."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <Eyebrow>Where records live today</Eyebrow>
            <ul className="mt-4 space-y-3 text-[14px] leading-relaxed text-muted">
              <li>• Scanned PDFs attached to asset-management tickets, unindexed and unsearchable</li>
              <li>• Laboratory portals that hold certificates for two years, then archive them</li>
              <li>• Excel trackers with the next due date — and no link to the evidence itself</li>
              <li>• Acceptance reports that reference a certificate number no one can find again</li>
            </ul>
          </Card>
          <Card className="p-6">
            <Eyebrow>What verifiability requires</Eyebrow>
            <ul className="mt-4 space-y-3 text-[14px] leading-relaxed text-muted">
              <li>• One canonical record per certificate, not one copy per inbox</li>
              <li>• A traceable path from instrument to reference standard to national standard</li>
              <li>• Tamper evidence: anyone can confirm a record was not quietly edited</li>
              <li>• Straightforward, machine-readable formats instead of page scans</li>
            </ul>
          </Card>
        </div>
      </MarketingSection>

      {/* 2 · Traceability ----------------------------------------------- */}
      <MarketingSection
        id="traceability"
        eyebrow="02 · Instrument traceability"
        title="Traceability as a graph, not a filing cabinet"
        intro="CalibraGraph models the calibration relationship as an auditable chain: instrument → calibration record → reference standard → reference laboratory → issuing laboratory. Each edge is explicit, dated and evidenced — so the answer to “how do you know your meter is right?” is a link, not a memory."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Instrument as an identity",
              body: "Serial number, measurement function, range, resolution, location, owner and asset reference in one registry entry — with the public serial optionally masked.",
            },
            {
              title: "History as first-class structure",
              body: "Every calibration event attaches to the instrument register. Superseded revisions stay visible; values are immutable after issuance.",
            },
            {
              title: "Upcoming due dates as alarms",
              body: "Due-date policy per organisation with reminders at 30, 14 and 7 days, plus an explicit overdue queue for instruments that slip.",
            },
          ].map((f) => (
            <Card key={f.title} className="p-5">
              <h3 className="text-sm font-semibold text-text">{f.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">{f.body}</p>
            </Card>
          ))}
        </div>
        <div className="mt-6">
          <BulletList
            items={[
              {
                lead: "Reference standards are part of the product data.",
                body: "A certificate lists the exact standard used — e.g. a 10 V DC voltage standard — with its own calibration date, due date and its own traceability chain to a national metrology institute.",
              },
              {
                lead: "Accreditation status is evidence-based, not self-declared.",
                body: "Laboratory profiles show accreditation scheme, number and scope as stored records; nothing about the accreditation is asserted without backing evidence.",
              },
            ]}
          />
        </div>
      </MarketingSection>

      {/* 3 · Digital certificates --------------------------------------- */}
      <MarketingSection
        id="digital-certificates"
        eyebrow="03 · Digital Calibration Certificates"
        title="Certificates that are data — not scans of paper"
        intro="CalibraGraph issues Digital Calibration Certificates (DCC): structured XML documents following the PTB DCC schema, rendered faithfully in the browser. Measurement values, uncertainties, conditions and digests are fields in a document — not paragraphs lost in a scan."
      >
        <FeatureGrid
          items={[
            {
              title: "Structured fields",
              body: "Administrative data, instrument identification, measurement results and environmental conditions are separate, typed fields — exportable, diff-able, query-able.",
            },
            {
              title: "Immutable values",
              body: "Once issued, measured values and their uncertainties are locked. Corrections happen through a new revision that explicitly supersedes the previous one.",
            },
            {
              title: "Digest-anchored",
              body: "Every certificate carries a SHA-256 digest; the digest is anchored on BOT Chain so recalculation can prove document integrity without trusting the server.",
            },
            {
              title: "Reader-shaped first",
              body: "The certificate detail view is laid out like a paper certificate an assessor would recognise: header, results table, uncertainty statement, conditions, signatures.",
            },
            {
              title: "Right.unit discipline",
              body: "Units always accompany values. Uncertainties carry their coverage factor. Serials and measured values render in monospaced type for character-accurate reading.",
            },
            {
              title: "Ingestion for laboratories",
              body: "Upload an existing DCC XML, get a validation report against the XSD schema, review the extracted fields, then issue — with an explicit authorisation check.",
            },
          ]}
        />
      </MarketingSection>

      {/* 4 · Laboratory workflows --------------------------------------- */}
      <MarketingSection
        id="laboratories"
        eyebrow="04 · Laboratory workflows"
        title="Built around how accredited laboratories actually work"
        intro="From job intake to signature to anchor, a calibration runs through defined states. CalibraGraph keeps each step observable — who did it, under which procedure, with which reference standard, inside which environmental conditions."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <Eyebrow>Workflow</Eyebrow>
            <ol className="mt-4 space-y-3.5 text-[14px] leading-relaxed text-muted">
              <li>
                <strong className="font-semibold text-text">1 · Intake.</strong> Instrument arrives with a calibration order; the registry entry, owner and location are confirmed.
              </li>
              <li>
                <strong className="font-semibold text-text">2 · Measurement.</strong> Points are taken against a listed reference standard; raw values stay attached to the event.
              </li>
              <li>
                <strong className="font-semibold text-text">3 · Evaluation.</strong> Errors and uncertainties are computed by the laboratory&apos;s own process and reviewed by a technical signatory.
              </li>
              <li>
                <strong className="font-semibold text-text">4 · Issuance.</strong> An authorised signer issues the DCC; the issuing actor, procedure and standards used are stored fields.
              </li>
              <li>
                <strong className="font-semibold text-text">5 · Anchor.</strong> The certificate digest is anchored on BOT Chain; the block and transaction are recorded on the certificate.
              </li>
            </ol>
          </Card>
          <Card className="p-6">
            <Eyebrow>Signer registry</Eyebrow>
            <p className="mt-4 text-[14px] leading-relaxed text-muted">
              Approved personnel are registered per laboratory: name, role, staff
              identifier and signature scheme (e.g. ECDSA P-256). Signatures are
              checked against the registry at issue and verification time — so a
              certificate never implies an authority that is not on record.
            </p>
            <div className="mt-5 rounded border border-border bg-bg px-4 py-3">
              <p className="mono text-[11px] text-muted">
                Certified through signer registry:
              </p>
              <p className="mono mt-1.5 text-[12.5px] text-text">
                Stefan Klein · RML-S-0288 · ECDSA P-256
              </p>
              <p className="mono mt-1 text-[12.5px] text-text">
                Authorized as technical signatory since 2023-03-15
              </p>
            </div>
            <p className="mt-5 text-[13px] text-muted">
              Laboratory profiles, scopes and personnel are{" "}
              <Link href="/app/laboratories" className="text-cobalt underline underline-offset-4">
                browsable in the application
              </Link>
              .
            </p>
          </Card>
        </div>
      </MarketingSection>

      {/* 5 · Verification ------------------------------------------------ */}
      <MarketingSection
        id="verification"
        eyebrow="05 · Certificate verification"
        title="Verification that anyone can perform — without contacting anyone"
        intro="Give the verifier a certificate ID (or a QR code on the instrument tag) and they can independently confirm who issued the certificate, for which instrument, over which range, when it was calibrated, whether it is still current — and that the on-chain record matches the document digest."
      >
        <Card className="p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <Eyebrow>What a verification states</Eyebrow>
              <ul className="mt-4 space-y-2.5 text-[14px] leading-relaxed text-muted">
                <li>✓ Authenticity — the certificate exists and its digest recomputes correctly</li>
                <li>✓ Issuer — the issuing laboratory, scheme, and responsible signatory</li>
                <li>✓ Instrument identification — name, model and serial reference</li>
                <li>✓ Scope — measurement function and calibrated range</li>
                <li>✓ Period — issue date, calibration date and current valid-until status</li>
                <li>✓ Revision state — whether a newer revision supersedes this one</li>
              </ul>
              <div className="mt-5 rounded border border-teal/25 bg-tealLight px-4 py-3">
                <p className="text-[13px] font-medium text-teal">
                  BOT Chain Testnet · chain 968 — record matches digest · block{" "}
                  <span className="mono">3804151</span>
                </p>
              </div>
            </div>
            <div className="lg:w-72">
              <div className="rounded border border-border bg-surface p-4 text-center">
                <p className="mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  Verification QR
                </p>
                <div className="mx-auto mt-3 flex h-40 w-40 items-center justify-center rounded border border-border bg-bg">
                  <span className="mono text-[11px] text-muted">
                    QR encodes
                    <br />
                    verify?cert=
                    <br />
                    DCC-RML-
                    <br />
                    2026-0417
                  </span>
                </div>
                <Button href="/app/verification" variant="secondary" size="sm" className="mt-4 w-full">
                  Open verification
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </MarketingSection>

      {/* 6 · Reference standards ----------------------------------------- */}
      <MarketingSection
        id="reference-standards"
        eyebrow="06 · Reference standards"
        title="Every standard has its own ebook-style history"
        intro="Reference standards — voltage standards, piston gauges, mass sets, resistance standards — are registered exactly like instruments: designation, serial, range, uncertainty, last calibration, due date, and the national standard they trace to."
      >
        <div className="overflow-hidden rounded border border-border">
          <TableWrap>
            <Table>
              <THead>
                <TH>Reference standard</TH>
                <TH>Type</TH>
                <TH>Range</TH>
                <TH>Last cal.</TH>
                <TH numeric>Uncertainty (k = 2)</TH>
                <TH>Traceable to</TH>
              </THead>
              <TBody>
                <TR>
                  <TD mono>RML Ref RM-0151</TD>
                  <TD>10 V DC voltage standard</TD>
                  <TD mono>10 V DC fixed</TD>
                  <TD mono>2025-10-02</TD>
                  <TD numeric>1.2 µV/V</TD>
                  <TD>PTB — Josephson array</TD>
                </TR>
                <TR>
                  <TD mono>EKZ Ref PB-0412</TD>
                  <TD>Deadweight piston gauge</TD>
                  <TD mono>0 – 25 bar</TD>
                  <TD mono>2025-04-17</TD>
                  <TD numeric>6.5 Pa</TD>
                  <TD>PTB — primary piston-cylinder</TD>
                </TR>
                <TR>
                  <TD mono>RML Ref RC-0088</TD>
                  <TD>10 kΩ resistance standard</TD>
                  <TD mono>10 kΩ fixed</TD>
                  <TD mono>2025-01-22</TD>
                  <TD numeric>0.42 µΩ/Ω</TD>
                  <TD>PTB — quantum Hall</TD>
                </TR>
              </TBody>
            </Table>
          </TableWrap>
        </div>
        <p className="mt-4 text-[13px] text-muted">
          A full registry with traceability graph is available under{" "}
          <Link href="/app/traceability" className="text-cobalt underline underline-offset-4">
            Reference Standards
          </Link>
          .
        </p>
      </MarketingSection>

      {/* 7 · Data integrity ---------------------------------------------- */}
      <MarketingSection
        id="integrity"
        eyebrow="07 · Data integrity"
        title="Evidence you can recompute — not a promise you must trust"
        intro="Integrity in CalibraGraph is a property of the record itself. The certificate document has a digest; the digest is anchored; recomputing the digest confirms the document you are reading is the document that was signed and anchored."
      >
        <BulletList
          items={[
            {
              lead: "SHA-256 digests on every certificate.",
              body: "Two digests per certificate — one over the structured payload, one over the rendered document. Both are recomputed and compared at verification time.",
            },
            {
              lead: "Anchoring on BOT Chain.",
              body: "Digests are recorded on BOT Chain Testnet (chain 968). The anchoring block and transaction identifier are shown in mono on the certificate; verifiers can follow the transaction in the BOT Chain Explorer.",
            },
            {
              lead: "Errors are corrections, not overwrites.",
              body: "If a value must change, the certificate is superseded: a new revision references its predecessor, which is retained and marked as superseded. Nothing disappears from the history.",
            },
            {
              lead: "Immutability after issuance.",
              body: "Measurement values, uncertainties and conditions are read-only once a certificate is issued. Only administrative metadata may be edited during ingestion review, before an authorised signer approves.",
            },
          ]}
        />
      </MarketingSection>

      {/* 8 · Standards compatibility ------------------------------------- */}
      <MarketingSection
        id="standards"
        eyebrow="08 · Standards compatibility"
        title="Interoperable by construction: PTB DCC v3.3.0 (XSD)"
        intro="CalibraGraph targets the Digital Calibration Certificate schema maintained by Physikalisch-Technische Bundesanstalt (PTB). Ingestion validates against the DCC v3.3.0 XSD; issuance writes schema-conformant XML so any DCC-aware tool can consume the documents."
      >
        <FeatureGrid
          columns={2}
          items={[
            {
              title: "XSD-validated ingestion",
              body: "Uploaded XML is checked against the dcc:v3.3.0 schema. A structured report lists schema findings with severity before anything is issued.",
            },
            {
              title: "17025-aligned metadata",
              body: "Procedure references, signer registry, accreditation references and conditions map to fields a quality assessor expects under ISO/IEC 17025.",
            },
            {
              title: "Unit-annotated values",
              body: "Every numeric field carries its unit per the DCC structure — no unit-free numbers float through the platform.",
            },
            {
              title: "Exportable, not hostage data",
              body: "Certificates can be exported as schema-conformant XML, and summaries as CSV. Your evidence stays yours.",
            },
          ]}
        />
      </MarketingSection>

      {/* 9 · FAQ ---------------------------------------------------------- */}
      <MarketingSection
        id="faq"
        eyebrow="09 · FAQ"
        title="Questions we are asked"
        intro="Six answers that cover intent, custody and honest limitations."
        className="pb-20"
      >
        <div className="mx-auto max-w-3xl space-y-3">
          {[
            {
              q: "Is CalibraGraph an accredited calibration laboratory?",
              a: "No. CalibraGraph is the record system used by laboratories; accreditation itself belongs to the laboratory performing the calibration. The accreditation status shown on laboratory and certificate pages is evidence-based and simulated in this demo — it reflects records we hold, not a self-declared claim.",
            },
            {
              q: "What exactly is anchored on the blockchain?",
              a: "Only certificate digests (SHA-256). No personal data, no measurement values and no certificate documents leave the platform. The anchor makes it possible to prove later that a specific digest existed at a specific block — a tamper-evidence property, not a data store.",
            },
            {
              q: "Can measured values be corrected after issuance?",
              a: "No — measurement values, uncertainties and conditions are immutable once issued. If a genuine error is found, the certificate is superseded by a new revision that references it, and both revisions remain permanently visible with their relationship.",
            },
            {
              q: "Which standards and formats do you support?",
              a: "Digital Calibration Certificates follow the PTB DCC schema, validated against dcc:v3.3.0 XSD on ingestion. Export is schema-conformant XML plus CSV summaries. We support ISO/IEC 17025-aligned metadata fields for laboratory records.",
            },
            {
              q: "Do we need a blockchain wallet to verify a certificate?",
              a: "No. Verification is a normal web page: enter the certificate ID or scan the instrument QR tag. The blockchain anchor is used in the background to confirm integrity, and the result is a plain-language statement on screen.",
            },
            {
              q: "How long is my data retained, and can I export it?",
              a: "Calibration records are retained as long as you request, with no hidden lock-in: certificates export as XML, and instruments, due lists and summaries export as CSV. Deletion policy follows your privacy documentation and applicable regulation.",
            },
          ].map((f, i) => (
            <Card key={i}>
              <details className="group">
                <summary className="faq-summary flex items-center justify-between gap-4 px-5 py-4">
                  <span className="text-[14.5px] font-medium text-text">{f.q}</span>
                  <span
                    aria-hidden
                    className="mono shrink-0 text-cobalt transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="border-t border-border px-5 py-4 text-[14px] leading-relaxed text-muted">
                  {f.a}
                </p>
              </details>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-between gap-4 rounded border border-border bg-surface px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-text">Something not covered?</p>
            <p className="mt-1 text-[13px] text-muted">
              Write to us — we answer with specifics, not brochures.
            </p>
          </div>
          <Button href="/contact" variant="secondary">
            Contact page
          </Button>
        </div>
      </MarketingSection>
    </>
  );
}
