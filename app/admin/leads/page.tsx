"use client";

import { useMemo, useState } from "react";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import DataTable from "@/components/admin/DataTable";
import { AdminPage, Chip, RowBtn, Toolbar, fmtDate, includesText } from "@/components/admin/kit";
import { Badge, ConfirmDialog } from "@/components/admin/ui";
import { useCollection } from "@/lib/useCollection";
import { db } from "@/lib/firebase";
import type { ContactMessageDoc, NewsletterSubscriberDoc } from "@/lib/types";

type Target = { col: "contact_messages" | "newsletter_subscribers"; id: string; label: string };

const ts = (x?: { toDate?: () => Date }) => x?.toDate?.().getTime() ?? 0;

export default function AdminLeadsPage() {
  const { data: messages, loading: lm } = useCollection<ContactMessageDoc>("contact_messages");
  const { data: subs, loading: ls } = useCollection<NewsletterSubscriberDoc>("newsletter_subscribers");
  const [tab, setTab] = useState<"messages" | "subscribers">("messages");
  const [q, setQ] = useState("");
  const [target, setTarget] = useState<Target | null>(null);

  const newCount = messages.filter((m) => (m.status ?? "new") === "new").length;
  const msgRows = useMemo(() => [...messages].sort((a, b) => ts(b.createdAt) - ts(a.createdAt)).filter((m) => includesText([m.name, m.email, m.message, m.interest], q)), [messages, q]);
  const subRows = useMemo(() => [...subs].sort((a, b) => ts(b.createdAt) - ts(a.createdAt)).filter((s) => includesText([s.email, s.source], q)), [subs, q]);

  return (
    <AdminPage title="Leads" intro="Messages from the Contact page and email sign-ups from the footer. Call requests are under Call bookings.">
      <Toolbar
        search={q}
        onSearch={setQ}
        placeholder="Search"
        chips={
          <>
            <Chip active={tab === "messages"} onClick={() => setTab("messages")} count={messages.length}>Messages</Chip>
            <Chip active={tab === "subscribers"} onClick={() => setTab("subscribers")} count={subs.length}>Email list</Chip>
          </>
        }
        summary={tab === "messages" && newCount > 0 ? `${newCount} unread` : undefined}
      />

      {tab === "messages" ? (
        <DataTable
          rows={msgRows}
          emptyMessage={lm ? "Loading…" : "No messages yet. Contact form submissions appear here."}
          columns={[
            { header: "From", render: (m) => <div><p className="font-medium">{m.name}</p><a href={`mailto:${m.email}`} className="text-xs text-ink-2 underline underline-offset-2">{m.email}</a></div> },
            { header: "About", render: (m) => m.interest ?? "—" },
            { header: "Message", hideOnMobile: false, render: (m) => <span className="line-clamp-3 max-w-md text-left text-ink-soft">{m.message || "—"}</span> },
            { header: "Date", render: (m) => fmtDate(m.createdAt) },
            { header: "Status", render: (m) => <Badge tone={(m.status ?? "new") === "new" ? "gold" : "neutral"}>{m.status ?? "new"}</Badge> },
            {
              header: "",
              render: (m) => (
                <>
                  {(m.status ?? "new") === "new" && <RowBtn onClick={() => updateDoc(doc(db, "contact_messages", m.id), { status: "read" })}>Mark read</RowBtn>}
                  <RowBtn tone="danger" onClick={() => setTarget({ col: "contact_messages", id: m.id, label: m.name })}>Delete</RowBtn>
                </>
              ),
            },
          ]}
        />
      ) : (
        <DataTable
          rows={subRows}
          emptyMessage={ls ? "Loading…" : "No sign-ups yet."}
          columns={[
            { header: "Email", render: (s) => <span className="font-medium">{s.email}</span> },
            { header: "From", render: (s) => s.source ?? "website" },
            { header: "Date", render: (s) => fmtDate(s.createdAt) },
            { header: "", render: (s) => <RowBtn tone="danger" onClick={() => setTarget({ col: "newsletter_subscribers", id: s.id, label: s.email })}>Delete</RowBtn> },
          ]}
        />
      )}

      <ConfirmDialog
        open={!!target}
        title="Delete entry"
        message={`Delete "${target?.label}"? This cannot be undone.`}
        onCancel={() => setTarget(null)}
        onConfirm={async () => {
          if (target) await deleteDoc(doc(db, target.col, target.id));
          setTarget(null);
        }}
      />
    </AdminPage>
  );
}
