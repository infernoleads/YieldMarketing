// client/src/pages/AgencyDashboard.jsx
import { useState } from "react";
import { ListChecks, Users, Headphones, BarChart3, CalendarClock, MessageSquare } from "lucide-react";
import AppLayout from "@/layouts/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Tabs } from "@/components/ui";
import LeadsBoard from "@/components/LeadsBoard";
import TeamPanel from "@/components/TeamPanel";
import AssignmentsPanel from "@/components/AssignmentsPanel";
import ReportingPanel from "@/components/ReportingPanel";
import ScheduledReportsPanel from "@/components/ScheduledReportsPanel";
import MessagePanel from "@/components/MessagePanel";
import { useAuth } from "@/lib/AuthContext";

const TABS = [
  { value: "leads", label: "Leads", icon: ListChecks },
  { value: "team", label: "Team", icon: Users },
  { value: "assignments", label: "Telemarketers", icon: Headphones },
  { value: "reports", label: "Reports", icon: BarChart3 },
  { value: "scheduled", label: "Scheduled", icon: CalendarClock },
  { value: "messages", label: "Team chat", icon: MessageSquare },
];

export default function AgencyDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("leads");

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <PageHeader
          title={user.agencyName || "Your agency"}
          subtitle="Manage your leads, team, and performance."
        />
        <div className="mb-6"><Tabs tabs={TABS} value={tab} onChange={setTab} /></div>

        {tab === "leads" && <LeadsBoard />}
        {tab === "team" && <TeamPanel />}
        {tab === "assignments" && <AssignmentsPanel />}
        {tab === "reports" && <ReportingPanel />}
        {tab === "scheduled" && <ScheduledReportsPanel />}
        {tab === "messages" && (
          <div className="max-w-2xl"><MessagePanel conversationId={`agency__${user.agencyId}`} title="Team channel" /></div>
        )}
      </div>
    </AppLayout>
  );
}
