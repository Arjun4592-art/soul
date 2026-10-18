"use client";

import Link from "next/link";
import { useMemo } from "react";
import { where } from "firebase/firestore";
import { StudentPage, Empty, when } from "@/components/student/kit";
import { useCollection } from "@/lib/useCollection";
import { useStudentAuth } from "@/lib/student-auth";
import type { NoteDoc } from "@/lib/types";

export default function StudentNotesPage() {
  const { user } = useStudentAuth();
  const { data, loading } = useCollection<NoteDoc>("notes", [where("userId", "==", user?.uid ?? "__none__")]);
  const notes = useMemo(
    () => data.filter((n) => n.content?.trim()).sort((a, b) => (b.updatedAt?.toDate().getTime() ?? 0) - (a.updatedAt?.toDate().getTime() ?? 0)),
    [data],
  );

  return (
    <StudentPage title="My notes">
      {loading ? (
        <p className="text-ink-soft">Loading…</p>
      ) : notes.length === 0 ? (
        <Empty>Notes you write while watching a lesson are collected here.</Empty>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2">
          {notes.map((n) => (
            <li key={n.id}>
              <Link href={`/student/courses/${n.courseId}`} className="block h-full border border-ink/30 bg-white p-5 hover:border-ink">
                <p className="label">{n.lessonTitle ?? "Lesson"}</p>
                <p className="mt-2 line-clamp-5 whitespace-pre-wrap text-sm">{n.content}</p>
                <p className="mt-3 text-xs text-ink-soft">{when(n.updatedAt)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </StudentPage>
  );
}
