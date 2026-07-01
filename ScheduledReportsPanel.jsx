// client/src/components/ScheduledReportsPanel.jsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Trash2, Plus, CalendarClock, Send } from "lucide-react";
import { reportsApi } from "@/api";
import { Card, Button, Input, Select, Modal, Spinner, EmptyState } from "./ui";

const FREQ = ["hourly", "daily", "weekly", "biweekly", "monthly", "quarterly"];

export default function ScheduledReportsPanel() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ reportName: "", frequency: "weekly", sendTime: "09:00", recipientEmails: "" });
  const [saving, setSaving] = useState(false);

  const load = () =>
    reportsApi.listScheduled().then(({ reports }) => setReports(reports)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.reportName || !form.recipientEmails) {
      toast.error("Name and recipients are required.");
      return;
    }
    setSaving(true);
    try {
      await reportsApi.createScheduled(form);
      toast.success("Scheduled report created.");
      setOpen(false);
      setForm({ reportName: "", frequency: "weekly", sendTime: "09:00", recipientEmails: "" });
      setLoading(true);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await reportsApi.removeScheduled(id);
    setReports((r) => r.filter((x) => x.id !== id));
    toast.success("Removed.");
  };

  const [sendingId, setSendingId] = useState(null);
  const sendNow = async (id) => {
    setSendingId(id);
    try {
      const { sent, reason, recipients } = await reportsApi.sendScheduledNow(id);
      if (sent) toast.success(`Sent to ${recipients.join(", ")}`);
      else if (reason === "not_configured") toast.error("Email isn't configured yet. Add your Gmail credentials on the server.");
      else toast.error(`Couldn't send: ${reason || "unknown error"}`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSendingId(null);
    }
  };

  if (loading) return <Spinner label="Loading reports" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-base" style={{ color: "var(--text)" }}>Scheduled reports</h3>
        <Button size="sm" onClick={() => setOpen(true)}><Plus size={15} /> New schedule</Button>
      </div>

      {reports.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No scheduled reports">
          Automate delivery of your pipeline metrics to any inbox.
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <Card key={r.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm" style={{ color: "var(--text)" }}>{r.reportName}</div>
                <div className="text-xs mt-1 font-mono" style={{ color: "var(--text-3)" }}>
                  {r.frequency}{r.sendTime ? ` · ${r.sendTime}` : ""} → {r.recipientEmails}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => sendNow(r.id)} disabled={sendingId === r.id}>
                  <Send size={14} /> {sendingId === r.id ? "Sending…" : "Send now"}
                </Button>
                <button className="btn btn-danger btn-sm" onClick={() => remove(r.id)}><Trash2 size={14} /></button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New scheduled report">
        <div className="space-y-4">
          <Input label="Report name" value={form.reportName} onChange={(e) => setForm({ ...form, reportName: e.target.value })} placeholder="Weekly pipeline summary" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Frequency" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
              {FREQ.map((f) => <option key={f} value={f}>{f}</option>)}
            </Select>
            <Input label="Send time" type="time" value={form.sendTime} onChange={(e) => setForm({ ...form, sendTime: e.target.value })} />
          </div>
          <Input label="Recipients (comma-separated)" value={form.recipientEmails} onChange={(e) => setForm({ ...form, recipientEmails: e.target.value })} placeholder="you@agency.com, boss@agency.com" />
          <Button className="w-full" onClick={create} disabled={saving}>{saving ? "Saving…" : "Create schedule"}</Button>
        </div>
      </Modal>
    </div>
  );
}
