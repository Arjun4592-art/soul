import type { Metadata } from "next";
import Image from "next/image";
import Button from "@/components/Button";
import Reveal from "@/components/Reveal";
import { CREDENTIALS, MOMENTS, STORY } from "@/lib/content";

export const metadata: Metadata = {
  title: "Her story",
  description:
    "Preeti Yadav is an Energy Transformation Coach, Intentional Communication Mentor and Manifestation Guide. This is how she got here.",
};

const wrap = "mx-auto max-w-6xl px-5 sm:px-8";

export default function About() {
  return (
    <>
      <section className="border-b border-ink/15">
        <div className={`${wrap} grid items-end gap-12 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20`}>
          <div>
            <p className="label">Her story</p>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] sm:text-6xl">
              Hi, I am <span className="mark">Preeti Yadav.</span>
            </h1>
            <div className="mt-8 max-w-xl space-y-5 text-[1.08rem] text-ink-soft">
              {STORY.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            <div className="mt-10">
              <Button href="/book">Book a free call</Button>
            </div>
          </div>
          <div className="mx-auto w-full max-w-sm lg:justify-self-end">
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
            <p className="mt-4 font-display text-xl leading-snug">From silence to soul-led leadership.</p>
          </div>
        </div>
      </section>

      <section className="border-b border-ink/15">
        <div className={`${wrap} grid gap-10 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-24`}>
          <div>
            <p className="label">Training</p>
            <h2 className="mt-5 font-display text-4xl leading-tight">Learning, on top of living it.</h2>
          </div>
          <ul className="divide-y divide-ink/15 border-y border-ink/15">
            {CREDENTIALS.map((c) => (
              <li key={c.title} className="flex flex-col justify-between gap-1 py-5 sm:flex-row sm:items-baseline">
                <span className="font-display text-2xl">{c.title}</span>
                <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft">{c.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-ink/15 bg-paper-2">
        <div className={`${wrap} py-16 lg:py-24`}>
          <p className="label">Along the way</p>
          <h2 className="mt-5 max-w-xl font-display text-4xl leading-tight sm:text-5xl">Moments from the work.</h2>
          <ul className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-5">
            {MOMENTS.map((m, i) => (
              <Reveal as="li" key={m.img} delay={i * 0.05} className={i % 2 ? "md:mt-10" : ""}>
                <figure>
                  <div className="relative aspect-[3/4] overflow-hidden border border-ink bg-mist">
                    <Image src={m.img} alt={m.caption} fill sizes="(max-width: 768px) 45vw, 200px" className="object-cover object-top" />
                  </div>
                  <figcaption className="mt-2 text-[0.82rem] leading-snug text-ink-soft">{m.caption}</figcaption>
                </figure>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className={`${wrap} py-20 text-center lg:py-28`}>
          <h2 className="mx-auto max-w-2xl font-display text-4xl leading-tight sm:text-5xl">Let us write your next chapter together.</h2>
          <div className="mt-9 flex justify-center">
            <Button href="/book">Book a free call</Button>
          </div>
        </div>
      </section>
    </>
  );
}
