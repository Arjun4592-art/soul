"use client";

import { orderBy } from "firebase/firestore";
import { useMemo } from "react";
import { Users as UsersIcon, BookOpen, IndianRupee, ClipboardList, CalendarDays, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Topbar from "@/components/admin/Topbar";
import StatCard from "@/components/admin/StatCard";
import DataTable from "@/components/admin/DataTable";
import FirebaseSetupNotice from "@/components/admin/FirebaseSetupNotice";
import { Badge } from "@/components/admin/ui";
import { useCollection } from "@/lib/useCollection";
import { isFirebaseConfigured } from "@/lib/firebase";
import type { OrderDoc, UserDoc, CourseDoc, EnrollmentDoc, BookingDoc } from "@/lib/types";

const ORDER_STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  paid: "success",
  pending: "warning",
  failed: "danger",
  refunded: "neutral",
};

export default function AdminDashboardPage() {
  const { data: orders, loading: ordersLoading } = useCollection<OrderDoc>("orders", [
    orderBy("createdAt", "desc"),
  ]);
  const { data: users, loading: usersLoading } = useCollection<UserDoc>("users");
  const { data: courses, loading: coursesLoading } = useCollection<CourseDoc>("courses");
  const { data: enrollments } = useCollection<EnrollmentDoc>("enrollments");
  const { data: bookings } = useCollection<BookingDoc>("bookings", []);
  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress ?? 0), 0) / enrollments.length)
    : 0;

  const revenue = useMemo(
    () => orders.filter((o) => o.status === "paid").reduce((sum, o) => sum + (o.amount || 0), 0),
    [orders]
  );

  const activeStudents = useMemo(
    () => users.filter((u) => u.role === "student" && u.status === "active").length,
    [users]
  );

  const chartData = useMemo(() => {
    // Group paid orders by day (last 14 entries) for a simple revenue trend.
    const byDay = new Map<string, number>();
    orders
      .filter((o) => o.status === "paid" && o.createdAt)
      .forEach((o) => {
        const key = o.createdAt!.toDate().toISOString().slice(0, 10);
        byDay.set(key, (byDay.get(key) ?? 0) + o.amount);
      });
    // Oldest to newest, so the chart reads left to right.
    return Array.from(byDay.entries())
      .sort(([x], [y]) => x.localeCompare(y))
      .slice(-14)
      .map(([iso, amount]) => ({
        date: new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        amount,
      }));
  }, [orders]);

  const loading = ordersLoading || usersLoading || coursesLoading;

  return (
    <div>
      <Topbar title="Dashboard" />
      <div className="space-y-6 p-5 sm:p-8">
        {!isFirebaseConfigured && <FirebaseSetupNotice />}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Revenue"
            value={`₹${revenue.toLocaleString("en-IN")}`}
            icon={IndianRupee}
          />
          <StatCard label="Active Students" value={String(activeStudents)} icon={UsersIcon} />
          <StatCard label="Published Courses" value={String(courses.filter((c) => c.status === "published").length)} icon={BookOpen} />
          <StatCard label="Total Enrollments" value={String(enrollments.length)} icon={ClipboardList} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Call requests to schedule" value={String(bookings.filter((b) => b.status === "requested").length)} icon={CalendarDays} />
          <StatCard label="Calls scheduled" value={String(bookings.filter((b) => b.status === "scheduled").length)} icon={CalendarDays} />
          <StatCard label="Avg. course progress" value={`${avgProgress}%`} icon={TrendingUp} />
        </div>

        <div className="rounded-none border border-ink/8 bg-white p-5 sm:p-6">
          <p className="mb-4 font-display text-lg text-ink">Revenue trend</p>
          {chartData.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-soft">
              {loading ? "Loading…" : "No paid orders yet — data will appear here in the chart."}
            </p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#b08a2c" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#b08a2c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#12263d10" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#52627a" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#52627a" }} axisLine={false} tickLine={false} width={50} />
                  <Tooltip
                    formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]}
                    contentStyle={{ borderRadius: 0, border: "1px solid #12263d" }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#b08a2c" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div>
          <p className="mb-4 font-display text-lg text-ink">Recent orders</p>
          <DataTable
            rows={orders.slice(0, 8)}
            emptyMessage={loading ? "Loading…" : "No orders yet."}
            columns={[
              { header: "Student", render: (o) => o.userName },
              { header: "Course", render: (o) => o.courseTitle },
              { header: "Amount", render: (o) => `₹${o.amount?.toLocaleString("en-IN")}` },
              {
                header: "Status",
                render: (o) => <Badge tone={ORDER_STATUS_TONE[o.status] ?? "neutral"}>{o.status}</Badge>,
              },
              {
                header: "Date",
                render: (o) => (o.createdAt ? o.createdAt.toDate().toLocaleDateString("en-IN") : "—"),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
