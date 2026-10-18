import type { Metadata } from "next";
import Button from "@/components/Button";
import SacredJoin from "@/components/SacredJoin";
import { SACRED_MORNINGS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Sacred mornings",
  description: "A free community for people ready to heal, grow and rise, with live sessions and daily practice.",
};

const wrap = "mx-auto max-w-6xl px-5 sm:px-8";

// CONFIRM with Preeti: whether Sacred Mornings and the WhatsApp community are the same thing,
// and the session days/times. Add the invite link in Admin → Settings.
const HOW = [
  ["Join the community", "Free to join. You get access through the WhatsApp community."],
  ["Show up when you can", "Come to the live sessions, or catch up on the practices later. No pressure to perform."],
  ["Take the next step if you want", "When you are ready for more, the three doors are open."],
];

export default function SacredMornings() {
  return (
    <>
      <section className="border-b border-ink/15 bg-sage">
        <div className={`${wrap} py-14 lg:py-24`}>
          <p className="label !text-ink/70">Free community</p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[1.05] sm:text-7xl">Start the day with company.</h1>
          <p className="mt-7 max-w-xl text-lg text-ink/80">
            Sacred Mornings is a community for people who are ready to heal, grow and rise. It is a room for real practice and honest conversation, not another group chat of quotes.
          </p>
          <div className="mt-9">
            <SacredJoin />
          </div>
        </div>
      </section>

      <section className="border-b border-ink/15">
        <div className={`${wrap} grid gap-10 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-24`}>
          <div>
            <p className="label">What you get</p>
            <h2 className="mt-5 font-display text-4xl leading-tight">A steady place to land.</h2>
          </div>
          <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {SACRED_MORNINGS.map((s) => (
              <li key={s.name} className="border-t border-ink pt-4">
                <h3 className="font-display text-2xl">{s.name}</h3>
                <p className="mt-2 text-ink-soft">{s.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-ink/15 bg-paper-2">
        <div className={`${wrap} py-16 lg:py-24`}>
          <p className="label">How it works</p>
          <ol className="mt-10 grid gap-10 md:grid-cols-3">
            {HOW.map(([t, b], i) => (
              <li key={t} className="border-t border-gold pt-5">
                <span className="font-mono text-sm text-gold-ink">0{i + 1}</span>
                <h3 className="mt-3 font-display text-2xl leading-snug">{t}</h3>
                <p className="mt-2 text-ink-soft">{b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section>
        <div className={`${wrap} flex flex-col items-start justify-between gap-6 py-14 sm:flex-row sm:items-center`}>
          <h2 className="font-display text-3xl sm:text-4xl">Not sure where to begin?</h2>
          <Button href="/services" variant="outline">See the three doors</Button>
        </div>
      </section>
    </>
  );
}
