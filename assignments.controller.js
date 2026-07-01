// server/src/controllers/assignments.controller.js
import { prisma } from "../services/prisma.js";
import { resolveUserAgencyId } from "../services/scope.js";

const ASSIGN_INCLUDE = {
  telemarketer: { select: { id: true, fullName: true, email: true, lastSeen: true } },
  agency: { select: { id: true, name: true } },
};

export async function listAssignments(req, res) {
  let where = {};
  if (req.user.role !== "super_admin") {
    const agencyId = await resolveUserAgencyId(req.user);
    where = { agencyId: agencyId || "__none__" };
  }
  const assignments = await prisma.telemarketerAssignment.findMany({
    where,
    include: ASSIGN_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  res.json({ assignments });
}

export async function createAssignment(req, res) {
  const { telemarketerId } = req.body;
  if (!telemarketerId) return res.status(400).json({ error: "telemarketerId is required" });

  let agencyId;
  if (req.user.role === "super_admin") {
    agencyId = req.body.agencyId;
    if (!agencyId) return res.status(400).json({ error: "agencyId is required" });
  } else {
    agencyId = await resolveUserAgencyId(req.user);
  }

  const telemarketer = await prisma.user.findUnique({ where: { id: telemarketerId } });
  if (!telemarketer) return res.status(404).json({ error: "Telemarketer not found" });

  const assignment = await prisma.telemarketerAssignment.upsert({
    where: { telemarketerId },
    update: { agencyId },
    create: { telemarketerId, agencyId },
    include: ASSIGN_INCLUDE,
  });
  // Keep the user's agency link in sync.
  await prisma.user.update({ where: { id: telemarketerId }, data: { agencyId, role: "telemarketer" } });

  res.status(201).json({ assignment });
}

export async function updateAssignment(req, res) {
  const assignment = await prisma.telemarketerAssignment.findUnique({ where: { id: req.params.id } });
  if (!assignment) return res.status(404).json({ error: "Assignment not found" });

  if (req.user.role !== "super_admin") {
    const agencyId = await resolveUserAgencyId(req.user);
    if (assignment.agencyId !== agencyId) {
      return res.status(403).json({ error: "You cannot modify this assignment" });
    }
  }
  const data = {};
  if (req.body.agencyId && req.user.role === "super_admin") data.agencyId = req.body.agencyId;

  const updated = await prisma.telemarketerAssignment.update({
    where: { id: req.params.id },
    data,
    include: ASSIGN_INCLUDE,
  });
  res.json({ assignment: updated });
}
