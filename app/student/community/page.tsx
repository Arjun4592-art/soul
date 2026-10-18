"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { StudentPage, Empty, when } from "@/components/student/kit";
import Modal from "@/components/admin/Modal";
import { Field, GhostButton, PrimaryButton, Select, TextArea, TextInput } from "@/components/admin/ui";
import { useCollection } from "@/lib/useCollection";
import { useStudentAuth } from "@/lib/student-auth";
import { db } from "@/lib/firebase";
import type { ForumReplyDoc, ForumThreadDoc } from "@/lib/types";

const CATEGORIES = ["General", "Wins and progress", "Questions", "Introductions"];

export default function CommunityPage() {
  const router = useRouter();
  const { user, profile } = useStudentAuth();
  const { data: threadsRaw, loading } = useCollection<ForumThreadDoc>("forum_threads");
  const { data: replies } = useCollection<ForumReplyDoc>("forum_replies");

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", category: CATEGORIES[0], body: "" });
  const [saving, setSaving] = useState(false);

  const stats = useMemo(() => {
    const m = new Map<string, { count: number; last: number }>();
    for (const r of replies) {
      const t = r.createdAt?.toDate().getTime() ?? 0;
      const s = m.get(r.threadId) ?? { count: 0, last: 0 };
      m.set(r.threadId, { count: s.count + 1, last: Math.max(s.last, t) });
    }
    return m;
  }, [replies]);

  const threads = useMemo(
    () =>
      [...threadsRaw].sort((a, b) => {
        if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
        const at = stats.get(a.id)?.last ?? a.createdAt?.toDate().getTime() ?? 0;
        const bt = stats.get(b.id)?.last ?? b.createdAt?.toDate().getTime() ?? 0;
        return bt - at;
      }),
    [threadsRaw, stats],
  );

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const ref = await addDoc(collection(db, "forum_threads"), {
        title: form.title.trim(),
        category: form.category,
        body: form.body.trim(),
        authorId: user.uid,
        authorName: profile?.name ?? user.email ?? "Student",
        createdAt: serverTimestamp(),
      });
      setOpen(false);
      setForm({ title: "", category: CATEGORIES[0], body: "" });
      router.push(`/student/community/${ref.id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <StudentPage title="Community">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-ink-soft">{threads.length} conversations</p>
        <PrimaryButton onClick={() => setOpen(true)}>Start a conversation</PrimaryButton>
      </div>

      {loading ? (
        <p className="text-ink-soft">Loading…</p>
      ) : threads.length === 0 ? (
        <Empty>No conversations yet. Be the first to say hello.</Empty>
      ) : (
        <ul className="divide-y divide-ink/15 border-y border-ink/30 bg-white">
          {threads.map((t) => (
            <li key={t.id}>
              <Link href={`/student/community/${t.id}`} className="flex items-start justify-between gap-4 px-4 py-4 hover:bg-paper">
                <span className="min-w-0">
                  <span className="label">{t.pinned ? "Pinned · " : ""}{t.category}</span>
                  <span className="mt-1 block truncate font-display text-lg">{t.title}</span>
                  <span className="text-sm text-ink-soft">{t.authorName} · {when(t.createdAt)}</span>
                </span>
                <span className="shrink-0 font-mono text-xs text-ink-soft">{stats.get(t.id)?.count ?? 0} replies</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Start a conversation">
        <form onSubmit={create}>
          <Field label="Title"><TextInput required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Topic">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Message"><TextArea required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></Field>
          <div className="flex justify-end gap-3">
            <GhostButton type="button" onClick={() => setOpen(false)}>Cancel</GhostButton>
            <PrimaryButton type="submit" disabled={saving}>{saving ? "Posting…" : "Post"}</PrimaryButton>
          </div>
        </form>
      </Modal>
    </StudentPage>
  );
}
