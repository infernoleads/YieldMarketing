// server/src/controllers/agencies.controller.js
import { prisma } from "../services/prisma.js";

const AGENCY_INCLUDE = {
  owner: { select: { id: true, fullName: true, email: true } },
  _count: { select: { members: true, leads: true } },
};

// Super admin: all agencies. Others: only their own.
export async function listAgencies(req, res) {
  if (req.user.role === "super_admin") {
    const agencies = await prisma.agency.findMany({
      include: AGENCY_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return res.json({ agencies });
  }
  const where =
    req.user.role === "agency_owner"
      ? { ownerId: req.user.id }
      : { id: req.user.agencyId || "__none__" };
  const agencies = await prisma.agency.findMany({ where, include: AGENCY_INCLUDE });
  res.json({ agencies });
}

export async function createAgency(req, res) {
  const { name, ownerId } = req.body;
  if (!name || !ownerId) return res.status(400).json({ error: "name and ownerId are required" });

  const owner = await prisma.user.findUnique({ where: { id: ownerId } });
  if (!owner) return res.status(404).json({ error: "Owner user not found" });

  const agency = await prisma.agency.create({
    data: { name, ownerId },
    include: AGENCY_INCLUDE,
  });
  // Ensure the owner carries the right role.
  if (owner.role !== "agency_owner") {
    await prisma.user.update({ where: { id: ownerId }, data: { role: "agency_owner" } });
  }
  res.status(201).json({ agency });
}

export async function getAgency(req, res) {
  const agency = await prisma.agency.findUnique({
    where: { id: req.params.id },
    include: {
      ...AGENCY_INCLUDE,
      members: { select: { id: true, fullName: true, email: true, role: true, lastSeen: true } },
    },
  });
  if (!agency) return res.status(404).json({ error: "Agency not found" });

  const isOwner = agency.ownerId === req.user.id;
  const isMember = req.user.agencyId === agency.id;
  if (req.user.role !== "super_admin" && !isOwner && !isMember) {
    return res.status(403).json({ error: "You cannot access this agency" });
  }
  res.json({ agency });
}

export async function updateAgency(req, res) {
  const agency = await prisma.agency.findUnique({ where: { id: req.params.id } });
  if (!agency) return res.status(404).json({ error: "Agency not found" });

  if (req.user.role !== "super_admin" && agency.ownerId !== req.user.id) {
    return res.status(403).json({ error: "You cannot modify this agency" });
  }
  const { name } = req.body;
  const updated = await prisma.agency.update({
    where: { id: req.params.id },
    data: { ...(name ? { name } : {}) },
    include: AGENCY_INCLUDE,
  });
  res.json({ agency: updated });
}
