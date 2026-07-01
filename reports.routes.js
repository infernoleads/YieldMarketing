// server/src/routes/reports.routes.js
import { Router } from "express";
import { asyncHandler } from "../middleware/error.js";
import { protect, authorize } from "../middleware/auth.js";
import {
  dashboardReport, agencyReport,
  listScheduledReports, createScheduledReport, deleteScheduledReport,
  sendScheduledReportNow,
} from "../controllers/reports.controller.js";

const router = Router();
router.use(protect);
router.get("/dashboard", asyncHandler(dashboardReport));
router.get("/agency/:id", asyncHandler(agencyReport));
router.get("/scheduled", asyncHandler(listScheduledReports));
router.post("/scheduled", authorize("super_admin", "agency_owner"), asyncHandler(createScheduledReport));
router.post("/scheduled/:id/send", asyncHandler(sendScheduledReportNow));
router.delete("/scheduled/:id", asyncHandler(deleteScheduledReport));
export default router;
