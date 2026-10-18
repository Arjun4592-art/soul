"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import Topbar from "@/components/student/Topbar";
import FirebaseSetupNotice from "@/components/admin/FirebaseSetupNotice";
import { isFirebaseConfigured } from "@/lib/firebase";

export function StudentPage({ title, children, narrow = false }: { title: string; children: ReactNode; narrow?: boolean }) {
  return (
    <div>
      <Topbar title={title} />
      <div className={`space-y-6 p-5 sm:p-8 ${narrow ? "max-w-2xl" : ""}`}>
        {!isFirebaseConfigured && <FirebaseSetupNotice />}
        {children}
      </div>
    </div>
  );
}

export function Progress({ value, className = "" }: { value: number; className?: string }) {
  const v = Math.max(0, Math.min(100, value || 0));
  return (
    <div className={`h-2 w-full bg-ink/10 ${className}`} role="img" aria-label={`${v} percent complete`}>
      <div className="h-full bg-leaf" style={{ width: `${v}%` }} />
    </div>
  );
}

export function Empty({ children, href, cta }: { children: ReactNode; href?: string; cta?: string }) {
  return (
    <div className="border border-dashed border-ink/40 bg-white/60 px-6 py-14 text-center">
      <p className="mx-auto max-w-sm text-ink-soft">{children}</p>
      {href && cta && (
        <Link href={href} className="mt-5 inline-block border border-ink bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink-2">
          {cta}
        </Link>
      )}
    </div>
  );
}

export const when = (ts?: { toDate?: () => Date }, withTime = false) =>
  ts?.toDate
    ? ts.toDate().toLocaleString("en-IN", withTime ? { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" } : { day: "numeric", month: "short", year: "numeric" })
    : "—";
