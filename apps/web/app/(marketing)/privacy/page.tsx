import { Copy, Eyebrow, MarketingSection, PageHero } from "@/components/marketing";

export const metadata = { title: "Privacy — CalibraGraph" };

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Privacy"
        title="Privacy statement"
        lede="What CalibraGraph collects, retains and exposes — written to be read, not to be survived in court."
      />

      <MarketingSection eyebrow="1 · Data collected" title="Instrument and calibration records" className="border-t-0">
        <Copy>
          <p>
            The platform stores what metrology practice requires: instrument
            identification (manufacturer, model, serial reference — full serial in
            the registry, optionally masked in public views), measurement function
            and range, location, owner and asset reference; calibration events;
            certificates with measurement values, uncertainties and environmental
            conditions; laboratory profiles including accreditation records and an
            approved signer registry (name, role, staff identifier, signature
            scheme). Contact form submissions are logged with a timestamp so we
            can follow up in writing.
          </p>
          <p>
            No special-category personal data is requested or expected. Owner
            fields may contain staff names where a work instrument is assigned to
            a person; that assignment is part of the calibration record, not a
            marketing database.
          </p>
        </Copy>
      </MarketingSection>

      <MarketingSection eyebrow="2 · On-chain anchoring" title="What leaves the platform">
        <Copy>
          <p>
            Only SHA-256 certificate digests are written to BOT Chain (testnet in
            the demo). No instrument data, no personal data, no certificates and
            no measurement values are included in anchors. A digest is a one-way
            fingerprint: from it, no information about a person, instrument or
            value can be recovered. The purpose is tamper evidence — the ability
            to prove later that an exact record layout existed at a given block.
          </p>
        </Copy>
      </MarketingSection>

      <MarketingSection eyebrow="3 · Public visibility" title="What is publicly reachable">
        <Copy>
          <p>
            Certificate verification is public by design: anyone holding a
            certificate ID or QR tag can see the verification result — issuer,
            instrument identification with masked serial where configured, scope,
            dates, status and anchor detail. Instrument registries, laboratory
            internals and full serials are inside the application surface, not the
            public pages. If your organisation requires a different disclosure
            policy, the settings surface defines mask-serial per instrument at
            registration time.
          </p>
        </Copy>
      </MarketingSection>

      <MarketingSection eyebrow="4 · Retention & export" title="Your records remain yours">
        <Copy>
          <p>
            Calibration records are retained per your request; certificates can be
            exported at any time as schema-conformant XML (PTB DCC), and tables
            (instruments, due lists, reports) as CSV. Superseded and expired
            certificates are retained rather than deleted — a calibration history
            with holes is not a history and cannot be audited.
          </p>
          <p>
            For contact form submissions: we keep the message content, the
            timestamp and the best reply channel you provided (email) until the
            conversation concludes, then for a short administrative period.
          </p>
        </Copy>
      </MarketingSection>

      <MarketingSection eyebrow="5 · Contact" title="Questions about this statement">
        <Copy>
          <p>
            Write to <span className="mono text-text">privacy@calibragraph.example</span> or use
            the contact form. We answer data-protection questions in writing, with
            references to the specific record types — never with a blurb.
          </p>
        </Copy>
      </MarketingSection>

      <MarketingSection eyebrow="Note" title="Demo status" className="pb-4">
        <p className="max-w-2xl text-[13.5px] leading-relaxed text-muted">
          This deployment is a demonstration. All organisations, laboratories,
          certificates and accreditation references in the sample dataset are
          simulated. Observation in this statement — including mask-serial and
          retention practices — will apply to the operated service; where this
          demo differs, that will be stated at the point of difference.
        </p>
      </MarketingSection>
    </>
  );
}
