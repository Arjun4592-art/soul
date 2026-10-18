"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, X } from "lucide-react";
import { useStudentAuth } from "@/lib/student-auth";
import Sidebar from "./Sidebar";

export default function Topbar({ title }: { title: string }) {
  const { profile, user, logout } = useStudentAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-ink/30 bg-paper px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="border border-ink/40 px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink lg:hidden"
            aria-label="Open menu"
          >
            Menu
          </button>
          <h1 className="font-display text-2xl text-ink sm:text-3xl">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/student/profile" className="hidden text-right sm:block">
            <p className="text-sm font-medium text-ink">{profile?.name ?? user?.email ?? "Student"}</p>
            <p className="text-[0.7rem] uppercase tracking-wide text-ink-soft">Student</p>
          </Link>
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 border border-ink/40 px-3.5 py-2 text-sm text-ink transition hover:border-ink hover:bg-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0">
            <div className="relative h-full">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-6 text-paper/70 hover:text-paper"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
