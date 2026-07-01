// client/src/pages/TelemarketerDashboard.jsx
import { useState } from "react";
import { PlusCircle, ListChecks, MessageSquare } from "lucide-react";
import AppLayout from "@/layouts/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Tabs, Card } from "@/components/ui";
import LeadForm from "@/components/LeadForm";
import LeadsBoard from "@/components/LeadsBoard";
import MessagePanel from "@/components/MessagePanel";
import { useAuth } from "@/lib/AuthContext";

const TABS = [
  { value: "submit", label: "Submit lead", icon: PlusCircle },
  { value: "leads", label: "My leads", icon: ListChecks },
  { value: "messages", label: "Team chat", icon: MessageSquare },
];

export default function TelemarketerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("submit");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <PageHeader title={`Welcome, ${user.fullName.split(" ")[0]}`} subtitle="Submit new leads and track your pipeline." />
        <div className="mb-6"><Tabs tabs={TABS} value={tab} onChange={setTab} /></div>

        {tab === "submit" && (
          <Card className="p-6 max-w-3xl">
            <h2 className="font-display font-semibold text-lg mb-5" style={{ color: "var(--text)" }}>New lead</h2>
            <LeadForm onCreated={() => { setRefreshKey((k) => k + 1); setTab("leads"); }} />
          </Card>
        )}

        {tab === "leads" && <div key={refreshKey}><LeadsBoard /></div>}

        {tab === "messages" && (
          <div className="max-w-2xl">
            <MessagePanel conversationId={`agency__${user.agencyId}`} title="Team channel" />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
