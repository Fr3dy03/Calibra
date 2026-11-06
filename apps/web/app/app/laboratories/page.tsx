import Link from "next/link";
import { PageHeading } from "@/components/AppShell";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  KeyValueList,
  TD,
  TH,
  THead,
  TR,
  TBody,
  Table,
  TableWrap,
} from "@/components/ui";
import { laboratories } from "@/lib/data";

export default function LaboratoriesPage() {
  return (
    <>
      <PageHeading
        eyebrow="Directory"
        title="Laboratories"
        description="Registered calibration laboratories with accreditation references, calibrated scope lines and approved signer registries. Status shown here is evidence-based — it repeats what is on record, never what a laboratory simply claims."
        actions={
          <Button variant="secondary" size="sm">
            Register a Laboratory
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        {laboratories.map((lab) => (
          <Card key={lab.id} className="overflow-hidden">
            <CardHeader
              eyebrow={lab.code}
              title={lab.name}
              action={<Badge tone="current">Accredited · evidence on record</Badge>}
            />
            <KeyValueList
              items={[
                { label: "Location", value: `${lab.location}, ${lab.country}` },
                {
                  label: "Accreditation",
                  value: <span className="mono">{lab.accreditation.endorsement}</span>,
                },
                { label: "Scheme", value: lab.accreditation.scheme },
                {
                  label: "Valid until",
                  value: <span className="mono">{lab.accreditation.validUntil}</span>,
                },
                { label: "Certificates issued", value: `${lab.certificateCount} · on this platform` },
                { label: "Listed since", value: <span className="mono">{lab.listedSince}</span> },
              ]}
            />
            <div className="border-t border-border">
              <TableWrap>
                <Table className="min-w-[420px]">
                  <THead>
                    <TH>Scope</TH>
                    <TH>Range</TH>
                    <TH numeric>CMC</TH>
                  </THead>
                  <TBody>
                    {lab.scope.map((s) => (
                      <TR key={s.field}>
                        <TD>{s.field}</TD>
                        <TD mono>{s.range}</TD>
                        <TD numeric>{s.cmc}</TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </TableWrap>
            </div>
            <div className="flex items-center justify-between px-4 py-3 sm:px-5">
              <p className="text-[11.5px] text-muted">
                {lab.personnel.length} approved signatories on registry
              </p>
              <Link
                href={`/app/laboratories/${lab.id}`}
                className="text-[12px] font-medium text-cobalt hover:underline"
              >
                Open laboratory profile →
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6 border-cobalt/25 bg-cobaltLight/40 px-5 py-4">
        <p className="text-[13px] leading-relaxed text-text/80">
          <strong className="font-semibold text-text">Note on accreditation status.</strong>{" "}
          Laboratory profile and directory pages in this demo dataset include
          simulated accreditation references (e.g.{" "}
          <span className="mono">ILAC MRA — Accred. No. A-11847 (simulated)</span>).
          The accreditation status displayed is derived from stored evidence and is
          always labelled as such — it is not a self-declaration, and the labels say
          so wherever the status appears.
        </p>
      </Card>
    </>
  );
}
