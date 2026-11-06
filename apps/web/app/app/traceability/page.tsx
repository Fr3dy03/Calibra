import { PageHeading } from "@/components/AppShell";
import { Badge, Card, CardHeader, TD, TH, THead, TR, TBody, Table, TableWrap } from "@/components/ui";
import TraceabilityGraph from "@/app/components/TraceabilityGraph";
import { flukeTraceEdges, flukeTraceNodes, referenceStandards } from "@/lib/data";

export default function TraceabilityPage() {
  return (
    <>
      <PageHeading
        eyebrow="Traceability"
        title="Reference standards & traceability"
        description="The reference standards behind every calibration result, each with its own chain to a national metrology institute — the full-page graph for the flagship instrument record, then the standards registry."
      />

      {/* Full-page graph */}
      <Card className="mb-8 overflow-hidden">
        <CardHeader
          eyebrow="Evidence chain"
          title="Instrument → calibration record → reference standard → national standard"
          action={<Badge tone="current">Deterministic · derived from records</Badge>}
        />
        <div className="p-4 sm:p-6">
          <TraceabilityGraph nodes={flukeTraceNodes} edges={flukeTraceEdges} />
        </div>
        <p className="border-t border-border px-4 py-3 text-[11.5px] text-muted">
          Rendered for the demo flagship record: digital multimeter Fluke 8846A
          (S/N 2451A7821), certificate DCC-RML-2026-0417, reference standard RML
          Ref RM-0151, traceable to PTB, operated by Rhein Metrology Laboratory.
        </p>
      </Card>

      {/* Standards registry */}
      <Card className="overflow-hidden">
        <CardHeader eyebrow="Registry" title="Reference standards" />
        <TableWrap>
          <Table className="min-w-[860px]">
            <THead>
              <TH>Standard</TH>
              <TH>Type</TH>
              <TH>Range</TH>
              <TH>Unit</TH>
              <TH numeric>Last calibration</TH>
              <TH>Traceable to</TH>
            </THead>
            <TBody>
              {referenceStandards.map((s) => (
                <TR key={s.id}>
                  <TD>
                    <span className="mono text-[13px] font-medium text-text">{s.designation}</span>
                    <p className="mono mt-0.5 text-[11px] text-muted">S/N {s.serial}</p>
                  </TD>
                  <TD>
                    <span className="text-[12.5px] text-text">{s.type}</span>
                    <p className="mt-0.5">
                      <Badge tone={s.status === "current" ? "current" : s.status === "due-soon" ? "pending" : "critical"}>
                        {s.status === "current" ? "In calibration" : s.status === "due-soon" ? "Due soon" : "Overdue"}
                      </Badge>
                    </p>
                  </TD>
                  <TD mono>{s.range}</TD>
                  <TD mono>{s.unit}</TD>
                  <TD numeric>
                    {s.lastCalibrationDate}
                    <p className="text-[11px] text-muted">due {s.lastDueDate}</p>
                  </TD>
                  <TD className="text-[12.5px] text-muted">
                    {s.traceableTo.institute.includes("PTB") ? "PTB, Braunschweig" : "METAS, Wabern"}
                    <p className="mt-0.5 text-[11px]">{s.traceableTo.nationalStandard}</p>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableWrap>
        <p className="border-t border-border px-4 py-2.5 text-[11.5px] text-muted">
          Uncertainty per standard: RM-0151 <span className="mono text-text">1.2 µV/V (k = 2)</span> ·
          PB-0412 <span className="mono text-text">6.5 Pa (k = 2)</span> · MM-0221{" "}
          <span className="mono text-text">24 µg (2 kg, k = 2)</span> · RC-0088{" "}
          <span className="mono text-text">0.42 µΩ/Ω (k = 2)</span>
        </p>
      </Card>

      <Card className="mt-8 border-cobalt/25 bg-cobaltLight/40 px-5 py-4">
        <p className="text-[13px] leading-relaxed text-text/80">
          <strong className="font-semibold text-text">How to read a chain.</strong>{" "}
          Traceability is a chain of comparisons: the instrument's indicated value was
          compared to the reference standard on a given date, under stated conditions,
          by a laboratory whose scope covers the measurement — and the standard itself
          was calibrated against a national standard within its validity window. Every
          link in the graph above cites the record that carries the evidence; the graph
          adds no claims of its own.
        </p>
      </Card>
    </>
  );
}
