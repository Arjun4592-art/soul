"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth";
import { isFirebaseConfigured } from "@/lib/firebase";
import FirebaseSetupNotice from "@/components/admin/FirebaseSetupNotice";

export default function AdminLoginPage() {
  const { login, error } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/admin");
    } catch {
      // error already set in context
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="arch mb-4 block h-14 w-10 bg-gold" aria-hidden />
          <h1 className="font-display text-2xl text-paper">Admin Console</h1>
          <p className="mt-1 text-sm text-paper/50">Preeti Soulpreneur LMS</p>
        </div>

        <div className="rounded-none bg-paper p-6 shadow-2xl sm:p-7">
          {!isFirebaseConfigured && (
            <div className="mb-5">
              <FirebaseSetupNotice />
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <label className="mb-4 block">
              <span className="mb-1.5 block text-[0.8rem] font-medium text-ink-soft">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[3px] border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold"
                placeholder="admin@preetisoulpreneur.com"
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
          Only admin/coach role accounts can access this console.
        </p>
      </div>
    </div>
  );
}
