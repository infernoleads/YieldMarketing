// client/src/components/ReportingPanel.jsx
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { reportsApi } from "@/api";
import { LEAD_STATUS } from "@/lib/utils";
import { Card, Spinner, ErrorState } from "./ui";

function Metric({ label, value, accent }) {
  return (
    <Card className="p-5">
      <div className="text-xs uppercase tracking-wide font-semibold" style={{ color: "var(--text-3)" }}>{label}</div>
      <div className="font-display font-bold text-3xl mt-2" style={{ color: accent || "var(--text)" }}>{value}</div>
    </Card>
  );
}

export default function ReportingPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    reportsApi.dashboard()
      .then(({ stats }) => setStats(stats))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  if (loading) return <Spinner label="Building report" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!stats) return null;

  const statusData = Object.entries(stats.statusBreakdown)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => ({ name: LEAD_STATUS[k]?.label || k, value: n, color: LEAD_STATUS[k]?.color || "#8a927c" }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric label="Total leads" value={stats.totalLeads} />
        <Metric label="Sold" value={stats.sold} accent="var(--lime-400)" />
        <Metric label="Conversion" value={`${stats.conversionRate}%`} accent="var(--lime-400)" />
        <Metric label="Open tasks" value={stats.openTasks} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-display font-semibold text-sm mb-4" style={{ color: "var(--text)" }}>Pipeline by status</h3>
          {statusData.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: "var(--text-3)" }}>No leads yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {statusData.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border-2)", borderRadius: 10, color: "var(--text)" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-3 mt-3 justify-center">
            {statusData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-3)" }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: d.color }} /> {d.name} ({d.value})
              </span>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-semibold text-sm mb-4" style={{ color: "var(--text)" }}>Telemarketer performance</h3>
          {stats.telemarketerPerformance.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: "var(--text-3)" }}>No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.telemarketerPerformance}>
                <XAxis dataKey="name" tick={{ fill: "var(--text-3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-3)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: "var(--lime-glow)" }} contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border-2)", borderRadius: 10, color: "var(--text)" }} />
                <Bar dataKey="total" fill="var(--lime-600)" radius={[6, 6, 0, 0]} name="Leads" />
                <Bar dataKey="sold" fill="var(--lime-400)" radius={[6, 6, 0, 0]} name="Sold" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
