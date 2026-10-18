"use client";

import type { ReactNode } from "react";
import Topbar from "@/components/admin/Topbar";
import FirebaseSetupNotice from "@/components/admin/FirebaseSetupNotice";
import { isFirebaseConfigured } from "@/lib/firebase";

/** Standard admin screen: top bar, optional firebase notice, one-line intro, content. */
export function AdminPage({ title, intro, children, narrow = false }: { title: string; intro?: string; children: ReactNode; narrow?: boolean }) {
  return (
    <div>
      <Topbar title={title} />
      <div className={`space-y-6 p-5 sm:p-8 ${narrow ? "max-w-3xl" : ""}`}>
        {!isFirebaseConfigured && <FirebaseSetupNotice />}
        {intro && <p className="max-w-2xl text-sm text-ink-soft">{intro}</p>}
        {children}
      </div>
    </div>
  );
}

/** Search box + optional filter chips on the left, primary action on the right. */
export function Toolbar({
  search,
  onSearch,
  placeholder = "Search",
  chips,
  action,
  summary,
}: {
  search?: string;
  onSearch?: (v: string) => void;
  placeholder?: string;
  chips?: ReactNode;
  action?: ReactNode;
  summary?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        {onSearch && (
          <input
            value={search ?? ""}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="w-full border border-ink/30 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-ink-soft/70 focus:border-ink sm:max-w-xs"
          />
        )}
        {chips && <div className="flex flex-wrap gap-2">{chips}</div>}
        {summary && <div className="text-sm text-ink-soft">{summary}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Chip({ active, onClick, children, count }: { active: boolean; onClick: () => void; children: ReactNode; count?: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`border px-3.5 py-2 text-sm transition ${active ? "border-ink bg-ink text-paper" : "border-ink/30 bg-white hover:border-ink"}`}
    >
      {children}
      {count !== undefined && <span className="ml-1.5 font-mono text-xs opacity-70">{count}</span>}
    </button>
  );
}

/** Text-style row action. tone="danger" for destructive ones. */
export function RowBtn({ onClick, children, tone = "default", href, disabled }: { onClick?: () => void; children: ReactNode; tone?: "default" | "danger"; href?: string; disabled?: boolean }) {
  const cls = `text-sm underline-offset-4 hover:underline disabled:opacity-50 ${tone === "danger" ? "text-rose-700" : "text-ink"}`;
  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export function Meter({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value || 0));
  return (
    <div className="flex items-center gap-2" role="img" aria-label={`${v} percent`}>
      <div className="h-1.5 w-24 bg-ink/10">
        <div className="h-full bg-leaf" style={{ width: `${v}%` }} />
      </div>
      <span className="font-mono text-xs text-ink-soft">{v}%</span>
    </div>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`border border-ink/30 bg-white p-5 sm:p-6 ${className}`}>
      {title && <h2 className="mb-4 font-display text-xl">{title}</h2>}
      {children}
    </section>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "success"; children: ReactNode }) {
  const cls = tone === "error" ? "border-rose-300 bg-rose-50 text-rose-800" : tone === "success" ? "border-ink/30 bg-sage" : "border-ink/30 bg-paper-2";
  return <p className={`border px-4 py-3 text-sm ${cls}`}>{children}</p>;
}

export const fmtDate = (ts?: { toDate?: () => Date }) =>
  ts?.toDate ? ts.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

export const fmtDateTime = (ts?: { toDate?: () => Date }) =>
  ts?.toDate ? ts.toDate().toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "—";

export const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const includesText = (haystack: (string | undefined)[], q: string) => {
  const needle = q.trim().toLowerCase();
  return !needle || haystack.some((h) => (h ?? "").toLowerCase().includes(needle));
};
