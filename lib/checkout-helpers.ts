import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import type { CourseDoc } from "@/lib/types";

/**
 * Creates the enrollment (if it doesn't already exist) once a payment is
 * confirmed, and bumps the course/user enrollment counters. Idempotent —
 * safe to call from both the client-verify route and the webhook fallback.
 */
export async function grantEnrollment(userId: string, userName: string, course: CourseDoc) {
  const existing = await adminDb()
    .collection("enrollments")
    .where("userId", "==", userId)
    .where("courseId", "==", course.id)
    .limit(1)
    .get();

  if (!existing.empty) return existing.docs[0].id;

  const ref = await adminDb().collection("enrollments").add({
    userId,
    userName,
    courseId: course.id,
    courseTitle: course.title,
    progress: 0,
    status: "active",
    enrolledAt: FieldValue.serverTimestamp(),
  });

  await adminDb()
    .collection("courses")
    .doc(course.id)
    .update({ enrollCount: FieldValue.increment(1) })
    .catch(() => null);
  await adminDb()
    .collection("users")
    .doc(userId)
    .update({ coursesEnrolled: FieldValue.increment(1) })
    .catch(() => null);

  return ref.id;
}

export async function incrementCouponUsage(code: string) {
  const snap = await adminDb().collection("coupons").where("code", "==", code).limit(1).get();
  if (snap.empty) return;
  await snap.docs[0].ref.update({ usedCount: FieldValue.increment(1) });
}
