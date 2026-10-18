"use client";

import { where } from "firebase/firestore";
import { StudentPage, Empty, when } from "@/components/student/kit";
import { useCollection } from "@/lib/useCollection";
import { useStudentAuth } from "@/lib/student-auth";
import type { CertificateDoc } from "@/lib/types";

export default function StudentCertificatesPage() {
  const { user } = useStudentAuth();
  const { data: certificates, loading } = useCollection<CertificateDoc>("certificates", [where("userId", "==", user?.uid ?? "__none__")]);

  return (
    <StudentPage title="Certificates">
      {loading ? (
        <p className="text-ink-soft">Loading…</p>
      ) : certificates.length === 0 ? (
        <Empty>Finish a course and your certificate will appear here.</Empty>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2">
          {certificates.map((c) => (
            <li key={c.id} className="border-2 border-gold bg-white p-6">
              <p className="label">Certificate of completion</p>
              <p className="mt-3 font-display text-2xl leading-snug">{c.courseTitle}</p>
              <p className="mt-2 text-sm text-ink-soft">Issued {when(c.issuedAt)}</p>
              {c.certificateUrl && (
                <a href={c.certificateUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block border border-ink px-4 py-2 text-sm font-medium hover:bg-ink hover:text-paper">
                  Download PDF
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </StudentPage>
  );
}
