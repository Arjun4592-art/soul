import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, getStaffUser } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    if (!(await getStaffUser(req, { adminOnly: true }))) {
      return NextResponse.json({ error: "Not allowed." }, { status: 403 });
    }
    const { name, email, password, role, phone } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userRecord = await adminAuth().createUser({
      email,
      password,
      displayName: name,
    });

    await adminDb()
      .collection("users")
      .doc(userRecord.uid)
      .set({
        name,
        email,
        role,
        phone: phone ?? "",
        status: "active",
        coursesEnrolled: 0,
        createdAt: FieldValue.serverTimestamp(),
      });

    return NextResponse.json({ id: userRecord.uid });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
