// client/src/pages/ProducerDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListChecks, CheckSquare, BarChart3, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "@/layouts/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Tabs, Card, Spinner, EmptyState } from "@/components/ui";
import LeadsBoard from "@/components/LeadsBoard";
import ReportingPanel from "@/components/ReportingPanel";
import MessagePanel from "@/components/MessagePanel";
import { tasksApi } from "@/api";
import { useAuth } from "@/lib/AuthContext";
import { formatDate } from "@/lib/utils";

const TABS = [
  { value: "leads", label: "Agency leads", icon: ListChecks },
  { value: "tasks", label: "My tasks", icon: CheckSquare },
  { value: "reports", label: "Reports", icon: BarChart3 },
  { value: "messages", label: "Team chat", icon: MessageSquare },
];

function TaskList() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => tasksApi.list({ mine: true }).then(({ tasks }) => setTasks(tasks)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const toggle = async (t) => {
    await tasksApi.update(t.id, { completed: !t.completed });
    setTasks((list) => list.map((x) => (x.id === t.id ? { ...x, completed: !x.completed } : x)));
    toast.success(t.completed ? "Marked open" : "Completed");
  };

  if (loading) return <Spinner label="Loading tasks" />;
  if (tasks.length === 0) return <EmptyState icon={CheckSquare} title="No tasks assigned">Follow-up tasks assigned to you will show here.</EmptyState>;

  return (
    <div className="space-y-3">
      {tasks.map((t) => (
        <Card key={t.id} className="p-4 flex items-center gap-4">
          <input type="checkbox" checked={t.completed} onChange={() => toggle(t)} style={{ width: 18, height: 18 }} />
          <div className="flex-1 min-w-0">
            <div className="text-sm" style={{ color: t.completed ? "var(--text-muted)" : "var(--text)", textDecoration: t.completed ? "line-through" : "none" }}>
              {t.description}
            </div>
            <div className="text-xs mt-1 font-mono" style={{ color: "var(--text-muted)" }}>
              {t.lead?.name} · due {formatDate(t.dueDate)}
            </div>
          </div>
          {t.lead && (
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/lead/${t.lead.id}`)}>View lead</button>
          )}
        </Card>
      ))}
    </div>
  );
}

export default function ProducerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("leads");

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <PageHeader title="Producer dashboard" subtitle="Work your agency's leads and follow-ups." />
        <div className="mb-6"><Tabs tabs={TABS} value={tab} onChange={setTab} /></div>

        {tab === "leads" && <LeadsBoard />}
        {tab === "tasks" && <TaskList />}
        {tab === "reports" && <ReportingPanel />}
        {tab === "messages" && (
          <div className="max-w-2xl"><MessagePanel conversationId={`agency__${user.agencyId}`} title="Team channel" /></div>
        )}
      </div>
    </AppLayout>
  );
}
