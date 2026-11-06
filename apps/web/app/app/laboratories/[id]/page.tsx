import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/AppShell";
import {
  Badge,
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
import { certificates, laboratoryById } from "@/lib/data";

export default function LaboratoryProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const lab = laboratoryById(params.id);
  if (!lab) notFound();

  const certs = certificates.filter((c) => c.laboratoryId === lab.id);

  return (
    <>
      <PageHeading
        eyebrow={`Laboratory ${lab.code}`}
        title={lab.name}
        description={`${lab.location}, ${lab.country}`}
        actions={<Badge tone="current">Accredited · evidence on record</Badge>}
      />

      {/* Profile */}
      <Card className="mb-6">
        <CardHeader eyebrow="Profile" title="Identification & accreditation" />
        <KeyValueList
          className="py-5"
          items={[
            { label: "Laboratory code", value: <span className="mono">{lab.code}</span> },
            { label: "Location", value: `${lab.location}, ${lab.country}` },
            {
              label: "Accreditation number",
              value: <span className="mono">{lab.accreditation.endorsement}</span>,
            },
            { label: "Scheme", value: lab.accreditation.scheme },
            { label: "Valid until", value: <span className="mono">{lab.accreditation.validUntil}</span> },
            { label: "Certificates issued (platform)", value: String(lab.certificateCount) },
            { label: "Listed since", value: <span className="mono">{lab.listedSince}</span> },
          ]}
        />
        <div className="border-t border-border bg-bg/60 px-5 py-4">
          <p className="text-[12.5px] leading-relaxed text-muted">
            Accreditation status is <strong className="font-medium text-text">evidence-based, not
            self-declared</strong>: the scheme, number, endorsement reference and validity shown here
            reflect stored records, and the endorsement reference carries its
            <span className="mono"> (simulated) </span>marker in this demo dataset.
          </p>
        </div>
      </Card>

      {/* Scope */}
      <Card className="mb-6 overflow-hidden">
        <CardHeader eyebrow="Accredited scope" title="Calibrated fields, ranges and CMC" />
        <TableWrap>
          <Table className="min-w-[560px]">
            <THead>
              <TH>Measurement field</TH>
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
        <p className="border-t border-border px-4 py-2.5 text-[11.5px] text-muted">
          CMC: best measurement capability per scope line. Certificates must stay
          inside the accredited scope; field-line and range are the boundaries used
          by issuance checks.
        </p>
      </Card>

      {/* Personnel / signer registry */}
      <Card className="mb-6 overflow-hidden">
        <CardHeader eyebrow="Approved personnel" title="Signer registry" />
        <TableWrap>
          <Table className="min-w-[720px]">
            <THead>
              <TH>Name</TH>
              <TH>Role</TH>
              <TH>Staff ID</TH>
              <TH>Signature scheme</TH>
              <TH numeric>Authorized since</TH>
            </THead>
            <TBody>
              {lab.personnel.map((p) => (
                <TR key={p.staffId}>
                  <TD className="font-medium">{p.name}</TD>
                  <TD className="text-muted">{p.role}</TD>
                  <TD mono>{p.staffId}</TD>
                  <TD mono>{p.signature}</TD>
                  <TD numeric>{p.authorizedSince}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableWrap>
        <p className="border-t border-border px-4 py-2.5 text-[11.5px] text-muted">
          Certificates reference registry entries by staff identifier. A signer
          removed from the registry cannot appear on newly issued certificates;
          previously issued certificates keep their historical registry snapshot.
        </p>
      </Card>

      {/* Certificate history */}
      <Card className="mb-6 overflow-hidden">
        <CardHeader eyebrow="Issued via platform" title="Certificate history" />
        {certs.length > 0 ? (
          <TableWrap>
            <Table className="min-w-[720px]">
              <THead>
                <TH>Certificate</TH>
                <TH>Instrument</TH>
                <TH>Status</TH>
                <TH numeric>Calibrated</TH>
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
                    <TD className="text-[13px]">{c.instrumentId}</TD>
                    <TD>
                      <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                    </TD>
                    <TD numeric>{c.calibrationDate}</TD>
                    <TD numeric>{c.dueDate}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableWrap>
        ) : (
          <EmptyState title="No certificates on record here" />
        )}
        <p className="border-t border-border px-4 py-2.5 text-[11.5px] text-muted">
          Instrument column shows registry identifiers; open a certificate for the
          named instrument and its serial.
        </p>
      </Card>

      <Card className="border-cobalt/25 bg-cobaltLight/40 px-5 py-4">
        <p className="text-[13px] leading-relaxed text-text/80">
          <strong className="font-semibold text-text">Reminder.</strong> This
          profile renders stored evidence. Statements about laboratory competence
          belong to the accreditation body that issued the endorsement — the
          platform's job is keeping the links intact between the endorsement, the
          certificates and the instruments they constrain.
        </p>
      </Card>
    </>
  );
}
