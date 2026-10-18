"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { SITE } from "@/lib/site";

export type SiteSettings = {
  supportEmail: string;
  supportPhone: string;
  whatsappCommunityUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  announcementBanner: string;
};

export const SETTINGS_DEFAULTS: SiteSettings = {
  supportEmail: SITE.email,
  supportPhone: SITE.phone,
  whatsappCommunityUrl: SITE.whatsappCommunityUrl,
  instagramUrl: SITE.socials.find((s) => s.label === "Instagram")?.href ?? "",
  linkedinUrl: SITE.socials.find((s) => s.label === "LinkedIn")?.href ?? "",
  announcementBanner: "",
};

let cached: SiteSettings | null = null;

/**
 * Contact details and links that Preeti can change from Admin → Settings
 * without touching code. Falls back to lib/site.ts until the doc loads (or if
 * Firebase isn't connected).
 */
export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(cached ?? SETTINGS_DEFAULTS);

  useEffect(() => {
    if (cached || !isFirebaseConfigured) return;
    let alive = true;
    getDoc(doc(db, "settings", "site"))
      .then((snap) => {
        if (!alive || !snap.exists()) return;
        const data = snap.data() as Partial<SiteSettings>;
        // Ignore empty strings so a blank field never wipes out the default.
        const merged = { ...SETTINGS_DEFAULTS };
        (Object.keys(SETTINGS_DEFAULTS) as (keyof SiteSettings)[]).forEach((k) => {
          if (typeof data[k] === "string" && data[k]!.trim()) merged[k] = data[k]!.trim();
        });
        cached = merged;
        setSettings(merged);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return settings;
}
