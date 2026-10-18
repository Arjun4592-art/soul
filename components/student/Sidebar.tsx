"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Video, Award, Bell, Settings, StickyNote, MessageSquare } from "lucide-react";

const NAV = [
  { href: "/student", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/student/courses", label: "My courses", icon: BookOpen },
  { href: "/student/live-classes", label: "Live classes", icon: Video },
  { href: "/student/community", label: "Community", icon: MessageSquare },
  { href: "/student/certificates", label: "Certificates", icon: Award },
  { href: "/student/notes", label: "My notes", icon: StickyNote },
  { href: "/student/notifications", label: "Announcements", icon: Bell },
  { href: "/student/profile", label: "My details", icon: Settings },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full min-h-screen w-60 shrink-0 flex-col bg-ink text-paper">
      <div className="border-b border-paper/15 px-6 py-6">
        <p className="font-display text-2xl leading-none">Preeti</p>
        <p className="mt-1.5 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-paper/55">Student portal</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul>
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 border-l-2 px-3 py-2.5 text-[0.9rem] transition ${
                    active ? "border-gold bg-paper/10 text-paper" : "border-transparent text-paper/70 hover:bg-paper/5 hover:text-paper"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.6} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Link href="/" className="border-t border-paper/15 px-6 py-4 text-[0.8rem] text-paper/60 hover:text-paper">
        ← View website
      </Link>
    </aside>
  );
}
