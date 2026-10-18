"use client";

import { useMemo } from "react";
import { StudentPage, Empty, when } from "@/components/student/kit";
import { useCollection } from "@/lib/useCollection";
import type { LiveClassDoc } from "@/lib/types";

export default function StudentLiveClassesPage() {
  const { data, loading } = useCollection<LiveClassDoc>("live_classes");
  const sorted = useMemo(() => [...data].sort((a, b) => (b.scheduledAt?.toDate().getTime() ?? 0) - (a.scheduledAt?.toDate().getTime() ?? 0)), [data]);

  return (
    <StudentPage title="Live classes">
      {loading ? (
        <p className="text-ink-soft">Loading…</p>
      ) : sorted.length === 0 ? (
        <Empty>No live classes yet. When one is scheduled, the Zoom link will show up here.</Empty>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2">
          {sorted.map((c) => {
            const open = c.status === "scheduled" || c.status === "live";
            return (
              <li key={c.id} className={`border bg-white p-5 ${open ? "border-ink shadow-[4px_4px_0_0_var(--gold)]" : "border-ink/20 opacity-80"}`}>
                <p className="label">{c.status === "live" ? "Happening now" : c.status}</p>
                <p className="mt-2 font-display text-xl leading-snug">{c.title}</p>
                {c.courseTitle && <p className="text-sm text-ink-soft">{c.courseTitle}</p>}
                <p className="mt-3 text-sm">{c.scheduledAt ? when(c.scheduledAt, true) : "Time to be announced"}{c.durationMinutes ? ` · ${c.durationMinutes} min` : ""}</p>
                {open && c.zoomLink && (
                  <div className="mt-4">
                    <a href={c.zoomLink} target="_blank" rel="noopener noreferrer" className="inline-block border border-ink bg-ink px-4 py-2.5 text-sm font-medium text-paper hover:bg-ink-2">Join on Zoom</a>
                    {c.zoomPasscode && <p className="mt-2 text-sm text-ink-soft">Passcode: <span className="font-mono">{c.zoomPasscode}</span></p>}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </StudentPage>
  );
}
