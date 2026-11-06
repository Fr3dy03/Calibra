"use client";

import { useState } from "react";
import { PageHeading } from "@/components/AppShell";
import { Button, Card, CardHeader, Field } from "@/components/ui";

const categories = ["Electrical", "Pressure", "Mass", "Length", "Temperature", "Humidity"];

const manufacturerOptions = [
  "Fluke",
  "Keysight",
  "WIKA",
  "Mettler Toledo",
  "Mitutoyo",
  "Testo",
  "Tektronix",
  "Jumo",
  "Other…",
];

export default function NewInstrumentPage() {
  const [maskSerial, setMaskSerial] = useState(false);
  const [serial, setSerial] = useState("");

  const maskedPreview =
    serial.length >= 4
      ? serial.slice(0, 2) + "***" + serial.slice(-2)
      : serial
      ? serial
      : "—";

  return (
    <>
      <PageHeading
        eyebrow="Registration"
        title="Register an Instrument"
        description="Create the registry entry that calibration events and certificates will attach to. Fields marked with * are required; administrative fields can be amended later."
      />

      <form className="grid gap-6 xl:grid-cols-[1.4fr_1fr] xl:items-start" onSubmit={(e) => e.preventDefault()}>
        <Card className="overflow-hidden">
          <CardHeader eyebrow="Section 1" title="Identification" />
          <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5">
            <Field label="Instrument category" htmlFor="n-category" required>
              <select id="n-category" name="category" className="field-input" required defaultValue="">
                <option value="" disabled>
                  Select a category…
                </option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Manufacturer" htmlFor="n-manufacturer" required>
              <input
                id="n-manufacturer"
                name="manufacturer"
                list="manufacturer-options"
                className="field-input"
                placeholder="Fluke"
                required
              />
              <datalist id="manufacturer-options">
                {manufacturerOptions.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </Field>
            <Field label="Model" htmlFor="n-model" required hint="Type designation">
              <input id="n-model" name="model" className="field-input" placeholder="8846A" required />
            </Field>
            <div>
              <Field label="Serial reference" htmlFor="n-serial" required>
                <input
                  id="n-serial"
                  name="serial"
                  className="field-input mono"
                  placeholder="2451A7821"
                  value={serial}
                  onChange={(e) => setSerial(e.target.value)}
                  required
                />
              </Field>
              <label className="mt-2.5 flex items-start gap-2.5 text-[12.5px] text-muted">
                <input
                  type="checkbox"
                  className="mt-0.5 h-3.5 w-3.5 rounded border-border text-cobalt accent-cobalt"
                  checked={maskSerial}
                  onChange={(e) => setMaskSerial(e.target.checked)}
                />
                <span>
                  <strong className="font-medium text-text">Mask serial publicly</strong> — public
                  views and verification show{" "}
                  <span className="mono text-text">{maskedPreview}</span> instead of the full serial.
                  The registry keeps the complete reference.
                </span>
              </label>
            </div>
            <Field label="Owner" htmlFor="n-owner" required hint="Person or team of record">
              <input id="n-owner" name="owner" className="field-input" placeholder="J. Weber — Production QC" required />
            </Field>
            <Field label="Asset reference" htmlFor="n-asset" hint="From your asset system">
              <input id="n-asset" name="assetRef" className="field-input mono" placeholder="AST-03-4412" />
            </Field>
          </div>

          <CardHeader eyebrow="Section 2" title="Measurement capability" className="border-t border-border" />
          <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5">
            <Field label="Measurement function" htmlFor="n-func" required hint="e.g. DC voltage, gauge pressure">
              <input id="n-func" name="func" className="field-input" placeholder="DC voltage / AC voltage" required />
            </Field>
            <Field label="Resolution" htmlFor="n-resolution" hint="Smallest display step; include unit">
              <input id="n-resolution" name="resolution" className="field-input mono" placeholder="1 µV (100 mV range)" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Range minimum" htmlFor="n-min" required>
                <input id="n-min" name="rangeMin" type="number" className="field-input mono" placeholder="-1000" required />
              </Field>
              <Field label="Range maximum" htmlFor="n-max" required>
                <input id="n-max" name="rangeMax" type="number" className="field-input mono" placeholder="1000" required />
              </Field>
            </div>
            <Field label="Unit" htmlFor="n-unit" required hint="Never left without values">
              <input id="n-unit" name="unit" className="field-input mono" placeholder="V" required />
            </Field>
          </div>

          <CardHeader eyebrow="Section 3" title="Location & custody" className="border-t border-border" />
          <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5">
            <Field label="Location" htmlFor="n-location" required>
              <input id="n-location" name="location" className="field-input" placeholder="Bay 3 — Bench L2" required />
            </Field>
            <Field label="Operation status" htmlFor="n-opstatus">
              <select id="n-opstatus" name="opstatus" className="field-input" defaultValue="in-use">
                <option value="in-use">In use</option>
                <option value="in-store">In store</option>
                <option value="maintenance">In maintenance</option>
              </select>
            </Field>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-bg px-4 py-4 sm:px-5">
            <p className="text-[12px] text-muted">
              A confirmation screen shows the complete entry before it enters the registry.
            </p>
            <div className="flex gap-2">
              <Button type="reset" variant="secondary">
                Clear form
              </Button>
              <Button type="submit">Register instrument</Button>
            </div>
          </div>
        </Card>

        {/* Guidance sidebar */}
        <div className="space-y-4">
          <Card className="p-5">
            <p className="mono text-[10px] font-semibold uppercase tracking-[0.16em] text-cobalt">
              How this entry is used
            </p>
            <ul className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-muted">
              <li>
                • Calibration events attach to this entry — the calibration history
                table on the instrument detail page is built from this registry.
              </li>
              <li>
                • Certificates cite the serial reference, function and range exactly
                as stored here; keep them precise because values render in a
                fixed-width typeface for character-accurate reading.
              </li>
              <li>
                • Due-date monitoring starts with the first issued certificate; the
                instrument then appears in the due dashboard per your notification
                policy.
              </li>
              <li>
                • Asset references from your asset system stay linked so registry
                entries reconcile with procurement and maintenance lists.
              </li>
            </ul>
          </Card>
          <Card className="border-teal/25 bg-tealLight p-5">
            <p className="text-[13px] font-semibold text-teal">Privacy note</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-teal/90">
              The mask-serial option affects public and verification surfaces only.
              Operationally, staff always see the full serial to prevent
              misidentification — masking is a safeguard against leaking custody
              details, not against your own auditors.
            </p>
          </Card>
        </div>
      </form>
    </>
  );
}
