"use client";

import { useMemo, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import { AdminPage, Chip, Notice, RowBtn, Toolbar, fmtDate, includesText } from "@/components/admin/kit";
import { Badge, ConfirmDialog, Field, GhostButton, PrimaryButton, Select, TextInput } from "@/components/admin/ui";
import { useCollection } from "@/lib/useCollection";
import { authedFetch } from "@/lib/authed-fetch";
import { db } from "@/lib/firebase";
import type { Role, UserDoc } from "@/lib/types";

const blank = { name: "", email: "", password: "", role: "student" as Role, phone: "" };

export default function AdminUsersPage() {
  const { data: users, loading } = useCollection<UserDoc>("users");
  const [q, setQ] = useState("");
  const [role, setRole] = useState<"all" | Role>("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<UserDoc | null>(null);
  const [pageError, setPageError] = useState("");

  const rows = useMemo(() => users.filter((u) => (role === "all" || u.role === role) && includesText([u.name, u.email, u.phone], q)), [users, role, q]);
  const count = (r: Role) => users.filter((u) => u.role === r).length;

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await authedFetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create the user.");
      setOpen(false);
      setForm(blank);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the user.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!deleteTarget) return;
    setPageError("");
    const res = await authedFetch(`/api/admin/users/${deleteTarget.id}`, { method: "DELETE" });
    if (!res.ok) setPageError((await res.json().catch(() => ({}))).error ?? "Could not delete the user.");
    setDeleteTarget(null);
  }

  return (
    <AdminPage title="Users" intro="Everyone with an account. Blocking someone stops them signing in to the student portal.">
      {pageError && <Notice tone="error">{pageError}</Notice>}
      <Toolbar
        search={q}
        onSearch={setQ}
        placeholder="Search name, email or phone"
        chips={
          <>
            <Chip active={role === "all"} onClick={() => setRole("all")} count={users.length}>All</Chip>
            <Chip active={role === "student"} onClick={() => setRole("student")} count={count("student")}>Students</Chip>
            <Chip active={role === "coach"} onClick={() => setRole("coach")} count={count("coach")}>Coaches</Chip>
            <Chip active={role === "admin"} onClick={() => setRole("admin")} count={count("admin")}>Admins</Chip>
          </>
        }
        action={<PrimaryButton onClick={() => setOpen(true)}>Add user</PrimaryButton>}
      />

      <DataTable
        rows={rows}
        emptyMessage={loading ? "Loading…" : "No users match."}
        columns={[
          { header: "Name", render: (u) => <span className="font-medium">{u.name}</span> },
          { header: "Email", render: (u) => u.email },
          { header: "Role", render: (u) => <Badge tone={u.role === "admin" ? "gold" : u.role === "coach" ? "info" : "neutral"}>{u.role}</Badge> },
          { header: "Courses", render: (u) => u.coursesEnrolled ?? 0 },
          { header: "Joined", render: (u) => fmtDate(u.createdAt) },
          {
            header: "Status",
            render: (u) => (
              <button title="Click to block or unblock" onClick={() => updateDoc(doc(db, "users", u.id), { status: u.status === "active" ? "blocked" : "active" })}>
                <Badge tone={u.status === "active" ? "success" : "danger"}>{u.status}</Badge>
              </button>
            ),
          },
          { header: "", render: (u) => <RowBtn tone="danger" onClick={() => setDeleteTarget(u)}>Delete</RowBtn> },
        ]}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Add user">
        <form onSubmit={create}>
          <Field label="Full name"><TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Email"><TextInput type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Temporary password (min 6 characters)"><TextInput type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
          <Field label="Phone (optional)"><TextInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Role">
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
              <option value="student">Student</option>
              <option value="coach">Coach (can manage content and bookings)</option>
              <option value="admin">Admin (full access)</option>
            </Select>
          </Field>
          {error && <div className="mb-4"><Notice tone="error">{error}</Notice></div>}
          <div className="flex justify-end gap-3">
            <GhostButton type="button" onClick={() => setOpen(false)}>Cancel</GhostButton>
            <PrimaryButton type="submit" disabled={saving}>{saving ? "Creating…" : "Create user"}</PrimaryButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title="Delete user" message={`Permanently delete ${deleteTarget?.name}? Their login is removed too.`} onCancel={() => setDeleteTarget(null)} onConfirm={remove} />
    </AdminPage>
  );
}
