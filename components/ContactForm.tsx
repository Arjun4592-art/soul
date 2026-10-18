"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { btnClass } from "./Button";
import { FormField, inputClass } from "./forms";

const INTERESTS = [
  "Healing (Door 1)",
  "Leading myself (Door 2)",
  "Coaching others (Door 3)",
  "A course",
  "Something else",
];

export default function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", interest: INTERESTS[0], message: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isFirebaseConfigured) {
      setError("The contact form is not connected yet.");
      return;
    }
    setState("sending");
    try {
      await addDoc(collection(db, "contact_messages"), {
        name: form.name.trim(),
        email: form.email.trim(),
        interest: form.interest,
        message: form.message.trim(),
        status: "new",
        createdAt: serverTimestamp(),
      });
      setState("done");
    } catch {
      setError("Could not send your message. Please try again.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="border border-ink bg-sage p-8">
        <h2 className="font-display text-3xl">Message sent.</h2>
        <p className="mt-3 text-ink/80">Thank you for writing. You will hear back within a day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Name">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} autoComplete="name" />
        </FormField>
        <FormField label="Email">
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} autoComplete="email" />
        </FormField>
      </div>
      <FormField label="I am writing about">
        <select value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })} className={inputClass}>
          {INTERESTS.map((i) => (
            <option key={i}>{i}</option>
          ))}
        </select>
      </FormField>
      <FormField label="Message">
        <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${inputClass} resize-none`} />
      </FormField>
      {error && <p className="text-sm text-rose-700">{error}</p>}
      <button type="submit" disabled={state === "sending"} className={btnClass("primary")}>
        {state === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
