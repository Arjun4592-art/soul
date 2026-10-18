"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

export default function NewsletterForm({
  className = "",
  source = "footer",
  dark = false,
}: {
  className?: string;
  source?: string;
  dark?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isFirebaseConfigured) {
      setError("Sign-up is not connected yet.");
      return;
    }
    setState("sending");
    try {
      await addDoc(collection(db, "newsletter_subscribers"), { email: email.trim(), source, createdAt: serverTimestamp() });
      setState("done");
    } catch {
      setError("Could not sign you up. Please try again.");
      setState("idle");
    }
  }

  if (state === "done") {
    return <p className={`text-sm ${dark ? "text-gold-soft" : "text-leaf"} ${className}`}>Thank you. You are on the list.</p>;
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="email"
          required
          aria-label="Email address"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`min-w-0 flex-1 border bg-transparent px-3 py-2.5 text-sm outline-none ${
            dark
              ? "border-paper/30 text-paper placeholder:text-paper/45 focus:border-gold-soft"
              : "border-ink/30 text-ink placeholder:text-ink-soft focus:border-ink"
          }`}
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className={`border px-4 text-sm font-medium disabled:opacity-60 ${
            dark ? "border-paper bg-paper text-ink hover:bg-gold-soft" : "border-ink bg-ink text-paper hover:bg-ink-2"
          }`}
        >
          {state === "sending" ? "…" : "Join"}
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
    </div>
  );
}
