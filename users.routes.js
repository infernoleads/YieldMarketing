// server/src/routes/users.routes.js
import { Router } from "express";
import { asyncHandler } from "../middleware/error.js";
import { protect, authorize } from "../middleware/auth.js";
import {
  listUsers, inviteUser, updateUser, deleteUser,
} from "../controllers/users.controller.js";

const router = Router();
router.use(protect);
router.get("/", authorize("super_admin", "agency_owner"), asyncHandler(listUsers));
router.post("/invite", authorize("super_admin", "agency_owner"), asyncHandler(inviteUser));
router.patch("/:id", authorize("super_admin", "agency_owner"), asyncHandler(updateUser));
router.delete("/:id", authorize("super_admin", "agency_owner"), asyncHandler(deleteUser));
export default router;
