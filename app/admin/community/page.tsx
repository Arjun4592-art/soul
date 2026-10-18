"use client";

import { useMemo, useState } from "react";
import { collection, deleteDoc, doc, getDocs, query, updateDoc, where, writeBatch } from "firebase/firestore";
import { AdminPage, RowBtn, Toolbar, fmtDateTime, includesText } from "@/components/admin/kit";
import { Badge, ConfirmDialog } from "@/components/admin/ui";
import { useCollection } from "@/lib/useCollection";
import { db } from "@/lib/firebase";
import type { ForumReplyDoc, ForumThreadDoc } from "@/lib/types";

export default function AdminCommunityPage() {
  const { data: threadsRaw, loading } = useCollection<ForumThreadDoc>("forum_threads");
  const { data: replies } = useCollection<ForumReplyDoc>("forum_replies");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ForumThreadDoc | null>(null);

  const threads = useMemo(
    () =>
      threadsRaw
        .filter((t) => includesText([t.title, t.body, t.authorName, t.category], q))
        .sort((a, b) => (a.pinned === b.pinned ? (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0) : a.pinned ? -1 : 1)),
    [threadsRaw, q]
  );

  async function deleteThread() {
    if (!deleteTarget) return;
    const snap = await getDocs(query(collection(db, "forum_replies"), where("threadId", "==", deleteTarget.id)));
    const batch = writeBatch(db);
    snap.forEach((d) => batch.delete(d.ref));
    batch.delete(doc(db, "forum_threads", deleteTarget.id));
    await batch.commit();
    setDeleteTarget(null);
  }

  return (
    <AdminPage title="Community" intro="Student discussions. Pin important ones to the top, or remove anything that should not be there.">
      <Toolbar search={q} onSearch={setQ} placeholder="Search discussions" summary={`${threadsRaw.length} discussions, ${replies.length} replies`} />

      {loading ? (
        <p className="text-ink-soft">Loading…</p>
      ) : threads.length === 0 ? (
        <div className="border border-dashed border-ink/40 bg-white/60 px-6 py-16 text-center text-ink-soft">No discussions yet.</div>
      ) : (
        <ul className="divide-y divide-ink/15 border border-ink/30 bg-white">
          {threads.map((t) => {
            const mine = replies.filter((r) => r.threadId === t.id);
            const isOpen = open === t.id;
            return (
              <li key={t.id}>
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <button onClick={() => setOpen(isOpen ? null : t.id)} className="min-w-0 text-left" aria-expanded={isOpen}>
                    <p className="flex flex-wrap items-center gap-2">
                      {t.pinned && <Badge tone="gold">pinned</Badge>}
                      <span className="font-display text-xl leading-snug">{t.title}</span>
                    </p>
                    <p className="mt-1 text-xs text-ink-soft">
                      {t.category} · {t.authorName} · {fmtDateTime(t.createdAt)} · {mine.length} replies
                    </p>
                  </button>
                  <div className="flex shrink-0 gap-5">
                    <RowBtn onClick={() => updateDoc(doc(db, "forum_threads", t.id), { pinned: !t.pinned })}>{t.pinned ? "Unpin" : "Pin"}</RowBtn>
                    <RowBtn tone="danger" onClick={() => setDeleteTarget(t)}>Delete</RowBtn>
                  </div>
                </div>

                {isOpen && (
                  <div className="space-y-3 border-t border-ink/10 bg-paper px-4 py-5 sm:px-5">
                    <p className="whitespace-pre-wrap text-sm">{t.body}</p>
                    {mine.length === 0 ? (
                      <p className="text-sm text-ink-soft">No replies.</p>
                    ) : (
                      <ul className="space-y-2 border-l-2 border-gold pl-4">
                        {mine.map((r) => (
                          <li key={r.id} className="flex items-start justify-between gap-4 bg-white p-3 text-sm">
                            <div>
                              <p className="font-medium">{r.authorName}</p>
                              <p className="mt-0.5 whitespace-pre-wrap text-ink-soft">{r.body}</p>
                            </div>
                            <RowBtn tone="danger" onClick={() => deleteDoc(doc(db, "forum_replies", r.id))}>Remove</RowBtn>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Delete discussion" message={`Delete "${deleteTarget?.title}" and every reply?`} onCancel={() => setDeleteTarget(null)} onConfirm={deleteThread} />
    </AdminPage>
  );
}
