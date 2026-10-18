"use client";

import Link from "next/link";
import { where } from "firebase/firestore";
import { StudentPage, Progress, Empty } from "@/components/student/kit";
import { useCollection } from "@/lib/useCollection";
import { useStudentAuth } from "@/lib/student-auth";
import type { EnrollmentDoc } from "@/lib/types";

export default function StudentCoursesPage() {
  const { user } = useStudentAuth();
  const { data: enrollments, loading } = useCollection<EnrollmentDoc>("enrollments", [where("userId", "==", user?.uid ?? "__none__")]);

  return (
    <StudentPage title="My courses">
      {loading ? (
        <p className="text-ink-soft">Loading…</p>
      ) : enrollments.length === 0 ? (
        <Empty href="/courses" cta="See the courses">You are not enrolled in any course yet.</Empty>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {enrollments.map((e) => {
            const done = e.status === "completed" || (e.progress ?? 0) >= 100;
            return (
              <li key={e.id}>
                <Link href={`/student/courses/${e.courseId}`} className="flex h-full flex-col border border-ink/30 bg-white p-5 shadow-[4px_4px_0_0_var(--gold)] transition hover:-translate-y-0.5">
                  <span className="label">{done ? "Completed" : "In progress"}</span>
                  <span className="mt-2 font-display text-xl leading-snug">{e.courseTitle}</span>
                  <span className="mt-auto block pt-6">
                    <Progress value={e.progress ?? 0} />
                    <span className="mt-2 block text-sm text-ink-soft">{e.progress ?? 0}% done</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </StudentPage>
  );
}
