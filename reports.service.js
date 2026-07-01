// server/src/services/reports.service.js
import { prisma } from "./prisma.js";
import { emailLayout } from "./email.js";

export const STATUSES = ["new", "contacted", "quoted", "sold", "lost", "follow_up"];
const STATUS_LABEL = {
  new: "New", contacted: "Contacted", quoted: "Quoted",
  sold: "Sold", lost: "Lost", follow_up: "Follow Up",
};

// Builds a stats bundle for a given lead `where` filter.
export async function buildStats(where) {
  const [leads, tasks] = await Promise.all([
    prisma.lead.findMany({
      where,
      select: {
        status: true, telemarketerId: true, producerId: true, createdAt: true,
        telemarketer: { select: { fullName: true, email: true } },
      },
    }),
    prisma.followUpTask.findMany({
      where: where.agencyId ? { agencyId: where.agencyId } : {},
      select: { completed: true },
    }),
  ]);

  const statusBreakdown = STATUSES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
  for (const l of leads) statusBreakdown[l.status] = (statusBreakdown[l.status] || 0) + 1;

  const total = leads.length;
  const sold = statusBreakdown.sold || 0;
  const conversionRate = total ? Math.round((sold / total) * 1000) / 10 : 0;

  const perfMap = {};
  for (const l of leads) {
    if (!l.telemarketerId) continue;
    const key = l.telemarketer?.email || l.telemarketerId;
    if (!perfMap[key]) perfMap[key] = { name: l.telemarketer?.fullName || key, total: 0, sold: 0 };
    perfMap[key].total += 1;
    if (l.status === "sold") perfMap[key].sold += 1;
  }
  const telemarketerPerformance = Object.values(perfMap).map((p) => ({
    ...p,
    conversionRate: p.total ? Math.round((p.sold / p.total) * 1000) / 10 : 0,
  }));

  return {
    totalLeads: total,
    sold,
    conversionRate,
    statusBreakdown,
    telemarketerPerformance,
    openTasks: tasks.filter((t) => !t.completed).length,
    completedTasks: tasks.filter((t) => t.completed).length,
  };
}

// Renders a scheduled report to HTML honoring its include flags.
export function renderReportEmail(report, stats, agencyName) {
  const row = (label, value) =>
    `<tr><td style="padding:8px 0;color:#8a927c;font-size:14px;">${label}</td>
         <td style="padding:8px 0;text-align:right;font-weight:700;font-size:15px;color:#1a2e05;">${value}</td></tr>`;

  let body = `<p style="margin-top:0;">Here's your ${esc(report.frequency)} summary${agencyName ? ` for <strong>${esc(agencyName)}</strong>` : ""}.</p>`;

  if (report.includeLeadSummary) {
    body += `<table style="width:100%;border-collapse:collapse;margin-top:8px;border-top:1px solid #e3e8dc;">
      ${row("Total leads", stats.totalLeads)}
      ${row("Sold", stats.sold)}
      ${report.includeConversionRates ? row("Conversion rate", stats.conversionRate + "%") : ""}
      ${report.includeFollowUps ? row("Open follow-ups", stats.openTasks) : ""}
    </table>`;
  }

  if (report.includeStatusBreakdown) {
    const rows = STATUSES
      .filter((s) => stats.statusBreakdown[s] > 0)
      .map((s) => row(STATUS_LABEL[s], stats.statusBreakdown[s]))
      .join("");
    body += `<h3 style="margin:22px 0 6px;font-size:15px;color:#1a2e05;">Pipeline by status</h3>
      <table style="width:100%;border-collapse:collapse;border-top:1px solid #e3e8dc;">${rows || row("No leads yet", 0)}</table>`;
  }

  if (report.includeTelemarketerPerf && stats.telemarketerPerformance.length) {
    const rows = stats.telemarketerPerformance
      .map((p) => row(esc(p.name), `${p.sold}/${p.total} · ${p.conversionRate}%`))
      .join("");
    body += `<h3 style="margin:22px 0 6px;font-size:15px;color:#1a2e05;">Telemarketer performance</h3>
      <table style="width:100%;border-collapse:collapse;border-top:1px solid #e3e8dc;">${rows}</table>`;
  }

  return emailLayout({
    heading: esc(report.reportName),
    body,
    footer: `Scheduled ${esc(report.frequency)} report from Yield Transfers.`,
  });
}

function esc(s = "") {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
