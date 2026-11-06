"use client";

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
} from "@/components/ui";

const orgDefaults = {
  name: "Quidline Labs GmbH",
  legal: "Quidline Laboratories Gesellschaft mbH",
  site: "Düsseldorf — Bay 1–4, Materials lab, Climate zone",
  vat: "DE 811 907 988 (demo)",
  email: "metrology@quidline.example",
  intervalPolicy: "Based on manufacturer recommendation + drift review",
};

const members = [
  { name: "Dr. Anja Hofmann", role: "Org admin", scope: "Full workspace", since: "2024-01-18", id: "USR-0001" },
  { name: "J. Weber", role: "Registry editor", scope: "Instruments · due queue", since: "2024-02-02", id: "USR-0007" },
  { name: "L. Odum", role: "Registry editor", scope: "Instruments · reports", since: "2024-05-22", id: "USR-0012" },
  { name: "R. Adamski", role: "Viewer", scope: "Read-only", since: "2023-11-09", id: "USR-0018" },
  { name: "S. Klein", role: "Signer (via RML-2001 registry)", scope: "Certificates (issuing lab)", since: "2024-03-01", id: "USR-0021" },
];

export default function SettingsPage() {
  const [org, setOrg] = useState(orgDefaults);
  const [savedOrg, setSavedOrg] = useState(false);
  const [savedPolicy, setSavedPolicy] = useState(false);
  const [reminders, setReminders] = useState("30-14-7");

  return (
    <>
      <PageHeading
        eyebrow="Configuration"
        title="Settings"
        description="Organisation profile, member roles and the place reserved for API access. Demo workspace — changes persist for the session only."
      />

      <div className="grid gap-6 xl:grid-cols-2 xl:items-start">
        {/* Org profile */}
        <Card className="overflow-hidden">
          <CardHeader
            eyebrow="Organisation"
            title="Profile"
            action={savedOrg ? <Badge tone="current">Saved ✓</Badge> : undefined}
          />
          <form
            className="grid gap-5 p-5 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              setSavedOrg(true);
            }}
          >
            <div className="sm:col-span-2">
              <Field label="Organisation name" htmlFor="s-name">
                <input id="s-name" className="field-input" value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} />
              </Field>
            </div>
            <Field label="Legal entity" htmlFor="s-legal">
              <input id="s-legal" className="field-input" value={org.legal} onChange={(e) => setOrg({ ...org, legal: e.target.value })} />
            </Field>
            <Field label="Contact email" htmlFor="s-email">
              <input id="s-email" type="email" className="field-input" value={org.email} onChange={(e) => setOrg({ ...org, email: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Sites / locations" htmlFor="s-site" hint="Free text summary">
                <input id="s-site" className="field-input" value={org.site} onChange={(e) => setOrg({ ...org, site: e.target.value })} />
              </Field>
            </div>
            <Field label="VAT / registration" htmlFor="s-vat">
              <input id="s-vat" className="field-input" value={org.vat} onChange={(e) => setOrg({ ...org, vat: e.target.value })} />
            </Field>
            <Field label="Interval policy" htmlFor="s-interval" hint="Shown on due reports">
              <input id="s-interval" className="field-input" value={org.intervalPolicy} onChange={(e) => setOrg({ ...org, intervalPolicy: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <Button type="submit">Save profile</Button>
            </div>
          </form>
        </Card>

        {/* Notification policy + identity */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader
              eyebrow="Recalibration reminders"
              title="Notification policy"
              action={savedPolicy ? <Badge tone="current">Saved ✓</Badge> : undefined}
            />
            <form
              className="grid gap-5 p-5"
              onSubmit={(e) => {
                e.preventDefault();
                setSavedPolicy(true);
              }}
            >
              <Field label="Reminder cadence" htmlFor="s-cadence">
                <select id="s-cadence" className="field-input" value={reminders} onChange={(e) => setReminders(e.target.value)}>
                  <option value="30-14-7">30 / 14 / 7 days before due</option>
                  <option value="30-7">30 / 7 days before due</option>
                  <option value="14-7">14 / 7 days before due</option>
                  <option value="30">30 days before due</option>
                </select>
              </Field>
              <div className="rounded border border-border bg-bg px-4 py-3 text-[12.5px] leading-relaxed text-muted">
                Reminders apply per organisation and mirror the cadence on{" "}
                <span className="mono">/app/calibrations/due</span>. Overdue
                instruments escalate weekly until the queue is clean.
              </div>
              <div>
                <Button type="submit" size="sm">
                  Save policy
                </Button>
              </div>
            </form>
          </Card>

          <Card className="overflow-hidden border-dashed">
            <CardHeader eyebrow="Reserved" title="Identity & API access" />
            <div className="p-5">
              <div className="rounded border border-border bg-bg px-4 py-4">
                <p className="flex items-center gap-2 text-[13px] font-semibold text-text">
                  <span aria-hidden>🧪</span> Feature in preparation
                </p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                  Per-user keypairs for certificate signatures and organisation API
                  keys for sync — will live here. For now, exports (XML per DCC
                  schema, CSV from reports) cover the integration surface.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Members */}
      <Card className="mt-6 overflow-hidden">
        <CardHeader
          eyebrow="Access"
          title="Members & roles"
          action={<Badge tone="info">5 members</Badge>}
        />
        <TableWrap>
          <Table className="min-w-[680px]">
            <THead>
              <TH>Member</TH>
              <TH>Role</TH>
              <TH>Scope</TH>
              <TH numeric>Member since</TH>
              <TH numeric>User ID</TH>
            </THead>
            <TBody>
              {members.map((m) => (
                <TR key={m.id}>
                  <TD className="font-medium">{m.name}</TD>
                  <TD>
                    <Badge tone={m.role === "Org admin" ? "info" : m.role.startsWith("Signer") ? "current" : "neutral"}>
                      {m.role}
                    </Badge>
                  </TD>
                  <TD className="text-[12.5px] text-muted">{m.scope}</TD>
                  <TD numeric>{m.since}</TD>
                  <TD mono numeric>{m.id}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableWrap>
        <p className="border-t border-border px-4 py-2.5 text-[11.5px] text-muted">
          Roles are workspace-scoped. Signing authority derives from the issuing
          laboratory's approved signer registry — a workspace role never creates
          metrological signing rights. Demo workspace without authentication:
          position only.
        </p>
      </Card>
    </>
  );
}
