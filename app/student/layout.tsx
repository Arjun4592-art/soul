import StudentShell from "@/components/student/StudentShell";

// Everything under /student is auth-gated and reads live Firestore/Firebase
// Auth state, so it must never be statically prerendered at build time.
export const dynamic = "force-dynamic";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <StudentShell>{children}</StudentShell>;
}
