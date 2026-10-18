import { escapeHtml, sendTransactionalEmail } from "@/lib/resend";
import { SITE } from "@/lib/site";

const DEFAULT_TZ = "Asia/Kolkata";

/** "Saturday 24 October 2026, 5:30 pm IST" in the guest's own timezone. */
export function formatWhen(date: Date, timezone?: string) {
  const timeZone = timezone || DEFAULT_TZ;
  try {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone,
      dateStyle: "full",
      timeStyle: "short",
      timeZoneName: "short",
    }).format(date);
  } catch {
    return date.toUTCString();
  }
}

function shell(inner: string) {
  return `<div style="font-family:Georgia,'Times New Roman',serif;color:#12263d;max-width:520px;margin:0 auto;padding:8px">
    ${inner}
    <p style="margin-top:32px;font-size:13px;color:#55657a">— ${escapeHtml(SITE.name)} ${escapeHtml(SITE.tagline)}</p>
  </div>`;
}

export async function sendRequestReceived(b: { name: string; email: string }) {
  return sendTransactionalEmail({
    to: b.email,
    subject: "We received your call request",
    html: shell(`
      <h2 style="font-weight:600">Thank you, ${escapeHtml(b.name)}.</h2>
      <p>Your request for a free call has reached us. We will write back within a day with a confirmed time and the Zoom link.</p>`),
  });
}

export async function sendStaffAlert(b: { name: string; email: string; topic: string; preferredTime?: string; message?: string }) {
  const to = process.env.NOTIFY_EMAIL || SITE.email;
  return sendTransactionalEmail({
    to,
    subject: `New call request: ${b.name}`,
    html: shell(`
      <h3>New call request</h3>
      <p><strong>${escapeHtml(b.name)}</strong> &lt;${escapeHtml(b.email)}&gt;</p>
      <p>Interested in: ${escapeHtml(b.topic)}</p>
      ${b.preferredTime ? `<p>Preferred time: ${escapeHtml(b.preferredTime)}</p>` : ""}
      ${b.message ? `<p>${escapeHtml(b.message)}</p>` : ""}
      <p>Open Admin → Bookings to pick a time and add the Zoom link.</p>`),
  });
}

export async function sendScheduled(b: {
  name: string;
  email: string;
  start: Date;
  timezone?: string;
  durationMinutes: number;
  zoomLink: string;
  zoomPasscode?: string;
  rescheduled?: boolean;
}) {
  return sendTransactionalEmail({
    to: b.email,
    subject: b.rescheduled ? "Your call has been rescheduled" : "Your call is confirmed",
    html: shell(`
      <h2 style="font-weight:600">${b.rescheduled ? "New time for your call" : `You are booked, ${escapeHtml(b.name)}.`}</h2>
      <p style="font-size:17px">${escapeHtml(formatWhen(b.start, b.timezone))}<br/><span style="color:#55657a">${b.durationMinutes} minutes, on Zoom</span></p>
      <p><a href="${escapeHtml(b.zoomLink)}" style="display:inline-block;background:#12263d;color:#f5f2e9;padding:12px 22px;text-decoration:none">Join the Zoom meeting</a></p>
      ${b.zoomPasscode ? `<p>Passcode: <strong>${escapeHtml(b.zoomPasscode)}</strong></p>` : ""}
      <p style="font-size:13px;color:#55657a">Need a different time? Just reply to this email.</p>`),
  });
}

export async function sendCancelled(b: { name: string; email: string; start?: Date; timezone?: string; reason?: string }) {
  return sendTransactionalEmail({
    to: b.email,
    subject: "Your call has been cancelled",
    html: shell(`
      <h2 style="font-weight:600">Call cancelled</h2>
      ${b.start ? `<p>${escapeHtml(formatWhen(b.start, b.timezone))}</p>` : ""}
      <p>${b.reason ? escapeHtml(b.reason) : "This call has been cancelled."} Reply to this email whenever you would like to find a new time.</p>`),
  });
}
