"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import { AdminPage, Chip, RowBtn, Toolbar, includesText, slugify } from "@/components/admin/kit";
import { Badge, ConfirmDialog, Field, GhostButton, PrimaryButton, Select, TextArea, TextInput } from "@/components/admin/ui";
import { useCollection } from "@/lib/useCollection";
import { db } from "@/lib/firebase";
import type { CategoryDoc, CourseDoc, CourseStatus } from "@/lib/types";

const TONE: Record<CourseStatus, "success" | "warning" | "neutral"> = { published: "success", draft: "warning", archived: "neutral" };
const blank = { title: "", categoryId: "", price: "", compareAtPrice: "", status: "draft" as CourseStatus, description: "", thumbnailUrl: "" };

export default function AdminCoursesPage() {
  const { data: courses, loading } = useCollection<CourseDoc>("courses");
  const { data: categories } = useCollection<CategoryDoc>("categories");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | CourseStatus>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CourseDoc | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CourseDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(blank);

  const rows = useMemo(() => courses.filter((c) => (status === "all" || c.status === status) && includesText([c.title, c.categoryName], q)), [courses, status, q]);

  function openNew() {
    setEditing(null);
    setForm(blank);
    setOpen(true);
  }
  function openEdit(c: CourseDoc) {
    setEditing(c);
    setForm({
      title: c.title,
      categoryId: c.categoryId ?? "",
      price: String(c.price ?? ""),
      compareAtPrice: c.compareAtPrice ? String(c.compareAtPrice) : "",
      status: c.status,
      description: c.description ?? "",
      thumbnailUrl: c.thumbnailUrl ?? "",
    });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug: slugify(form.title),
        categoryId: form.categoryId,
        categoryName: categories.find((c) => c.id === form.categoryId)?.name ?? "",
        price: Number(form.price) || 0,
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
        status: form.status,
        description: form.description,
        thumbnailUrl: form.thumbnailUrl.trim(),
      };
      if (editing) await updateDoc(doc(db, "courses", editing.id), payload);
      else await addDoc(collection(db, "courses"), { ...payload, moduleCount: 0, lessonCount: 0, enrollCount: 0, createdAt: serverTimestamp() });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminPage title="Courses" intro="Create a course here, then use Content to add its modules and lessons. Only published courses show on the website.">
      <Toolbar
        search={q}
        onSearch={setQ}
        placeholder="Search courses"
        chips={(["all", "published", "draft", "archived"] as const).map((s) => (
          <Chip key={s} active={status === s} onClick={() => setStatus(s)} count={s === "all" ? courses.length : courses.filter((c) => c.status === s).length}>
            {s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)}
          </Chip>
        ))}
        action={<PrimaryButton onClick={openNew}>Add course</PrimaryButton>}
      />

      <DataTable
        rows={rows}
        emptyMessage={loading ? "Loading…" : courses.length === 0 ? "No courses yet. Add your first one." : "No courses match."}
        columns={[
          { header: "Title", render: (c) => <span className="font-medium">{c.title}</span> },
          { header: "Category", render: (c) => c.categoryName || "—" },
          { header: "Price", render: (c) => `₹${c.price?.toLocaleString("en-IN")}` },
          { header: "Lessons", render: (c) => c.lessonCount ?? 0 },
          { header: "Enrolled", render: (c) => c.enrollCount ?? 0 },
          { header: "Status", render: (c) => <Badge tone={TONE[c.status]}>{c.status}</Badge> },
          {
            header: "",
            render: (c) => (
              <>
                <Link href={`/admin/courses/${c.id}`} className="text-sm font-medium underline underline-offset-4">Content</Link>
                <RowBtn onClick={() => openEdit(c)}>Edit</RowBtn>
                <RowBtn tone="danger" onClick={() => setDeleteTarget(c)}>Delete</RowBtn>
              </>
            ),
          },
        ]}
      />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit course" : "Add course"}>
        <form onSubmit={save}>
          <Field label="Title"><TextInput required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Category">
            <Select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">Choose a category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Field label="Price (₹)"><TextInput type="number" min={0} required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field>
            <Field label="Original price (₹), optional"><TextInput type="number" min={0} value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} /></Field>
          </div>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as CourseStatus })}>
              <option value="draft">Draft (hidden)</option>
              <option value="published">Published</option>
              <option value="archived">Archived (hidden)</option>
            </Select>
          </Field>
          <Field label="Cover image link (optional)"><TextInput type="url" value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} placeholder="https://..." /></Field>
          <Field label="Description"><TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <div className="flex justify-end gap-3">
            <GhostButton type="button" onClick={() => setOpen(false)}>Cancel</GhostButton>
            <PrimaryButton type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</PrimaryButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete course"
        message={`Delete "${deleteTarget?.title}"? Its enrollments stay, but students lose the page.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) await deleteDoc(doc(db, "courses", deleteTarget.id));
          setDeleteTarget(null);
        }}
      />
    </AdminPage>
  );
}
