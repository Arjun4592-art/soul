"use client";

import { useState } from "react";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import { AdminPage, RowBtn, Toolbar } from "@/components/admin/kit";
import { Badge, ConfirmDialog, Field, GhostButton, PrimaryButton, Select, TextInput } from "@/components/admin/ui";
import { useCollection } from "@/lib/useCollection";
import { db } from "@/lib/firebase";
import type { CouponDoc } from "@/lib/types";

const blank = { code: "", type: "percent" as "percent" | "flat", value: "", maxUses: "", active: true };

export default function AdminCouponsPage() {
  const { data: coupons, loading } = useCollection<CouponDoc>("coupons");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CouponDoc | null>(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CouponDoc | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { code: form.code.toUpperCase().trim(), type: form.type, value: Number(form.value) || 0, maxUses: form.maxUses ? Number(form.maxUses) : null, active: form.active };
      if (editing) await updateDoc(doc(db, "coupons", editing.id), payload);
      else await addDoc(collection(db, "coupons"), { ...payload, usedCount: 0, createdAt: serverTimestamp() });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminPage title="Coupons" intro="Discount codes students type in at checkout.">
      <Toolbar summary={`${coupons.length} coupons`} action={<PrimaryButton onClick={() => { setEditing(null); setForm(blank); setOpen(true); }}>Add coupon</PrimaryButton>} />

      <DataTable
        rows={coupons}
        emptyMessage={loading ? "Loading…" : "No coupons yet."}
        columns={[
          { header: "Code", render: (c) => <span className="font-mono font-medium">{c.code}</span> },
          { header: "Discount", render: (c) => (c.type === "percent" ? `${c.value}% off` : `₹${c.value} off`) },
          { header: "Used", render: (c) => `${c.usedCount ?? 0}${c.maxUses ? ` of ${c.maxUses}` : ""}` },
          { header: "Status", render: (c) => <button onClick={() => updateDoc(doc(db, "coupons", c.id), { active: !c.active })} title="Click to switch on or off"><Badge tone={c.active ? "success" : "neutral"}>{c.active ? "on" : "off"}</Badge></button> },
          {
            header: "",
            render: (c) => (
              <>
                <RowBtn onClick={() => { setEditing(c); setForm({ code: c.code, type: c.type, value: String(c.value), maxUses: c.maxUses ? String(c.maxUses) : "", active: c.active }); setOpen(true); }}>Edit</RowBtn>
                <RowBtn tone="danger" onClick={() => setDeleteTarget(c)}>Delete</RowBtn>
              </>
            ),
          },
        ]}
      />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit coupon" : "Add coupon"}>
        <form onSubmit={save}>
          <Field label="Code"><TextInput required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="WELCOME20" /></Field>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Field label="Type">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "percent" | "flat" })}>
                <option value="percent">Percent off</option>
                <option value="flat">Rupees off</option>
              </Select>
            </Field>
            <Field label="Amount"><TextInput type="number" min={0} required value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></Field>
          </div>
          <Field label="Limit on uses (optional)"><TextInput type="number" min={0} value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} /></Field>
          <label className="mb-5 flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
          <div className="flex justify-end gap-3">
            <GhostButton type="button" onClick={() => setOpen(false)}>Cancel</GhostButton>
            <PrimaryButton type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</PrimaryButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title="Delete coupon" message={`Delete ${deleteTarget?.code}?`} onCancel={() => setDeleteTarget(null)} onConfirm={async () => { if (deleteTarget) await deleteDoc(doc(db, "coupons", deleteTarget.id)); setDeleteTarget(null); }} />
    </AdminPage>
  );
}
