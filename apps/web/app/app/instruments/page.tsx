"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageHeading } from "@/components/AppShell";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  LoadingRows,
  TD,
  TH,
  THead,
  TR,
  TBody,
  Table,
  TableWrap,
} from "@/components/ui";
import { instruments } from "@/lib/data";

const referenceToday = new Date("2026-11-06T00:00:00Z");

function dueBucket(nextDue: string): "overdue" | "90d" | "later" | "none" {
  if (nextDue === "—") return "none";
  const d = new Date(nextDue + "T00:00:00Z");
  const diff = (d.getTime() - referenceToday.getTime()) / 86400000;
  if (diff < 0) return "overdue";
  if (diff <= 90) return "90d";
  return "later";
}

export default function InstrumentsPage() {
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [due, setDue] = useState("all");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Simulated fetch delay so the loading skeleton is genuinely visible.
    const t = setTimeout(() => setLoaded(true), 350);
    return () => clearTimeout(t);
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(instruments.map((i) => i.category))).sort(),
    []
  );

  const rows = instruments.filter((i) => {
    if (category !== "all" && i.category !== category) return false;
    if (status !== "all" && i.status !== status) return false;
    if (due !== "all" && dueBucket(i.nextDue) !== due) return false;
    return true;
  });

  return (
    <>
      <PageHeading
        eyebrow="Instrument registry"
        title="Instruments"
        description="Every registered device with its identification, measurement capability and current calibration state."
        actions={
          <Button href="/app/instruments/new" size="sm">
            Register an Instrument
          </Button>
        }
      />

      {/* Filters */}
      <Card className="mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="f-cat" className="field-label">
              Category
            </label>
            <select id="f-cat" className="field-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-status" className="field-label">
              Status
            </label>
            <select id="f-status" className="field-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All states</option>
              <option value="in-use">In use</option>
              <option value="in-store">In store</option>
              <option value="maintenance">In maintenance</option>
            </select>
          </div>
          <div>
            <label htmlFor="f-due" className="field-label">
              Next due
            </label>
            <select id="f-due" className="field-input" value={due} onChange={(e) => setDue(e.target.value)}>
              <option value="all">Any due date</option>
              <option value="90d">Due within 90 days</option>
              <option value="overdue">Overdue</option>
              <option value="none">No current certificate</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <TableWrap>
          <Table className="min-w-[860px]">
            <THead>
              <TH>Instrument</TH>
              <TH>Category</TH>
              <TH>Function / range</TH>
              <TH>Location · owner</TH>
              <TH>Next due</TH>
              <TH>State</TH>
              <TH numeric>Current certificate</TH>
            </THead>
            {loaded ? (
              rows.length > 0 ? (
                <TBody>
                  {rows.map((i) => {
                    const bucket = dueBucket(i.nextDue);
                    return (
                      <TR key={i.id}>
                        <TD>
                          <Link
                            href={`/app/instruments/${i.id}`}
                            className="text-[13px] font-medium text-cobalt hover:underline"
                          >
                            {i.name}
                          </Link>
                          <p className="mono mt-0.5 text-[11px] text-muted">
                            S/N {i.serial} · {i.id}
                          </p>
                        </TD>
                        <TD>
                          <Badge tone="info">{i.category}</Badge>
                        </TD>
                        <TD>
                          <span className="mono text-[12.5px] text-text">{i.func}</span>
                          <p className="mono mt-0.5 text-[11px] text-muted">
                            {i.rangeMin} … {i.rangeMax} {i.unit}
                          </p>
                        </TD>
                        <TD>
                          <span className="text-[12.5px] text-text">{i.location}</span>
                          <p className="mt-0.5 text-[11px] text-muted">{i.owner}</p>
                        </TD>
                        <TD>
                          <span className="mono text-[12.5px] text-text">{i.nextDue}</span>
                          <p className="mt-0.5">
                            <Badge
                              tone={
                                bucket === "overdue"
                                  ? "critical"
                                  : bucket === "90d"
                                  ? "pending"
                                  : bucket === "none"
                                  ? "neutral"
                                  : "current"
                              }
                            >
                              {bucket === "overdue"
                                ? "Overdue"
                                : bucket === "90d"
                                ? "Due soon"
                                : bucket === "none"
                                ? "No certificate"
                                : "Scheduled"}
                            </Badge>
                          </p>
                        </TD>
                        <TD>
                          <span className="text-[12.5px] text-muted">
                            {i.status === "in-use" ? "In use" : i.status === "in-store" ? "In store" : "Maintenance"}
                          </span>
                        </TD>
                        <TD numeric>
                          {i.currentCertificate ? (
                            <Link
                              href={`/app/certificates/${i.currentCertificate}`}
                              className="text-cobalt hover:underline"
                            >
                              {i.currentCertificate}
                            </Link>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </TD>
                      </TR>
                    );
                  })}
                </TBody>
              ) : (
                <tbody>
                  <tr>
                    <td colSpan={7}>
                      <EmptyState
                        title="No instruments match these filters"
                        note="Clear a filter, or register a new instrument to fill the registry."
                      />
                    </td>
                  </tr>
                </tbody>
              )
            ) : (
              <LoadingRows cols={7} />
            )}
          </Table>
        </TableWrap>
        <p className="border-t border-border px-4 py-2.5 text-[11.5px] text-muted">
          {loaded ? `${rows.length} of ${instruments.length} registry entries shown (sample dataset).` : "Loading registry…"}
        </p>
      </Card>
    </>
  );
}
