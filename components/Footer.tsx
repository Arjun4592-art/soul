"use client";

import Link from "next/link";
import { NAV_LINKS, SITE } from "@/lib/site";
import { useSiteSettings } from "@/lib/useSiteSettings";
import Wordmark from "./Wordmark";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  const s = useSiteSettings();
  const socials = [
    { label: "Instagram", href: s.instagramUrl },
    { label: "LinkedIn", href: s.linkedinUrl },
  ].filter((x) => x.href);

  return (
    <footer className="mt-auto bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-5 pb-10 pt-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div>
            <Wordmark light />
            <p className="mt-4 max-w-xs font-display text-2xl leading-snug text-paper">{SITE.motto}.</p>
          </div>

          <div>
            <p className="label !text-paper/50">Explore</p>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-paper/85 hover:text-gold-soft">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label !text-paper/50">More</p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/book" className="text-paper/85 hover:text-gold-soft">Book a free call</Link>
              </li>
              <li>
                <Link href="/blog" className="text-paper/85 hover:text-gold-soft">Journal</Link>
              </li>
              <li>
                <Link href="/contact" className="text-paper/85 hover:text-gold-soft">Contact</Link>
              </li>
              <li>
                <Link href="/student/login" className="text-paper/85 hover:text-gold-soft">Student sign in</Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="label !text-paper/50">Write to us</p>
            <ul className="mt-4 space-y-2.5 text-paper/85">
              <li>
                <a href={`mailto:${s.supportEmail}`} className="hover:text-gold-soft">{s.supportEmail}</a>
              </li>
              {s.supportPhone && <li>{s.supportPhone}</li>}
              {socials.map((x) => (
                <li key={x.label}>
                  <a href={x.href} target="_blank" rel="noreferrer" className="hover:text-gold-soft">
                    {x.label} ↗
                  </a>
                </li>
              ))}
            </ul>
            <p className="label mt-8 !text-paper/50">Occasional notes</p>
            <NewsletterForm dark className="mt-3" />
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-paper/15 pt-6 text-[0.8rem] text-paper/55 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Preeti Soulpreneur</p>
          <p>Coaching supports growth and is not a substitute for therapy or medical care.</p>
        </div>
      </div>
    </footer>
  );
}
