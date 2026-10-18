import { NextRequest, NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb, getStaffUser } from "@/lib/firebase-admin";
import { sendScheduled } from "@/lib/booking-email";

/**
 * Staff-only: POST /api/admin/bookings/[id]/schedule
 * body: { startISO, durationMinutes, zoomLink, zoomPasscode?, adminNote?, sendEmail? }
 * Turns a request into a scheduled call (or moves an already scheduled one)
 * and emails the guest the time + the Zoom link staff pasted in.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await getStaffUser(req))) return NextResponse.json({ error: "Not allowed." }, { status: 403 });

    const { id } = await params;
    const b = await req.json();
    const start = new Date(b.startISO);
    const zoomLink = String(b.zoomLink ?? "").trim();
    const durationMinutes = Math.min(Math.max(Number(b.durationMinutes) || 30, 10), 240);

    if (Number.isNaN(start.getTime())) return NextResponse.json({ error: "Pick a valid date and time." }, { status: 400 });
    if (!/^https:\/\//i.test(zoomLink)) {
      return NextResponse.json({ error: "Paste the full Zoom link (starting with https://)." }, { status: 400 });
    }

    const ref = adminDb().collection("bookings").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    const booking = snap.data()!;
    if (booking.status === "cancelled" || booking.status === "completed") {
      return NextResponse.json({ error: `This booking is already ${booking.status}.` }, { status: 400 });
    }

    const zoomPasscode = String(b.zoomPasscode ?? "").trim();
    await ref.update({
      status: "scheduled",
      startTime: Timestamp.fromDate(start),
      durationMinutes,
      zoomLink,
      zoomPasscode,
      adminNote: String(b.adminNote ?? booking.adminNote ?? "").trim(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    let emailed = false;
    if (b.sendEmail !== false) {
      const r = await sendScheduled({
        name: booking.name,
        email: booking.email,
        start,
        timezone: booking.timezone,
        durationMinutes,
        zoomLink,
        zoomPasscode,
        rescheduled: booking.status === "scheduled",
      });
      emailed = r.sent;
    }
    return NextResponse.json({ ok: true, emailed });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not schedule the call." }, { status: 500 });
  }
}
