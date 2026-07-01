// server/src/routes/tasks.routes.js
import { Router } from "express";
import { asyncHandler } from "../middleware/error.js";
import { protect } from "../middleware/auth.js";
import {
  listTasks, createTask, updateTask, deleteTask,
} from "../controllers/tasks.controller.js";

const router = Router();
router.use(protect);
router.get("/", asyncHandler(listTasks));
router.post("/", asyncHandler(createTask));
router.patch("/:id", asyncHandler(updateTask));
router.delete("/:id", asyncHandler(deleteTask));
export default router;
