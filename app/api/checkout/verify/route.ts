import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb, getAuthedUser } from "@/lib/firebase-admin";
import { grantEnrollment, incrementCouponUsage } from "@/lib/checkout-helpers";
import type { CourseDoc, OrderDoc } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const authedUser = await getAuthedUser(req);
    if (!authedUser) {
      return NextResponse.json({ error: "Please log in first." }, { status: 401 });
    }

    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Payment details are incomplete." }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "RAZORPAY_KEY_SECRET is not set." }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await adminDb().collection("orders").doc(orderId).update({ status: "failed" }).catch(() => null);
      return NextResponse.json({ error: "Payment could not be verified — signature mismatch." }, { status: 400 });
    }

    const orderSnap = await adminDb().collection("orders").doc(orderId).get();
    if (!orderSnap.exists) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    const order = { id: orderSnap.id, ...orderSnap.data() } as OrderDoc;

    if (order.userId !== authedUser.uid) {
      return NextResponse.json({ error: "This order does not belong to you." }, { status: 403 });
    }

    // Idempotent: webhook may have already marked this paid.
    if (order.status === "paid") {
      return NextResponse.json({ ok: true, courseId: order.courseId });
    }

    await adminDb().collection("orders").doc(orderId).update({
      status: "paid",
      razorpayPaymentId: razorpay_payment_id,
    });

    const courseSnap = await adminDb().collection("courses").doc(order.courseId).get();
    if (courseSnap.exists) {
      const course = { id: courseSnap.id, ...courseSnap.data() } as CourseDoc;
      await grantEnrollment(order.userId, order.userName, course);
      if (order.couponCode) await incrementCouponUsage(order.couponCode);
    }

    return NextResponse.json({ ok: true, courseId: order.courseId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment verification failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
