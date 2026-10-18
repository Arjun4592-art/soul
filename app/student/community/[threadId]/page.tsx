"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, where } from "firebase/firestore";
import { StudentPage, when } from "@/components/student/kit";
import { PrimaryButton, TextArea } from "@/components/admin/ui";
import { RowBtn } from "@/components/admin/kit";
import { useCollection } from "@/lib/useCollection";
import { useDoc } from "@/lib/useDoc";
import { useStudentAuth } from "@/lib/student-auth";
import { db } from "@/lib/firebase";
import type { ForumReplyDoc, ForumThreadDoc } from "@/lib/types";

export default function ThreadPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const { user, profile } = useStudentAuth();
  const { data: thread, loading } = useDoc<ForumThreadDoc>("forum_threads", threadId);
  const { data: raw } = useCollection<ForumReplyDoc>("forum_replies", [where("threadId", "==", threadId)]);
  const replies = useMemo(() => [...raw].sort((a, b) => (a.createdAt?.toDate().getTime() ?? 0) - (b.createdAt?.toDate().getTime() ?? 0)), [raw]);

  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  async function reply(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !text.trim()) return;
    setPosting(true);
    try {
      await addDoc(collection(db, "forum_replies"), {
        threadId,
        body: text.trim(),
        authorId: user.uid,
        authorName: profile?.name ?? user.email ?? "Student",
        createdAt: serverTimestamp(),
      });
      setText("");
    } finally {
      setPosting(false);
    }
  }

  return (
    <StudentPage title="Conversation" narrow>
      <Link href="/student/community" className="inline-block text-sm text-ink-soft underline underline-offset-4 hover:text-ink">← All conversations</Link>

      {loading ? (
        <p className="text-ink-soft">Loading…</p>
      ) : !thread ? (
        <p className="text-ink-soft">This conversation could not be found.</p>
      ) : (
        <>
          <article className="border border-ink bg-white p-6">
            <p className="label">{thread.category}</p>
            <h2 className="mt-2 font-display text-2xl leading-snug">{thread.title}</h2>
            <p className="mt-1 text-sm text-ink-soft">{thread.authorName} · {when(thread.createdAt)}</p>
            <p className="mt-4 whitespace-pre-wrap">{thread.body}</p>
          </article>

          <section aria-label="Replies">
            <h3 className="label mb-3">{replies.length} {replies.length === 1 ? "reply" : "replies"}</h3>
            <ul className="space-y-3">
              {replies.map((r) => (
                <li key={r.id} className="border-l-4 border-gold bg-white px-4 py-3">
                  <p className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{r.authorName} <span className="font-normal text-ink-soft">· {when(r.createdAt)}</span></span>
                    {user?.uid === r.authorId && <RowBtn tone="danger" onClick={() => deleteDoc(doc(db, "forum_replies", r.id))}>Delete</RowBtn>}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{r.body}</p>
                </li>
              ))}
            </ul>
          </section>

          <form onSubmit={reply} className="border border-ink/30 bg-white p-4">
            <TextArea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a reply" aria-label="Your reply" />
            <div className="mt-3 flex justify-end"><PrimaryButton type="submit" disabled={posting || !text.trim()}>{posting ? "Posting…" : "Reply"}</PrimaryButton></div>
          </form>
        </>
      )}
    </StudentPage>
  );
}
