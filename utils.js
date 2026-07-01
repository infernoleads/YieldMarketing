// client/src/lib/utils.js

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function timeAgo(value) {
  if (!value) return "never";
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function isOnline(lastSeen) {
  if (!lastSeen) return false;
  return Date.now() - new Date(lastSeen).getTime() < 5 * 60 * 1000;
}

export const LEAD_STATUS = {
  new:       { label: "New",        color: "#60a5fa" },
  contacted: { label: "Contacted",  color: "#fbbf24" },
  quoted:    { label: "Quoted",     color: "#a78bfa" },
  sold:      { label: "Sold",       color: "#84cc16" },
  lost:      { label: "Lost",       color: "#f87171" },
  follow_up: { label: "Follow Up",  color: "#22d3ee" },
};

export const ROLE_LABEL = {
  super_admin: "Super Admin",
  agency_owner: "Agency Owner",
  producer: "Producer",
  telemarketer: "Telemarketer",
};

// Deterministic conversation id between two users.
export function directConversationId(a, b) {
  return `dm__${[a, b].sort().join("__")}`;
}
