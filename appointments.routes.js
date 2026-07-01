// server/src/routes/appointments.routes.js
import { Router } from "express";
import { asyncHandler } from "../middleware/error.js";
import { protect, authorize } from "../middleware/auth.js";
import {
  createAppointment, listAppointments, updateAppointment,
} from "../controllers/appointments.controller.js";

const router = Router();
// Public: prospects submit appointment requests from the marketing site.
router.post("/", asyncHandler(createAppointment));
// Protected: super admins manage the queue.
router.get("/", protect, authorize("super_admin"), asyncHandler(listAppointments));
router.patch("/:id", protect, authorize("super_admin"), asyncHandler(updateAppointment));
export default router;
