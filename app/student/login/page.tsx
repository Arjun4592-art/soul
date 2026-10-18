"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useStudentAuth } from "@/lib/student-auth";
import { isFirebaseConfigured } from "@/lib/firebase";
import FirebaseSetupNotice from "@/components/admin/FirebaseSetupNotice";
import GoogleButton from "@/components/student/GoogleButton";

export default function StudentLoginPage() {
  const { login, loginWithGoogle, error } = useStudentAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/student";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      router.push(redirectTo);
    } catch {
      // error already set in context
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setGoogleSubmitting(true);
    try {
      await loginWithGoogle();
      router.push(redirectTo);
    } catch {
      // error already set in context (or user just cancelled the popup)
    } finally {
      setGoogleSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="arch mb-4 block h-14 w-10 bg-gold" aria-hidden />
          <h1 className="font-display text-2xl text-paper">Welcome Back</h1>
          <p className="mt-1 text-sm text-paper/50">Log in to your courses</p>
        </div>

        <div className="rounded-none bg-paper p-6 shadow-2xl sm:p-7">
          {!isFirebaseConfigured && (
            <div className="mb-5">
              <FirebaseSetupNotice />
            </div>
          )}

          <GoogleButton onClick={handleGoogle} disabled={googleSubmitting || !isFirebaseConfigured} />

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-ink/10" />
            <span className="text-[0.72rem] uppercase tracking-wide text-ink-soft">or</span>
            <span className="h-px flex-1 bg-ink/10" />
          </div>

          <form onSubmit={handleSubmit}>
            <label className="mb-4 block">
              <span className="mb-1.5 block text-[0.8rem] font-medium text-ink-soft">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[3px] border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold"
                placeholder="you@example.com"
              />
            </label>
            <label className="mb-5 block">
              <span className="mb-1.5 block text-[0.8rem] font-medium text-ink-soft">Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-[3px] border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold"
                placeholder="••••••••"
              />
            </label>

            {error && (
              <p className="mb-4 rounded-[3px] bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !isFirebaseConfigured}
              className="flex w-full items-center justify-center gap-2 rounded-[3px] bg-ink px-5 py-3 text-sm font-medium text-paper transition hover:bg-ink-2 disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Log In
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-[0.78rem] text-paper/40">
          New here? <Link href={`/student/signup${redirectTo !== "/student" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`} className="text-gold-ink hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
