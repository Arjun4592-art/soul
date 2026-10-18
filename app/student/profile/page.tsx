"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { StudentPage } from "@/components/student/kit";
import { Field, PrimaryButton, TextInput } from "@/components/admin/ui";
import { useStudentAuth } from "@/lib/student-auth";
import { db } from "@/lib/firebase";

export default function StudentProfilePage() {
  const { profile } = useStudentAuth();
  // Remount the form when the profile arrives so the inputs start with saved values.
  return <ProfileForm key={`${profile?.name ?? ""}|${profile?.phone ?? ""}`} />;
}

function ProfileForm() {
  const { user, profile } = useStudentAuth();
  const [name, setName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateDoc(doc(db, "users", user.uid), { name: name.trim(), phone: phone.trim() });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <StudentPage title="My details" narrow>
      <form onSubmit={save} className="border border-ink/30 bg-white p-6">
        <Field label="Full name"><TextInput value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Phone"><TextInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" /></Field>
        <Field label="Email (cannot be changed here)"><TextInput value={user?.email ?? ""} disabled className="opacity-60" /></Field>
        <div className="flex items-center gap-4">
          <PrimaryButton type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</PrimaryButton>
          {saved && <span className="text-sm text-leaf">Saved.</span>}
        </div>
      </form>
    </StudentPage>
  );
}
