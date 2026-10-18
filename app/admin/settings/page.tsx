"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Topbar from "@/components/admin/Topbar";
import FirebaseSetupNotice from "@/components/admin/FirebaseSetupNotice";
import { Field, TextInput, TextArea, PrimaryButton } from "@/components/admin/ui";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { SETTINGS_DEFAULTS, type SiteSettings } from "@/lib/useSiteSettings";

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SiteSettings>(SETTINGS_DEFAULTS);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    getDoc(doc(db, "settings", "site")).then((snap) => {
      if (snap.exists()) setForm({ ...SETTINGS_DEFAULTS, ...(snap.data() as Partial<SiteSettings>) });
      setLoading(false);
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await setDoc(doc(db, "settings", "site"), form, { merge: true });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  const set = (k: keyof SiteSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div>
      <Topbar title="Settings" />
      <div className="max-w-xl space-y-5 p-5 sm:p-8">
        {!isFirebaseConfigured && <FirebaseSetupNotice />}
        <p className="text-sm text-ink-soft">These details show on the public website (footer, contact page, Sacred Mornings). Changes appear within a refresh.</p>

        <div className="border border-ink/30 bg-white p-5 sm:p-6">
          {loading ? (
            <p className="py-8 text-center text-sm text-ink-soft">Loading…</p>
          ) : (
            <form onSubmit={handleSave}>
              <Field label="Contact email">
                <TextInput type="email" value={form.supportEmail} onChange={set("supportEmail")} />
              </Field>
              <Field label="Phone or WhatsApp number (leave empty to hide)">
                <TextInput value={form.supportPhone} onChange={set("supportPhone")} />
              </Field>
              <Field label="Sacred Mornings WhatsApp community link">
                <TextInput type="url" value={form.whatsappCommunityUrl} onChange={set("whatsappCommunityUrl")} placeholder="https://chat.whatsapp.com/..." />
              </Field>
              <Field label="Instagram URL">
                <TextInput type="url" value={form.instagramUrl} onChange={set("instagramUrl")} />
              </Field>
              <Field label="LinkedIn URL">
                <TextInput type="url" value={form.linkedinUrl} onChange={set("linkedinUrl")} />
              </Field>
              <Field label="Announcement banner (optional, shows above the header)">
                <TextArea value={form.announcementBanner} onChange={set("announcementBanner")} placeholder="e.g. New Sacred Mornings batch starts Monday" />
              </Field>

              {saved && <p className="mb-4 border border-ink/30 bg-sage px-3 py-2 text-sm">Settings saved.</p>}
              <PrimaryButton type="submit" disabled={saving}>{saving ? "Saving…" : "Save settings"}</PrimaryButton>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
