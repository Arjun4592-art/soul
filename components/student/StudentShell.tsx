"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { StudentAuthProvider, useStudentAuth } from "@/lib/student-auth";
import { isFirebaseConfigured } from "@/lib/firebase";
import Sidebar from "@/components/student/Sidebar";

const PUBLIC_PATHS = ["/student/login", "/student/signup"];

function Guard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useStudentAuth();
  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (loading || !isFirebaseConfigured) return;
    if (!user && !isPublicPage) {
      router.replace("/student/login");
    }
    if (user && isPublicPage) {
      router.replace("/student");
    }
  }, [loading, user, isPublicPage, router]);

  if (isPublicPage) return <>{children}</>;

  if (loading || !isFirebaseConfigured || !user) {
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

export default function StudentShell({ children }: { children: React.ReactNode }) {
  return (
    <StudentAuthProvider>
      <Guard>{children}</Guard>
    </StudentAuthProvider>
  );
}
