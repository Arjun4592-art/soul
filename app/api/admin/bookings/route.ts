import { NextRequest, NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb, getStaffUser } from "@/lib/firebase-admin";
import { sendScheduled } from "@/lib/booking-email";

/**
 * Staff-only: POST /api/admin/bookings — add a booking by hand (for example a
 * call agreed over WhatsApp). Created directly as "scheduled" with its Zoom link.
 */
export async function POST(req: NextRequest) {
  try {
    if (!(await getStaffUser(req))) return NextResponse.json({ error: "Not allowed." }, { status: 403 });

    const b = await req.json();
    const name = String(b.name ?? "").trim();
    const email = String(b.email ?? "").trim().toLowerCase();
    const zoomLink = String(b.zoomLink ?? "").trim();
    const start = new Date(b.startISO);
    const durationMinutes = Math.min(Math.max(Number(b.durationMinutes) || 30, 10), 240);

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Name and a valid email are required." }, { status: 400 });
    }
    if (Number.isNaN(start.getTime())) return NextResponse.json({ error: "Pick a valid date and time." }, { status: 400 });
    if (!/^https:\/\//i.test(zoomLink)) {
      return NextResponse.json({ error: "Paste the full Zoom link (starting with https://)." }, { status: 400 });
    }

    const doc = {
      name,
      email,
      phone: String(b.phone ?? "").trim(),
      topic: ["heal", "lead", "coach", "unsure"].includes(b.topic) ? b.topic : "unsure",
      message: "",
      status: "scheduled",
      source: "admin",
      startTime: Timestamp.fromDate(start),
      durationMinutes,
      zoomLink,
      zoomPasscode: String(b.zoomPasscode ?? "").trim(),
      adminNote: String(b.adminNote ?? "").trim(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    const ref = await adminDb().collection("bookings").add(doc);

    let emailed = false;
    if (b.sendEmail !== false) {
      const r = await sendScheduled({ name, email, start, durationMinutes, zoomLink, zoomPasscode: doc.zoomPasscode });
      emailed = r.sent;
    }
    return NextResponse.json({ id: ref.id, emailed });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not add the booking." }, { status: 500 });
  }
}
