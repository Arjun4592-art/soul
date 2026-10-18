import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import ContactDetails from "@/components/ContactDetails";

export const metadata: Metadata = {
  title: "Contact",
  description: "Write to Preeti with a question. You will hear back within a day.",
};

export default function Contact() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
        <p className="label">Contact</p>
        <h1 className="mt-5 max-w-2xl font-display text-5xl leading-[1.05] sm:text-6xl">
          Write to us. <span className="mark">We read everything.</span>
        </h1>
        <div className="mt-14 grid gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
          <ContactForm />
          <ContactDetails />
        </div>
      </div>
    </section>
  );
}
