/**
 * Copy that lives in code. Kept in one file so Preeti's wording can be edited
 * without hunting through page components. Anything flagged CONFIRM should be
 * checked with her before launch.
 */

export const FAMILIAR = [
  {
    title: "You keep waiting to hear that it was enough.",
    body: "You do the work, then look to other people to tell you whether it counted. Your own voice goes quiet.",
  },
  {
    title: "You carry everyone's expectations.",
    body: "Family, clients, team. You hold it together for all of them and have nothing left for the part of you that is tired.",
  },
  {
    title: "The same pattern keeps coming back.",
    body: "A different person, a different job, the same argument with money or with being heard.",
  },
  {
    title: "On paper it is going well. Inside, it is flat.",
    body: "You are getting through the days. Somewhere along the way you stopped asking what any of it is for.",
  },
];

export type Door = {
  id: "heal" | "lead" | "coach";
  title: string;
  who: string;
  start: string;
  startNote: string;
  path: { name: string; note: string }[];
  cta: string;
  tone: "navy" | "leaf" | "gold";
};

export const DOORS: Door[] = [
  {
    id: "heal",
    title: "Heal",
    who: "You look successful from the outside and feel lost on the inside.",
    start: "Sacred Mornings",
    startNote: "A free morning community. Show up, listen, and see whether this is your kind of room.",
    path: [
      { name: "Group coaching", note: "Work on it alongside a small circle, with live guidance." },
      { name: "1:1 Soul Coaching", note: "Private sessions built around your story and your pace." },
    ],
    cta: "Talk about healing",
    tone: "navy",
  },
  {
    id: "lead",
    title: "Lead yourself",
    who: "You are worn out from proving yourself and ready to stop.",
    start: "The 5-day series", // CONFIRM: is the series free, and where do people join?
    startNote: "Five days of short, practical steps to feel where you actually stand.",
    path: [
      { name: "Self-Worth Activation", note: "Learn to ask for what you are worth and hold your ground." },
      { name: "Energy Transformation Program", note: "The deeper programme for lasting change in how you live and lead." }, // CONFIRM: one-line difference vs 1:1 Soul Coaching
    ],
    cta: "Talk about leading yourself",
    tone: "leaf",
  },
  {
    id: "coach",
    title: "Coach",
    who: "You are a coach or healer who helps everyone and undervalues yourself.",
    start: "A mentorship conversation",
    startNote: "Tell us where you are in your practice and we will see whether mentoring fits.", // CONFIRM: mentorship offer
    path: [],
    cta: "Ask about mentorship",
    tone: "gold",
  },
];

export const METHOD = [
  { name: "Emotional healing", body: "Release the stored pain and old beliefs that keep you in the same loop." },
  { name: "Energy alignment", body: "Clear what drains you and restore your natural steadiness." },
  { name: "Intentional communication", body: "Say what you mean, clearly and kindly, in every relationship." },
  { name: "Conscious habits", body: "Small daily practices that look after mind, body and spirit." },
  { name: "Practical action", body: "Grounded next steps toward the life you actually want." },
];

export const STORY = [
  "I know what it is to stay silent when you need to speak, to give endlessly while feeling empty, and to wonder whether there is more to life than getting through the day.",
  "For years I lived with self-doubt, swallowed my feelings, and depended on other people to tell me what I was worth. On paper I was successful. Inside, I was lost.",
  "Through my own work of healing, realigning my energy and learning to say my truth, I found my purpose: to guide other people back home to themselves.",
  "Today I work as an Energy Transformation Coach, Intentional Communication Mentor and Manifestation Guide, helping people break the patterns that keep them small.",
];

export const CREDENTIALS = [
  { title: "Coaching Certification 121", detail: "January to March 2023" },
  { title: "Enlightened Goddess", detail: "Certified practitioner" },
  { title: "Empowered 4.0 with Mohanji", detail: "Workshop completed" },
];

// CONFIRM: captions and the years of leadership work with Ammucare Trust (sources disagreed: 12+ vs 14).
export const MOMENTS = [
  { img: "/images/visionary-kalam.jpg", caption: "With Dr. APJ Abdul Kalam" },
  { img: "/images/visionary-successgyan.jpg", caption: "Success Gyan Global Leadership Summit" },
  { img: "/images/visionary-trainers.jpg", caption: "With trainers and mentors" },
  { img: "/images/visionary-vip.jpg", caption: "With industry leaders" },
  { img: "/images/visionary-ngo.jpg", caption: "Leadership work with Ammucare Trust" },
];

export const SACRED_MORNINGS = [
  { name: "Live sessions", body: "Guidance, questions and energy work, in real time." },
  { name: "Group healing", body: "Shared practice to clear what is stuck and restore balance." },
  { name: "Daily tools", body: "Short practices you can use the same day." },
  { name: "A safe room", body: "A community where you can be seen and heard without performing." },
];

// CONFIRM: shown only until real testimonials are added in Admin → Testimonials,
// and only after each person has agreed to be quoted.
export const FALLBACK_VOICES = [
  {
    id: "v1",
    name: "Ayushi Chaturvedi",
    role: "Soulmates cohort",
    quote:
      "This journey and the transformation each one has witnessed in us wouldn't have been the same, had you not been there to handhold us in our highs and lows within these 8 weeks. You've been a gentle guide, and a soul stirrer.",
  },
  {
    id: "v2",
    name: "Arti Palnitkar",
    role: "Nov '25 cohort",
    quote:
      "\"Thank you\" feels far too small to capture what you have truly contributed to each one of us. You have been a strong yet gentle leader, holding, nurturing and guiding each individual through this journey with deep care.",
  },
  {
    id: "v3",
    name: "Dr Sowmya S",
    role: "Jan '26 coaching",
    quote:
      "It was amazing talking to you! You gave me a clear idea of the coaching schedule and how we can nail this coaching with flying colors. Your energy is infectious, and I'm feeling super motivated to give it my all.",
  },
  {
    id: "v4",
    name: "Shaini",
    role: "Jan '26 cohort",
    quote:
      "Looking back, it's honestly mind-blowing to see the progress I've made in overcoming many fears and beliefs. For years, I was stuck in a cycle of overthinking, but you've completely broken that spell.",
  },
];
