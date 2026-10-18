import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase-admin";
import { grantEnrollment, incrementCouponUsage } from "@/lib/checkout-helpers";
import type { CourseDoc, OrderDoc } from "@/lib/types";

// Configure this URL + RAZORPAY_WEBHOOK_SECRET in the Razorpay dashboard
// (Settings → Webhooks), subscribed to "payment.captured".
export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers.get("x-razorpay-signature");
  const rawBody = await req.text();

  if (!secret) {
    return NextResponse.json({ error: "RAZORPAY_WEBHOOK_SECRET is not set." }, { status: 500 });
  }
  if (!signature) {
    return NextResponse.json({ error: "Signature header missing." }, { status: 400 });
  }

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (expected !== signature) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (event.event === "payment.captured") {
    const rpOrderId = event.payload?.payment?.entity?.order_id;
    const paymentId = event.payload?.payment?.entity?.id;

    if (rpOrderId) {
      const snap = await adminDb().collection("orders").where("razorpayOrderId", "==", rpOrderId).limit(1).get();
      if (!snap.empty) {
        const orderDoc = snap.docs[0];
        const order = { id: orderDoc.id, ...orderDoc.data() } as OrderDoc;

        if (order.status !== "paid") {
          await orderDoc.ref.update({
            status: "paid",
            razorpayPaymentId: paymentId ?? order.razorpayPaymentId ?? null,
          });

          const courseSnap = await adminDb().collection("courses").doc(order.courseId).get();
          if (courseSnap.exists) {
            const course = { id: courseSnap.id, ...courseSnap.data() } as CourseDoc;
            await grantEnrollment(order.userId, order.userName, course);
            if (order.couponCode) await incrementCouponUsage(order.couponCode);
          }
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}
