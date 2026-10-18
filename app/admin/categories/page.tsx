"use client";

import { useState } from "react";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import { AdminPage, RowBtn, Toolbar, slugify } from "@/components/admin/kit";
import { ConfirmDialog, Field, GhostButton, PrimaryButton, TextArea, TextInput } from "@/components/admin/ui";
import { useCollection } from "@/lib/useCollection";
import { db } from "@/lib/firebase";
import type { CategoryDoc, CourseDoc } from "@/lib/types";

export default function AdminCategoriesPage() {
  const { data: categories, loading } = useCollection<CategoryDoc>("categories");
  const { data: courses } = useCollection<CourseDoc>("courses");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryDoc | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), slug: slugify(form.name), description: form.description };
      if (editing) await updateDoc(doc(db, "categories", editing.id), payload);
      else await addDoc(collection(db, "categories"), { ...payload, createdAt: serverTimestamp() });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminPage title="Categories" intro="Groups for your courses. They show as filters on the public Courses page.">
      <Toolbar action={<PrimaryButton onClick={() => { setEditing(null); setForm({ name: "", description: "" }); setOpen(true); }}>Add category</PrimaryButton>} summary={`${categories.length} categories`} />

      <DataTable
        rows={categories}
        emptyMessage={loading ? "Loading…" : "No categories yet. Add one before creating courses."}
        columns={[
          { header: "Name", render: (c) => <span className="font-medium">{c.name}</span> },
          { header: "Description", hideOnMobile: true, render: (c) => <span className="line-clamp-1 max-w-sm text-ink-soft">{c.description || "—"}</span> },
          { header: "Courses", render: (c) => courses.filter((x) => x.categoryId === c.id).length },
          {
            header: "",
            render: (c) => (
              <>
                <RowBtn onClick={() => { setEditing(c); setForm({ name: c.name, description: c.description ?? "" }); setOpen(true); }}>Edit</RowBtn>
                <RowBtn tone="danger" onClick={() => setDeleteTarget(c)}>Delete</RowBtn>
              </>
            ),
          },
        ]}
      />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit category" : "Add category"}>
        <form onSubmit={save}>
          <Field label="Name"><TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Description (optional)"><TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <div className="flex justify-end gap-3">
            <GhostButton type="button" onClick={() => setOpen(false)}>Cancel</GhostButton>
            <PrimaryButton type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</PrimaryButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete category"
        message={`Delete "${deleteTarget?.name}"? Courses in it will have no category.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) await deleteDoc(doc(db, "categories", deleteTarget.id));
          setDeleteTarget(null);
        }}
      />
    </AdminPage>
  );
}
