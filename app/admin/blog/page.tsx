"use client";

import { useMemo, useState } from "react";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import { AdminPage, Chip, RowBtn, Toolbar, fmtDate, includesText, slugify } from "@/components/admin/kit";
import { Badge, ConfirmDialog, Field, GhostButton, PrimaryButton, Select, TextArea, TextInput } from "@/components/admin/ui";
import { useCollection } from "@/lib/useCollection";
import { db } from "@/lib/firebase";
import type { PostDoc, PostStatus } from "@/lib/types";

const blank = { title: "", excerpt: "", content: "", author: "Preeti", coverUrl: "", status: "draft" as PostStatus };

export default function AdminBlogPage() {
  const { data: posts, loading } = useCollection<PostDoc>("posts");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | PostStatus>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PostDoc | null>(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PostDoc | null>(null);

  const rows = useMemo(() => posts.filter((p) => (status === "all" || p.status === status) && includesText([p.title, p.excerpt], q)), [posts, status, q]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { title: form.title.trim(), slug: slugify(form.title), excerpt: form.excerpt, content: form.content, author: form.author, coverUrl: form.coverUrl.trim(), status: form.status };
      if (editing) await updateDoc(doc(db, "posts", editing.id), payload);
      else await addDoc(collection(db, "posts"), { ...payload, createdAt: serverTimestamp() });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminPage title="Journal" intro="Articles for the public Journal page. Only published posts are visible.">
      <Toolbar
        search={q}
        onSearch={setQ}
        placeholder="Search posts"
        chips={(["all", "published", "draft"] as const).map((s) => (
          <Chip key={s} active={status === s} onClick={() => setStatus(s)} count={s === "all" ? posts.length : posts.filter((p) => p.status === s).length}>
            {s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)}
          </Chip>
        ))}
        action={<PrimaryButton onClick={() => { setEditing(null); setForm(blank); setOpen(true); }}>New post</PrimaryButton>}
      />

      <DataTable
        rows={rows}
        emptyMessage={loading ? "Loading…" : posts.length === 0 ? "No posts yet. Write the first one." : "No posts match."}
        columns={[
          { header: "Title", render: (p) => <span className="font-medium">{p.title}</span> },
          { header: "Author", render: (p) => p.author || "—" },
          { header: "Written", render: (p) => fmtDate(p.createdAt) },
          { header: "Status", render: (p) => <Badge tone={p.status === "published" ? "success" : "warning"}>{p.status}</Badge> },
          {
            header: "",
            render: (p) => (
              <>
                {p.status === "published" && <RowBtn href={`/blog/${p.slug}`}>View</RowBtn>}
                <RowBtn onClick={() => { setEditing(p); setForm({ title: p.title, excerpt: p.excerpt ?? "", content: p.content ?? "", author: p.author ?? "Preeti", coverUrl: p.coverUrl ?? "", status: p.status }); setOpen(true); }}>Edit</RowBtn>
                <RowBtn tone="danger" onClick={() => setDeleteTarget(p)}>Delete</RowBtn>
              </>
            ),
          },
        ]}
      />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit post" : "New post"} wide>
        <form onSubmit={save}>
          <Field label="Title"><TextInput required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Short summary"><TextArea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></Field>
          <Field label="Article"><TextArea className="min-h-56" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></Field>
          <Field label="Cover image link (optional)"><TextInput type="url" value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} placeholder="https://..." /></Field>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Field label="Author"><TextInput value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PostStatus })}>
                <option value="draft">Draft (hidden)</option>
                <option value="published">Published</option>
              </Select>
            </Field>
          </div>
          <div className="flex justify-end gap-3">
            <GhostButton type="button" onClick={() => setOpen(false)}>Cancel</GhostButton>
            <PrimaryButton type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</PrimaryButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title="Delete post" message={`Delete "${deleteTarget?.title}"?`} onCancel={() => setDeleteTarget(null)} onConfirm={async () => { if (deleteTarget) await deleteDoc(doc(db, "posts", deleteTarget.id)); setDeleteTarget(null); }} />
    </AdminPage>
  );
}
