// client/src/components/AssignmentsPanel.jsx
import { useEffect, useState } from "react";
import { Headphones } from "lucide-react";
import { assignmentsApi } from "@/api";
import { isOnline, timeAgo } from "@/lib/utils";
import { Card, Spinner, EmptyState } from "./ui";

export default function AssignmentsPanel() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assignmentsApi.list().then(({ assignments }) => setAssignments(assignments)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading assignments" />;
  if (assignments.length === 0) {
    return <EmptyState icon={Headphones} title="No telemarketers assigned">Telemarketers assigned to your agency will appear here.</EmptyState>;
  }

  return (
    <div className="space-y-2.5">
      {assignments.map((a) => (
        <Card key={a.id} className="p-4 flex items-center gap-4">
          <div className="flex items-center justify-center rounded-xl font-display font-semibold"
            style={{ width: 40, height: 40, background: "var(--lime-glow)", color: "var(--lime-400)", border: "1px solid var(--border-2)" }}>
            {(a.telemarketer?.fullName || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm" style={{ color: "var(--text)" }}>{a.telemarketer?.fullName}</div>
            <div className="text-xs font-mono truncate" style={{ color: "var(--text-muted)" }}>{a.telemarketer?.email}</div>
          </div>
          <span className="badge" style={{
            color: isOnline(a.telemarketer?.lastSeen) ? "var(--lime-400)" : "var(--text-muted)",
            background: isOnline(a.telemarketer?.lastSeen) ? "var(--lime-glow)" : "var(--surface-2)",
            border: "1px solid var(--border-2)",
          }}>
            {isOnline(a.telemarketer?.lastSeen) ? "Online" : timeAgo(a.telemarketer?.lastSeen)}
          </span>
        </Card>
      ))}
    </div>
  );
}
