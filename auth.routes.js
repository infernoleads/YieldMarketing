// server/src/routes/auth.routes.js
import { Router } from "express";
import { asyncHandler } from "../middleware/error.js";
import { protect } from "../middleware/auth.js";
import { register, login, me } from "../controllers/auth.controller.js";

const router = Router();
router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", protect, asyncHandler(me));
export default router;
