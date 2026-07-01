// server/src/jobs/sendScheduledReports.js
// Optional standalone runner (e.g. an external cron). The web service already
// sends due reports in-process, so you normally don't need this.
//
//   npm run reports:send
//
import "../config/env.js";
import { prisma } from "../services/prisma.js";
import { sendDueReports } from "../services/scheduler.js";

sendDueReports()
  .then((r) => console.log(`[reports] done:`, JSON.stringify(r)))
  .catch((e) => { console.error("[reports] job failed:", e); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
