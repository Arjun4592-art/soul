"use client";

import { useMemo, useState } from "react";
import { doc, orderBy, updateDoc } from "firebase/firestore";
import Topbar from "@/components/admin/Topbar";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import FirebaseSetupNotice from "@/components/admin/FirebaseSetupNotice";
import { Badge, ConfirmDialog, Field, GhostButton, PrimaryButton, Select, TextInput } from "@/components/admin/ui";
import { useCollection } from "@/lib/useCollection";
import { authedFetch } from "@/lib/authed-fetch";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { TOPICS } from "@/lib/site";
import type { BookingDoc, BookingStatus } from "@/lib/types";

const TONE: Record<BookingStatus, "warning" | "success" | "neutral" | "danger"> = {
  requested: "warning",
  scheduled: "success",
  completed: "neutral",
  cancelled: "danger",
};

const TOPIC_LABEL: Record<string, string> = { heal: "Heal", lead: "Lead yourself", coach: "Coach", unsure: "Not sure" };

type Tab = "requested" | "scheduled" | "past";

/** <input type="datetime-local"> value in the browser's local time. */
function toLocalInput(d?: Date) {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const emptyForm = { name: "", email: "", phone: "", topic: "unsure", startLocal: "", durationMinutes: "30", zoomLink: "", zoomPasscode: "", adminNote: "", sendEmail: true };

export default function AdminBookingsPage() {
  const { data: bookings, loading } = useCollection<BookingDoc>("bookings", [orderBy("createdAt", "desc")]);
  const [tab, setTab] = useState<Tab>("requested");
  const [editing, setEditing] = useState<BookingDoc | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<BookingDoc | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const counts = useMemo(
    () => ({
      requested: bookings.filter((b) => b.status === "requested").length,
      scheduled: bookings.filter((b) => b.status === "scheduled").length,
      past: bookings.filter((b) => b.status === "completed" || b.status === "cancelled").length,
    }),
    [bookings]
  );

  const rows = useMemo(() => {
    const list = bookings.filter((b) => (tab === "past" ? b.status === "completed" || b.status === "cancelled" : b.status === tab));
    if (tab === "scheduled") list.sort((a, b) => (a.startTime?.toMillis() ?? 0) - (b.startTime?.toMillis() ?? 0));
    return list;
  }, [bookings, tab]);

  function openSchedule(b: BookingDoc) {
    setError("");
    setForm({
      ...emptyForm,
      name: b.name,
      email: b.email,
      phone: b.phone ?? "",
      topic: b.topic,
      startLocal: toLocalInput(b.startTime?.toDate()),
      durationMinutes: String(b.durationMinutes ?? 30),
      zoomLink: b.zoomLink ?? "",
      zoomPasscode: b.zoomPasscode ?? "",
      adminNote: b.adminNote ?? "",
    });
    setEditing(b);
  }

  function openNew() {
    setError("");
    setForm(emptyForm);
    setEditing("new");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        startISO: form.startLocal ? new Date(form.startLocal).toISOString() : "",
        durationMinutes: Number(form.durationMinutes) || 30,
      };
      const url = editing === "new" ? "/api/admin/bookings" : `/api/admin/bookings/${editing.id}/schedule`;
      const res = await authedFetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save.");
      setNotice(data.emailed ? `Saved. Confirmation email sent to ${form.email}.` : "Saved. No email was sent (email is not configured, or you turned it off).");
      setEditing(null);
      setTab("scheduled");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  async function cancel() {
    if (!cancelTarget) return;
    setError("");
    try {
      const res = await authedFetch(`/api/admin/bookings/${cancelTarget.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not cancel.");
      setCancelTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cancel.");
    }
  }

  async function markDone(b: BookingDoc) {
    await updateDoc(doc(db, "bookings", b.id), { status: "completed" });
  }

  const tabBtn = (t: Tab, label: string) => (
    <button
      onClick={() => setTab(t)}
      className={`border px-4 py-2 text-sm transition ${tab === t ? "border-ink bg-ink text-paper" : "border-ink/30 hover:border-ink"}`}
    >
      {label} <span className="ml-1 font-mono text-xs opacity-70">{counts[t]}</span>
    </button>
  );

  return (
    <div>
      <Topbar title="Call bookings" />
      <div className="space-y-5 p-5 sm:p-8">
        {!isFirebaseConfigured && <FirebaseSetupNotice />}
        {error && !editing && <p className="border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
        {notice && <p className="border border-ink/30 bg-sage px-4 py-3 text-sm">{notice}</p>}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {tabBtn("requested", "Needs scheduling")}
            {tabBtn("scheduled", "Scheduled")}
            {tabBtn("past", "Past and cancelled")}
          </div>
          <PrimaryButton onClick={openNew}>Add booking</PrimaryButton>
        </div>

        <DataTable
          rows={rows}
          emptyMessage={loading ? "Loading…" : tab === "requested" ? "No new requests. Requests from the Book a call page appear here." : "Nothing here."}
          columns={[
            {
              header: "Guest",
              render: (b) => (
                <div>
                  <p className="font-medium">{b.name}</p>
                  <p className="text-xs text-ink-soft">{b.email}</p>
                  {b.phone && <p className="text-xs text-ink-soft">{b.phone}</p>}
                </div>
              ),
            },
            { header: "Topic", render: (b) => TOPIC_LABEL[b.topic] ?? b.topic },
            {
              header: tab === "requested" ? "Guest prefers" : "When",
              render: (b) =>
                tab === "requested" ? (
                  <div className="max-w-xs text-sm">
                    <p>{b.preferredTime || "No preference given"}</p>
                    {b.message && <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{b.message}</p>}
                  </div>
                ) : b.startTime ? (
                  b.startTime.toDate().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                ) : (
                  "—"
                ),
            },
            { header: "Status", render: (b) => <Badge tone={TONE[b.status]}>{b.status}</Badge> },
            {
              header: "",
              render: (b) => (
                <div className="flex flex-wrap justify-end gap-2">
                  {b.zoomLink && b.status === "scheduled" && (
                    <a href={b.zoomLink} target="_blank" rel="noreferrer" className="border border-ink/40 px-3 py-1.5 text-xs hover:border-ink">
                      Open Zoom
                    </a>
                  )}
                  {(b.status === "requested" || b.status === "scheduled") && (
                    <button onClick={() => openSchedule(b)} className="border border-ink bg-ink px-3 py-1.5 text-xs text-paper hover:bg-ink-2">
                      {b.status === "requested" ? "Schedule" : "Edit"}
                    </button>
                  )}
                  {b.status === "scheduled" && (
                    <button onClick={() => markDone(b)} className="border border-ink/40 px-3 py-1.5 text-xs hover:border-ink">
                      Mark done
                    </button>
                  )}
                  {(b.status === "requested" || b.status === "scheduled") && (
                    <button onClick={() => setCancelTarget(b)} className="border border-rose-300 px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50">
                      Cancel
                    </button>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? "Add booking" : "Schedule call"} wide>
        <form onSubmit={save}>
          {editing === "new" ? (
            <div className="grid gap-x-4 sm:grid-cols-2">
              <Field label="Guest name">
                <TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Guest email">
                <TextInput required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Phone (optional)">
                <TextInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Field>
              <Field label="Topic">
                <Select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>
                  {TOPICS.map((t) => (
                    <option key={t.value} value={t.value}>{TOPIC_LABEL[t.value]}</option>
                  ))}
                </Select>
              </Field>
            </div>
          ) : (
            <p className="mb-5 border border-ink/20 bg-white px-4 py-3 text-sm">
              <span className="font-medium">{form.name}</span> · {form.email}
              {editing && editing.preferredTime ? <span className="block text-ink-soft">Prefers: {editing.preferredTime}</span> : null}
            </p>
          )}

          <div className="grid gap-x-4 sm:grid-cols-2">
            <Field label="Date and time (your local time)">
              <TextInput required type="datetime-local" value={form.startLocal} onChange={(e) => setForm({ ...form, startLocal: e.target.value })} />
            </Field>
            <Field label="Duration (minutes)">
              <TextInput type="number" min={10} max={240} value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} />
            </Field>
          </div>
          <Field label="Zoom meeting link">
            <TextInput required type="url" placeholder="https://zoom.us/j/..." value={form.zoomLink} onChange={(e) => setForm({ ...form, zoomLink: e.target.value })} />
          </Field>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Field label="Passcode (optional)">
              <TextInput value={form.zoomPasscode} onChange={(e) => setForm({ ...form, zoomPasscode: e.target.value })} />
            </Field>
            <Field label="Private note (optional)">
              <TextInput value={form.adminNote} onChange={(e) => setForm({ ...form, adminNote: e.target.value })} />
            </Field>
          </div>

          <label className="mb-5 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.sendEmail} onChange={(e) => setForm({ ...form, sendEmail: e.target.checked })} />
            Email the time and Zoom link to the guest
          </label>

          {error && <p className="mb-4 border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>}

          <div className="flex justify-end gap-3">
            <GhostButton type="button" onClick={() => setEditing(null)}>Close</GhostButton>
            <PrimaryButton type="submit" disabled={saving}>{saving ? "Saving…" : "Save and confirm"}</PrimaryButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancel this call?"
        message={`${cancelTarget?.name} will get a cancellation email.`}
        onCancel={() => setCancelTarget(null)}
        onConfirm={cancel}
        confirmLabel="Cancel call"
      />
    </div>
  );
}
