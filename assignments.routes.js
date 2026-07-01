// server/src/routes/assignments.routes.js
import { Router } from "express";
import { asyncHandler } from "../middleware/error.js";
import { protect, authorize } from "../middleware/auth.js";
import {
  listAssignments, createAssignment, updateAssignment,
} from "../controllers/assignments.controller.js";

const router = Router();
router.use(protect);
router.get("/", asyncHandler(listAssignments));
router.post("/", authorize("super_admin", "agency_owner"), asyncHandler(createAssignment));
router.patch("/:id", authorize("super_admin", "agency_owner"), asyncHandler(updateAssignment));
export default router;
