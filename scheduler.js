// server/src/services/scheduler.js
// Runs scheduled-report delivery *inside* the web service — no separate cron
// job or paid plan required. Checks on startup and then once an hour.
import { prisma } from "./prisma.js";
import { buildStats, renderReportEmail } from "./reports.service.js";
import { sendMail, isEmailConfigured } from "./email.js";

// Decide whether a report should go out at `now`, given when it last went out.
export function isDue(report, now = new Date()) {
  const last = report.lastSent ? new Date(report.lastSent) : null;
  const [h, m] = (report.sendTime || "09:00").split(":").map(Number);
  const sendMinutes = (h || 0) * 60 + (m || 0);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const pastSendTime = nowMinutes >= sendMinutes;

  const sameDay = (a, b) =>
    a && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const daysSince = (a) => (a ? Math.floor((now - a) / 86400000) : Infinity);

  switch (report.frequency) {
    case "hourly":
      return !last || (now - last) >= 55 * 60 * 1000;
    case "daily":
      return pastSendTime && !sameDay(last, now);
    case "weekly": {
      const days = report.daysOfWeek?.length ? report.daysOfWeek : [1];
      if (!days.includes(now.getDay())) return false;
      return pastSendTime && !sameDay(last, now);
    }
    case "biweekly": {
      const days = report.daysOfWeek?.length ? report.daysOfWeek : [1];
      if (!days.includes(now.getDay())) return false;
      if (!pastSendTime) return false;
      return daysSince(last) >= 14;
    }
    case "monthly": {
      const dom = report.dayOfMonth || 1;
      if (now.getDate() !== dom) return false;
      return pastSendTime && !sameDay(last, now);
    }
    case "quarterly": {
      const isQuarterStart = now.getDate() === 1 && now.getMonth() % 3 === 0;
      if (!isQuarterStart) return false;
      return pastSendTime && !sameDay(last, now);
    }
    default:
      return false;
  }
}

// Sends every report that is currently due. Safe to call repeatedly.
export async function sendDueReports() {
  if (!isEmailConfigured()) return { sent: 0, skipped: "email_not_configured" };

  const reports = await prisma.scheduledReport.findMany({ where: { isActive: true } });
  const now = new Date();
  let sent = 0;

  for (const report of reports) {
    if (!isDue(report, now)) continue;
    const agency = report.agencyId
      ? await prisma.agency.findUnique({ where: { id: report.agencyId } })
      : null;
    const where = report.agencyId ? { agencyId: report.agencyId } : {};
    const stats = await buildStats(where);
    const html = renderReportEmail(report, stats, agency?.name);
    const recipients = report.recipientEmails.split(",").map((e) => e.trim()).filter(Boolean);
    if (!recipients.length) continue;

    const result = await sendMail({ to: recipients.join(","), subject: `${report.reportName} — Yield Transfers`, html });
    if (result.sent) {
      await prisma.scheduledReport.update({ where: { id: report.id }, data: { lastSent: now } });
      sent += 1;
      console.log(`[reports] sent "${report.reportName}" → ${recipients.join(", ")}`);
    }
  }
  return { sent, total: reports.length };
}

// Starts the in-process schedule: a check shortly after boot, then hourly.
export function startScheduler() {
  const run = () =>
    sendDueReports()
      .then((r) => { if (r.sent) console.log(`[reports] ${r.sent} report(s) delivered.`); })
      .catch((e) => console.error("[reports] scheduler error:", e.message));

  // First check ~20s after startup (lets the server settle), then every hour.
  setTimeout(run, 20_000);
  setInterval(run, 60 * 60 * 1000);
  console.log("[reports] in-process scheduler started (hourly).");
}
