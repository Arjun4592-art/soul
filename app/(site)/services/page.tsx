import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/components/Button";
import { DOORS } from "@/lib/content";

export const metadata: Metadata = {
  title: "The ways",
  description: "Three doors into the work: heal, lead yourself, or coach. Each starts with a free first step.",
};

const wrap = "mx-auto max-w-6xl px-5 sm:px-8";

const tone = {
  navy: { arch: "bg-ink", dot: "text-ink" },
  leaf: { arch: "bg-leaf", dot: "text-leaf" },
  gold: { arch: "bg-gold", dot: "text-gold-ink" },
} as const;

const FAQ = [
  ["How do I know which door is mine?", "Book a free call. We will talk it through and point you to the best starting place. Many people begin with Sacred Mornings."],
  ["Are sessions online?", "Yes. Sessions run on Zoom, so you can join from anywhere in the world."],
  ["What if I need to pause or reschedule?", "Life happens. Let us know at least 24 hours ahead and we will find another time."],
  ["Is this therapy?", "No. Coaching supports growth and is not a substitute for therapy or medical care. If you are in crisis, please contact a mental health professional or a local helpline."],
];

export default function Services() {
  return (
    <>
      <section className="border-b border-ink/15">
        <div className={`${wrap} py-14 lg:py-20`}>
          <p className="label">The ways</p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[1.05] sm:text-6xl">
            Three ways in. <span className="mark">One way through.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">
            Find the sentence below that sounds like you. Each door begins with a free first step, then opens onto a path if you want to go further.
          </p>
          <nav className="mt-8 flex flex-wrap gap-3" aria-label="Doors">
            {DOORS.map((d) => (
              <a key={d.id} href={`#${d.id}`} className="border border-ink px-4 py-2 text-sm font-medium transition hover:bg-ink hover:text-paper">
                {d.title}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {DOORS.map((d, i) => (
        <section key={d.id} id={d.id} className="scroll-mt-16 border-b border-ink/15">
          <div className={`${wrap} grid gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-20`}>
            <div>
              <div className="flex items-end gap-5">
                <span className={`arch block h-20 w-14 border border-ink ${tone[d.tone].arch}`} aria-hidden />
                <p className="label pb-1">Door 0{i + 1}</p>
              </div>
              <h2 className="mt-6 font-display text-5xl leading-none">{d.title}</h2>
              <p className="mt-5 max-w-md font-display text-2xl leading-snug">{d.who}</p>
              <div className="mt-8">
                <Button href={`/book?topic=${d.id}`}>{d.cta}</Button>
              </div>
            </div>

            <ol className="relative space-y-0 border-l border-ink/30 pl-8">
              <li className="relative pb-9">
                <span className="absolute -left-[2.45rem] top-1 h-3 w-3 rounded-full border border-ink bg-gold" aria-hidden />
                <p className="label">Start here</p>
                <h3 className="mt-1 font-display text-2xl">{d.start}</h3>
                <p className="mt-1 max-w-md text-ink-soft">{d.startNote}</p>
              </li>
              {d.path.map((p, j) => (
                <li key={p.name} className="relative pb-9 last:pb-0">
                  <span className="absolute -left-[2.45rem] top-1 h-3 w-3 rounded-full border border-ink bg-paper" aria-hidden />
                  <p className="label">Then, step {j + 2}</p>
                  <h3 className="mt-1 font-display text-2xl">{p.name}</h3>
                  <p className="mt-1 max-w-md text-ink-soft">{p.note}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ))}

      <section className="border-b border-ink/15 bg-sage">
        <div className={`${wrap} flex flex-col items-start justify-between gap-6 py-12 sm:flex-row sm:items-center`}>
          <div>
            <h2 className="font-display text-3xl">Rather learn at your own pace?</h2>
            <p className="mt-1 text-ink/80">Self-paced courses with video lessons, notes and a certificate.</p>
          </div>
          <Button href="/courses" variant="outline">Browse courses</Button>
        </div>
      </section>

      <section>
        <div className={`${wrap} grid gap-10 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-24`}>
          <div>
            <p className="label">Questions</p>
            <h2 className="mt-5 font-display text-4xl leading-tight">Before you reach out.</h2>
            <p className="mt-4 text-ink-soft">
              Something else on your mind? <Link href="/contact" className="underline decoration-gold decoration-2 underline-offset-4">Write to us</Link>.
            </p>
          </div>
          <div className="divide-y divide-ink/15 border-y border-ink/15">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-display text-xl">
                  {q}
                  <span className="font-mono text-lg leading-none text-gold-ink transition group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-3 max-w-xl text-ink-soft">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
