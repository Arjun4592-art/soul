"use client";

import { useMemo, useState } from "react";
import { addDoc, collection, deleteDoc, doc, increment, serverTimestamp, updateDoc } from "firebase/firestore";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import { AdminPage, Meter, Notice, RowBtn, Toolbar, fmtDate, includesText } from "@/components/admin/kit";
import { Badge, ConfirmDialog, Field, GhostButton, PrimaryButton, Select } from "@/components/admin/ui";
import { useCollection } from "@/lib/useCollection";
import { db } from "@/lib/firebase";
import type { CourseDoc, EnrollmentDoc, UserDoc } from "@/lib/types";

export default function AdminEnrollmentsPage() {
  const { data: enrollments, loading } = useCollection<EnrollmentDoc>("enrollments");
  const { data: users } = useCollection<UserDoc>("users");
  const { data: courses } = useCollection<CourseDoc>("courses");
  const [q, setQ] = useState("");
  const [courseId, setCourseId] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ userId: "", courseId: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [removeTarget, setRemoveTarget] = useState<EnrollmentDoc | null>(null);

  const students = users.filter((u) => u.role === "student");
  const rows = useMemo(
    () => enrollments.filter((e) => (courseId === "all" || e.courseId === courseId) && includesText([e.userName, e.courseTitle], q)),
    [enrollments, courseId, q]
  );

  async function enroll(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const user = students.find((u) => u.id === form.userId);
    const course = courses.find((c) => c.id === form.courseId);
    if (!user || !course) return;
    if (enrollments.some((en) => en.userId === user.id && en.courseId === course.id)) {
      setError(`${user.name} is already enrolled in this course.`);
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, "enrollments"), { userId: user.id, userName: user.name, courseId: course.id, courseTitle: course.title, progress: 0, status: "active", enrolledAt: serverTimestamp() });
      await updateDoc(doc(db, "courses", course.id), { enrollCount: increment(1) });
      await updateDoc(doc(db, "users", user.id), { coursesEnrolled: increment(1) });
      setOpen(false);
      setForm({ userId: "", courseId: "" });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!removeTarget) return;
    await deleteDoc(doc(db, "enrollments", removeTarget.id));
    await updateDoc(doc(db, "courses", removeTarget.courseId), { enrollCount: increment(-1) }).catch(() => {});
    await updateDoc(doc(db, "users", removeTarget.userId), { coursesEnrolled: increment(-1) }).catch(() => {});
    setRemoveTarget(null);
  }

  return (
    <AdminPage title="Enrollments" intro="Who is taking which course. Payments create enrollments automatically; use Enroll student to give someone access for free.">
      <Toolbar
        search={q}
        onSearch={setQ}
        placeholder="Search student or course"
        chips={
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} aria-label="Filter by course" className="border border-ink/30 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink">
            <option value="all">All courses</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        }
        action={<PrimaryButton onClick={() => setOpen(true)}>Enroll student</PrimaryButton>}
      />

      <DataTable
        rows={rows}
        emptyMessage={loading ? "Loading…" : "No enrollments yet."}
        columns={[
          { header: "Student", render: (e) => <span className="font-medium">{e.userName}</span> },
          { header: "Course", render: (e) => e.courseTitle },
          { header: "Progress", render: (e) => <Meter value={e.progress ?? 0} /> },
          { header: "Status", render: (e) => <Badge tone={e.status === "expired" ? "neutral" : "success"}>{e.status}</Badge> },
          { header: "Enrolled", render: (e) => fmtDate(e.enrolledAt) },
          { header: "", render: (e) => <RowBtn tone="danger" onClick={() => setRemoveTarget(e)}>Remove</RowBtn> },
        ]}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Enroll a student">
        <form onSubmit={enroll}>
          <Field label="Student">
            <Select required value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}>
              <option value="">Choose a student</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
            </Select>
          </Field>
          <Field label="Course">
            <Select required value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
              <option value="">Choose a course</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </Select>
          </Field>
          {error && <div className="mb-4"><Notice tone="error">{error}</Notice></div>}
          <div className="flex justify-end gap-3">
            <GhostButton type="button" onClick={() => setOpen(false)}>Cancel</GhostButton>
            <PrimaryButton type="submit" disabled={saving}>{saving ? "Enrolling…" : "Enroll"}</PrimaryButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!removeTarget} title="Remove enrollment" message={`Remove ${removeTarget?.userName} from "${removeTarget?.courseTitle}"? They lose access to the lessons.`} confirmLabel="Remove" onCancel={() => setRemoveTarget(null)} onConfirm={remove} />
    </AdminPage>
  );
}
