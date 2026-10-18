/**
 * Minimal Resend wrapper for transactional booking emails (confirmation,
 * reschedule, cancellation). Mirrors the inline fetch already used in
 * app/api/admin/email-campaigns/route.ts. Silently no-ops if
 * RESEND_API_KEY isn't set, so bookings still work without email configured
 * — the booking itself is the source of truth, email is a nice-to-have.
 */
export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

export async function sendTransactionalEmail(params: { to: string | string[]; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "hello@preetisoulpreneur.com";
  if (!apiKey) return { sent: false, reason: "RESEND_API_KEY not set" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: fromEmail, to: params.to, subject: params.subject, html: params.html }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { sent: false, reason: text };
  }
  return { sent: true };
}
