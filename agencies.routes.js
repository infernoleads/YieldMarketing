// server/src/routes/agencies.routes.js
import { Router } from "express";
import { asyncHandler } from "../middleware/error.js";
import { protect, authorize } from "../middleware/auth.js";
import {
  listAgencies, createAgency, getAgency, updateAgency,
} from "../controllers/agencies.controller.js";

const router = Router();
router.use(protect);
router.get("/", asyncHandler(listAgencies));
router.post("/", authorize("super_admin"), asyncHandler(createAgency));
router.get("/:id", asyncHandler(getAgency));
router.patch("/:id", authorize("super_admin", "agency_owner"), asyncHandler(updateAgency));
export default router;
