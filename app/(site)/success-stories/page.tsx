import type { Metadata } from "next";
import Button from "@/components/Button";
import VoicesWall from "@/components/VoicesWall";

export const metadata: Metadata = {
  title: "Voices",
  description: "In their own words: people who have worked with Preeti.",
};

export default function Voices() {
  return (
    <>
      <section className="border-b border-ink/15">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
          <p className="label">Voices</p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[1.05] sm:text-6xl">
            Real people, <span className="mark">in their own words.</span>
          </h1>
        </div>
      </section>
      <section>
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
          <VoicesWall />
        </div>
      </section>
      <section className="border-t border-ink/15 bg-paper-2">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-14 sm:flex-row sm:items-center sm:px-8">
          <h2 className="font-display text-3xl sm:text-4xl">Your story could be next.</h2>
          <Button href="/book">Book a free call</Button>
        </div>
      </section>
    </>
  );
}
