"use client";

import { useMemo, useState } from "react";
import { orderBy } from "firebase/firestore";
import DataTable from "@/components/admin/DataTable";
import { AdminPage, Notice, Panel, fmtDateTime } from "@/components/admin/kit";
import { Field, PrimaryButton, Select, TextArea, TextInput } from "@/components/admin/ui";
import { useCollection } from "@/lib/useCollection";
import { authedFetch } from "@/lib/authed-fetch";
import type { NewsletterSubscriberDoc, UserDoc } from "@/lib/types";

type CampaignDoc = { id: string; subject: string; recipientCount: number; sentAt?: { toDate: () => Date } };
type Audience = "student" | "coach" | "list" | "all";

export default function AdminEmailCampaignsPage() {
  const { data: campaigns, loading } = useCollection<CampaignDoc>("email_campaigns", [orderBy("sentAt", "desc")]);
  const { data: users } = useCollection<UserDoc>("users");
  const { data: subs } = useCollection<NewsletterSubscriberDoc>("newsletter_subscribers");
  const [audience, setAudience] = useState<Audience>("list");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const recipients = useMemo(() => {
    const pick = (role?: string) => users.filter((u) => !role || u.role === role).map((u) => u.email);
    const list = subs.map((s) => s.email);
    const set =
      audience === "student" ? pick("student") : audience === "coach" ? pick("coach") : audience === "list" ? list : [...pick(), ...list];
    return Array.from(new Set(set.filter(Boolean).map((e) => e.toLowerCase())));
  }, [users, subs, audience]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (recipients.length === 0) {
      setMsg({ tone: "error", text: "There is nobody in this audience yet." });
      return;
    }
    setSending(true);
    setMsg(null);
    try {
      const html = `<div style="font-family:Georgia,serif;color:#12263d;max-width:560px;margin:0 auto;line-height:1.6">${body
        .split(/\n{2,}/)
        .map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br/>")}</p>`)
        .join("")}</div>`;
      const res = await authedFetch("/api/admin/email-campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, body: html, recipients }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send.");
      setMsg({ tone: "success", text: `Sent to ${recipients.length} ${recipients.length === 1 ? "person" : "people"}.` });
      setSubject("");
      setBody("");
    } catch (err) {
      setMsg({ tone: "error", text: err instanceof Error ? err.message : "Could not send." });
    } finally {
      setSending(false);
    }
  }

  return (
    <AdminPage title="Email campaigns" intro="Send one email to a group. Write in plain paragraphs. Needs the Resend key in your environment settings.">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <Panel title="Write an email">
          <form onSubmit={send}>
            <Field label="Send to">
              <Select value={audience} onChange={(e) => setAudience(e.target.value as Audience)}>
                <option value="list">Email list (website sign-ups)</option>
                <option value="student">Students</option>
                <option value="coach">Coaches</option>
                <option value="all">Everyone</option>
              </Select>
            </Field>
            <p className="-mt-2 mb-4 text-xs text-ink-soft">{recipients.length} recipients</p>
            <Field label="Subject"><TextInput required value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
            <Field label="Message"><TextArea required className="min-h-44" value={body} onChange={(e) => setBody(e.target.value)} /></Field>
            {msg && <div className="mb-4"><Notice tone={msg.tone}>{msg.text}</Notice></div>}
            <PrimaryButton type="submit" disabled={sending} className="w-full">{sending ? "Sending…" : `Send to ${recipients.length}`}</PrimaryButton>
          </form>
        </Panel>

        <div>
          <h2 className="mb-4 font-display text-xl">Sent</h2>
          <DataTable
            rows={campaigns}
            emptyMessage={loading ? "Loading…" : "Nothing sent yet."}
            columns={[
              { header: "Subject", render: (c) => <span className="font-medium">{c.subject}</span> },
              { header: "People", render: (c) => c.recipientCount },
              { header: "Sent", render: (c) => fmtDateTime(c.sentAt) },
            ]}
          />
        </div>
      </div>
    </AdminPage>
  );
}
