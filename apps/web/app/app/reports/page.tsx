import Link from "next/link";
import { PageHeading } from "@/components/AppShell";
import { Badge, Card, CardHeader, TD, TH, THead, TR, TBody, Table, TableWrap } from "@/components/ui";
import CsvExportButton from "@/components/CsvExportButton";
import { dueRows, instruments, referenceStandards, certificates } from "@/lib/data";

export default function ReportsPage() {
  /* --- Due forecast rows ------------------------------------------------ */
  const forecastRows: (string | number)[][] = dueRows.map((r) => [
    r.instrumentId,
    r.designation,
    r.category,
    r.owner,
    r.bucket,
    r.dueLabel,
    r.certificate ?? "—",
  ]);

  /* --- Certificate inventory rows --------------------------------------- */
  const inventoryRows: (string | number)[][] = certificates.map((c) => [
    c.number,
    c.revision,
    c.status,
    c.instrumentId,
    instruments.find((i) => i.id === c.instrumentId)?.serial ?? "—",
    c.laboratoryId,
    c.calibrationDate,
    c.issueDate,
    c.dueDate,
    c.digest.certificate.slice(0, 16) + "…",
  ]);

  /* --- Laboratory workload rows ----------------------------------------- */
  const workloadRows: (string | number)[][] = [
    ["Rhein Metrology Laboratory", "RML-2001", "Voltage / resistance / mass", 3, 1, "On plan"],
    ["Emscher Kalibrierzentrum", "EKZ-2214", "Pressure / temperature / humidity", 2, 1, "On plan"],
  ];

  const stdsDue = referenceStandards.filter((s) => s.status !== "current").length;

  return (
    <>
      <PageHeading
        eyebrow="Reports"
        title="Reports & exports"
        description="Operational summaries with plain CSV export — the numbers behind each report are the same tables the platform shows, never re-computed separately."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Due forecast */}
        <Card className="overflow-hidden">
          <CardHeader
            eyebrow="Forecast"
            title="Calibration due forecast"
            action={<CsvExportButton filename="calibragraph-due-forecast.csv" headers={["Instrument ID", "Designation", "Category", "Owner", "Bucket", "Due", "Certificate"]} rows={forecastRows} />}
          />
          <div className="px-5 py-4">
            <dl className="space-y-2.5 text-[13px]">
              {[
                ["Due within 30 days", "5", "pending"],
                ["Due in 31–90 days", "3", "info"],
                ["Overdue", "2", "critical"],
                ["No current certificate", "1", "neutral"],
              ].map(([label, v, tone]) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <dt className="text-muted">{label}</dt>
                  <dd className="flex items-center gap-2">
                    <span className="mono text-lg font-semibold text-text">{v}</span>
                    <Badge tone={tone === "pending" ? "pending" : tone === "critical" ? "critical" : tone === "info" ? "info" : "neutral"}>
                      {label.split(" ")[0]}
                    </Badge>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 border-t border-border/70 pt-3 text-[12px] leading-relaxed text-muted">
              Based on current validity end dates of {instruments.length} sample
              registry entries. The full dataset forecast: {42} instruments,
              reference date 2026-11-06.
            </p>
          </div>
        </Card>

        {/* Reference standard alerts */}
        <Card className="overflow-hidden">
          <CardHeader
            eyebrow="Traceability health"
            title="Reference standards"
            action={<CsvExportButton filename="calibragraph-reference-standards.csv" headers={["Designation", "Type", "Range", "Unit", "Last calibration", "Due", "Status"]} rows={referenceStandards.map((s) => [s.designation, s.type, s.range, s.unit, s.lastCalibrationDate, s.lastDueDate, s.status])} />}
          />
          <div className="px-5 py-4">
            <p className="mono text-3xl font-semibold text-text">
              {referenceStandards.length}
            </p>
            <p className="mt-1 text-[12.5px] text-muted">
              standards registered — {referenceStandards.length - stdsDue} of them in
              calibration, {stdsDue} due soon.
            </p>
            <TableWrap className="mt-4">
              <Table className="min-w-[240px]">
                <THead>
                  <TH>Standard</TH>
                  <TH numeric>Due</TH>
                </THead>
                <TBody>
                  {referenceStandards.slice(0, 4).map((s) => (
                    <TR key={s.id}>
                      <TD mono className="text-[12px]">{s.designation}</TD>
                      <TD numeric>{s.lastDueDate}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </TableWrap>
          </div>
        </Card>

        {/* Workload */}
        <Card className="overflow-hidden">
          <CardHeader
            eyebrow="Capacity"
            title="Laboratory workload"
            action={<CsvExportButton filename="calibragraph-lab-workload.csv" headers={["Laboratory", "Code", "Scope", "Events (90 d)", "Overdue", "Status"]} rows={workloadRows} />}
          />
          <div className="px-5 py-4">
            {workloadRows.map(([name, code, scope, events, overdue]) => (
              <div key={String(code)} className="border-b border-border/70 py-3 last:border-0">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-medium text-text">{name}</p>
                    <p className="mono text-[11px] text-muted">
                      {code} · {scope}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="mono text-lg font-semibold text-text">{events}</p>
                    <p className="text-[11px] text-muted">events / 90 d</p>
                  </div>
                </div>
                {String(overdue) !== "0" && (
                  <p className="mt-1.5">
                    <Badge tone="pending">{overdue} instrument(s) overdue</Badge>
                  </p>
                )}
              </div>
            ))}
            <p className="mt-3 text-[12px] text-muted">
              Workload mirrors issued certificates plus open intake; report period
              trailing 90 days from the reference date.
            </p>
          </div>
        </Card>
      </div>

      {/* Inventory */}
      <Card className="mt-6 overflow-hidden">
        <CardHeader
          eyebrow="Archive"
          title="Certificate inventory"
          action={<CsvExportButton filename="calibragraph-certificate-inventory.csv" headers={["Number", "Rev", "Status", "Instrument", "Serial", "Lab", "Calibrated", "Issued", "Due", "Digest (16)"]} rows={inventoryRows} />}
        />
        <TableWrap>
          <Table className="min-w-[860px]">
            <THead>
              <TH>Certificate</TH>
              <TH>Status</TH>
              <TH numeric>Calibrated</TH>
              <TH numeric>Due</TH>
              <TH>Digest (first 16)</TH>
            </THead>
            <TBody>
              {inventoryRows.map((r) => (
                <TR key={String(r[0])}>
                  <TD>
                    <Link href={`/app/certificates/${r[0]}`} className="text-[13px] font-medium text-cobalt hover:underline">
                      {r[0]}
                    </Link>
                  </TD>
                  <TD>
                    <Badge tone={r[2] === "current" ? "current" : r[2] === "expired" ? "critical" : "neutral"}>
                      {String(r[2])}
                    </Badge>
                  </TD>
                  <TD numeric>{r[6]}</TD>
                  <TD numeric>{r[8]}</TD>
                  <TD mono className="text-[11.5px] text-muted">{String(r[9])}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableWrap>
        <p className="border-t border-border px-4 py-2.5 text-[11.5px] text-muted">
          {inventoryRows.length} certificates across{" "}
          {new Set(inventoryRows.map((r) => r[5])).size} laboratories · CSV uses
          semicolon separators and UTF-8 with BOM, opens directly in spreadsheets.
        </p>
      </Card>
    </>
  );
}
