// server/src/middleware/error.js

// Wraps async controllers so thrown errors reach the error handler.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// 404 fallback for unknown API routes.
export function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Central error handler.
export function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);

  // Prisma known-request errors → friendlier messages
  if (err.code === "P2002") {
    return res.status(409).json({ error: "A record with that value already exists" });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Record not found" });
  }

  res.status(status).json({ error: err.message || "Something went wrong" });
}
