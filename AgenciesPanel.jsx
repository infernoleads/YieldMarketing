// client/src/components/AgenciesPanel.jsx
import { useEffect, useState } from "react";
import { Building2, Users, TrendingUp } from "lucide-react";
import { reportsApi } from "@/api";
import { Card, Spinner, EmptyState } from "./ui";

export default function AgenciesPanel() {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsApi.dashboard().then(({ agencies }) => setAgencies(agencies || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading agencies" />;
  if (agencies.length === 0) return <EmptyState icon={Building2} title="No agencies yet">Agencies will appear here as owners sign up.</EmptyState>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {agencies.map((a) => (
        <Card key={a.id} className="p-5 card-hover">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center rounded-xl" style={{ width: 42, height: 42, background: "var(--lime-glow)", border: "1px solid var(--border-2)" }}>
              <Building2 size={19} style={{ color: "var(--lime-400)" }} />
            </div>
            <div className="font-display font-semibold" style={{ color: "var(--text)" }}>{a.name}</div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="font-display font-bold text-xl" style={{ color: "var(--text)" }}>{a.totalLeads}</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>Leads</div>
            </div>
            <div>
              <div className="font-display font-bold text-xl" style={{ color: "var(--lime-400)" }}>{a.sold}</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>Sold</div>
            </div>
            <div>
              <div className="font-display font-bold text-xl" style={{ color: "var(--text)" }}>{a.conversionRate}%</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>Conv.</div>
            </div>
          </div>
          <div className="mt-4 pt-3 flex items-center gap-2 text-xs" style={{ borderTop: "1px solid var(--border)", color: "var(--text-3)" }}>
            <Users size={13} /> {a.members} member{a.members === 1 ? "" : "s"}
          </div>
        </Card>
      ))}
    </div>
  );
}
