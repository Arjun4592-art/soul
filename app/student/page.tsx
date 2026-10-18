"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { where } from "firebase/firestore";
import { StudentPage, Progress, Empty, when } from "@/components/student/kit";
import { useCollection } from "@/lib/useCollection";
import { useStudentAuth } from "@/lib/student-auth";
import type { CertificateDoc, EnrollmentDoc, LiveClassDoc } from "@/lib/types";

export default function StudentDashboardPage() {
  const { user, profile } = useStudentAuth();
  const uid = user?.uid ?? "__none__";
  const [now] = useState(() => Date.now());

  const { data: enrollments, loading } = useCollection<EnrollmentDoc>("enrollments", [where("userId", "==", uid)]);
  const { data: liveClasses } = useCollection<LiveClassDoc>("live_classes");
  const { data: certificates } = useCollection<CertificateDoc>("certificates", [where("userId", "==", uid)]);

  const current = useMemo(() => enrollments.find((e) => (e.progress ?? 0) < 100 && e.status !== "completed") ?? enrollments[0], [enrollments]);
  const upcoming = useMemo(
    () =>
      liveClasses
        .filter((c) => c.status === "scheduled" && c.scheduledAt && c.scheduledAt.toDate().getTime() > now)
        .sort((a, b) => a.scheduledAt!.toDate().getTime() - b.scheduledAt!.toDate().getTime())
        .slice(0, 3),
    [liveClasses, now],
  );
  const firstName = profile?.name?.split(" ")[0];

  return (
    <StudentPage title="Home">
      <h2 className="font-display text-3xl sm:text-4xl">{firstName ? `Hello, ${firstName}.` : "Hello."}</h2>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="border border-ink bg-white p-6 shadow-[6px_6px_0_0_var(--gold)]">
          <p className="label">Pick up where you left off</p>
          {loading ? (
            <p className="mt-4 text-ink-soft">Loading…</p>
          ) : !current ? (
            <div className="mt-4"><Empty href="/courses" cta="See the courses">You are not enrolled in any course yet.</Empty></div>
          ) : (
            <>
              <h3 className="mt-3 font-display text-2xl leading-snug">{current.courseTitle}</h3>
              <Progress value={current.progress ?? 0} className="mt-5" />
              <p className="mt-2 text-sm text-ink-soft">{current.progress ?? 0}% done</p>
              <Link href={`/student/courses/${current.courseId}`} className="mt-6 inline-block border border-ink bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink-2">
                Continue
              </Link>
            </>
          )}
        </section>

        <section className="border border-ink/30 bg-white p-6">
          <p className="label">Coming up</p>
          {upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">No live classes are scheduled right now.</p>
          ) : (
            <ul className="mt-4 divide-y divide-ink/10">
              {upcoming.map((c) => (
                <li key={c.id} className="py-3 first:pt-0">
                  <p className="font-medium">{c.title}</p>
                  <p className="text-sm text-ink-soft">{when(c.scheduledAt, true)}</p>
                </li>
              ))}
            </ul>
          )}
          <Link href="/student/live-classes" className="mt-3 inline-block text-sm underline underline-offset-4">All live classes</Link>
        </section>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Fact n={enrollments.length} label="courses" />
        <Fact n={enrollments.filter((e) => (e.progress ?? 0) >= 100 || e.status === "completed").length} label="finished" />
        <Fact n={certificates.length} label="certificates" />
      </div>

      <section className="flex flex-col items-start justify-between gap-4 border border-ink bg-sage p-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-xl">Want to talk with Preeti?</p>
          <p className="mt-1 text-sm text-ink/80">Request a free call. You will get a time and a Zoom link by email.</p>
        </div>
        <Link href="/book" className="border border-ink bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink-2">Request a call</Link>
      </section>
    </StudentPage>
  );
}

function Fact({ n, label }: { n: number; label: string }) {
  return (
    <div className="border-l-4 border-gold bg-white px-5 py-4">
      <p className="font-display text-4xl leading-none">{n}</p>
      <p className="mt-1 text-sm text-ink-soft">{label}</p>
    </div>
  );
}
