import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { sendRequestReceived, sendStaffAlert } from "@/lib/booking-email";

/**
 * Public endpoint: POST /api/bookings/request
 * body: { name, email, phone?, topic, preferredTime?, message?, timezone?, website? }
 *
 * `website` is a honeypot — real visitors never see or fill it. Bookings are
 * only ever written here (admin SDK), never straight from the browser, so the
 * input can be validated first.
 */
const TOPICS = ["heal", "lead", "coach", "unsure"] as const;

// Best-effort throttle: one request per email+IP every 30 seconds per server instance.
const recent = new Map<string, number>();

function clean(v: unknown, max: number) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (clean(body.website, 100)) return NextResponse.json({ ok: true }); // bot

    const name = clean(body.name, 120);
    const email = clean(body.email, 200).toLowerCase();
    const phone = clean(body.phone, 40);
    const message = clean(body.message, 2000);
    const preferredTime = clean(body.preferredTime, 300);
    const timezone = clean(body.timezone, 60);
    const topic = TOPICS.includes(body.topic) ? (body.topic as (typeof TOPICS)[number]) : "unsure";

    if (!name || !email) {
      return NextResponse.json({ error: "Please add your name and email." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "That email address does not look right." }, { status: 400 });
    }

    const key = `${req.headers.get("x-forwarded-for") ?? "local"}|${email}`;
    const last = recent.get(key) ?? 0;
    if (Date.now() - last < 30_000) {
      return NextResponse.json({ error: "Request already received. Please wait a moment." }, { status: 429 });
    }
    recent.set(key, Date.now());

    await adminDb().collection("bookings").add({
      name,
      email,
      phone,
      topic,
      message,
      preferredTime,
      timezone,
      status: "requested",
      source: "website",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Emails are a courtesy; the request is already saved.
    await Promise.allSettled([sendRequestReceived({ name, email }), sendStaffAlert({ name, email, topic, preferredTime, message })]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not send your request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
