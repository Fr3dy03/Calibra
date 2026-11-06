import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/AppShell";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  KeyValueList,
  TD,
  TH,
  THead,
  TR,
  TBody,
  Table,
  TableWrap,
  statusTone,
} from "@/components/ui";
import TraceabilityGraph from "@/app/components/TraceabilityGraph";
import {
  certificates,
  flukeTraceEdges,
  flukeTraceNodes,
  instrumentById,
  laboratoryById,
} from "@/lib/data";

const navigationSections = [
  ["overview", "Overview"],
  ["specifications", "Specifications"],
  ["history", "Calibration history"],
  ["current", "Current certificate"],
  ["standards", "Reference standards"],
  ["files", "Certificate files"],
  ["owner", "Owner history"],
  ["due", "Upcoming due date"],
  ["audit", "Audit history"],
];

export default function InstrumentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const instrument = instrumentById(params.id);
  if (!instrument || instrument.id !== "INS-0101") notFound();

  const certs = certificates
    .filter((c) => c.instrumentId === instrument.id)
    .sort((a, b) => b.calibrationDate.localeCompare(a.calibrationDate));
  const current = certs.find((c) => c.status === "current");
  const lab = current ? laboratoryById(current.laboratoryId) : undefined;

  return (
    <>
      <PageHeading
        eyebrow={`Instrument ${instrument.id} · ${instrument.category}`}
        title={instrument.name}
        description={`Registered ${instrument.registeredOn} · Asset ${instrument.assetRef}`}
        actions={
          <>
            <Button href={`/app/certificates/${current?.number ?? ""}`} variant="secondary" size="sm">
              Open current certificate
            </Button>
            <Button href="/app/calibrations/due" variant="secondary" size="sm">
              Due queue
            </Button>
          </>
        }
      />

      {/* Status strip */}
      <Card className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Serial</p>
          <p className="mono text-[13px] font-semibold text-text">{instrument.serial}</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">State</p>
          <Badge tone="info">In use</Badge>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Certificate</p>
          {current ? (
            <Badge tone="current">Current · valid to {current.dueDate}</Badge>
          ) : (
            <Badge tone="critical">None on record</Badge>
          )}
        </div>
      </Card>

      {/* Section navigation */}
      <nav aria-label="Sections" className="mb-6 flex flex-wrap gap-2">
        {navigationSections.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="rounded border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-muted transition-colors hover:border-cobalt hover:text-cobalt"
          >
            {label}
          </a>
        ))}
      </nav>

      {/* Overview */}
      <section id="overview" className="mb-8 scroll-mt-24">
        <Card className="overflow-hidden">
          <CardHeader eyebrow="Overview" title="Instrument at a glance" />
          <KeyValueList
            className="py-5"
            items={[
              {
                label: "Instrument",
                value: (
                  <span>
                    {instrument.manufacturer} {instrument.model} —{" "}
                    {instrument.name.replace(`${instrument.manufacturer} `, "")}
                  </span>
                ),
              },
              { label: "Function", value: <span className="mono">{instrument.func}</span> },
              {
                label: "Serial reference",
                value: (
                  <span className="mono">
                    {instrument.serial}{" "}
                    <span className="text-muted">(masked: {instrument.serialMasked})</span>
                  </span>
                ),
              },
              { label: "Asset reference", value: <span className="mono">{instrument.assetRef}</span> },
              { label: "Location", value: instrument.location },
              { label: "Owner", value: instrument.owner },
              { label: "Registered", value: <span className="mono">{instrument.registeredOn}</span> },
              { label: "Operation status", value: "In use" },
            ]}
          />
        </Card>
      </section>

      {/* Traceability graph */}
      <section className="mb-8">
        <Card className="overflow-hidden">
          <CardHeader
            eyebrow="Signature feature"
            title="TraceabilityGraph — evidence chain for this instrument"
            action={
              <Link href="/app/traceability" className="text-[12px] font-medium text-cobalt hover:underline">
                All standards →
              </Link>
            }
          />
          <div className="bg-bg p-4 sm:p-6">
            <TraceabilityGraph nodes={flukeTraceNodes} edges={flukeTraceEdges} />
          </div>
        </Card>
      </section>

      {/* Specifications */}
      <section id="specifications" className="mb-8 scroll-mt-24">
        <Card className="overflow-hidden">
          <CardHeader eyebrow="Specifications" title="Measurement capability" />
          <TableWrap>
            <Table className="min-w-[520px]">
              <THead>
                <TH>Parameter</TH>
                <TH>Value</TH>
                <TH>Unit</TH>
              </THead>
              <TBody>
                <TR>
                  <TD>Measurement function</TD>
                  <TD mono>{instrument.func}</TD>
                  <TD mono>—</TD>
                </TR>
                <TR>
                  <TD>Range (minimum)</TD>
                  <TD mono>{instrument.rangeMin}</TD>
                  <TD mono>{instrument.unit}</TD>
                </TR>
                <TR>
                  <TD>Range (maximum)</TD>
                  <TD mono>{instrument.rangeMax}</TD>
                  <TD mono>{instrument.unit}</TD>
                </TR>
                <TR>
                  <TD>Resolution</TD>
                  <TD mono>{instrument.resolution}</TD>
                  <TD mono>1 µV best case</TD>
                </TR>
                <TR>
                  <TD>Calibration uncertainty (worst case, per current certificate)</TD>
                  <TD mono>11.5</TD>
                  <TD mono>µV/V (k = 2)</TD>
                </TR>
              </TBody>
            </Table>
          </TableWrap>
        </Card>
      </section>

      {/* Calibration history */}
      <section id="history" className="mb-8 scroll-mt-24">
        <Card className="overflow-hidden">
          <CardHeader eyebrow="Calibration history" title="Certificates for this instrument" />
          <TableWrap>
            <Table className="min-w-[680px]">
              <THead>
                <TH>Certificate</TH>
                <TH>Status</TH>
                <TH>Calibrated</TH>
                <TH>Laboratory</TH>
                <TH numeric>Valid until</TH>
              </THead>
              <TBody>
                {certs.map((c) => (
                  <TR key={c.id}>
                    <TD>
                      <Link href={`/app/certificates/${c.number}`} className="text-[13px] font-medium text-cobalt hover:underline">
                        {c.number}
                      </Link>
                      <p className="mono mt-0.5 text-[11px] text-muted">rev {c.revision}</p>
                    </TD>
                    <TD>
                      <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                      {c.supersededBy && (
                        <p className="mono mt-0.5 text-[10.5px] text-muted">→ {c.supersededBy}</p>
                      )}
                    </TD>
                    <TD mono>{c.calibrationDate}</TD>
                    <TD>{c.laboratoryId === "LAB-RML-2001" ? "Rhein Metrology Laboratory" : "Emscher Kalibrierzentrum"}</TD>
                    <TD numeric>{c.dueDate}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableWrap>
          {certs.length === 0 && <EmptyState title="No calibration events yet" />}
        </Card>
      </section>

      {/* Current certificate */}
      <section id="current" className="mb-8 scroll-mt-24">
        <Card className="overflow-hidden">
          <CardHeader eyebrow="Current certificate" title="Result in force" />
          {current && lab ? (
            <KeyValueList
              className="py-5"
              items={[
                {
                  label: "Certificate number",
                  value: (
                    <Link href={`/app/certificates/${current.number}`} className="mono text-cobalt hover:underline">
                      {current.number}
                    </Link>
                  ),
                },
                { label: "Revision", value: <span className="mono">{current.revision}</span> },
                { label: "Laboratory", value: <span>{lab.name} · <span className="mono">{lab.code}</span></span> },
                { label: "Responsible signatory", value: current.responsiblePerson },
                { label: "Calibration date", value: <span className="mono">{current.calibrationDate}</span> },
                { label: "Issue date", value: <span className="mono">{current.issueDate}</span> },
                {
                  label: "Uncertainty",
                  value: (
                    <span className="mono">
                      U = {current.uncertaintyStatement.expanded} ({current.uncertaintyStatement.coverageFactor}, ~95 %)
                    </span>
                  ),
                },
                { label: "Procedure", value: current.procedure },
              ]}
            />
          ) : (
            <EmptyState title="No current certificate" note="Queue this instrument for calibration." />
          )}
        </Card>
      </section>

      {/* Reference standards used */}
      <section id="standards" className="mb-8 scroll-mt-24">
        <Card className="overflow-hidden">
          <CardHeader eyebrow="Reference standards" title="Calibration was performed against" />
          <TableWrap>
            <Table className="min-w-[560px]">
              <THead>
                <TH>Standard</TH>
                <TH>Type</TH>
                <TH numeric>Uncertainty</TH>
                <TH>Last cal.</TH>
                <TH>Traceable to</TH>
              </THead>
              <TBody>
                <TR>
                  <TD mono>RML Ref RM-0151</TD>
                  <TD>10 V DC voltage standard</TD>
                  <TD numeric>1.2 µV/V (k = 2)</TD>
                  <TD mono>2025-10-02</TD>
                  <TD>PTB — Josephson array voltage standard</TD>
                </TR>
                <TR>
                  <TD mono>RML Ref RC-0088</TD>
                  <TD>10 kΩ resistance standard (used for internal-resistance checks)</TD>
                  <TD numeric>0.42 µΩ/Ω (k = 2)</TD>
                  <TD mono>2025-01-22</TD>
                  <TD>PTB — quantum Hall resistance standard</TD>
                </TR>
              </TBody>
            </Table>
          </TableWrap>
        </Card>
      </section>

      {/* Certificate files */}
      <section id="files" className="mb-8 scroll-mt-24">
        <Card className="overflow-hidden">
          <CardHeader eyebrow="Certificate files" title="Documents & exports" />
          <TableWrap>
            <Table className="min-w-[520px]">
              <THead>
                <TH>File</TH>
                <TH>Format</TH>
                <TH>Description</TH>
              </THead>
              <TBody>
                {[
                  ["dcc-rml-2026-0417.xml", "DCC XML (v3.3.0)", "Schema-conformant structured certificate, digest-referenced"],
                  ["dcc-rml-2026-0417.pdf", "Print rendering", "Paper-shaped view of the same structured record"],
                  ["dcc-rml-2025-0583.xml", "DCC XML (v3.3.0)", "Superseded revision — retained permanently"],
                ].map(([file, fmt, desc]) => (
                  <TR key={file}>
                    <TD mono>{file}</TD>
                    <TD>
                      <Badge tone="info">{fmt}</Badge>
                    </TD>
                    <TD className="text-muted">{desc}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableWrap>
        </Card>
      </section>

      {/* Owner history */}
      <section id="owner" className="mb-8 scroll-mt-24">
        <Card className="overflow-hidden">
          <CardHeader eyebrow="Owner history" title="Custody of record" />
          <TableWrap>
            <Table className="min-w-[520px]">
              <THead>
                <TH>From</TH>
                <TH>To</TH>
                <TH>Owner</TH>
                <TH>Location</TH>
              </THead>
              <TBody>
                <TR>
                  <TD mono>2024-01-18</TD>
                  <TD mono>2024-06-30</TD>
                  <TD>M. Oxford — Incoming Goods</TD>
                  <TD>Bay 1 — QC station A</TD>
                </TR>
                <TR>
                  <TD mono>2024-07-01</TD>
                  <TD mono>present</TD>
                  <TD>J. Weber — Production QC</TD>
                  <TD>Bay 3 — Bench L2</TD>
                </TR>
              </TBody>
            </Table>
          </TableWrap>
        </Card>
      </section>

      {/* Upcoming due date */}
      <section id="due" className="mb-8 scroll-mt-24">
        <Card className="overflow-hidden border-ochre/30">
          <CardHeader eyebrow="Upcoming due date" title="Validity planning" />
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5">
            <div>
              <p className="mono text-2xl font-semibold text-text">{instrument.nextDue}</p>
              <p className="mt-1 text-[13px] text-muted">
                Approximately 125 days from today (2026-11-06). The instrument appears
                in the due dashboard 90 days before this date and triggers reminders
                at 30 / 14 / 7 days per the organisation notification policy.
              </p>
            </div>
            <Badge tone="current">Scheduling not required yet</Badge>
          </div>
        </Card>
      </section>

      {/* Audit history */}
      <section id="audit" className="mb-8 scroll-mt-24">
        <Card className="overflow-hidden">
          <CardHeader eyebrow="Audit history" title="Record-level events" />
          <TableWrap>
            <Table className="min-w-[560px]">
              <THead>
                <TH>Timestamp (UTC)</TH>
                <TH>Actor</TH>
                <TH>Event</TH>
              </THead>
              <TBody>
                {[
                  ["2026-03-16 14:22", "System / anchor worker", "Digest anchored on BOT Chain Testnet, block 3804151"],
                  ["2026-03-16 13:58", "Dr. Anja Hofmann", "Certificate DCC-RML-2026-0417 issued (rev 1)"],
                  ["2026-03-13 10:41", "Stefan Klein", "Measurement data finalised — values locked"],
                  ["2025-03-17 09:12", "Dr. Anja Hofmann", "Certificate DCC-RML-2025-0583 superseded by rev 2026 record"],
                  ["2024-01-18 08:30", "J. Weber", "Instrument registered by owner transfer"],
                ].map(([t, actor, ev]) => (
                  <TR key={t}>
                    <TD mono>{t}</TD>
                    <TD>{actor}</TD>
                    <TD className="text-muted">{ev}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableWrap>
        </Card>
      </section>
    </>
  );
}
