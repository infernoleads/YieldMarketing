// server/src/controllers/users.controller.js
import bcrypt from "bcryptjs";
import { prisma } from "../services/prisma.js";
import { resolveUserAgencyId } from "../services/scope.js";
import { sendInvite } from "../services/email.js";

const PUBLIC_USER = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  agencyId: true,
  lastSeen: true,
  createdAt: true,
};

// Super admin sees all users. Agency owner sees their team.
export async function listUsers(req, res) {
  if (req.user.role === "super_admin") {
    const users = await prisma.user.findMany({
      select: { ...PUBLIC_USER, agency: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ users });
  }

  const agencyId = await resolveUserAgencyId(req.user);
  if (!agencyId) return res.json({ users: [] });

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { agencyId },
        { ownedAgency: { id: agencyId } }, // include the owner
      ],
    },
    select: PUBLIC_USER,
    orderBy: { createdAt: "desc" },
  });
  res.json({ users });
}

// Invite = create a user with a temporary password, scoped to the inviter's agency.
export async function inviteUser(req, res) {
  const { email, fullName, role, password } = req.body;
  if (!email || !fullName) {
    return res.status(400).json({ error: "email and fullName are required" });
  }
  const cleanEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (existing) return res.status(409).json({ error: "That email is already registered" });

  let finalRole = role;
  let agencyId = null;

  if (req.user.role === "agency_owner") {
    // Owners can only invite producers or telemarketers into their own agency.
    if (!["producer", "telemarketer"].includes(role)) {
      return res.status(403).json({ error: "Agency owners can invite producers or telemarketers only" });
    }
    agencyId = await resolveUserAgencyId(req.user);
  } else if (req.user.role === "super_admin") {
    finalRole = role || "telemarketer";
    agencyId = req.body.agencyId || null;
  } else {
    return res.status(403).json({ error: "You cannot invite users" });
  }

  const tempPassword = password || "password123";
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const user = await prisma.user.create({
    data: { email: cleanEmail, fullName: fullName.trim(), role: finalRole, passwordHash, agencyId },
    select: PUBLIC_USER,
  });

  // Wire up the corresponding link record.
  if (agencyId && finalRole === "producer") {
    await prisma.teamMember.create({ data: { producerId: user.id, agencyId } });
  }
  if (agencyId && finalRole === "telemarketer") {
    await prisma.telemarketerAssignment.create({ data: { telemarketerId: user.id, agencyId } });
  }

  res.status(201).json({ user, tempPassword });
  sendInvite(user, tempPassword, req.user.fullName); // background invite email
}

export async function updateUser(req, res) {
  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target) return res.status(404).json({ error: "User not found" });

  // Only super admin may change roles; owners may edit their own team's names.
  if (req.user.role !== "super_admin") {
    const agencyId = await resolveUserAgencyId(req.user);
    if (target.agencyId !== agencyId) {
      return res.status(403).json({ error: "You cannot edit this user" });
    }
    if (req.body.role) {
      return res.status(403).json({ error: "Only a super admin can change roles" });
    }
  }

  const data = {};
  if (req.body.fullName) data.fullName = req.body.fullName.trim();
  if (req.body.role && req.user.role === "super_admin") data.role = req.body.role;
  if (req.body.agencyId !== undefined && req.user.role === "super_admin")
    data.agencyId = req.body.agencyId || null;

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data,
    select: PUBLIC_USER,
  });
  res.json({ user });
}

export async function deleteUser(req, res) {
  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target) return res.status(404).json({ error: "User not found" });

  if (req.user.role !== "super_admin") {
    const agencyId = await resolveUserAgencyId(req.user);
    if (target.agencyId !== agencyId || target.role === "agency_owner") {
      return res.status(403).json({ error: "You cannot remove this user" });
    }
  }
  if (target.id === req.user.id) {
    return res.status(400).json({ error: "You cannot delete your own account" });
  }

  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
}
