"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { TOPICS } from "@/lib/site";
import { btnClass } from "./Button";
import { FormField, inputClass } from "./forms";

export default function BookingRequestForm() {
  const params = useSearchParams();
  const initialTopic = TOPICS.some((t) => t.value === params.get("topic")) ? (params.get("topic") as string) : "unsure";

  const [form, setForm] = useState({
    topic: initialTopic,
    name: "",
    email: "",
    phone: "",
    preferredTime: "",
    message: "",
    website: "", // honeypot
  });
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/bookings/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send your request.");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your request.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="border border-ink bg-sage p-8 shadow-[6px_6px_0_0_var(--ink)]">
        <p className="label !text-ink/70">Request received</p>
        <h2 className="mt-3 font-display text-3xl leading-tight">Thank you, {form.name.split(" ")[0]}.</h2>
        <p className="mt-4 text-ink/80">
          We will write to {form.email} within a day with a confirmed time and a Zoom link. If it does not arrive, check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5 border border-ink bg-paper p-6 shadow-[6px_6px_0_0_var(--ink)] sm:p-8">
      <FormField label="What would you like to talk about?">
        <select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className={inputClass}>
          {TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Your name">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} autoComplete="name" />
        </FormField>
        <FormField label="Email">
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} autoComplete="email" />
        </FormField>
      </div>

      <FormField label="Phone or WhatsApp" hint="optional">
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} autoComplete="tel" />
      </FormField>

      <FormField label="When suits you?" hint="days and times, in your own words">
        <input
          value={form.preferredTime}
          onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
          placeholder="e.g. weekday evenings after 7, or Saturday morning"
          className={inputClass}
        />
      </FormField>

      <FormField label="Anything you would like us to know first?" hint="optional">
        <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${inputClass} resize-none`} />
      </FormField>

      {/* Honeypot: hidden from people, tempting to bots. */}
      <div className="absolute -left-[9999px]" aria-hidden>
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
        </label>
      </div>

      {error && <p className="text-sm text-rose-700">{error}</p>}

      <button type="submit" disabled={state === "sending"} className={btnClass("primary")}>
        {state === "sending" ? "Sending…" : "Request my free call"}
      </button>
    </form>
  );
}
