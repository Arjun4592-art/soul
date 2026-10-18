import Image from "next/image";
import Link from "next/link";
import Button from "@/components/Button";
import Reveal from "@/components/Reveal";
import HomeVoices from "@/components/HomeVoices";
import { DOORS, FAMILIAR, METHOD, SACRED_MORNINGS, STORY } from "@/lib/content";

const wrap = "mx-auto max-w-6xl px-5 sm:px-8";

const doorTone = {
  navy: "bg-ink text-paper",
  leaf: "bg-leaf text-paper",
  gold: "bg-gold-soft text-ink",
} as const;

export default function Home() {
  return (
    <>
      {/* 1. Welcome */}
      <section className="border-b border-ink/15">
        <div className={`${wrap} grid items-end gap-12 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-20`}>
          <div>
            <p className="label">Energy transformation coach</p>
            <h1 className="mt-6 font-display text-[2.8rem] leading-[1.03] tracking-tight sm:text-[4.3rem]">
              From overwhelm to <span className="mark">inner peace.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg text-ink-soft">
              You have been strong for everyone else for a long time. Here you can put some of that down, understand
              what is really going on, and build a life that does not cost you yourself. We work on what you feel, how
              you speak, and what you do on Monday morning.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Button href="/book">Book a free call</Button>
              <a href="#doors" className="font-medium underline decoration-gold decoration-2 underline-offset-[6px] hover:text-ink-2">
                Find your door ↓
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm lg:mx-0 lg:justify-self-end">
            <div className="arch relative aspect-[4/5] overflow-hidden border border-ink bg-mist">
              <Image
                src="/images/preeti-portrait.jpg"
                alt="Preeti Yadav"
                fill
                priority
                sizes="(max-width: 1024px) 80vw, 380px"
                className="object-cover object-[58%_12%]"
              />
            </div>
            <p className="absolute -left-3 bottom-10 max-w-[11rem] border border-ink bg-gold-soft px-4 py-3 font-display text-lg leading-snug shadow-[4px_4px_0_0_var(--ink)] sm:-left-8">
              Where spirit meets success
            </p>
          </div>
        </div>
      </section>

      {/* 2. Does this feel familiar? */}
      <section className="border-b border-ink/15">
        <div className={`${wrap} grid gap-10 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-24`}>
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="label">01 / Does this feel familiar?</p>
            <h2 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">If you nodded at any of these, you are in the right place.</h2>
            <p className="mt-6 max-w-sm text-ink-soft">
              None of this is a flaw in you. It is a sign that the way you have been living has run its course.
            </p>
          </div>
          <ol className="divide-y divide-ink/15 border-y border-ink/15">
            {FAMILIAR.map((f, i) => (
              <Reveal as="li" key={f.title} className="grid grid-cols-[2.5rem_1fr] gap-4 py-7">
                <span className="font-mono text-sm text-gold-ink">0{i + 1}</span>
                <div>
                  <h3 className="font-display text-2xl leading-snug">{f.title}</h3>
                  <p className="mt-2 text-ink-soft">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 3. Choose your door */}
      <section id="doors" className="scroll-mt-16 border-b border-ink/15 bg-paper-2">
        <div className={`${wrap} py-16 lg:py-24`}>
          <p className="label">02 / Choose your door</p>
          <div className="mt-5 grid gap-6 lg:grid-cols-2 lg:items-end">
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">Pick the sentence that sounds like you.</h2>
            <p className="max-w-md text-ink-soft lg:justify-self-end">
              You do not have to decode who this is for. Three doors, three starting points, and a free first step behind each.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {DOORS.map((d, i) => (
              <Reveal key={d.id} delay={i * 0.08} className={i === 1 ? "md:mt-12" : i === 2 ? "md:mt-24" : ""}>
                <Link
                  href={`/services#${d.id}`}
                  className={`arch group flex min-h-[26rem] flex-col border border-ink px-7 pb-8 pt-24 transition hover:-translate-y-1 ${doorTone[d.tone]}`}
                >
                  <span className="font-mono text-xs uppercase tracking-[0.18em] opacity-70">Door 0{i + 1}</span>
                  <h3 className="mt-3 font-display text-4xl leading-none">{d.title}</h3>
                  <p className="mt-5 text-[1.02rem] leading-relaxed opacity-90">{d.who}</p>
                  <span className="mt-auto pt-8 font-medium underline decoration-2 underline-offset-[6px] opacity-95 group-hover:decoration-gold">
                    See this path →
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Meet Preeti */}
      <section className="border-b border-ink/15">
        <div className={`${wrap} grid items-center gap-12 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:py-24`}>
          <Reveal className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-0 translate-x-3 translate-y-3 border border-ink" aria-hidden />
            <div className="relative aspect-square overflow-hidden border border-ink bg-mist">
              <Image
                src="/images/preeti-portrait.jpg"
                alt="Preeti Yadav, energy transformation coach"
                fill
                sizes="(max-width: 1024px) 90vw, 440px"
                className="object-cover object-[58%_18%]"
              />
            </div>
          </Reveal>
          <Reveal>
            <p className="label">03 / Meet Preeti</p>
            <h2 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">I have stood where you are standing.</h2>
            <div className="mt-6 space-y-4 text-[1.05rem] text-ink-soft">
              <p>{STORY[0]}</p>
              <p>{STORY[2]}</p>
            </div>
            <div className="mt-8">
              <Button href="/about" variant="outline">Read her story</Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5. The Soulpreneur way */}
      <section className="bg-ink text-paper">
        <div className={`${wrap} py-16 lg:py-24`}>
          <p className="label !text-paper/60">04 / The Soulpreneur way</p>
          <h2 className="mt-5 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
            Simple, grounded and lasting. No quick fixes.
          </h2>
          <ol className="mt-14 grid gap-x-8 gap-y-10 md:grid-cols-5">
            {METHOD.map((m, i) => (
              <Reveal as="li" key={m.name} delay={i * 0.06} className="border-t border-gold pt-5">
                <span className="font-mono text-xs text-gold-soft">0{i + 1}</span>
                <h3 className="mt-3 font-display text-xl leading-snug">{m.name}</h3>
                <p className="mt-2 text-[0.95rem] text-paper/70">{m.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 6. Voices */}
      <section className="border-b border-ink/15">
        <div className={`${wrap} py-16 lg:py-24`}>
          <p className="label">05 / Voices</p>
          <h2 className="mb-12 mt-5 max-w-xl font-display text-4xl leading-tight sm:text-5xl">In their own words.</h2>
          <HomeVoices />
        </div>
      </section>

      {/* 7. Sacred Mornings */}
      <section className="border-b border-ink/15 bg-sage">
        <div className={`${wrap} grid gap-10 py-16 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:py-24`}>
          <div>
            <p className="label !text-ink/70">06 / Sacred Mornings</p>
            <h2 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">Start in the morning, and start for free.</h2>
            <p className="mt-6 max-w-md text-ink/80">
              A community for people who are ready to heal, grow and rise, with real practice rather than just motivation.
            </p>
            <div className="mt-8">
              <Button href="/sacred-mornings">Join Sacred Mornings</Button>
            </div>
          </div>
          <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {SACRED_MORNINGS.map((s) => (
              <li key={s.name} className="border-t border-ink/40 pt-4">
                <h3 className="font-display text-xl">{s.name}</h3>
                <p className="mt-1 text-[0.95rem] text-ink/75">{s.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 8. Closing invitation */}
      <section>
        <div className={`${wrap} py-20 text-center lg:py-28`}>
          <p className="label">07 / An invitation</p>
          <h2 className="mx-auto mt-5 max-w-3xl font-display text-4xl leading-tight sm:text-6xl">
            Ready to put some of it <span className="mark">down?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-ink-soft">
            Book a free call. We will talk about where you are and whether working together makes sense. No pressure.
          </p>
          <div className="mt-9 flex justify-center">
            <Button href="/book">Book a free call</Button>
          </div>
        </div>
      </section>
    </>
  );
}
