// server/src/index.js
import "./config/env.js"; // must be first — loads .env before other modules
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import { notFound, errorHandler } from "./middleware/error.js";
import { startScheduler } from "./services/scheduler.js";
import authRoutes from "./routes/auth.routes.js";
import agencyRoutes from "./routes/agencies.routes.js";
import userRoutes from "./routes/users.routes.js";
import leadRoutes from "./routes/leads.routes.js";
import taskRoutes from "./routes/tasks.routes.js";
import appointmentRoutes from "./routes/appointments.routes.js";
import assignmentRoutes from "./routes/assignments.routes.js";
import messageRoutes from "./routes/messages.routes.js";
import reportRoutes from "./routes/reports.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL?.split(",") || true, credentials: true }));
app.use(express.json({ limit: "2mb" }));
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

// Health check (used by Render)
app.get("/api/health", (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/agencies", agencyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reports", reportRoutes);

// In production, serve the built React client from the same server.
if (process.env.NODE_ENV === "production") {
  const clientDist = path.resolve(__dirname, "../../client/dist");
  app.use(express.static(clientDist));
  // SPA fallback — anything not matching /api returns index.html
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
} else {
  app.use("/api", notFound);
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Yield Transfers API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  // Deliver scheduled reports from within the web service (no separate cron needed).
  startScheduler();
});

export default app;
