import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, getStaffUser } from "@/lib/firebase-admin";
import { sendCancelled } from "@/lib/booking-email";

/** Staff-only: POST /api/admin/bookings/[id]/cancel  body: { reason?, sendEmail? } */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await getStaffUser(req))) return NextResponse.json({ error: "Not allowed." }, { status: 403 });

    const { id } = await params;
    const { reason, sendEmail } = await req.json().catch(() => ({ reason: "", sendEmail: true }));

    const ref = adminDb().collection("bookings").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    const booking = snap.data()!;
    if (booking.status === "cancelled") return NextResponse.json({ error: "Already cancelled." }, { status: 400 });

    await ref.update({
      status: "cancelled",
      cancelReason: String(reason ?? "").trim(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    if (sendEmail !== false) {
      await sendCancelled({
        name: booking.name,
        email: booking.email,
        start: booking.startTime?.toDate?.(),
        timezone: booking.timezone,
        reason: String(reason ?? "").trim(),
      });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not cancel the booking." }, { status: 500 });
  }
}
