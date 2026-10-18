"use client";

import Link from "next/link";
import { SITE } from "@/lib/site";
import { useSiteSettings } from "@/lib/useSiteSettings";

export default function ContactDetails() {
  const s = useSiteSettings();
  const socials = [
    { label: "Instagram", href: s.instagramUrl },
    { label: "LinkedIn", href: s.linkedinUrl },
  ].filter((x) => x.href);

  return (
    <aside className="space-y-8">
      <dl className="divide-y divide-ink/15 border-y border-ink/15">
        <div className="py-4">
          <dt className="label">Email</dt>
          <dd className="mt-1">
            <a href={`mailto:${s.supportEmail}`} className="underline decoration-gold decoration-2 underline-offset-4 hover:text-ink-2">
              {s.supportEmail}
            </a>
          </dd>
        </div>
        {s.supportPhone && (
          <div className="py-4">
            <dt className="label">Phone</dt>
            <dd className="mt-1">{s.supportPhone}</dd>
          </div>
        )}
        <div className="py-4">
          <dt className="label">Where</dt>
          <dd className="mt-1">{SITE.location}</dd>
        </div>
        {socials.length > 0 && (
          <div className="py-4">
            <dt className="label">Elsewhere</dt>
            <dd className="mt-1 flex gap-5">
              {socials.map((x) => (
                <a key={x.label} href={x.href} target="_blank" rel="noreferrer" className="underline decoration-gold decoration-2 underline-offset-4 hover:text-ink-2">
                  {x.label} ↗
                </a>
              ))}
            </dd>
          </div>
        )}
      </dl>

      <div className="border border-ink bg-gold-soft p-6">
        <h2 className="font-display text-2xl">Prefer to talk first?</h2>
        <p className="mt-2 text-ink/80">Ask for a free call and we will send you a time and a Zoom link.</p>
        <Link href="/book" className="mt-4 inline-block font-medium underline decoration-ink decoration-2 underline-offset-4">
          Request a call →
        </Link>
      </div>
    </aside>
  );
}
