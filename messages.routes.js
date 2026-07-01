// server/src/routes/messages.routes.js
import { Router } from "express";
import { asyncHandler } from "../middleware/error.js";
import { protect } from "../middleware/auth.js";
import { listMessages, createMessage } from "../controllers/messages.controller.js";

const router = Router();
router.use(protect);
router.get("/", asyncHandler(listMessages));
router.post("/", asyncHandler(createMessage));
export default router;
