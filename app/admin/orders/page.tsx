"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import DataTable from "@/components/admin/DataTable";
import StatCard from "@/components/admin/StatCard";
import { AdminPage, Chip, RowBtn, Toolbar, fmtDate, includesText } from "@/components/admin/kit";
import { Badge, ConfirmDialog } from "@/components/admin/ui";
import { useCollection } from "@/lib/useCollection";
import { db } from "@/lib/firebase";
import type { OrderDoc, OrderStatus } from "@/lib/types";

const TONE: Record<OrderStatus, "success" | "warning" | "danger" | "neutral"> = {
  paid: "success",
  pending: "warning",
  failed: "danger",
  refunded: "neutral",
};

export default function AdminOrdersPage() {
  const { data: orders, loading } = useCollection<OrderDoc>("orders");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [refundTarget, setRefundTarget] = useState<OrderDoc | null>(null);

  const paid = orders.filter((o) => o.status === "paid");
  const collected = paid.reduce((s, o) => s + (o.amount || 0), 0);
  const rows = orders.filter((o) => (status === "all" || o.status === status) && includesText([o.userName, o.courseTitle, o.couponCode, o.razorpayPaymentId], q));

  return (
    <AdminPage title="Orders" intro="Course payments made through Razorpay. Enrollments are created automatically when a payment succeeds.">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Collected" value={`₹${collected.toLocaleString("en-IN")}`} />
        <StatCard label="Paid orders" value={String(paid.length)} />
        <StatCard label="All orders" value={String(orders.length)} />
      </div>

      <Toolbar
        search={q}
        onSearch={setQ}
        placeholder="Search student, course or coupon"
        chips={(["all", "paid", "pending", "failed", "refunded"] as const).map((s) => (
          <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
            {s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)}
          </Chip>
        ))}
      />

      <DataTable
        rows={rows}
        emptyMessage={loading ? "Loading…" : orders.length === 0 ? "No orders yet. They appear here after the first payment." : "No orders match this filter."}
        columns={[
          { header: "Student", render: (o) => o.userName },
          { header: "Course", render: (o) => o.courseTitle },
          { header: "Amount", render: (o) => `₹${o.amount?.toLocaleString("en-IN")}` },
          { header: "Coupon", render: (o) => o.couponCode || "—" },
          { header: "Payment ID", hideOnMobile: true, render: (o) => <span className="font-mono text-xs text-ink-soft">{o.razorpayPaymentId || o.razorpayOrderId || "—"}</span> },
          { header: "Status", render: (o) => <Badge tone={TONE[o.status] ?? "neutral"}>{o.status}</Badge> },
          { header: "Date", render: (o) => fmtDate(o.createdAt) },
          { header: "", render: (o) => (o.status === "paid" ? <RowBtn tone="danger" onClick={() => setRefundTarget(o)}>Mark refunded</RowBtn> : null) },
        ]}
      />

      <ConfirmDialog
        open={!!refundTarget}
        title="Mark as refunded?"
        message="This only updates the record here. Refund the money from your Razorpay dashboard."
        confirmLabel="Mark refunded"
        onCancel={() => setRefundTarget(null)}
        onConfirm={async () => {
          if (refundTarget) await updateDoc(doc(db, "orders", refundTarget.id), { status: "refunded" });
          setRefundTarget(null);
        }}
      />
    </AdminPage>
  );
}
