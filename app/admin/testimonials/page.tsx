"use client";

import { useState } from "react";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import { AdminPage, Notice, RowBtn, Toolbar } from "@/components/admin/kit";
import { Badge, ConfirmDialog, Field, GhostButton, PrimaryButton, TextArea, TextInput } from "@/components/admin/ui";
import { useCollection } from "@/lib/useCollection";
import { db } from "@/lib/firebase";
import type { TestimonialDoc } from "@/lib/types";

const blank = { name: "", role: "", quote: "", featured: false };

export default function AdminVoicesPage() {
  const { data: items, loading } = useCollection<TestimonialDoc>("testimonials");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TestimonialDoc | null>(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TestimonialDoc | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), role: form.role.trim(), quote: form.quote.trim(), featured: form.featured };
      if (editing) await updateDoc(doc(db, "testimonials", editing.id), payload);
      else await addDoc(collection(db, "testimonials"), { ...payload, createdAt: serverTimestamp() });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminPage title="Voices" intro="Testimonials shown on the home page and the Voices page. Only add words people have agreed to share.">
      {items.length === 0 && !loading && <Notice>Nothing added yet, so the website is showing a built-in set of sample voices. Add your own here and they replace the sample set automatically.</Notice>}
      <Toolbar summary={`${items.length} voices`} action={<PrimaryButton onClick={() => { setEditing(null); setForm(blank); setOpen(true); }}>Add voice</PrimaryButton>} />

      <DataTable
        rows={items}
        emptyMessage={loading ? "Loading…" : "No voices yet."}
        columns={[
          { header: "Name", render: (t) => <div><p className="font-medium">{t.name}</p>{t.role && <p className="text-xs text-ink-soft">{t.role}</p>}</div> },
          { header: "Words", render: (t) => <span className="line-clamp-2 max-w-md text-left text-ink-soft">{t.quote}</span> },
          { header: "On home page", render: (t) => <button onClick={() => updateDoc(doc(db, "testimonials", t.id), { featured: !t.featured })} title="Click to change"><Badge tone={t.featured ? "gold" : "neutral"}>{t.featured ? "first" : "normal"}</Badge></button> },
          {
            header: "",
            render: (t) => (
              <>
                <RowBtn onClick={() => { setEditing(t); setForm({ name: t.name, role: t.role ?? "", quote: t.quote, featured: !!t.featured }); setOpen(true); }}>Edit</RowBtn>
                <RowBtn tone="danger" onClick={() => setDeleteTarget(t)}>Delete</RowBtn>
              </>
            ),
          },
        ]}
      />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit voice" : "Add voice"}>
        <form onSubmit={save}>
          <Field label="Name"><TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Programme or cohort (optional)"><TextInput value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Jan '26 cohort" /></Field>
          <Field label="Their words"><TextArea required value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} /></Field>
          <label className="mb-5 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Show first on the home page
          </label>
          <div className="flex justify-end gap-3">
            <GhostButton type="button" onClick={() => setOpen(false)}>Cancel</GhostButton>
            <PrimaryButton type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</PrimaryButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title="Delete voice" message={`Delete the words from ${deleteTarget?.name}?`} onCancel={() => setDeleteTarget(null)} onConfirm={async () => { if (deleteTarget) await deleteDoc(doc(db, "testimonials", deleteTarget.id)); setDeleteTarget(null); }} />
    </AdminPage>
  );
}
