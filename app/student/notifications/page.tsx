"use client";

import { orderBy } from "firebase/firestore";
import { StudentPage, Empty, when } from "@/components/student/kit";
import { useCollection } from "@/lib/useCollection";

type Announcement = { id: string; title: string; body: string; sentAt?: { toDate: () => Date } };

export default function StudentAnnouncementsPage() {
  const { data, loading } = useCollection<Announcement>("notifications", [orderBy("sentAt", "desc")]);

  return (
    <StudentPage title="Announcements" narrow>
      {loading ? (
        <p className="text-ink-soft">Loading…</p>
      ) : data.length === 0 ? (
        <Empty>Nothing new. Announcements from Preeti will show up here.</Empty>
      ) : (
        <ul className="divide-y divide-ink/15 border-y border-ink/30">
          {data.map((n) => (
            <li key={n.id} className="py-5">
              <p className="label">{when(n.sentAt)}</p>
              <p className="mt-1 font-display text-xl">{n.title}</p>
              <p className="mt-1 whitespace-pre-wrap text-ink-soft">{n.body}</p>
            </li>
          ))}
        </ul>
      )}
    </StudentPage>
  );
}
