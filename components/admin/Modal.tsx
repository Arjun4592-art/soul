"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

export default function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-10 sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="fixed inset-0 bg-ink/60" onClick={onClose} />
      <div className={`relative w-full border border-ink bg-paper p-6 shadow-[8px_8px_0_0_var(--ink)] sm:p-7 ${wide ? "max-w-2xl" : "max-w-lg"}`}>
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-ink/15 pb-4">
          <h2 className="font-display text-2xl">{title}</h2>
          <button onClick={onClose} className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft hover:text-ink" aria-label="Close">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
