// server/src/controllers/appointments.controller.js
import { prisma } from "../services/prisma.js";
import { notifyNewAppointment, confirmAppointmentToProspect } from "../services/email.js";

// Public — anyone can request an appointment from the marketing site.
export async function createAppointment(req, res) {
  const { name, email, phone, company, message } = req.body;
  if (!name || !email) return res.status(400).json({ error: "name and email are required" });

  const appointment = await prisma.appointmentRequest.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || null,
      company: company || null,
      message: message || null,
    },
  });

  // Respond immediately; deliver emails in the background (service never throws).
  res.status(201).json({ appointment });
  notifyNewAppointment(appointment);
  confirmAppointmentToProspect(appointment);
}

// Super admin only — manage the incoming request queue.
export async function listAppointments(req, res) {
  const appointments = await prisma.appointmentRequest.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json({ appointments });
}

export async function updateAppointment(req, res) {
  const { status } = req.body;
  const appointment = await prisma.appointmentRequest.update({
    where: { id: req.params.id },
    data: { ...(status ? { status } : {}) },
  });
  res.json({ appointment });
}
