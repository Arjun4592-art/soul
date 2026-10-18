"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin-auth";
import { isFirebaseConfigured } from "@/lib/firebase";
import Sidebar from "@/components/admin/Sidebar";

function Guard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, loading } = useAdminAuth();
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (loading || !isFirebaseConfigured) return;
    if (!user && !isLoginPage) {
      router.replace("/admin/login");
    }
    if (user && role && role !== "admin" && role !== "coach" && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [loading, user, role, isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <Loader2 className="h-6 w-6 animate-spin text-ink/50" />
      </div>
    );
  }

  if (!isFirebaseConfigured || !user) {
    // Redirect effect above will fire; render nothing in the meantime.
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <Loader2 className="h-6 w-6 animate-spin text-ink/50" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <Guard>{children}</Guard>
    </AdminAuthProvider>
  );
}
