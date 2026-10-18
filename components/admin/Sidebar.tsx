"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, Users, BookOpen, FolderTree, ClipboardList, Video, Award, Receipt, Mail, Tag, Megaphone,
  Newspaper, Quote, Settings, MessageSquare, Inbox, CalendarDays,
} from "lucide-react";

type Item = { href: string; label: string; icon: LucideIcon; exact?: boolean };

const GROUPS: { title: string; items: Item[] }[] = [
  { title: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }] },
  {
    title: "People",
    items: [
      { href: "/admin/bookings", label: "Call bookings", icon: CalendarDays },
      { href: "/admin/leads", label: "Leads", icon: Inbox },
      { href: "/admin/users", label: "Users", icon: Users },
    ],
  },
  {
    title: "Teaching",
    items: [
      { href: "/admin/courses", label: "Courses", icon: BookOpen },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/enrollments", label: "Enrollments", icon: ClipboardList },
      { href: "/admin/live-classes", label: "Live classes", icon: Video },
      { href: "/admin/community", label: "Community", icon: MessageSquare },
      { href: "/admin/certificates", label: "Certificates", icon: Award },
    ],
  },
  {
    title: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: Receipt },
      { href: "/admin/coupons", label: "Coupons", icon: Tag },
    ],
  },
  {
    title: "Website",
    items: [
      { href: "/admin/blog", label: "Journal", icon: Newspaper },
      { href: "/admin/testimonials", label: "Voices", icon: Quote },
      { href: "/admin/email-campaigns", label: "Email campaigns", icon: Mail },
      { href: "/admin/notifications", label: "Announcements", icon: Megaphone },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full min-h-screen w-60 shrink-0 flex-col bg-ink text-paper">
      <div className="border-b border-paper/15 px-6 py-6">
        <p className="font-display text-2xl leading-none">Preeti</p>
        <p className="mt-1.5 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-paper/55">Admin</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {GROUPS.map((g) => (
          <div key={g.title} className="mb-5">
            <p className="px-3 pb-1.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-paper/45">{g.title}</p>
            <ul>
              {g.items.map(({ href, label, icon: Icon, exact }) => {
                const active = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      className={`flex items-center gap-3 border-l-2 px-3 py-2 text-[0.88rem] transition ${
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
          </div>
        ))}
      </nav>

      <Link href="/" className="border-t border-paper/15 px-6 py-4 text-[0.8rem] text-paper/60 hover:text-paper">
        ← View website
      </Link>
    </aside>
  );
}
