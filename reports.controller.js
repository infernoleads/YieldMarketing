// server/src/controllers/reports.controller.js
import { prisma } from "../services/prisma.js";
import { resolveUserAgencyId, leadScopeWhere } from "../services/scope.js";
import { buildStats, renderReportEmail } from "../services/reports.service.js";
import { sendMail } from "../services/email.js";

// GET /api/reports/dashboard — scoped to the caller's role.
export async function dashboardReport(req, res) {
  const where = await leadScopeWhere(req.user);
  const stats = await buildStats(where);

  // Super admin also gets an agency roll-up.
  let agencies = [];
  if (req.user.role === "super_admin") {
    const all = await prisma.agency.findMany({
      include: { _count: { select: { leads: true, members: true } } },
    });
    agencies = await Promise.all(
      all.map(async (a) => {
        const s = await buildStats({ agencyId: a.id });
        return {
          id: a.id, name: a.name,
          totalLeads: s.totalLeads, sold: s.sold, conversionRate: s.conversionRate,
          members: a._count.members,
        };
      })
    );
  }
  res.json({ stats, agencies });
}

// GET /api/reports/agency/:id
export async function agencyReport(req, res) {
  const agencyId = req.params.id;
  if (req.user.role !== "super_admin") {
    const own = await resolveUserAgencyId(req.user);
    if (own !== agencyId) return res.status(403).json({ error: "You cannot view this report" });
  }
  const agency = await prisma.agency.findUnique({ where: { id: agencyId } });
  if (!agency) return res.status(404).json({ error: "Agency not found" });

  const stats = await buildStats({ agencyId });
  res.json({ agency: { id: agency.id, name: agency.name }, stats });
}

// --- Scheduled reports ---
export async function listScheduledReports(req, res) {
  let where = { ownerId: req.user.id };
  if (req.user.role === "super_admin" && req.query.all === "true") where = {};
  const reports = await prisma.scheduledReport.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  res.json({ reports });
}

export async function createScheduledReport(req, res) {
  const b = req.body;
  if (!b.reportName || !b.frequency || !b.recipientEmails) {
    return res.status(400).json({ error: "reportName, frequency and recipientEmails are required" });
  }
  const agencyId = await resolveUserAgencyId(req.user);
  const report = await prisma.scheduledReport.create({
    data: {
      reportName: b.reportName,
      frequency: b.frequency,
      sendTime: b.sendTime || null,
      daysOfWeek: Array.isArray(b.daysOfWeek) ? b.daysOfWeek : [],
      dayOfMonth: b.dayOfMonth ?? null,
      recipientEmails: b.recipientEmails,
      includeLeadSummary: b.includeLeadSummary ?? true,
      includeStatusBreakdown: b.includeStatusBreakdown ?? true,
      includeTelemarketerPerf: b.includeTelemarketerPerf ?? false,
      includeConversionRates: b.includeConversionRates ?? false,
      includeFollowUps: b.includeFollowUps ?? false,
      isActive: b.isActive ?? true,
      ownerId: req.user.id,
      agencyId,
    },
  });
  res.status(201).json({ report });
}

export async function deleteScheduledReport(req, res) {
  const report = await prisma.scheduledReport.findUnique({ where: { id: req.params.id } });
  if (!report) return res.status(404).json({ error: "Report not found" });
  if (report.ownerId !== req.user.id && req.user.role !== "super_admin") {
    return res.status(403).json({ error: "You cannot delete this report" });
  }
  await prisma.scheduledReport.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
}

// POST /api/reports/scheduled/:id/send — send this report now (test / on-demand).
export async function sendScheduledReportNow(req, res) {
  const report = await prisma.scheduledReport.findUnique({ where: { id: req.params.id } });
  if (!report) return res.status(404).json({ error: "Report not found" });
  if (report.ownerId !== req.user.id && req.user.role !== "super_admin") {
    return res.status(403).json({ error: "You cannot send this report" });
  }

  const agency = report.agencyId
    ? await prisma.agency.findUnique({ where: { id: report.agencyId } })
    : null;
  const where = report.agencyId ? { agencyId: report.agencyId } : {};
  const stats = await buildStats(where);
  const html = renderReportEmail(report, stats, agency?.name);

  const recipients = report.recipientEmails.split(",").map((e) => e.trim()).filter(Boolean);
  const result = await sendMail({
    to: recipients.join(","),
    subject: `${report.reportName} — Yield Transfers`,
    html,
  });

  if (result.sent) {
    await prisma.scheduledReport.update({ where: { id: report.id }, data: { lastSent: new Date() } });
  }
  res.json({ sent: result.sent, reason: result.reason, recipients });
}
