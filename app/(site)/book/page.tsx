import { Suspense } from "react";
import type { Metadata } from "next";
import BookingRequestForm from "@/components/BookingRequestForm";

export const metadata: Metadata = {
  title: "Book a free call",
  description: "Tell us when suits you. You will get a confirmed time and a Zoom link by email.",
};

const steps = [
  ["You send a request", "Tell us what is on your mind and when you are usually free."],
  ["We confirm a time", "Within a day you get an email with the exact time and a Zoom link."],
  ["We talk", "A relaxed conversation about where you are. No pitch, no pressure."],
];

export default function BookPage() {
  return (
    <section>
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-20">
        <div>
          <p className="label">Free call</p>
          <h1 className="mt-5 font-display text-5xl leading-[1.05] sm:text-6xl">
            Let us find a time to <span className="mark">talk.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-ink-soft">
            Choose what you would like to talk about, tell us when you are free, and we will take it from there.
          </p>

          <ol className="mt-12 space-y-7">
            {steps.map(([title, body], i) => (
              <li key={title} className="grid grid-cols-[2.5rem_1fr] gap-3">
                <span className="font-mono text-sm text-gold-ink">0{i + 1}</span>
                <div>
                  <h2 className="font-display text-xl">{title}</h2>
                  <p className="mt-1 text-ink-soft">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <Suspense fallback={<div className="h-96" />}>
          <BookingRequestForm />
        </Suspense>
      </div>
    </section>
  );
}
