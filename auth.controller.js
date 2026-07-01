// server/src/controllers/auth.controller.js
import bcrypt from "bcryptjs";
import { prisma } from "../services/prisma.js";
import { signToken } from "../services/token.js";
import { notifyNewSignup } from "../services/email.js";

const PUBLIC_USER = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  agencyId: true,
  createdAt: true,
};

export async function register(req, res) {
  const { email, password, fullName, role, agencyName } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: "email, password and fullName are required" });
  }
  const cleanEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (existing) return res.status(409).json({ error: "That email is already registered" });

  // Only agency_owner, producer, telemarketer can self-register.
  // super_admin accounts are created via seed / invite only.
  const allowedRoles = ["agency_owner", "producer", "telemarketer"];
  const finalRole = allowedRoles.includes(role) ? role : "telemarketer";

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email: cleanEmail, passwordHash, fullName: fullName.trim(), role: finalRole },
    select: PUBLIC_USER,
  });

  // An agency_owner registering also creates their agency.
  if (finalRole === "agency_owner") {
    await prisma.agency.create({
      data: { name: agencyName?.trim() || `${fullName.trim()}'s Agency`, ownerId: user.id },
    });
  }

  const token = signToken({ sub: user.id, role: user.role });
  res.status(201).json({ token, user });
  notifyNewSignup(user); // background notification to admin
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }
  const cleanEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (!user) return res.status(401).json({ error: "Invalid email or password" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid email or password" });

  await prisma.user.update({ where: { id: user.id }, data: { lastSeen: new Date() } });

  const token = signToken({ sub: user.id, role: user.role });
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      agencyId: user.agencyId,
      createdAt: user.createdAt,
    },
  });
}

export async function me(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: PUBLIC_USER,
  });
  // Attach agency name + a resolved agency id (owners own an agency but
  // aren't stored as a member, so agencyId is otherwise null for them).
  let agencyName = null;
  let resolvedAgencyId = user.agencyId ?? null;
  if (user.role === "agency_owner") {
    const a = await prisma.agency.findUnique({ where: { ownerId: user.id } });
    agencyName = a?.name ?? null;
    resolvedAgencyId = a?.id ?? null;
  } else if (user.agencyId) {
    const a = await prisma.agency.findUnique({ where: { id: user.agencyId } });
    agencyName = a?.name ?? null;
  }
  res.json({ user: { ...user, agencyName, agencyId: resolvedAgencyId } });
}
