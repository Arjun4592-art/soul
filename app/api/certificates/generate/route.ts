import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, adminStorageBucket, getAuthedUser } from "@/lib/firebase-admin";
import { generateCertificatePdf } from "@/lib/certificate-pdf";
import type { EnrollmentDoc, CertificateDoc } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const authedUser = await getAuthedUser(req);
    if (!authedUser) {
      return NextResponse.json({ error: "Please log in first." }, { status: 401 });
    }

    const { courseId, userId: requestedUserId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ error: "courseId is required." }, { status: 400 });
    }

    // Is the caller staff? Staff can issue a certificate on behalf of any student.
    const callerSnap = await adminDb().collection("users").doc(authedUser.uid).get();
    const callerRole = callerSnap.exists ? callerSnap.data()?.role : null;
    const isStaff = callerRole === "admin" || callerRole === "coach";

    const targetUserId = isStaff && requestedUserId ? requestedUserId : authedUser.uid;

    const enrollSnap = await adminDb()
      .collection("enrollments")
      .where("userId", "==", targetUserId)
      .where("courseId", "==", courseId)
      .limit(1)
      .get();

    if (enrollSnap.empty) {
      return NextResponse.json({ error: "Enrollment not found." }, { status: 404 });
    }
    const enrollment = { id: enrollSnap.docs[0].id, ...enrollSnap.docs[0].data() } as EnrollmentDoc;

    if (!isStaff && enrollment.userId !== authedUser.uid) {
      return NextResponse.json({ error: "This enrollment does not belong to you." }, { status: 403 });
    }
    if (!isStaff && (enrollment.progress ?? 0) < 100 && enrollment.status !== "completed") {
      return NextResponse.json({ error: "Course is not complete yet." }, { status: 400 });
    }

    // Idempotent: if a certificate already exists for this user+course, return it.
    const existing = await adminDb()
      .collection("certificates")
      .where("userId", "==", targetUserId)
      .where("courseId", "==", courseId)
      .limit(1)
      .get();
    if (!existing.empty) {
      const cert = { id: existing.docs[0].id, ...existing.docs[0].data() } as CertificateDoc;
      return NextResponse.json({ ok: true, certificateId: cert.id, certificateUrl: cert.certificateUrl });
    }

    const certificateId = `${targetUserId}_${courseId}`;
    const issuedDate = new Date();

    const pdfBytes = await generateCertificatePdf({
      studentName: enrollment.userName || "Student",
      courseTitle: enrollment.courseTitle,
      issuedDate,
      certificateId,
    });

    const filePath = `certificates/${certificateId}.pdf`;
    const downloadToken = randomUUID();
    const file = adminStorageBucket().file(filePath);

    await file.save(Buffer.from(pdfBytes), {
      contentType: "application/pdf",
      metadata: {
        metadata: { firebaseStorageDownloadTokens: downloadToken },
      },
    });

    const certificateUrl = `https://firebasestorage.googleapis.com/v0/b/${adminStorageBucket().name}/o/${encodeURIComponent(
      filePath
    )}?alt=media&token=${downloadToken}`;

    await adminDb()
      .collection("certificates")
      .doc(certificateId)
      .set({
        userId: targetUserId,
        userName: enrollment.userName,
        courseId,
        courseTitle: enrollment.courseTitle,
        certificateUrl,
        issuedAt: FieldValue.serverTimestamp(),
      });

    return NextResponse.json({ ok: true, certificateId, certificateUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not generate the certificate.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
