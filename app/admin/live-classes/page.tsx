"use client";

import { useState } from "react";
import { addDoc, collection, deleteDoc, doc, Timestamp, updateDoc } from "firebase/firestore";
import { Plus, Loader2, ExternalLink } from "lucide-react";
import Topbar from "@/components/admin/Topbar";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import FirebaseSetupNotice from "@/components/admin/FirebaseSetupNotice";
import { Field, TextInput, Select, PrimaryButton, GhostButton, ConfirmDialog } from "@/components/admin/ui";
import { useCollection } from "@/lib/useCollection";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import type { LiveClassDoc, CourseDoc } from "@/lib/types";

const emptyForm = {
  title: "",
  courseId: "",
  zoomLink: "",
  zoomPasscode: "",
  scheduledAt: "",
  durationMinutes: "60",
};

export default function AdminLiveClassesPage() {
  const { data: liveClasses, loading } = useCollection<LiveClassDoc>("live_classes", []);
  const { data: courses } = useCollection<CourseDoc>("courses");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LiveClassDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const course = courses.find((c) => c.id === form.courseId);
      await addDoc(collection(db, "live_classes"), {
        title: form.title,
        courseId: form.courseId || null,
        courseTitle: course?.title ?? null,
        zoomLink: form.zoomLink.trim(),
        zoomPasscode: form.zoomPasscode.trim() || null,
        scheduledAt: form.scheduledAt ? Timestamp.fromDate(new Date(form.scheduledAt)) : null,
        durationMinutes: Number(form.durationMinutes) || 60,
        status: "scheduled",
      });
      setModalOpen(false);
      setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteDoc(doc(db, "live_classes", deleteTarget.id));
    setDeleteTarget(null);
  }

  async function setStatus(cls: LiveClassDoc, status: LiveClassDoc["status"]) {
    await updateDoc(doc(db, "live_classes", cls.id), { status });
  }

  return (
    <div>
      <Topbar title="Live Classes" />
      <div className="space-y-5 p-5 sm:p-8">
        {!isFirebaseConfigured && <FirebaseSetupNotice />}

        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-soft">{liveClasses.length} scheduled sessions</p>
          <PrimaryButton onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Schedule Class
          </PrimaryButton>
        </div>

        <DataTable
          rows={liveClasses}
          emptyMessage={loading ? "Loading…" : "No live classes scheduled yet."}
          columns={[
            { header: "Title", render: (c) => <span className="font-medium">{c.title}</span> },
            { header: "Course", render: (c) => c.courseTitle || "All students" },
            {
              header: "When",
              render: (c) => (c.scheduledAt ? c.scheduledAt.toDate().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—"),
            },
            { header: "Duration", render: (c) => `${c.durationMinutes ?? 60} min` },
            {
              header: "Status",
              render: (c) => (
                <Select
                  value={c.status}
                  onChange={(e) => setStatus(c, e.target.value as LiveClassDoc["status"])}
                  className="!w-auto !py-1.5 !text-xs"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="live">Live</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              ),
            },
            {
              header: "Zoom link",
              render: (c) =>
                c.zoomLink ? (
                  <a href={c.zoomLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm underline underline-offset-4 hover:text-ink-2">
                    <ExternalLink className="h-3.5 w-3.5" /> Open
                  </a>
                ) : (
                  <span className="text-ink-soft">—</span>
                ),
            },
            {
              header: "",
              render: (c) => (
                <button onClick={() => setDeleteTarget(c)} className="text-sm text-rose-600 hover:underline">
                  Delete
                </button>
              ),
            },
          ]}
        />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Schedule live class">
        <form onSubmit={handleSubmit}>
          <Field label="Title">
            <TextInput required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Course (optional — leave blank for all students)">
            <Select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
              <option value="">All students</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date & Time">
              <TextInput type="datetime-local" required value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
            </Field>
            <Field label="Duration (min)">
              <TextInput type="number" min={15} value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} />
            </Field>
          </div>

          <Field label="Zoom meeting link (paste it from Zoom)">
            <TextInput required type="url" value={form.zoomLink} onChange={(e) => setForm({ ...form, zoomLink: e.target.value })} placeholder="https://zoom.us/j/..." />
          </Field>
          <Field label="Passcode (optional)">
            <TextInput value={form.zoomPasscode} onChange={(e) => setForm({ ...form, zoomPasscode: e.target.value })} />
          </Field>

          <div className="flex justify-end gap-3">
            <GhostButton type="button" onClick={() => setModalOpen(false)}>Cancel</GhostButton>
            <PrimaryButton type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Schedule
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Live Class"
        message={`Delete "${deleteTarget?.title}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
