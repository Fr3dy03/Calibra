import { Eyebrow, MarketingSection, PageHero } from "@/components/marketing";
import { Button, Card } from "@/components/ui";

export const metadata = { title: "FAQ — CalibraGraph" };

const faqs: { q: string; a: React.ReactNode }[] = [
  {
    q: "What is the difference between an instrument record, a calibration record and a certificate?",
    a: (
      <>
        An instrument record is the registry entry that identifies the device —
        manufacturer, model, serial reference, function, range, location, owner.
        A calibration record is one service event for that instrument. A
        certificate is the structured document that results from the event and is
        issued and anchored — with the measurement table, uncertainties,
        conditions and digests. An instrument has one record and many
        calibration events; each event has at most one current certificate.
      </>
    ),
  },
  {
    q: "Who may issue or sign a certificate?",
    a: "Only laboratory personnel listed in that laboratory's approved signer registry — name, role, staff identifier and signature scheme on record — and the issuing actor must affirm the authorisation statement at issue time. Certificates cannot name a signer who is not registered, and registry entries carry their authorisation date.",
  },
  {
    q: "What happens when a serial is printed? Can instruments and certificates get mixed up?",
    a: (
      <>
        Serial identity is a stored field used consistently across the registry,
        certificates, verification and QR links; a mismatch at intake is a data
        problem you will see immediately rather than a silent rewriting.
        Verification resolves a certificate ID to exactly one record, and the
        serial shown in the public view may be masked (e.g.{" "}
        <code className="mono">2451***21</code>) while remaining unique in the
        registry.
      </>
    ),
  },
  {
    q: "How is “due” computed and displayed?",
    a: "Every instrument with a current certificate has a validity end date. The dashboard groups instruments into 7/30/60/90-day lapses, plus overdue and no-current-certificate queues. A notification policy per organisation can send reminders at 30, 14 and 7 days before due; the due dashboard shows counts per group and the rows behind every count.",
  },
  {
    q: "Is the demo dataset real?",
    a: "It is representative and internally consistent, but it is a demo: figures, accreditation references and anchoring blocks illustrate the interface — with every simulated reference labelled as simulated. It exists so each screen can show real-looking states (an overdue balance, a superseded revision, a due-soon pressure gauge) instead of empty tables.",
  },
  {
    q: "How do we integrate CalibraGraph with our asset management or ERP?",
    a: (
      <>
        Start with the exports: certificate XML per the DCC schema and CSV for
        tables. Asset references and owner fields on the instrument registry match
        the fields most asset systems carry, so synchronization stays a mapping
        exercise on your side. API access is on the roadmap — the settings page
        already reserves the place where keys will live.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Answers, with the caveats included"
        lede="Questions from laboratory staff, quality managers and procurement — answered as we answer them in writing."
      />

      <MarketingSection eyebrow="Questions" title="Six answers" className="border-t-0">
        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((f, i) => (
            <Card key={i}>
              <details className="group" open={i === 0}>
                <summary className="faq-summary flex items-center justify-between gap-4 px-5 py-4">
                  <span className="text-[14.5px] font-medium text-text">{f.q}</span>
                  <span aria-hidden className="mono shrink-0 text-cobalt transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="border-t border-border px-5 py-4 text-[14px] leading-relaxed text-muted [&_code]:mono [&_code]:rounded [&_code]:bg-bg [&_code]:px-1 [&_code]:text-[12.5px] [&_code]:text-text">
                  {f.a}
                </div>
              </details>
            </Card>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection eyebrow="Still open?" title="Write us — we answer with specifics" className="pb-4">
        <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <Eyebrow>Contact</Eyebrow>
            <p className="mt-1 text-sm text-muted">
              Tell us which instruments you need to put under control, and how
              many laboratories are involved. Submissions get logged and answered.
            </p>
          </div>
          <Button href="/contact" variant="secondary">
            Open the contact form
          </Button>
        </Card>
      </MarketingSection>
    </>
  );
}
