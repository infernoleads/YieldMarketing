// client/src/components/LeadForm.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import { Input, Textarea, Select, Button } from "./ui";
import { leadsApi } from "@/api";

const EMPTY = {
  name: "", phone: "", email: "", address: "",
  currentCarrier: "", yearsWithCarrier: "", accidentsClaims: false,
  homeOwnership: "", vehicleYear: "", vehicleMake: "", vehicleModel: "",
  telemarketerNotes: "",
};

export default function LeadForm({ onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("Name and phone are required.");
      return;
    }
    setSaving(true);
    try {
      const { lead } = await leadsApi.create({
        ...form,
        yearsWithCarrier: form.yearsWithCarrier ? Number(form.yearsWithCarrier) : null,
      });
      toast.success("Lead submitted.");
      setForm(EMPTY);
      onCreated?.(lead);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Full name *" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Jane Doe" />
        <Input label="Phone *" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="555-0100" />
        <Input label="Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@example.com" />
        <Input label="Address" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="City, State" />
        <Input label="Current carrier" value={form.currentCarrier} onChange={(e) => set("currentCarrier", e.target.value)} placeholder="Geico" />
        <Input label="Years with carrier" type="number" value={form.yearsWithCarrier} onChange={(e) => set("yearsWithCarrier", e.target.value)} placeholder="3" />
        <Select label="Home ownership" value={form.homeOwnership} onChange={(e) => set("homeOwnership", e.target.value)}>
          <option value="">Select…</option>
          <option value="own">Own</option>
          <option value="rent">Rent</option>
        </Select>
        <div className="flex items-end pb-1.5">
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--text-2)" }}>
            <input type="checkbox" checked={form.accidentsClaims} onChange={(e) => set("accidentsClaims", e.target.checked)} />
            Accidents or claims
          </label>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input label="Vehicle year" value={form.vehicleYear} onChange={(e) => set("vehicleYear", e.target.value)} placeholder="2021" />
        <Input label="Make" value={form.vehicleMake} onChange={(e) => set("vehicleMake", e.target.value)} placeholder="Toyota" />
        <Input label="Model" value={form.vehicleModel} onChange={(e) => set("vehicleModel", e.target.value)} placeholder="Camry" />
      </div>

      <Textarea label="Notes" rows={3} value={form.telemarketerNotes} onChange={(e) => set("telemarketerNotes", e.target.value)} placeholder="Context for the agent…" />

      <Button type="submit" disabled={saving} className="w-full">
        {saving ? "Submitting…" : "Submit lead"}
      </Button>
    </form>
  );
}
