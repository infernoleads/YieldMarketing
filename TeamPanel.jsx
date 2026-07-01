// client/src/components/TeamPanel.jsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UserPlus, Trash2, Users } from "lucide-react";
import { usersApi } from "@/api";
import { useAuth } from "@/lib/AuthContext";
import { ROLE_LABEL, isOnline, timeAgo } from "@/lib/utils";
import { Card, Button, Input, Select, Modal, Spinner, EmptyState } from "./ui";

export default function TeamPanel() {
  const { user } = useAuth();
  const isSuper = user.role === "super_admin";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", role: "telemarketer" });

  const load = () => usersApi.list().then(({ users }) => setUsers(users)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const invite = async () => {
    if (!form.fullName || !form.email) { toast.error("Name and email are required."); return; }
    setSaving(true);
    try {
      const { tempPassword } = await usersApi.invite(form);
      toast.success(`Invited. Temp password: ${tempPassword}`);
      setOpen(false);
      setForm({ fullName: "", email: "", role: "telemarketer" });
      setLoading(true);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const changeRole = async (id, role) => {
    try {
      await usersApi.update(id, { role });
      setUsers((list) => list.map((u) => (u.id === id ? { ...u, role } : u)));
      toast.success("Role updated.");
    } catch (e) { toast.error(e.message); }
  };

  const remove = async (id) => {
    try {
      await usersApi.remove(id);
      setUsers((list) => list.filter((u) => u.id !== id));
      toast.success("Removed.");
    } catch (e) { toast.error(e.message); }
  };

  if (loading) return <Spinner label="Loading team" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-base" style={{ color: "var(--text)" }}>
          {isSuper ? "All users" : "Your team"} <span style={{ color: "var(--text-muted)" }}>({users.length})</span>
        </h3>
        <Button size="sm" onClick={() => setOpen(true)}><UserPlus size={15} /> Invite</Button>
      </div>

      {users.length === 0 ? (
        <EmptyState icon={Users} title="No team members yet">Invite producers and telemarketers to get started.</EmptyState>
      ) : (
        <div className="space-y-2.5">
          {users.map((u) => (
            <Card key={u.id} className="p-4 flex items-center gap-4">
              <div className="relative">
                <div className="flex items-center justify-center rounded-xl font-display font-semibold"
                  style={{ width: 40, height: 40, background: "var(--lime-glow)", color: "var(--lime-400)", border: "1px solid var(--border-2)" }}>
                  {u.fullName.charAt(0).toUpperCase()}
                </div>
                {isOnline(u.lastSeen) && (
                  <span className="absolute -bottom-0.5 -right-0.5 rounded-full" style={{ width: 11, height: 11, background: "var(--lime-500)", border: "2px solid var(--surface)" }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate" style={{ color: "var(--text)" }}>{u.fullName}</div>
                <div className="text-xs truncate font-mono" style={{ color: "var(--text-muted)" }}>{u.email}</div>
              </div>
              <div className="text-xs hidden sm:block" style={{ color: "var(--text-muted)" }}>
                {isOnline(u.lastSeen) ? "online" : timeAgo(u.lastSeen)}
              </div>
              {isSuper ? (
                <select className="select" style={{ width: 150 }} value={u.role} onChange={(e) => changeRole(u.id, e.target.value)}>
                  {Object.entries(ROLE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              ) : (
                <span className="badge" style={{ color: "var(--lime-400)", background: "var(--lime-glow)", border: "1px solid var(--border-2)" }}>
                  {ROLE_LABEL[u.role]}
                </span>
              )}
              {u.id !== user.id && u.role !== "agency_owner" && (
                <button className="btn btn-danger btn-sm" onClick={() => remove(u.id)}><Trash2 size={14} /></button>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Invite a team member">
        <div className="space-y-4">
          <Input label="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Jane Doe" />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@agency.com" />
          <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="telemarketer">Telemarketer</option>
            <option value="producer">Producer</option>
            {isSuper && <option value="agency_owner">Agency Owner</option>}
            {isSuper && <option value="super_admin">Super Admin</option>}
          </Select>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            They'll be created with the temporary password <span className="font-mono">password123</span>.
          </p>
          <Button className="w-full" onClick={invite} disabled={saving}>{saving ? "Inviting…" : "Send invite"}</Button>
        </div>
      </Modal>
    </div>
  );
}
