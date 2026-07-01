// prisma/seed.js
// Seeds one agency, a user for every role, and sample leads/tasks/appointments.
import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PASSWORD = "password123";

async function main() {
  console.log("Seeding Yield Transfers…");

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  // --- Super admin (no agency) ---
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@yieldtransfers.com" },
    update: {},
    create: {
      email: "superadmin@yieldtransfers.com",
      passwordHash,
      fullName: "Super Admin",
      role: "super_admin",
    },
  });

  // --- Agency owner ---
  const owner = await prisma.user.upsert({
    where: { email: "owner@yieldtransfers.com" },
    update: {},
    create: {
      email: "owner@yieldtransfers.com",
      passwordHash,
      fullName: "Olivia Owner",
      role: "agency_owner",
    },
  });

  // --- Agency owned by the owner ---
  const agency = await prisma.agency.upsert({
    where: { ownerId: owner.id },
    update: {},
    create: {
      name: "Summit Insurance Group",
      ownerId: owner.id,
    },
  });

  // --- Producer (belongs to agency) ---
  const producer = await prisma.user.upsert({
    where: { email: "producer@yieldtransfers.com" },
    update: { agencyId: agency.id },
    create: {
      email: "producer@yieldtransfers.com",
      passwordHash,
      fullName: "Paul Producer",
      role: "producer",
      agencyId: agency.id,
    },
  });

  // --- Telemarketer (belongs to agency) ---
  const telemarketer = await prisma.user.upsert({
    where: { email: "telemarketer@yieldtransfers.com" },
    update: { agencyId: agency.id },
    create: {
      email: "telemarketer@yieldtransfers.com",
      passwordHash,
      fullName: "Tina Telemarketer",
      role: "telemarketer",
      agencyId: agency.id,
    },
  });

  // --- TeamMember + Assignment links ---
  await prisma.teamMember.upsert({
    where: { producerId: producer.id },
    update: {},
    create: { producerId: producer.id, agencyId: agency.id },
  });

  await prisma.telemarketerAssignment.upsert({
    where: { telemarketerId: telemarketer.id },
    update: {},
    create: { telemarketerId: telemarketer.id, agencyId: agency.id },
  });

  // --- Sample leads ---
  const sampleLeads = [
    {
      name: "James Carter", phone: "555-0142", email: "james.carter@example.com",
      address: "412 Oak Ave, Atlanta, GA", currentCarrier: "Geico", yearsWithCarrier: 3,
      accidentsClaims: false, homeOwnership: "own", vehicleYear: "2021",
      vehicleMake: "Toyota", vehicleModel: "Camry", status: "new",
      telemarketerNotes: "Interested in bundling home + auto.",
    },
    {
      name: "Maria Gonzalez", phone: "555-0177", email: "maria.g@example.com",
      address: "88 Pine St, Marietta, GA", currentCarrier: "State Farm", yearsWithCarrier: 6,
      accidentsClaims: true, homeOwnership: "rent", vehicleYear: "2019",
      vehicleMake: "Honda", vehicleModel: "Civic", status: "contacted",
      telemarketerNotes: "Callback requested for Thursday afternoon.",
    },
    {
      name: "Derrick Ways", phone: "555-0199", email: "d.ways@example.com",
      address: "9 Maple Ct, Alpharetta, GA", currentCarrier: "Progressive", yearsWithCarrier: 1,
      accidentsClaims: false, homeOwnership: "own", vehicleYear: "2023",
      vehicleMake: "Ford", vehicleModel: "F-150", status: "quoted",
      agentNotes: "Quoted $142/mo — waiting on decision.",
    },
    {
      name: "Angela Brooks", phone: "555-0110", email: "angela.brooks@example.com",
      currentCarrier: "Allstate", yearsWithCarrier: 8, accidentsClaims: false,
      homeOwnership: "own", vehicleYear: "2020", vehicleMake: "Subaru",
      vehicleModel: "Outback", status: "sold",
      agentNotes: "Closed — 12-month policy.",
    },
  ];

  for (const data of sampleLeads) {
    // avoid duplicate seeding on reruns by keying off name + phone
    const existing = await prisma.lead.findFirst({
      where: { name: data.name, phone: data.phone, agencyId: agency.id },
    });
    if (existing) continue;
    await prisma.lead.create({
      data: {
        ...data,
        agencyId: agency.id,
        telemarketerId: telemarketer.id,
        producerId: ["quoted", "sold"].includes(data.status) ? producer.id : null,
      },
    });
  }

  // --- One follow-up task ---
  const firstLead = await prisma.lead.findFirst({ where: { agencyId: agency.id } });
  if (firstLead) {
    const existingTask = await prisma.followUpTask.findFirst({ where: { leadId: firstLead.id } });
    if (!existingTask) {
      await prisma.followUpTask.create({
        data: {
          description: "Send updated quote and coverage comparison.",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          leadId: firstLead.id,
          assigneeId: producer.id,
          agencyId: agency.id,
        },
      });
    }
  }

  // --- Sample appointment request ---
  const existingAppt = await prisma.appointmentRequest.findFirst({
    where: { email: "prospect@newagency.com" },
  });
  if (!existingAppt) {
    await prisma.appointmentRequest.create({
      data: {
        name: "Ray Whitfield",
        email: "prospect@newagency.com",
        phone: "555-2020",
        company: "Whitfield Insurance",
        message: "Interested in 2 telemarketers. What's onboarding like?",
        status: "new",
      },
    });
  }

  console.log("Seed complete.");
  console.log("Login with any of these (password: password123):");
  console.log("  superadmin@yieldtransfers.com");
  console.log("  owner@yieldtransfers.com");
  console.log("  producer@yieldtransfers.com");
  console.log("  telemarketer@yieldtransfers.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
