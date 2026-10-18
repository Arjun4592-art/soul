import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, getStaffUser } from "@/lib/firebase-admin";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const caller = await getStaffUser(req, { adminOnly: true });
    if (!caller) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
    const { id } = await params;
    if (id === caller.uid) return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
    await adminAuth().deleteUser(id).catch(() => null); // ignore if auth user already gone
    await adminDb().collection("users").doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not delete";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
