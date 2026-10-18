import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, getAuthedUser } from "@/lib/firebase-admin";
import { validateCoupon } from "@/lib/coupon";
import { grantEnrollment, incrementCouponUsage } from "@/lib/checkout-helpers";
import type { CourseDoc } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const authedUser = await getAuthedUser(req);
    if (!authedUser) {
      return NextResponse.json({ error: "Please log in first." }, { status: 401 });
    }

    const { courseId, couponCode } = await req.json();
    if (!courseId) {
      return NextResponse.json({ error: "courseId is required." }, { status: 400 });
    }

    const courseSnap = await adminDb().collection("courses").doc(courseId).get();
    if (!courseSnap.exists) {
      return NextResponse.json({ error: "This course could not be found." }, { status: 404 });
    }
    const course = { id: courseSnap.id, ...courseSnap.data() } as CourseDoc;
    if (course.status !== "published") {
      return NextResponse.json({ error: "This course is not available right now." }, { status: 400 });
    }

    const alreadyEnrolled = await adminDb()
      .collection("enrollments")
      .where("userId", "==", authedUser.uid)
      .where("courseId", "==", courseId)
      .limit(1)
      .get();
    if (!alreadyEnrolled.empty) {
      return NextResponse.json({ error: "You are already enrolled in this course." }, { status: 400 });
    }

    let amount = course.price;
    let appliedCouponCode: string | null = null;

    if (couponCode) {
      const result = await validateCoupon(couponCode, course.price);
      if (!result.valid) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }
      amount = result.finalAmount;
      appliedCouponCode = result.coupon.code;
    }

    const userName = authedUser.name ?? authedUser.email ?? "Student";

    const orderRef = await adminDb().collection("orders").add({
      userId: authedUser.uid,
      userName,
      courseId,
      courseTitle: course.title,
      amount,
      currency: "INR",
      status: "pending",
      couponCode: appliedCouponCode,
      createdAt: FieldValue.serverTimestamp(),
    });

    // 100%-off coupon → nothing to charge; enroll immediately, skip Razorpay.
    if (amount <= 0) {
      await orderRef.update({ status: "paid", amount: 0 });
      await grantEnrollment(authedUser.uid, userName, course);
      if (appliedCouponCode) await incrementCouponUsage(appliedCouponCode);
      return NextResponse.json({ free: true, orderId: orderRef.id, courseId });
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      await orderRef.update({ status: "failed" });
      return NextResponse.json(
        { error: "Razorpay keys are not set in .env.local (NEXT_PUBLIC_RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)." },
        { status: 500 }
      );
    }

    const rpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // paise
        currency: "INR",
        receipt: orderRef.id,
        notes: { courseId, userId: authedUser.uid },
      }),
    });

    if (!rpRes.ok) {
      const errText = await rpRes.text();
      await orderRef.update({ status: "failed" });
      return NextResponse.json({ error: `Could not create Razorpay order: ${errText}` }, { status: 500 });
    }

    const rpOrder = await rpRes.json();
    await orderRef.update({ razorpayOrderId: rpOrder.id });

    return NextResponse.json({
      orderId: orderRef.id,
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      keyId,
      courseTitle: course.title,
      userName,
      userEmail: authedUser.email ?? "",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create order.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
