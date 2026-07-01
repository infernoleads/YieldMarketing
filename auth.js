// server/src/middleware/auth.js
import { verifyToken } from "../services/token.js";
import { prisma } from "../services/prisma.js";

// Verifies the Bearer JWT, loads the user, and attaches it to req.user.
export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        agencyId: true,
        lastSeen: true,
      },
    });
    if (!user) return res.status(401).json({ error: "User no longer exists" });

    // Presence tracking — best effort, don't block the request.
    prisma.user
      .update({ where: { id: user.id }, data: { lastSeen: new Date() } })
      .catch(() => {});

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Restricts a route to one or more roles.
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You do not have access to this resource" });
    }
    next();
  };
}
