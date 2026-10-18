"use client";

import Link from "next/link";
import { useVoices } from "@/components/Voices";

export default function HomeVoices() {
  const { voices, loading } = useVoices();
  if (loading) return <div className="h-64" aria-hidden />;
  const [lead, ...rest] = voices;
  if (!lead) return null;

  return (
    <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
      <figure>
        <blockquote className="font-display text-[1.65rem] leading-[1.3] text-ink sm:text-[2.1rem]">
          <span className="text-gold" aria-hidden>“</span>
          {lead.quote}
        </blockquote>
        <figcaption className="mt-6 label">
          {lead.name}
          {lead.role ? ` · ${lead.role}` : ""}
        </figcaption>
      </figure>

      <ul className="divide-y divide-ink/15 border-y border-ink/15">
        {rest.slice(0, 3).map((v) => (
          <li key={v.id} className="py-5">
            <p className="line-clamp-4 text-[0.98rem] text-ink-soft">{v.quote}</p>
            <p className="mt-3 label">
              {v.name}
              {v.role ? ` · ${v.role}` : ""}
            </p>
          </li>
        ))}
        <li className="py-4">
          <Link href="/success-stories" className="text-sm font-medium underline decoration-gold decoration-2 underline-offset-4 hover:text-ink-2">
            Read more voices →
          </Link>
        </li>
      </ul>
    </div>
  );
}
