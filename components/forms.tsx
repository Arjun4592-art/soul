import type { ReactNode } from "react";

export const inputClass =
  "w-full border border-ink/30 bg-white px-3.5 py-3 text-[1rem] text-ink outline-none transition placeholder:text-ink-soft/70 focus:border-ink focus:shadow-[3px_3px_0_0_var(--gold-soft)]";

export function FormField({ label, hint, children, className = "" }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[0.9rem] font-medium text-ink">
        {label}
        {hint && <span className="ml-2 font-normal text-ink-soft">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
