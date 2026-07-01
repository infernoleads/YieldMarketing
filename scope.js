// server/src/services/scope.js
import { prisma } from "./prisma.js";

// Resolves the agencyId a non-super-admin user is bound to.
// - agency_owner: the agency they own
// - producer/telemarketer: the agency they're a member of
// Returns null for super_admin (they aren't bound to one agency).
export async function resolveUserAgencyId(user) {
  if (user.role === "super_admin") return null;
  if (user.agencyId) return user.agencyId;

  if (user.role === "agency_owner") {
    const agency = await prisma.agency.findUnique({ where: { ownerId: user.id } });
    return agency?.id ?? null;
  }
  return null;
}

// Builds a Prisma `where` fragment that limits Lead-like queries to what the
// user is allowed to see. Super admins get an empty filter (everything).
export async function leadScopeWhere(user) {
  if (user.role === "super_admin") return {};

  const agencyId = await resolveUserAgencyId(user);
  if (!agencyId) return { id: "__none__" }; // no agency → see nothing

  if (user.role === "agency_owner" || user.role === "producer") {
    // Owners and producers see all leads in their agency.
    return { agencyId };
  }
  if (user.role === "telemarketer") {
    // Telemarketers see only the leads they submitted.
    return { agencyId, telemarketerId: user.id };
  }
  return { id: "__none__" };
}

// True if the user may read/write a specific lead.
export async function canAccessLead(user, lead) {
  if (!lead) return false;
  if (user.role === "super_admin") return true;
  const agencyId = await resolveUserAgencyId(user);
  if (lead.agencyId !== agencyId) return false;
  if (user.role === "telemarketer") return lead.telemarketerId === user.id;
  return true; // owner + producer within same agency
}
