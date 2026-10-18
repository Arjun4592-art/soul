"use client";

import Link from "next/link";
import { btnClass } from "@/components/Button";
import { useSiteSettings } from "@/lib/useSiteSettings";

/** Joins via the WhatsApp community link from Admin → Settings; otherwise falls back to /contact. */
export default function SacredJoin({ variant = "primary" }: { variant?: "primary" | "outline" }) {
  const { whatsappCommunityUrl } = useSiteSettings();
  if (whatsappCommunityUrl) {
    return (
      <a href={whatsappCommunityUrl} target="_blank" rel="noreferrer" className={btnClass(variant)}>
        Join on WhatsApp <span aria-hidden>→</span>
      </a>
    );
  }
  return (
    <Link href="/contact" className={btnClass(variant)}>
      Ask to join <span aria-hidden>→</span>
    </Link>
  );
}
