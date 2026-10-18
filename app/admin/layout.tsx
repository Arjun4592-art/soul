import AdminShell from "@/components/admin/AdminShell";

// Everything under /admin is auth-gated and reads live Firestore/Firebase
// Auth state, so it must never be statically prerendered at build time.
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
