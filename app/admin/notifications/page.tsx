"use client";

import { useState } from "react";
import { addDoc, collection, deleteDoc, doc, orderBy, serverTimestamp } from "firebase/firestore";
import Topbar from "@/components/admin/Topbar";
import DataTable from "@/components/admin/DataTable";
import FirebaseSetupNotice from "@/components/admin/FirebaseSetupNotice";
import { ConfirmDialog, Field, PrimaryButton, TextArea, TextInput } from "@/components/admin/ui";
import { useCollection } from "@/lib/useCollection";
import { db, isFirebaseConfigured } from "@/lib/firebase";

type AnnouncementDoc = { id: string; title: string; body: string; sentAt?: { toDate: () => Date } };

/** Announcements appear in every student's portal under "Announcements". */
export default function AdminAnnouncementsPage() {
  const { data: items, loading } = useCollection<AnnouncementDoc>("notifications", [orderBy("sentAt", "desc")]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementDoc | null>(null);

  async function post(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setMsg("");
    try {
      await addDoc(collection(db, "notifications"), { title: title.trim(), body: body.trim(), sentAt: serverTimestamp() });
      setTitle("");
      setBody("");
      setMsg("Posted. Students will see it in their portal.");
    } catch {
      setMsg("Could not post. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <Topbar title="Announcements" />
      <div className="grid grid-cols-1 gap-6 p-5 sm:p-8 lg:grid-cols-[1fr_1.2fr]">
        <div>
          {!isFirebaseConfigured && <div className="mb-5"><FirebaseSetupNotice /></div>}
          <div className="border border-ink/30 bg-white p-5 sm:p-6">
            <p className="mb-4 font-display text-xl">New announcement</p>
            <form onSubmit={post}>
              <Field label="Title">
                <TextInput required value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <Field label="Message">
                <TextArea required value={body} onChange={(e) => setBody(e.target.value)} />
              </Field>
              {msg && <p className="mb-4 border border-ink/30 bg-sage px-3 py-2 text-sm">{msg}</p>}
              <PrimaryButton type="submit" disabled={sending} className="w-full">{sending ? "Posting…" : "Post to students"}</PrimaryButton>
            </form>
          </div>
        </div>

        <div>
          <p className="mb-4 font-display text-xl">Posted</p>
          <DataTable
            rows={items}
            emptyMessage={loading ? "Loading…" : "No announcements yet."}
            columns={[
              { header: "Title", render: (n) => n.title },
              { header: "Posted", render: (n) => (n.sentAt ? n.sentAt.toDate().toLocaleString("en-IN") : "—") },
              {
                header: "",
                render: (n) => (
                  <button onClick={() => setDeleteTarget(n)} className="text-sm text-rose-700 hover:underline">
                    Delete
                  </button>
                ),
              },
            ]}
          />
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete announcement"
        message={`Delete "${deleteTarget?.title}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) await deleteDoc(doc(db, "notifications", deleteTarget.id));
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
