import { Copy, Eyebrow, MarketingSection, PageHero } from "@/components/marketing";

export const metadata = { title: "Terms — CalibraGraph" };

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Terms"
        title="Terms of use"
        lede="The workable rules for using CalibraGraph: what the platform records, what verifiers may rely on, and who keeps responsibility for the metrology itself."
      />

      <MarketingSection eyebrow="1 · Scope" title="What these terms cover" className="border-t-0">
        <Copy>
          <p>
            These terms govern the use of the CalibraGraph demonstration pages
            (marketing site and sample application). In an operated deployment, a
            laboratory agreement governs issuance rights, custody and service
            levels; this page then covers the public surfaces — marketing pages and
            certificate verification — which remain open to any visitor.
          </p>
        </Copy>
      </MarketingSection>

      <MarketingSection eyebrow="2 · Nature of records" title="Records, not measurements">
        <Copy>
          <p>
            CalibraGraph stores and presents structured records of instruments,
            calibration events, certificates, laboratories and reference
            standards, and the relationships among them. The platform does not
            perform measurements, does not evaluate your measurement process and
            does not certify competence. A “Verified” result on the verification
            page means: the record exists, its digest recomputes, the signer
            resolves against the laboratory's registry and the anchor matches. It
            says nothing about whether the printed measurand was measured well —
            that judgment belongs to accredited laboratory assessment.
          </p>
          <p>
            Measurement values, uncertainties and conditions on an issued
            certificate are immutable by design; corrections arrive as new
            revisions that explicitly supersede earlier ones, which remain visible
            and marked as superseded.
          </p>
        </Copy>
      </MarketingSection>

      <MarketingSection eyebrow="3 · Issuance authority" title="Authorised signers only">
        <Copy>
          <p>
            The “Issue certificate” action requires the issuing actor to affirm
            being an authorised issuer for the laboratory, and the responsible
            signatory must exist in that laboratory's approved personnel registry.
            Misuse of issuance authority is a serious matter: it corrupts the
            evidence chain the laboratory depends on and will be treated as such
            in an operated deployment — including revocation of the affected
            certificates and preservation of the supersession history.
          </p>
        </Copy>
      </MarketingSection>

      <MarketingSection eyebrow="4 · Demo data" title="Nothing here is a real certificate">
        <Copy>
          <p>
            Every laboratory, instrument, serial, certificate, digest, block and
            transaction identifier shown in
            this demonstration is simulated and
            plausible, not actual. Accreditation references marked “simulated”
            illustrate the format used by ILAC-MRA-style endorsements. Do
            not rely on any demo record for operational or contractual purposes — that is
            what the word “demo” on the workspace tag is for.
          </p>
        </Copy>
      </MarketingSection>

      <MarketingSection eyebrow="5 · Intellectual property" title="Yours stays yours">
        <Copy>
          <p>
            You retain all rights in your instrument data, certificates and
            laboratory records produced with the platform. The software, the
            marketing materials and the design system remain the property of the
            platform operator. Exporting XML or CSV is unrestricted: there is no
            lock-in mechanism and, in an operated deployment, none will be added
            to exports covered by the laboratory agreement.
          </p>
        </Copy>
      </MarketingSection>

      <MarketingSection eyebrow="6 · Availability & changes" title="An honest paragraph" className="pb-4">
        <Copy>
          <p>
            The demonstration may change without notice as the interface evolves.
            Anchoring on BOT Chain Testnet exists to exercise the mechanism; in an
            operated deployment the network, anchoring cadence and explorer
            references will be documented and stable changes announced. Where
            these terms and a laboratory agreement conflict, the agreement wins —
            the point of the agreement is clarity, not loophole-finding.
          </p>
        </Copy>
      </MarketingSection>
    </>
  );
}
