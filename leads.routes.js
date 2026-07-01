// server/src/routes/leads.routes.js
import { Router } from "express";
import { asyncHandler } from "../middleware/error.js";
import { protect } from "../middleware/auth.js";
import {
  listLeads, getLead, createLead, updateLead, deleteLead,
} from "../controllers/leads.controller.js";

const router = Router();
router.use(protect);
router.get("/", asyncHandler(listLeads));
router.post("/", asyncHandler(createLead));
router.get("/:id", asyncHandler(getLead));
router.patch("/:id", asyncHandler(updateLead));
router.delete("/:id", asyncHandler(deleteLead));
export default router;
