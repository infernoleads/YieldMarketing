// client/src/components/LeadsBoard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Inbox } from "lucide-react";
import { leadsApi } from "@/api";
import { LEAD_STATUS } from "@/lib/utils";
import LeadCard from "./LeadCard";
import { Spinner, ErrorState, EmptyState } from "./ui";

const FILTERS = ["all", ...Object.keys(LEAD_STATUS)];

export default function LeadsBoard() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    leadsApi.list({ status, search })
      .then(({ leads }) => setLeads(leads))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            className="input pl-9"
            placeholder="Search by name, phone, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatus(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
              style={{
                fontFamily: "var(--font-display)",
                color: status === f ? "var(--ink)" : "var(--text-3)",
                background: status === f ? "var(--lime-500)" : "var(--surface-2)",
                border: "1px solid var(--border-2)",
              }}
            >
              {f === "all" ? "All" : LEAD_STATUS[f].label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Spinner label="Loading leads" />
        : error ? <ErrorState message={error} onRetry={load} />
        : leads.length === 0 ? (
          <EmptyState icon={Inbox} title="No leads here yet">
            Leads matching this filter will appear here.
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} onClick={() => navigate(`/lead/${lead.id}`)} />
            ))}
          </div>
        )}
    </div>
  );
}
