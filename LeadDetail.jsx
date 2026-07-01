// client/src/pages/LeadDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Save, Plus, Check, Phone, Mail, MapPin, Car, Home, Shield } from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "@/layouts/AppLayout";
import { Card, Button, Input, Textarea, Select, StatusBadge, Spinner, ErrorState, Modal, EmptyState } from "@/components/ui";
import { leadsApi, tasksApi } from "@/api";
import { useAuth } from "@/lib/AuthContext";
import { LEAD_STATUS, formatDate } from "@/lib/utils";

function Field({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center justify-center rounded-lg mt-0.5" style={{ width: 32, height: 32, background: "var(--surface-2)", border: "1px solid var(--border-2)", flexShrink: 0 }}>
        <Icon size={15} style={{ color: "var(--lime-400)" }} />
      </div>
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{label}</div>
        <div className="text-sm mt-0.5" style={{ color: "var(--text)" }}>{value || "—"}</div>
      </div>
    </div>
  );
}

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");
  const [agentNotes, setAgentNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ description: "", dueDate: "" });

  const canEdit = user.role !== "telemarketer";
  const canDelete = user.role === "super_admin" || user.role === "agency_owner" ||
    (user.role === "telemarketer" && !lead?.producerId);

  const load = () => {
    setLoading(true);
    setError(null);
    leadsApi.get(id)
      .then(({ lead }) => { setLead(lead); setStatus(lead.status); setAgentNotes(lead.agentNotes || ""); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  const save = async () => {
    setSaving(true);
    try {
      const { lead: updated } = await leadsApi.update(id, { status, agentNotes });
      setLead(updated);
      toast.success("Lead updated.");
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const removeLead = async () => {
    if (!confirm("Delete this lead? This cannot be undone.")) return;
    try {
      await leadsApi.remove(id);
      toast.success("Lead deleted.");
      navigate(-1);
    } catch (e) { toast.error(e.message); }
  };

  const addTask = async () => {
    if (!newTask.description) { toast.error("Description is required."); return; }
    try {
      const { task } = await tasksApi.create({ leadId: id, ...newTask });
      setLead((l) => ({ ...l, followUpTasks: [...(l.followUpTasks || []), task] }));
      setTaskModal(false);
      setNewTask({ description: "", dueDate: "" });
      toast.success("Task added.");
    } catch (e) { toast.error(e.message); }
  };

  const toggleTask = async (t) => {
    await tasksApi.update(t.id, { completed: !t.completed });
    setLead((l) => ({ ...l, followUpTasks: l.followUpTasks.map((x) => x.id === t.id ? { ...x, completed: !x.completed } : x) }));
  };

  const deleteTask = async (t) => {
    await tasksApi.remove(t.id);
    setLead((l) => ({ ...l, followUpTasks: l.followUpTasks.filter((x) => x.id !== t.id) }));
    toast.success("Task removed.");
  };

  if (loading) return <AppLayout><div className="p-8"><Spinner label="Loading lead" /></div></AppLayout>;
  if (error) return <AppLayout><div className="p-8"><ErrorState message={error} onRetry={load} /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm mb-6" style={{ color: "var(--text-3)" }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display font-bold text-3xl" style={{ color: "var(--text)" }}>{lead.name}</h1>
              <StatusBadge status={lead.status} />
            </div>
            <p className="mt-2 text-sm font-mono" style={{ color: "var(--text-3)" }}>Added {formatDate(lead.createdAt)}</p>
          </div>
          {canDelete && (
            <Button variant="danger" size="sm" onClick={removeLead}><Trash2 size={15} /> Delete</Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="font-display font-semibold mb-5" style={{ color: "var(--text)" }}>Contact & profile</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field icon={Phone} label="Phone" value={lead.phone} />
                <Field icon={Mail} label="Email" value={lead.email} />
                <Field icon={MapPin} label="Address" value={lead.address} />
                <Field icon={Shield} label="Current carrier" value={lead.currentCarrier} />
                <Field icon={Home} label="Home" value={lead.homeOwnership} />
                <Field icon={Car} label="Vehicle" value={[lead.vehicleYear, lead.vehicleMake, lead.vehicleModel].filter(Boolean).join(" ")} />
                <Field icon={Shield} label="Years w/ carrier" value={lead.yearsWithCarrier} />
                <Field icon={Shield} label="Accidents/claims" value={lead.accidentsClaims ? "Yes" : "No"} />
              </div>
              {lead.telemarketerNotes && (
                <div className="mt-6 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
                  <div className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>Telemarketer notes</div>
                  <p className="text-sm" style={{ color: "var(--text-2)" }}>{lead.telemarketerNotes}</p>
                </div>
              )}
            </Card>

            {/* Follow-up tasks */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold" style={{ color: "var(--text)" }}>Follow-up tasks</h2>
                {canEdit && <Button size="sm" onClick={() => setTaskModal(true)}><Plus size={15} /> Add</Button>}
              </div>
              {(!lead.followUpTasks || lead.followUpTasks.length === 0) ? (
                <EmptyState icon={Check} title="No tasks yet">Add follow-ups to keep this lead moving.</EmptyState>
              ) : (
                <div className="space-y-2.5">
                  {lead.followUpTasks.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "var(--inset)" }}>
                      <input type="checkbox" checked={t.completed} onChange={() => toggleTask(t)} style={{ width: 17, height: 17 }} disabled={!canEdit} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm" style={{ color: t.completed ? "var(--text-muted)" : "var(--text)", textDecoration: t.completed ? "line-through" : "none" }}>{t.description}</div>
                        {t.dueDate && <div className="text-xs font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>Due {formatDate(t.dueDate)}</div>}
                      </div>
                      {canEdit && <button onClick={() => deleteTask(t)} style={{ color: "var(--text-muted)" }}><Trash2 size={14} /></button>}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar: status + agent notes */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-display font-semibold mb-4" style={{ color: "var(--text)" }}>Manage</h2>
              {canEdit ? (
                <>
                  <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                    {Object.entries(LEAD_STATUS).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                  </Select>
                  <Textarea className="mt-4" label="Agent notes" rows={5} value={agentNotes} onChange={(e) => setAgentNotes(e.target.value)} placeholder="Internal notes for producers…" />
                  <Button className="w-full mt-4" onClick={save} disabled={saving}>
                    <Save size={15} /> {saving ? "Saving…" : "Save changes"}
                  </Button>
                </>
              ) : (
                <p className="text-sm" style={{ color: "var(--text-3)" }}>
                  You can view this lead but only producers and owners can edit it.
                </p>
              )}
            </Card>

            {lead.telemarketer && (
              <Card className="p-6">
                <div className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>Submitted by</div>
                <div className="text-sm" style={{ color: "var(--text)" }}>{lead.telemarketer.fullName}</div>
                <div className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{lead.telemarketer.email}</div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Modal open={taskModal} onClose={() => setTaskModal(false)} title="Add follow-up task">
        <div className="space-y-4">
          <Textarea label="Description" rows={3} value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} placeholder="Call back with quote…" />
          <Input label="Due date" type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} />
          <Button className="w-full" onClick={addTask}>Add task</Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
