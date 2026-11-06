import CertificatePreview from "@/components/CertificatePreview";
import { BulletList, Eyebrow, FeatureGrid, MarketingSection, PageHero } from "@/components/marketing";
import { Card } from "@/components/ui";

export const metadata = { title: "Digital Calibration — CalibraGraph" };

export default function DigitalCalibrationPage() {
  return (
    <>
      <PageHero
        eyebrow="Digital calibration"
        title="A Digital Calibration Certificate you can read twice and verify once"
        lede="CalibraGraph issues certificates as structured documents following the PTB DCC schema (dcc:v3.3.0, XSD-validated). The same structured data renders the certificate view, powers the exports and anchors the digest — one source, every surface."
      />

      <MarketingSection
        eyebrow="Document structure"
        title="What one certificate contains"
        intro="Fields map to what an assessor expects to read on paper — because the data model was designed with existing certificates on the desk, not around a database schema."
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <FeatureGrid
            columns={2}
            items={[
              { title: "Header block", body: "Certificate number, revision, status and a verification link. The number follows the convention DCC-<LAB>-<YEAR>-<SEQ>." },
              { title: "Administrative data", body: "Issuing laboratory, issuer, responsible signatory (with registry ID), calibration date and the customer/owner to whom the result is reported." },
              { title: "Instrument block", body: "Instrument name, model and serial in a fixed-width typeface, plus measurement function and range — identification is never prose." },
              { title: "Measurement results", body: "A table: measured point, reference value, indicated value, error, expanded uncertainty U(k = 2) — right-aligned, tabular, units per column." },
              { title: "Uncertainty statement", body: "Expanded uncertainty with coverage factor and coverage probability, plus the distribution model — stated once, legibly, in words as well as numbers." },
              { title: "Evidence anchors", body: "Reference standard with its own chain to a national standard, environmental conditions, procedure reference, SHA-256 digests and the anchoring transaction." },
            ]}
          />
          <div>
            <CertificatePreview compact showVerifiedBadge />
            <p className="mt-3 text-[12px] text-muted">
              A live sample certificate rendered from the same structured data —
              one record, no separate marketing rendering.
            </p>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Lifecycle"
        title="Issue, revision and end of life — with every state kept"
        intro="Calibration certificates move through a small, strict lifecycle. CalibraGraph treats transitions as structured events so the history of a certificate is as auditable as its content."
      >
        <BulletList
          items={[
            {
              lead: "Draft → issuance.",
              body: "During drafting, administrative metadata may be edited — measurement values are already read-only shown with an explicit note that values are immutable after issuance. An authorised signer approves with the statement “I am an authorised issuer for this laboratory”, and the certificate becomes issued.",
            },
            {
              lead: "Revision.",
              body: "If a correction is ever needed — e.g. a typo in an administrative field that requires a formal change — a new revision is issued that explicitly supersedes the old one. The old revision is never deleted; it stays marked as superseded with a link forward.",
            },
            {
              lead: "Moderation of status.",
              body: "A certificate can be formally revoked or simply reach its due date. Expired certificates stop being “current” automatically, and instruments whose due date has passed are marked overdue in every view that matters.",
            },
            {
              lead: "Export and archival.",
              body: "Certificates export as schema-conformant XML at any time. Downloads include the digest so an archive can re-run integrity checks without the platform.",
            },
          ]}
        />
      </MarketingSection>

      <MarketingSection
        eyebrow="Ingestion"
        title="Onboarding existing certificates: the XML wizard"
        intro="Laboratories with existing DCC documents do not need to re-type them. Ingestion is a four-step, client-side wizard: upload → validation → field review → issue."
      >
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { step: "1", title: "Upload", body: "Drag-and-drop a .xml document; the selected file is shown with size and name before processing." },
            { step: "2", title: "Validate", body: "Schema version is detected (dcc:v3.3.0); XSD validation produces a finding report with severities — error, warning, info." },
            { step: "3", title: "Review", body: "Extracted administrative fields appear in editable inputs; measurement values are shown read-only with a note that values are immutable after issuance." },
            { step: "4", title: "Issue", body: "An approval statement and an explicit “Issue certificate” action. Nothing is issued without the authorisation checkbox." },
          ].map((s) => (
            <Card key={s.step} className="p-5">
              <p className="mono text-lg font-semibold text-cobalt">{s.step}</p>
              <h3 className="mt-2 text-sm font-semibold text-text">{s.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{s.body}</p>
            </Card>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/app/certificates/import"
            className="inline-flex items-center justify-center rounded border border-white/15 bg-gradient-to-r from-violet via-blue to-cyan px-3.5 py-2 text-sm font-medium text-white shadow-glow transition-all hover:brightness-110"
          >
            Open the ingestion wizard
          </a>
        </div>
      </MarketingSection>

      <MarketingSection eyebrow="Copying rights" title="What the recipient may rely on" className="pb-4">
        <FeatureGrid
          columns={3}
          items={[
            { title: "Right values, right units", body: "Every numeric field carries a unit annotation; the DCC structure forbids unit-free numbers, and so does the UI." },
            { title: "Coverage stated per certificate", body: "U is always given with k and the coverage level — a value without its coverage factor is not a result." },
            { title: "Conditions attached", body: "Temperature, humidity and, where relevant, pressure are recorded as certificate-level conditions, because they moved the result and the reader deserves to see them." },
          ]}
        />
      </MarketingSection>
    </>
  );
}

