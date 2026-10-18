"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/site";
import Wordmark from "./Wordmark";
import Button from "./Button";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/15 bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
        <Wordmark />

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
          {NAV_LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`text-[0.95rem] underline-offset-[7px] decoration-2 transition hover:underline hover:decoration-gold ${
                  active ? "font-medium underline decoration-gold" : "text-ink-soft hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <Link href="/student/login" className="text-[0.9rem] text-ink-soft hover:text-ink">
            Sign in
          </Link>
          <Button href="/book" className="!px-5 !py-2.5 !text-[0.9rem]">
            Book a free call
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="font-mono text-xs uppercase tracking-[0.18em] text-ink lg:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="fixed inset-x-0 bottom-0 top-[65px] overflow-y-auto bg-paper px-5 pb-10 pt-6 lg:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {NAV_LINKS.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-4 border-b border-ink/15 py-4 font-display text-3xl text-ink"
              >
                <span className="font-mono text-xs text-ink-soft">0{i + 1}</span>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 flex flex-col items-start gap-5">
            <Button href="/book">Book a free call</Button>
            <Link href="/student/login" onClick={() => setOpen(false)} className="text-ink-soft underline underline-offset-4">
              Student sign in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
