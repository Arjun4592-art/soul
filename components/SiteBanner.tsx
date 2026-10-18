"use client";

import { useSiteSettings } from "@/lib/useSiteSettings";

/** Optional one-line announcement set from Admin → Settings. Renders nothing when empty. */
export default function SiteBanner() {
  const { announcementBanner } = useSiteSettings();
  if (!announcementBanner) return null;
  return (
    <div className="bg-leaf px-5 py-2 text-center text-[0.85rem] text-paper">{announcementBanner}</div>
  );
}
