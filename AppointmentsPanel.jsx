// client/src/components/AppointmentsPanel.jsx
import { useEffect, useState } from "react";
import { Inbox, Mail, Phone, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { appointmentsApi } from "@/api";
import { formatDateTime } from "@/lib/utils";
import { Card, Spinner, EmptyState } from "./ui";

const STATUS = ["new", "contacted", "scheduled", "closed"];
const STATUS_COLOR = { new: "#60a5fa", contacted: "#fbbf24", scheduled: "#a3e635", closed: "#8a927c" };

export default function AppointmentsPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentsApi.list().then(({ appointments }) => setItems(appointments)).finally(() => setLoading(false));
  }, []);

  const setStatus = async (id, status) => {
    await appointmentsApi.update(id, { status });
    setItems((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
    toast.success("Updated.");
  };

  if (loading) return <Spinner label="Loading requests" />;
  if (items.length === 0) return <EmptyState icon={Inbox} title="No appointment requests">New requests from the landing page appear here.</EmptyState>;

  return (
    <div className="space-y-3">
      {items.map((a) => (
        <Card key={a.id} className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="font-display font-semibold" style={{ color: "var(--text)" }}>{a.name}</div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs" style={{ color: "var(--text-3)" }}>
                <span className="flex items-center gap-1.5"><Mail size={12} /> {a.email}</span>
                {a.phone && <span className="flex items-center gap-1.5"><Phone size={12} /> {a.phone}</span>}
                {a.company && <span className="flex items-center gap-1.5"><Building2 size={12} /> {a.company}</span>}
              </div>
            </div>
            <select className="select" style={{ width: 140 }} value={a.status} onChange={(e) => setStatus(a.id, e.target.value)}>
              {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {a.message && <p className="mt-3 text-sm p-3 rounded-lg" style={{ background: "var(--inset)", color: "var(--text-2)" }}>{a.message}</p>}
          <div className="mt-3 text-xs font-mono flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_COLOR[a.status] }} />
            {formatDateTime(a.createdAt)}
          </div>
        </Card>
      ))}
    </div>
  );
}
