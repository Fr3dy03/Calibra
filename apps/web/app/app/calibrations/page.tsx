import Link from "next/link";
import { PageHeading } from "@/components/AppShell";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  TD,
  TH,
  THead,
  TR,
  TBody,
  Table,
  TableWrap,
  statusTone,
} from "@/components/ui";
import { certificates, instrumentById } from "@/lib/data";

export default function CalibrationsPage() {
  const rows = [...certificates].sort((a, b) => b.calibrationDate.localeCompare(a.calibrationDate));

  return (
    <>
      <PageHeading
        eyebrow="Service log"
        title="Calibration records"
        description="Calibration events in chronological service order — one row per event, each linked to the certificate it produced and the instrument it served."
        actions={
          <Button href="/app/certificates/import" size="sm">
            Import calibration record
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <TableWrap>
          <Table className="min-w-[860px]">
            <THead>
              <TH>Event</TH>
              <TH>Instrument</TH>
              <TH>Laboratory · procedure</TH>
              <TH>Result</TH>
              <TH numeric>Calibrated</TH>
              <TH numeric>Due</TH>
            </THead>
            <TBody>
              {rows.map((c) => {
                const instr = instrumentById(c.instrumentId);
                return (
                  <TR key={c.id}>
                    <TD>
                      <Link href={`/app/certificates/${c.number}`} className="text-[13px] font-medium text-cobalt hover:underline">
                        {c.number}
                      </Link>
                      <p className="mono mt-0.5 text-[11px] text-muted">rev {c.revision}</p>
                    </TD>
                    <TD>
                      {instrumentById(c.instrumentId) ? (
                        <Link href={`/app/instruments/${c.instrumentId}`} className="text-[13px] font-medium text-cobalt hover:underline">
                          {instr?.name}
                        </Link>
                      ) : (
                        <span className="text-[13px] text-text">{instr?.name}</span>
                      )}
                      <p className="mono mt-0.5 text-[11px] text-muted">S/N {instr?.serial}</p>
                    </TD>
                    <TD>
                      <span className="text-[12.5px] text-text">{c.laboratoryId === "LAB-RML-2001" ? "Rhein Metrology Laboratory" : "Emscher Kalibrierzentrum"}</span>
                      <p className="mono mt-0.5 text-[10.5px] text-muted">
                        {c.procedure.split("—")[0].trim()}
                      </p>
                    </TD>
                    <TD>
                      <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                      <p className="mono mt-0.5 text-[10.5px] text-muted">
                        {c.measurements.length} points · U = {c.uncertaintyStatement.expanded}
                      </p>
                    </TD>
                    <TD numeric>{c.calibrationDate}</TD>
                    <TD numeric>{c.dueDate}</TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </TableWrap>
        {rows.length === 0 && <EmptyState title="No calibration events recorded" />}
        <p className="border-t border-border px-4 py-2.5 text-[11.5px] text-muted">
          The sample dataset shows {rows.length} events. Events attach to instruments
          from the registry; values live on the linked certificate — immutable after
          issuance.
        </p>
      </Card>
    </>
  );
}
