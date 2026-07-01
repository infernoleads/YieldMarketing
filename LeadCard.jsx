// client/src/components/LeadCard.jsx
import { Phone, Car, Clock } from "lucide-react";
import { StatusBadge } from "./ui";
import { timeAgo } from "@/lib/utils";

export default function LeadCard({ lead, onClick }) {
  return (
    <div className="card card-hover p-4 cursor-pointer fade-in" onClick={onClick}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-[15px] truncate" style={{ color: "var(--text)" }}>
            {lead.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-xs" style={{ color: "var(--text-3)" }}>
            <Phone size={12} /> <span className="font-mono">{lead.phone}</span>
          </div>
        </div>
        <StatusBadge status={lead.status} />
      </div>

      {(lead.vehicleMake || lead.currentCarrier) && (
        <div className="mt-3 flex flex-wrap gap-3 text-xs" style={{ color: "var(--text-3)" }}>
          {lead.vehicleMake && (
            <span className="flex items-center gap-1.5">
              <Car size={12} /> {lead.vehicleYear} {lead.vehicleMake} {lead.vehicleModel}
            </span>
          )}
          {lead.currentCarrier && (
            <span style={{ color: "var(--text-muted)" }}>· {lead.currentCarrier}</span>
          )}
        </div>
      )}

      <div className="mt-3 pt-3 flex items-center justify-between text-xs" style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}>
        <span className="flex items-center gap-1.5"><Clock size={11} /> {timeAgo(lead.createdAt)}</span>
        {lead.telemarketer && <span className="truncate max-w-[120px]">{lead.telemarketer.fullName}</span>}
      </div>
    </div>
  );
}
