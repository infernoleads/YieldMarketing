// client/src/pages/BookAppointment.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, CalendarDays, Mail, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { appointmentsApi } from "@/api";
import { BrandMark, Button, Input, Textarea } from "@/components/ui";

// Your Google booking calendar. Baked in as the default so it always shows;
// override with VITE_BOOKING_CALENDAR_URL if you ever change it.
const DEFAULT_CALENDAR = "https://calendar.app.google/XJZhDDoikmXdwb56A";
const CALENDAR_URL = import.meta.env.VITE_BOOKING_CALENDAR_URL || DEFAULT_CALENDAR;
// Google's embeddable view needs ?gv=true appended.
const CALENDAR_EMBED = CALENDAR_URL.includes("?") ? CALENDAR_URL : `${CALENDAR_URL}?gv=true`;

export default function BookAppointment() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) { toast.error("Name and email are required."); return; }
    setSubmitting(true);
    try {
      await appointmentsApi.create(form);
      setDone(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid-bg" style={{ background: "var(--bg)" }}>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm mb-8" style={{ color: "var(--text-3)" }}>
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div className="flex items-center gap-2.5 mb-3">
          <BrandMark size={38} />
          <span className="font-display font-bold text-lg" style={{ color: "var(--text)" }}>Yield Transfers</span>
        </div>
        <h1 className="font-display font-bold tracking-tight mb-2" style={{ color: "var(--text)", fontSize: "clamp(1.8rem,4vw,2.6rem)" }}>
          Book an appointment
        </h1>
        <p className="text-sm mb-10 max-w-xl" style={{ color: "var(--text-2)" }}>
          Grab a time that works for you and we'll map out a transfer plan for your agency.
        </p>

        {/* Live booking calendar */}
        <div className="card overflow-hidden mb-4">
          <div className="px-5 py-3 flex items-center justify-between gap-2" style={{ borderBottom: "1px solid var(--border-2)" }}>
            <span className="flex items-center gap-2 font-display font-semibold text-sm" style={{ color: "var(--text)" }}>
              <CalendarDays size={16} style={{ color: "var(--lime-400)" }} /> Pick a time
            </span>
            <a href={CALENDAR_URL} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
              Open calendar <ExternalLink size={13} />
            </a>
          </div>
          <iframe
            title="Booking calendar"
            src={CALENDAR_EMBED}
            style={{ width: "100%", height: 700, border: "none", background: "#fff" }}
            loading="lazy"
          />
        </div>
        <p className="text-xs mb-12" style={{ color: "var(--text-muted)" }}>
          Calendar not loading?{" "}
          <a href={CALENDAR_URL} target="_blank" rel="noreferrer" style={{ color: "var(--lime-400)" }}>
            Open it in a new tab
          </a>.
        </p>

        {/* Message form (alternative) */}
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-4">
            <Mail size={16} style={{ color: "var(--lime-400)" }} />
            <h2 className="font-display font-semibold" style={{ color: "var(--text)" }}>Prefer we reach out? Send a message</h2>
          </div>

          {done ? (
            <div className="card p-10 text-center fade-in">
              <div className="mx-auto flex items-center justify-center rounded-2xl mb-5" style={{ width: 56, height: 56, background: "var(--lime-500)" }}>
                <Check size={30} style={{ color: "var(--ink)" }} />
              </div>
              <h3 className="font-display font-bold text-2xl" style={{ color: "var(--text)" }}>Request received</h3>
              <p className="mt-3 text-sm" style={{ color: "var(--text-2)" }}>
                Thanks, {form.name.split(" ")[0]}. Check your inbox for a confirmation — our team will follow up within one business day.
              </p>
              <Link to="/" className="btn btn-ghost mt-7">Back to home</Link>
            </div>
          ) : (
            <div className="card p-8 fade-in">
              <form onSubmit={submit} className="space-y-4">
                <Input label="Full name *" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Jane Doe" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Email *" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@agency.com" />
                  <Input label="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="555-0100" />
                </div>
                <Input label="Agency name" value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Summit Insurance" />
                <Textarea label="What are you looking for?" rows={4} value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="How many seats, current volume, goals…" />
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Sending…" : "Request my call"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
