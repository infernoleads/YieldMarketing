// server/src/controllers/tasks.controller.js
import { prisma } from "../services/prisma.js";
import { resolveUserAgencyId, canAccessLead } from "../services/scope.js";

const TASK_INCLUDE = {
  lead: { select: { id: true, name: true } },
  assignee: { select: { id: true, fullName: true, email: true } },
};

export async function listTasks(req, res) {
  const { leadId } = req.query;
  let where = {};

  if (req.user.role === "super_admin") {
    where = leadId ? { leadId } : {};
  } else {
    const agencyId = await resolveUserAgencyId(req.user);
    where = { agencyId: agencyId || "__none__" };
    if (leadId) where.leadId = leadId;
    // Producers/telemarketers can further narrow to tasks assigned to them.
    if (req.query.mine === "true") where.assigneeId = req.user.id;
  }

  const tasks = await prisma.followUpTask.findMany({
    where,
    include: TASK_INCLUDE,
    orderBy: [{ completed: "asc" }, { dueDate: "asc" }],
  });
  res.json({ tasks });
}

export async function createTask(req, res) {
  const { leadId, description, dueDate, assigneeId } = req.body;
  if (!leadId || !description) {
    return res.status(400).json({ error: "leadId and description are required" });
  }
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return res.status(404).json({ error: "Lead not found" });
  if (!(await canAccessLead(req.user, lead))) {
    return res.status(403).json({ error: "You cannot add tasks to this lead" });
  }

  const task = await prisma.followUpTask.create({
    data: {
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      assigneeId: assigneeId || null,
      leadId,
      agencyId: lead.agencyId,
    },
    include: TASK_INCLUDE,
  });
  res.status(201).json({ task });
}

export async function updateTask(req, res) {
  const task = await prisma.followUpTask.findUnique({ where: { id: req.params.id } });
  if (!task) return res.status(404).json({ error: "Task not found" });

  if (req.user.role !== "super_admin") {
    const agencyId = await resolveUserAgencyId(req.user);
    if (task.agencyId !== agencyId) return res.status(403).json({ error: "You cannot edit this task" });
  }

  const data = {};
  if (req.body.description !== undefined) data.description = req.body.description;
  if (req.body.completed !== undefined) data.completed = !!req.body.completed;
  if (req.body.dueDate !== undefined) data.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
  if (req.body.assigneeId !== undefined) data.assigneeId = req.body.assigneeId || null;

  const updated = await prisma.followUpTask.update({
    where: { id: req.params.id },
    data,
    include: TASK_INCLUDE,
  });
  res.json({ task: updated });
}

export async function deleteTask(req, res) {
  const task = await prisma.followUpTask.findUnique({ where: { id: req.params.id } });
  if (!task) return res.status(404).json({ error: "Task not found" });
  if (req.user.role !== "super_admin") {
    const agencyId = await resolveUserAgencyId(req.user);
    if (task.agencyId !== agencyId) return res.status(403).json({ error: "You cannot delete this task" });
  }
  await prisma.followUpTask.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
}
