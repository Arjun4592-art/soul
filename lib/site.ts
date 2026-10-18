/**
 * Single place for site-wide facts. Anything marked CONFIRM was inconsistent
 * across the old sources and should be checked with Preeti before launch.
 */

export const NAV_LINKS = [
  { href: "/about", label: "Her story" },
  { href: "/services", label: "The ways" },
  { href: "/courses", label: "Courses" },
  { href: "/success-stories", label: "Voices" },
  { href: "/sacred-mornings", label: "Sacred mornings" },
];

export const SITE = {
  name: "Preeti",
  tagline: "Soulpreneur",
  motto: "Where spirit meets success",
  email: "hello@preetisoulpreneur.com", // CONFIRM: real inbox
  phone: "", // CONFIRM: add a real number to show it in the footer and on /contact
  location: "India, sessions online worldwide",
  // Paste the real WhatsApp community invite link here to light up the
  // "Join" buttons on /sacred-mornings. Empty = buttons go to /contact.
  whatsappCommunityUrl: "",
  socials: [
    { label: "Instagram", href: "https://instagram.com/preeti_soulpreneur" },
    // CONFIRM: paste the full LinkedIn profile URL to show it in the footer.
    { label: "LinkedIn", href: "" },
  ],
};

export const TOPICS = [
  { value: "heal", label: "Healing: I look fine outside but feel lost inside" },
  { value: "lead", label: "Leading myself: I am tired of proving my worth" },
  { value: "coach", label: "Coaching others: I help everyone but undervalue myself" },
  { value: "unsure", label: "Not sure yet" },
] as const;
