"use client";

import { useState } from "react";
import { Button, cn } from "./ui";

export default function ConfirmAction({
  actionLabel,
  title,
  body,
  confirmLabel,
  icon,
}: {
  actionLabel: string;
  title: string;
  body: string;
  confirmLabel: string;
  icon: string;
}) {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <>
      <Button variant={icon === "⚠" ? "danger" : "secondary"} size="sm" onClick={() => setOpen(true)}>
        <span aria-hidden>{icon}</span> {confirmed ? actionLabel + " · done ✓" : actionLabel}
      </Button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#263643]/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <div className="w-full max-w-md rounded border border-border bg-surface p-6 shadow-lift">
            <h3 id="confirm-title" className="text-base font-semibold text-text">
              {title}
            </h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{body}</p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={icon === "⚠" ? "danger" : "primary"}
                onClick={() => {
                  setConfirmed(true);
                  setOpen(false);
                }}
              >
                {confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
