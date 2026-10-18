import { NextRequest, NextResponse } from "next/server";
import { adminDb, getStaffUser } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    if (!(await getStaffUser(req, { adminOnly: true }))) {
      return NextResponse.json({ error: "Not allowed." }, { status: 403 });
    }
    const { subject, body, recipients } = await req.json();
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "hello@preetisoulpreneur.com";

    if (!apiKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY is not set — add it to .env.local." },
        { status: 400 }
      );
    }
    if (!subject || !body || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: "Subject, body and recipients are required" }, { status: 400 });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: recipients,
        subject,
        html: body,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Resend error: ${errText}` }, { status: 500 });
    }

    await adminDb().collection("email_campaigns").add({
      subject,
      body,
      recipientCount: recipients.length,
      sentAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
