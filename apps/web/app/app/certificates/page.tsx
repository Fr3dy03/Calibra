import Link from "next/link";
import { PageHeading } from "@/components/AppShell";
import {
  Badge,
  Button,
  Card,
  TD,
  TH,
  THead,
  TR,
  TBody,
  Table,
  TableWrap,
  statusTone,
} from "@/components/ui";
import { certificates, instrumentById, laboratoryById } from "@/lib/data";

export default function CertificatesPage() {
  const rows = [...certificates].sort((a, b) => b.calibrationDate.localeCompare(a.calibrationDate));

  return (
    <>
      <PageHeading
        eyebrow="Document register"
        title="Certificates"
        description="Digital Calibration Certificates on this platform — issued, imported, superseded, expired. Revision relationships are always visible; measurement values are immutable after issuance."
        actions={
          <>
            <Button href="/app/verification" variant="secondary" size="sm">
              Verify a certificate
            </Button>
            <Button href="/app/certificates/import" size="sm">
              Import DCC XML
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        <TableWrap>
          <Table className="min-w-[880px]">
            <THead>
              <TH>Certificate</TH>
              <TH>Instrument</TH>
              <TH>Laboratory</TH>
              <TH>Status</TH>
              <TH numeric>Calibrated</TH>
              <TH numeric>Issued</TH>
              <TH numeric>Valid until</TH>
            </THead>
            <TBody>
              {rows.map((c) => {
                const instr = instrumentById(c.instrumentId);
                const lab = laboratoryById(c.laboratoryId);
                return (
                  <TR key={c.id}>
                    <TD>
                      <Link
                        href={`/app/certificates/${c.number}`}
                        className="text-[13px] font-medium text-cobalt hover:underline"
                      >
                        {c.number}
                      </Link>
                      <p className="mono mt-0.5 text-[11px] text-muted">rev {c.revision}</p>
                    </TD>
                    <TD>
                      <span className="text-[13px] text-text">{instr?.name ?? "—"}</span>
                      <p className="mono mt-0.5 text-[11px] text-muted">S/N {instr?.serial}</p>
                    </TD>
                    <TD>
                      <span className="text-[12.5px] text-text">{lab?.name}</span>
                      <p className="mono mt-0.5 text-[11px] text-muted">{lab?.code}</p>
                    </TD>
                    <TD>
                      <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                      {c.supersededBy && (
                        <p className="mono mt-0.5 text-[10.5px] text-muted">→ {c.supersededBy}</p>
                      )}
                      {c.supersedes && (
                        <p className="mono mt-0.5 text-[10.5px] text-muted">▲ {c.supersedes}</p>
                      )}
                    </TD>
                    <TD numeric>{c.calibrationDate}</TD>
                    <TD numeric>{c.issueDate}</TD>
                    <TD numeric>{c.dueDate}</TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </TableWrap>
        <p className="border-t border-border px-4 py-2.5 text-[11.5px] text-muted">
          {rows.length} certificates in the sample dataset. Colour legend — teal:
          current/issued · ochre: pending/due soon · red: revoked/overdue/expired ·
          cobalt: informational · gray: imported/superseded.
        </p>
      </Card>
    </>
  );
}
