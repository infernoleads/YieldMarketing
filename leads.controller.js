// server/src/controllers/leads.controller.js
import { prisma } from "../services/prisma.js";
import { leadScopeWhere, canAccessLead, resolveUserAgencyId } from "../services/scope.js";

const LEAD_INCLUDE = {
  telemarketer: { select: { id: true, fullName: true, email: true } },
  producer: { select: { id: true, fullName: true, email: true } },
  agency: { select: { id: true, name: true } },
};

export async function listLeads(req, res) {
  const scope = await leadScopeWhere(req.user);
  const { status, search } = req.query;

  const where = { ...scope };
  if (status && status !== "all") where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const leads = await prisma.lead.findMany({
    where,
    include: LEAD_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  res.json({ leads });
}

export async function getLead(req, res) {
  const lead = await prisma.lead.findUnique({
    where: { id: req.params.id },
    include: { ...LEAD_INCLUDE, followUpTasks: { orderBy: { dueDate: "asc" } } },
  });
  if (!lead) return res.status(404).json({ error: "Lead not found" });
  if (!(await canAccessLead(req.user, lead))) {
    return res.status(403).json({ error: "You cannot access this lead" });
  }
  res.json({ lead });
}

export async function createLead(req, res) {
  const agencyId = await resolveUserAgencyId(req.user);

  // Super admin must pass an agencyId explicitly.
  const targetAgencyId = req.user.role === "super_admin" ? req.body.agencyId : agencyId;
  if (!targetAgencyId) {
    return res.status(400).json({ error: "No agency context for this lead" });
  }

  const b = req.body;
  const lead = await prisma.lead.create({
    data: {
      name: b.name,
      phone: b.phone,
      email: b.email || null,
      address: b.address || null,
      currentCarrier: b.currentCarrier || null,
      yearsWithCarrier: b.yearsWithCarrier != null ? Number(b.yearsWithCarrier) : null,
      accidentsClaims: !!b.accidentsClaims,
      homeOwnership: b.homeOwnership || null,
      vehicleYear: b.vehicleYear || null,
      vehicleMake: b.vehicleMake || null,
      vehicleModel: b.vehicleModel || null,
      telemarketerNotes: b.telemarketerNotes || null,
      agentNotes: b.agentNotes || null,
      status: b.status || "new",
      agencyId: targetAgencyId,
      // Telemarketer who submits is auto-attached.
      telemarketerId:
        req.user.role === "telemarketer" ? req.user.id : b.telemarketerId || null,
      producerId: b.producerId || null,
    },
    include: LEAD_INCLUDE,
  });
  res.status(201).json({ lead });
}

export async function updateLead(req, res) {
  const existing = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Lead not found" });
  if (!(await canAccessLead(req.user, existing))) {
    return res.status(403).json({ error: "You cannot modify this lead" });
  }

  const b = req.body;
  const data = {};
  const fields = [
    "name", "phone", "email", "address", "currentCarrier", "homeOwnership",
    "vehicleYear", "vehicleMake", "vehicleModel", "telemarketerNotes",
    "agentNotes", "status", "producerId", "telemarketerId",
  ];
  for (const f of fields) if (b[f] !== undefined) data[f] = b[f] || null;
  if (b.yearsWithCarrier !== undefined)
    data.yearsWithCarrier = b.yearsWithCarrier != null ? Number(b.yearsWithCarrier) : null;
  if (b.accidentsClaims !== undefined) data.accidentsClaims = !!b.accidentsClaims;

  const lead = await prisma.lead.update({
    where: { id: req.params.id },
    data,
    include: LEAD_INCLUDE,
  });
  res.json({ lead });
}

export async function deleteLead(req, res) {
  const existing = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Lead not found" });
  if (!(await canAccessLead(req.user, existing))) {
    return res.status(403).json({ error: "You cannot delete this lead" });
  }
  // Telemarketers can't delete once a producer is working it.
  if (req.user.role === "telemarketer" && existing.producerId) {
    return res.status(403).json({ error: "Lead is in production and cannot be deleted" });
  }
  await prisma.lead.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
}
