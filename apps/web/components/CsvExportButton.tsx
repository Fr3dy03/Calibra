"use client";

import { Button } from "./ui";

export default function CsvExportButton({
  filename,
  headers,
  rows,
  size = "sm",
}: {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
  size?: "sm" | "md";
}) {
  const exportCsv = () => {
    const escape = (v: string | number) => {
      const s = String(v);
      return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [headers.map(escape).join(";"), ...rows.map((r) => r.map(escape).join(";"))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="secondary" size={size} onClick={exportCsv}>
      Export CSV
    </Button>
  );
}
