"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeading } from "@/components/AppShell";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Field,
  TD,
  TH,
  THead,
  TR,
  TBody,
  Table,
  TableWrap,
  cn,
} from "@/components/ui";
import { dueRows } from "@/lib/data";

type Group = {
  key: string;
  label: string;
  tone: string;
  note: string;
};

const allGroups: Group[] = [
  { key: "7", label: "≤ 7 days", tone: "pending", note: "Advise scheduling now" },
  { key: "30", label: "≤ 30 days", tone: "pending", note: "First reminder sent" },
  { key: "60", label: "31–60 days", tone: "neutral", note: "Plan the interval" },
  { key: "90", label: "61–90 days", tone: "neutral", note: "Plan the interval" },
  { key: "overdue", label: "Overdue", tone: "critical", note: "Validity elapsed" },
  { key: "none", label: "No current certificate", tone: "neutral", note: "Never issued or revocation" },
];

export default function DuePage() {
  const [group, setGroup] = useState<string>("all");
  const [saved, setSaved] = useState(false);

  const rows = group === "all" ? dueRows : dueRows.filter((r) => r.bucket === group);

  return (
    <>
      <PageHeading
        eyebrow="Recalibration queue"
        title="Due soon"
        description="Validity segments from 7 to 90 days, plus overdue instruments and instruments without any current certificate. Every count links to the rows behind it."
      />

      {/* Segment cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {allGroups.map((g) => {
          const count = dueRows.filter((r) => r.bucket === g.key).length;
          const active = group === g.key;
          return (
            <button
              key={g.key}
              type="button"
              onClick={() => setGroup(active ? "all" : g.key)}
              aria-pressed={active}
              className={cn(
                "rounded border px-4 py-3.5 text-left transition-colors",
                active
                  ? "border-cobalt bg-cobaltLight/60 shadow-card"
                  : "border-border bg-surface hover:border-cobalt/40"
              )}
            >
              <p className="mono text-2xl font-semibold text-text">{count}</p>
              <p className="mt-1 text-[12px] font-medium text-text">{g.label}</p>
              <p className="mt-0.5 text-[10.5px] text-muted">{g.note}</p>
            </button>
          );
        })}
      </div>

      {/* Rows */}
      <Card className="mb-8 overflow-hidden">
        <CardHeader
          eyebrow="Queue"
          title={group === "all" ? "All instruments incl. upcoming lapses" : allGroups.find((g) => g.key === group)?.label ?? "Queue"}
          action={
            group !== "all" ? (
              <Button variant="ghost" size="sm" onClick={() => setGroup("all")}>
                Show all groups
              </Button>
            ) : undefined
          }
        />
        <TableWrap>
          <Table className="min-w-[760px]">
            <THead>
              <TH>Instrument</TH>
              <TH>Category</TH>
              <TH>Owner</TH>
              <TH numeric>Due state</TH>
              <TH numeric>Certificate</TH>
            </THead>
            {rows.length > 0 ? (
              <TBody>
                {rows.map((r) => (
                  <TR key={r.instrumentId}>
                    <TD>
                      {r.designation}
                      <p className="mono mt-0.5 text-[11px] text-muted">{r.instrumentId}</p>
                    </TD>
                    <TD>
                      <Badge tone="info">{r.category}</Badge>
                    </TD>
                    <TD className="text-[12.5px] text-muted">{r.owner}</TD>
                    <TD>
                      <Badge tone={r.bucket === "overdue" ? "critical" : r.bucket === "30" || r.bucket === "7" ? "pending" : "neutral"}>
                        {r.bucket === "overdue" ? "Overdue" : r.bucket === "none" ? "No certificate" : r.dueLabel}
                      </Badge>
                    </TD>
                    <TD numeric>
                      {r.certificate ? (
                        <Link href={`/app/certificates/${r.certificate}`} className="text-cobalt hover:underline">
                          {r.certificate}
                        </Link>
                      ) : (
                        <Button href="/app/instruments/new" variant="ghost" size="sm">
                          Register
                        </Button>
                      )}
                    </TD>
                  </TR>
                ))}
              </TBody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted">
                    Nothing in this segment.
                  </td>
                </tr>
              </tbody>
            )}
          </Table>
        </TableWrap>
        <p className="border-t border-border px-4 py-2.5 text-[11.5px] text-muted">
          Reference date: 2026-11-06 (demo dataset). Counts per group are recomputed
          nightly under production operation.
        </p>
      </Card>

      {/* Notification policy */}
      <Card className="overflow-hidden">
        <CardHeader
          eyebrow="Notification policy"
          title="Email reminders per organisation"
          action={saved ? <Badge tone="current">Policy saved ✓</Badge> : undefined}
        />
        <form
          className="grid gap-5 p-5 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(true);
          }}
        >
          <Field label="Reminder cadence" htmlFor="np-cadence">
            <select id="np-cadence" className="field-input" defaultValue="30-14-7">
              <option value="30-14-7">30 / 14 / 7 days before due</option>
              <option value="30-7">30 / 7 days before due</option>
              <option value="14-7">14 / 7 days before due</option>
              <option value="30">30 days before due</option>
            </select>
          </Field>
          <Field label="Applies to" htmlFor="np-scope" hint="Per organisation">
            <input id="np-scope" className="field-input" defaultValue="Quidline Labs GmbH — all locations" readOnly />
          </Field>
          <Field label="Recipients" htmlFor="np-emails" hint="Comma-separated">
            <input
              id="np-emails"
              type="email"
              multiple
              className="field-input"
              defaultValue="qcm@quidline.example, metrology@quidline.example"
            />
          </Field>
          <Field label="Overdue escalation" htmlFor="np-escalate">
            <select id="np-escalate" className="field-input" defaultValue="weekly">
              <option value="off">Off</option>
              <option value="weekly">Weekly overdue summary</option>
              <option value="daily">Daily until handled</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit">Save notification policy</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
