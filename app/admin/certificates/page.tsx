"use client";

import { useMemo, useState } from "react";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import { AdminPage, Notice, Toolbar, fmtDate, includesText } from "@/components/admin/kit";
import { Field, GhostButton, PrimaryButton, Select } from "@/components/admin/ui";
import { useCollection } from "@/lib/useCollection";
import { authedFetch } from "@/lib/authed-fetch";
import type { CertificateDoc, EnrollmentDoc } from "@/lib/types";

export default function AdminCertificatesPage() {
  const { data: certificates, loading } = useCollection<CertificateDoc>("certificates");
  const { data: enrollments } = useCollection<EnrollmentDoc>("enrollments");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Only students who finished and have no certificate yet.
  const eligible = useMemo(() => {
    const issued = new Set(certificates.map((c) => `${c.userId}_${c.courseId}`));
    return enrollments.filter((e) => (e.status === "completed" || (e.progress ?? 0) >= 100) && !issued.has(`${e.userId}_${e.courseId}`));
  }, [enrollments, certificates]);

  const rows = useMemo(() => certificates.filter((c) => includesText([c.userName, c.courseTitle], q)), [certificates, q]);

  async function issue(e: React.FormEvent) {
    e.preventDefault();
    const enrollment = enrollments.find((en) => en.id === enrollmentId);
    if (!enrollment) return;
    setSaving(true);
    setError("");
    try {
      const res = await authedFetch("/api/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: enrollment.courseId, userId: enrollment.userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create the certificate.");
      setOpen(false);
      setEnrollmentId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the certificate.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminPage title="Certificates" intro="A PDF certificate for students who finish a course. Students can also download theirs from the portal.">
      <Toolbar search={q} onSearch={setQ} placeholder="Search student or course" summary={`${eligible.length} ready to issue`} action={<PrimaryButton onClick={() => setOpen(true)}>Issue certificate</PrimaryButton>} />

      <DataTable
        rows={rows}
        emptyMessage={loading ? "Loading…" : "No certificates yet."}
        columns={[
          { header: "Student", render: (c) => <span className="font-medium">{c.userName}</span> },
          { header: "Course", render: (c) => c.courseTitle },
          { header: "Issued", render: (c) => fmtDate(c.issuedAt) },
          {
            header: "",
            render: (c) =>
              c.certificateUrl ? (
                <a href={c.certificateUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium underline underline-offset-4">
                  Open PDF
                </a>
              ) : (
                <span className="text-sm text-ink-soft">No file</span>
              ),
          },
        ]}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Issue certificate">
        <form onSubmit={issue}>
          {eligible.length === 0 ? (
            <div className="mb-4"><Notice>Nobody is waiting for a certificate. Students appear here once they reach 100% in a course.</Notice></div>
          ) : (
            <Field label="Student and course">
              <Select required value={enrollmentId} onChange={(e) => setEnrollmentId(e.target.value)}>
                <option value="">Choose</option>
                {eligible.map((en) => <option key={en.id} value={en.id}>{en.userName}: {en.courseTitle}</option>)}
              </Select>
            </Field>
          )}
          {error && <div className="mb-4"><Notice tone="error">{error}</Notice></div>}
          <div className="flex justify-end gap-3">
            <GhostButton type="button" onClick={() => setOpen(false)}>Close</GhostButton>
            <PrimaryButton type="submit" disabled={saving || !enrollmentId}>{saving ? "Creating…" : "Issue"}</PrimaryButton>
          </div>
        </form>
      </Modal>
    </AdminPage>
  );
}
