"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { where } from "firebase/firestore";
import { btnClass } from "@/components/Button";
import { inputClass } from "@/components/forms";
import { useCollection } from "@/lib/useCollection";
import { useCurrentUser } from "@/lib/useCurrentUser";
import type { CourseDoc, EnrollmentDoc } from "@/lib/types";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

let razorpayScriptPromise: Promise<void> | null = null;
function loadRazorpayScript() {
  if (razorpayScriptPromise) return razorpayScriptPromise;
  razorpayScriptPromise = new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load the Razorpay script"));
    document.body.appendChild(script);
  });
  return razorpayScriptPromise;
}

export default function EnrollPanel({ course }: { course: CourseDoc }) {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const uid = user?.uid ?? "__none__";

  const { data: enrollments, loading: enrollLoading } = useCollection<EnrollmentDoc>("enrollments", [
    where("userId", "==", uid),
    where("courseId", "==", course.id),
  ]);
  const enrolled = enrollments.length > 0;

  const [couponCode, setCouponCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "creating" | "paying" | "verifying" | "success">("idle");

  async function handleEnroll() {
    if (!user) {
      router.push(`/student/login?redirect=/courses/${course.slug}`);
      return;
    }
    setBusy(true);
    setError(null);
    setStatus("creating");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ courseId: course.id, couponCode: couponCode || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setStatus("idle");
        setBusy(false);
        return;
      }

      if (data.free) {
        setStatus("success");
        setBusy(false);
        router.push(`/student/courses/${course.id}`);
        return;
      }

      await loadRazorpayScript();
      setStatus("paying");

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Preeti Soulpreneur",
        description: data.courseTitle,
        order_id: data.razorpayOrderId,
        prefill: { name: data.userName, email: data.userEmail },
        theme: { color: "#12263d" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          setStatus("verifying");
          try {
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
              body: JSON.stringify({ orderId: data.orderId, ...response }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              setError(verifyData.error ?? "Payment could not be verified.");
              setStatus("idle");
              return;
            }
            setStatus("success");
            router.push(`/student/courses/${course.id}`);
          } finally {
            setBusy(false);
          }
        },
        modal: {
          ondismiss: () => {
            setStatus("idle");
            setBusy(false);
          },
        },
      });
      rzp.open();
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("idle");
      setBusy(false);
    }
  }

  const loading = userLoading || (user && enrollLoading);

  return (
    <div className="border border-ink bg-white p-6 shadow-[6px_6px_0_0_var(--ink)]">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-4xl">₹{course.price?.toLocaleString("en-IN")}</span>
        {course.compareAtPrice && course.compareAtPrice > course.price && (
          <span className="text-ink-soft line-through">₹{course.compareAtPrice.toLocaleString("en-IN")}</span>
        )}
      </div>

      {loading ? (
        <div className="mt-5 h-12 animate-pulse bg-ink/10" />
      ) : enrolled ? (
        <Link href={`/student/courses/${course.id}`} className={btnClass("primary", "mt-5 w-full")}>
          Go to course <span aria-hidden>→</span>
        </Link>
      ) : (
        <>
          <label className="mt-5 block">
            <span className="mb-1.5 block text-[0.85rem] font-medium">
              Coupon code <span className="font-normal text-ink-soft">optional</span>
            </span>
            <input
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                setError(null);
              }}
              placeholder="WELCOME10"
              className={inputClass}
            />
          </label>

          {error && <p className="mt-3 border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>}

          <button onClick={handleEnroll} disabled={busy} className={btnClass("primary", "mt-4 w-full")}>
            {status === "paying"
              ? "Opening payment window…"
              : status === "verifying"
              ? "Verifying…"
              : busy
              ? "Please wait…"
              : !user
              ? "Sign in to enroll"
              : "Enroll now"}
          </button>

          {!user && (
            <p className="mt-4 text-center text-sm text-ink-soft">
              New here?{" "}
              <Link href={`/student/signup?redirect=/courses/${course.slug}`} className="font-medium text-ink underline decoration-gold decoration-2 underline-offset-4">
                Create an account
              </Link>
            </p>
          )}
        </>
      )}
    </div>
  );
}
