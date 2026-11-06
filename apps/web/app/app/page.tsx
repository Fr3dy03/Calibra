import Link from "next/link";
import { PageHeading } from "@/components/AppShell";
import {
  Badge,
  Button,
  Card,
  CardHeader,
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
import {
  certificates,
  dashboardStats,
  dueRows,
  instrumentById,
} from "@/lib/data";

const recentCerts = certificates
  .filter((c) => c.status === "current" || c.status === "expired")
  .slice(0, 5);

const dueSoon = dueRows
  .filter((r) => r.bucket === "30" || r.bucket === "60" || r.bucket === "90")
  .slice(0, 5);

export default function DashboardPage() {
  const stats = [
    {
      label: "Instruments registered",
      value: "42",
      href: "/app/instruments",
      hint: "Registry total",
    },
    {
      label: "Current certificates",
      value: "38",
      href: "/app/certificates",
      hint: "Issued and valid",
    },
    {
      label: "Due in 30 days",
      value: "5",
      href: "/app/calibrations/due",
      hint: "Across the organisation",
      tone: "pending" as const,
    },
    {
      label: "Overdue",
      value: "2",
      href: "/app/calibrations/due",
      hint: "Validity elapsed",
      tone: "critical" as const,
    },
  ];

  return (
    <>
      <PageHeading
        eyebrow="Overview"
        title="Dashboard"
        description="State of your calibration estate: what is current, what is due, and which certificates were issued most recently."
        actions={
          <>
            <Button href="/app/certificates/import" variant="secondary" size="sm">
              Import DCC XML
            </Button>
            <Button href="/app/instruments/new" size="sm">
              Register an Instrument
            </Button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group">
            <Card className="h-full p-5 transition-colors group-hover:border-cobalt/50">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">
                {s.label}
              </p>
              <p className="mono mt-2 text-3xl font-semibold text-text">{s.value}</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[11.5px] text-muted">{s.hint}</p>
                {s.tone && <Badge tone={s.tone} dot>{s.tone === "pending" ? "Watch" : "Action"}</Badge>}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* Due soon */}
        <Card className="overflow-hidden">
          <CardHeader
            eyebrow="Recalibration queue"
            title="Due soon — top of queue"
            action={
              <Link href="/app/calibrations/due" className="text-[12px] font-medium text-cobalt hover:underline">
                Full queue →
              </Link>
            }
          />
          <TableWrap>
            <Table className="min-w-[480px]">
              <THead>
                <TH>Instrument</TH>
                <TH>Next due</TH>
                <TH numeric>Certificate</TH>
              </THead>
              <TBody>
                {dueSoon.map((r) => (
                  <TR key={r.instrumentId}>
                    <TD>
                      {instrumentById(r.instrumentId) ? (
                        <Link
                          href={`/app/instruments/${r.instrumentId}`}
                          className="text-[13px] font-medium text-cobalt hover:underline"
                        >
                          {r.designation}
                        </Link>
                      ) : (
                        <span className="text-[13px] text-text">{r.designation}</span>
                      )}
                      <p className="mono mt-0.5 text-[11px] text-muted">{r.owner}</p>
                    </TD>
                    <TD>
                      <Badge tone={r.bucket === "30" ? "pending" : "neutral"}>
                        {r.bucket === "30" ? "≤ 30 days" : r.bucket === "60" ? "31–60 days" : "61–90 days"}
                      </Badge>
                      <p className="mono mt-0.5 text-[11px] text-muted">{r.dueLabel}</p>
                    </TD>
                    <TD numeric>
                      {r.certificate ? (
                        <Link
                          href={`/app/certificates/${r.certificate}`}
                          className="text-cobalt hover:underline"
                        >
                          {r.certificate}
                        </Link>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableWrap>
          <p className="border-t border-border px-4 py-2.5 text-[11.5px] text-muted">
            Top entries of the sample dataset — open the queue for all lapse groups,
            including overdue and no-current-certificate.
          </p>
        </Card>

        {/* Recent certificates */}
        <Card className="overflow-hidden">
          <CardHeader
            eyebrow="Anchors & issuance"
            title="Recent certificates"
            action={
              <Link href="/app/certificates" className="text-[12px] font-medium text-cobalt hover:underline">
                All certificates →
              </Link>
            }
          />
          <TableWrap>
            <Table className="min-w-[480px]">
              <THead>
                <TH>Certificate</TH>
                <TH>Instrument</TH>
                <TH>Status</TH>
                <TH numeric>Valid until</TH>
              </THead>
              <TBody>
                {recentCerts.map((c) => {
                  const instr = instrumentById(c.instrumentId);
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
                        <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                      </TD>
                      <TD numeric>{c.dueDate}</TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </TableWrap>
          <p className="border-t border-border px-4 py-2.5 text-[11.5px] text-muted">
            Showing the five most relevant records of the sample dataset.
          </p>
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="mt-6">
        <CardHeader eyebrow="Workflows" title="Where do you want to go?" />
        <div className="grid gap-px bg-border sm:grid-cols-4">
          {[
            { href: "/app/calibrations/due", title: "Due Soon", body: "7/30/60/90-day lapses, overdue and no-certificate queues." },
            { href: "/app/traceability", title: "Traceability", body: "Reference standards and their chains to national institutes." },
            { href: "/app/verification", title: "Verification", body: "Public check of a certificate ID against the anchored record." },
            { href: "/app/reports", title: "Reports", body: "Due forecast, certificate inventory, laboratory workload — CSV export." },
          ].map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="block bg-surface px-4 py-4 transition-colors hover:bg-cobaltLight/50"
            >
              <p className="text-[13px] font-semibold text-cobalt">{q.title}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted">{q.body}</p>
            </Link>
          ))}
        </div>
      </Card>
    </>
  );
}
