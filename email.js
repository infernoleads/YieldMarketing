// server/src/services/email.js
// Gmail-backed email sending via nodemailer.
// Configure with GMAIL_USER + GMAIL_APP_PASSWORD (a Google App Password).
// If not configured, sends are skipped gracefully (logged, never throws) so
// the app keeps working in development without credentials.
import nodemailer from "nodemailer";

let transporter = null;

export function isEmailConfigured() {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

function getTransporter() {
  if (transporter) return transporter;
  if (!isEmailConfigured()) return null;
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  return transporter;
}

const FROM_NAME = "Yield Transfers";

// Core send. Returns { sent: boolean }. Never throws on delivery failure —
// callers shouldn't fail their request just because an email hiccuped.
export async function sendMail({ to, subject, html, text, replyTo }) {
  const t = getTransporter();
  if (!t) {
    console.log(`[email] skipped (not configured): "${subject}" → ${to}`);
    return { sent: false, reason: "not_configured" };
  }
  try {
    await t.sendMail({
      from: `"${FROM_NAME}" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text: text || stripHtml(html),
      html,
      replyTo,
    });
    return { sent: true };
  } catch (err) {
    console.error(`[email] send failed for "${subject}" → ${to}:`, err.message);
    return { sent: false, reason: err.message };
  }
}

function stripHtml(html = "") {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

// ── Branded HTML wrapper (light theme for broad email-client support) ──
export function emailLayout({ heading, body, ctaText, ctaUrl, footer }) {
  const brand = "#65a30d";
  return `
  <div style="margin:0;padding:0;background:#f4f6f0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
        <div style="width:34px;height:34px;border-radius:9px;background:${brand};display:inline-flex;align-items:center;justify-content:center;">
          <span style="color:#fff;font-weight:700;font-size:18px;line-height:1;">Y</span>
        </div>
        <span style="font-size:16px;font-weight:700;color:#1a2e05;">Yield Transfers</span>
      </div>
      <div style="background:#ffffff;border:1px solid #e3e8dc;border-radius:14px;padding:28px;">
        <h1 style="margin:0 0 14px;font-size:20px;color:#1a2e05;">${heading}</h1>
        <div style="font-size:15px;line-height:1.6;color:#41492f;">${body}</div>
        ${ctaText && ctaUrl ? `
          <div style="margin-top:24px;">
            <a href="${ctaUrl}" style="display:inline-block;background:${brand};color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:11px 20px;border-radius:10px;">${ctaText}</a>
          </div>` : ""}
      </div>
      <p style="margin:18px 4px 0;font-size:12px;color:#8a927c;">${footer || "You're receiving this because you use Yield Transfers."}</p>
    </div>
  </div>`;
}

const appUrl = () => process.env.APP_URL || process.env.RENDER_EXTERNAL_URL || "http://localhost:5173";
const adminEmail = () => process.env.ADMIN_EMAIL || process.env.GMAIL_USER;

// ── Specific messages ──

export function notifyNewAppointment(appt) {
  const to = adminEmail();
  if (!to) return { sent: false, reason: "no_admin" };
  const body = `
    <p>A new appointment request just came in from the website.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:14px;">
      <tr><td style="padding:6px 0;color:#8a927c;">Name</td><td style="padding:6px 0;">${esc(appt.name)}</td></tr>
      <tr><td style="padding:6px 0;color:#8a927c;">Email</td><td style="padding:6px 0;">${esc(appt.email)}</td></tr>
      ${appt.phone ? `<tr><td style="padding:6px 0;color:#8a927c;">Phone</td><td style="padding:6px 0;">${esc(appt.phone)}</td></tr>` : ""}
      ${appt.company ? `<tr><td style="padding:6px 0;color:#8a927c;">Agency</td><td style="padding:6px 0;">${esc(appt.company)}</td></tr>` : ""}
    </table>
    ${appt.message ? `<p style="margin-top:14px;padding:12px;background:#f4f6f0;border-radius:8px;">${esc(appt.message)}</p>` : ""}`;
  return sendMail({
    to,
    replyTo: appt.email,
    subject: `New appointment request — ${appt.name}`,
    html: emailLayout({ heading: "New appointment request", body, ctaText: "Open dashboard", ctaUrl: `${appUrl()}/super-admin`, footer: "Sent by Yield Transfers." }),
  });
}

export function confirmAppointmentToProspect(appt) {
  const body = `
    <p>Hi ${esc(appt.name.split(" ")[0])},</p>
    <p>Thanks for reaching out to Yield Transfers. We've received your request and a member of our team will contact you within one business day to schedule your call.</p>
    <p>If you'd like, you can also grab a time directly on our calendar using the link on our booking page.</p>`;
  return sendMail({
    to: appt.email,
    subject: "We received your request — Yield Transfers",
    html: emailLayout({ heading: "Request received", body, ctaText: "Book a time", ctaUrl: `${appUrl()}/book-appointment`, footer: "Yield Transfers · telemarketing for insurance agencies." }),
  });
}

export function notifyNewSignup(user) {
  const to = adminEmail();
  if (!to) return { sent: false, reason: "no_admin" };
  const body = `<p>A new account was created on Yield Transfers.</p>
    <p><strong>${esc(user.fullName)}</strong> (${esc(user.email)}) signed up as <strong>${esc(user.role)}</strong>.</p>`;
  return sendMail({
    to,
    subject: `New signup — ${user.fullName}`,
    html: emailLayout({ heading: "New signup", body, ctaText: "Open dashboard", ctaUrl: `${appUrl()}/super-admin` }),
  });
}

export function sendInvite(user, tempPassword, invitedByName) {
  const body = `
    <p>Hi ${esc(user.fullName.split(" ")[0])},</p>
    <p>${invitedByName ? esc(invitedByName) + " has" : "You've been"} invited to join Yield Transfers as a <strong>${esc(user.role)}</strong>.</p>
    <p>Sign in with these credentials and change your password after your first login:</p>
    <table style="margin-top:8px;font-size:14px;">
      <tr><td style="padding:4px 12px 4px 0;color:#8a927c;">Email</td><td style="padding:4px 0;"><strong>${esc(user.email)}</strong></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#8a927c;">Temp password</td><td style="padding:4px 0;"><strong>${esc(tempPassword)}</strong></td></tr>
    </table>`;
  return sendMail({
    to: user.email,
    subject: "You've been invited to Yield Transfers",
    html: emailLayout({ heading: "Welcome to the team", body, ctaText: "Sign in", ctaUrl: `${appUrl()}/login` }),
  });
}

function esc(s = "") {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
export { esc };
