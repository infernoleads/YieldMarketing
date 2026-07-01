// client/src/pages/SuperAdminDashboard.jsx
import { useState } from "react";
import { Building2, Users, Inbox, ListChecks, BarChart3, CalendarClock } from "lucide-react";
import AppLayout from "@/layouts/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Tabs } from "@/components/ui";
import AgenciesPanel from "@/components/AgenciesPanel";
import TeamPanel from "@/components/TeamPanel";
import AppointmentsPanel from "@/components/AppointmentsPanel";
import LeadsBoard from "@/components/LeadsBoard";
import ReportingPanel from "@/components/ReportingPanel";
import ScheduledReportsPanel from "@/components/ScheduledReportsPanel";

const TABS = [
  { value: "agencies", label: "Agencies", icon: Building2 },
  { value: "users", label: "Users", icon: Users },
  { value: "appointments", label: "Requests", icon: Inbox },
  { value: "leads", label: "All leads", icon: ListChecks },
  { value: "reports", label: "Reports", icon: BarChart3 },
  { value: "scheduled", label: "Scheduled", icon: CalendarClock },
];

export default function SuperAdminDashboard() {
  const [tab, setTab] = useState("agencies");

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <PageHeader title="Control center" subtitle="Every agency, user, and lead across Yield Transfers." />
        <div className="mb-6"><Tabs tabs={TABS} value={tab} onChange={setTab} /></div>

        {tab === "agencies" && <AgenciesPanel />}
        {tab === "users" && <TeamPanel />}
        {tab === "appointments" && <AppointmentsPanel />}
        {tab === "leads" && <LeadsBoard />}
        {tab === "reports" && <ReportingPanel />}
        {tab === "scheduled" && <ScheduledReportsPanel />}
      </div>
    </AppLayout>
  );
}
