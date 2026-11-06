"use client";

import { useState } from "react";
import { Eyebrow, MarketingSection, PageHero } from "@/components/marketing";
import { Button, Card, Field } from "@/components/ui";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Discuss instruments, laboratories or a pilot"
        lede="Whether you work in an accredited laboratory, run instruments in production or audit records, tell us where calibration evidence hurts. This form is wired to a log — submissions get logged and are responded to in written form."
      />

      <MarketingSection eyebrow="Form" title="Send a message" className="border-t-0">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <Card className="p-6">
            {submitted ? (
              <div className="py-8 text-center">
                <p className="text-lg font-semibold text-text">Message logged</p>
                <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-muted">
                  Your submission has been logged with a timestamp. We reply by
                  email with specifics — whenever the question involves
                  measurement values, we prefer to look at a real record first.
                </p>
                <Button variant="secondary" className="mt-6" onClick={() => setSubmitted(false)}>
                  Compose another message
                </Button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="grid gap-5"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Name" htmlFor="c-name" required>
                    <input id="c-name" name="name" type="text" className="field-input" autoComplete="name" placeholder="Dr. Anja Hofmann" required />
                  </Field>
                  <Field label="Email" htmlFor="c-email" required>
                    <input id="c-email" name="email" type="email" className="field-input" autoComplete="email" placeholder="a.hofmann@example.org" required />
                  </Field>
                </div>
                <Field label="Organisation" htmlFor="c-org" hint="Laboratory, company or institution">
                  <input id="c-org" name="organisation" type="text" className="field-input" autoComplete="organization" placeholder="Rhein Metrology Laboratory" />
                </Field>
                <Field label="Message" htmlFor="c-msg" required>
                  <textarea
                    id="c-msg"
                    name="message"
                    rows={6}
                    className="field-input resize-y"
                    placeholder="We operate 40 instruments across two production sites and need traceable calibration history with due-date control…"
                    required
                  />
                </Field>
                <div className="rounded border border-border bg-bg px-4 py-3 text-[12.5px] leading-relaxed text-muted">
                  Submissions are logged with a timestamp for follow-up. We do not
                  forward your details to third parties; see the{" "}
                  <a href="/privacy" className="text-cobalt underline underline-offset-4">
                    privacy statement
                  </a>
                  .
                </div>
                <div>
                  <Button type="submit" size="lg">
                    Log message
                  </Button>
                </div>
              </form>
            )}
          </Card>

          <Card className="p-6">
            <Eyebrow>Direct</Eyebrow>
            <ul className="mt-3 space-y-3 text-[14px] text-muted">
              <li>
                <span className="font-medium text-text">General</span>
                <br />
                hello@calibragraph.example
              </li>
              <li>
                <span className="font-medium text-text">Laboratory onboarding</span>
                <br />
                labs@calibragraph.example
              </li>
              <li>
                <span className="font-medium text-text">Verification & audit questions</span>
                <br />
                Use the{" "}
                <a href="/app/verification" className="text-cobalt underline underline-offset-4">
                  verification page
                </a>{" "}
                for instant certificate checks.
              </li>
            </ul>
            <div className="mt-6 border-t border-border pt-5">
              <Eyebrow>What helps us help you</Eyebrow>
              <ul className="mt-3 space-y-2 text-[13px] text-muted">
                <li>• Approximate count of instruments and laboratories</li>
                <li>• Calibration interval practices (fixed? based on usage?)</li>
                <li>• Existing certificate format (paper scans? DCC XML? PDFs?)</li>
                <li>• Audit schedule that pressures you most, and when</li>
              </ul>
            </div>
          </Card>
        </div>
      </MarketingSection>
    </>
  );
}
