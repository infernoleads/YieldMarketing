// client/src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth, roleHome } from "@/lib/AuthContext";
import { BrandMark, Button, Input, Select } from "@/components/ui";

const DEMO = [
  { label: "Super Admin", email: "superadmin@yieldtransfers.com" },
  { label: "Agency Owner", email: "owner@yieldtransfers.com" },
  { label: "Producer", email: "producer@yieldtransfers.com" },
  { label: "Telemarketer", email: "telemarketer@yieldtransfers.com" },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, user } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", fullName: "", role: "agency_owner", agencyName: "" });
  const [loading, setLoading] = useState(false);

  if (user) { navigate(roleHome(user.role), { replace: true }); return null; }
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = mode === "login"
        ? await login(form.email, form.password)
        : await register(form);
      toast.success(`Welcome, ${u.fullName.split(" ")[0]}`);
      const dest = location.state?.from && location.state.from !== "/login" ? location.state.from : roleHome(u.role);
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (email) => setForm((f) => ({ ...f, email, password: "password123" }));

  return (
    <div className="min-h-screen flex items-center justify-center grid-bg px-6" style={{ background: "var(--bg)" }}>
      <div className="absolute inset-x-0 top-0 h-96 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, var(--lime-glow) 0%, transparent 60%)" }} />
      <div className="relative w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm mb-6" style={{ color: "var(--text-3)" }}>
          <ArrowLeft size={16} /> Home
        </Link>

        <div className="card p-8 fade-in">
          <div className="flex items-center gap-2.5 mb-6">
            <BrandMark size={38} />
            <span className="font-display font-bold text-lg" style={{ color: "var(--text)" }}>Yield Transfers</span>
          </div>

          <h1 className="font-display font-bold text-2xl" style={{ color: "var(--text)" }}>
            {mode === "login" ? "Sign in" : "Create your account"}
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: "var(--text-3)" }}>
            {mode === "login" ? "Welcome back. Enter your details." : "Set up your agency in seconds."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "register" && (
              <>
                <Input label="Full name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Jane Doe" />
                <Select label="Role" value={form.role} onChange={(e) => set("role", e.target.value)}>
                  <option value="agency_owner">Agency Owner</option>
                  <option value="producer">Producer</option>
                  <option value="telemarketer">Telemarketer</option>
                </Select>
                {form.role === "agency_owner" && (
                  <Input label="Agency name" value={form.agencyName} onChange={(e) => set("agencyName", e.target.value)} placeholder="Summit Insurance Group" />
                )}
              </>
            )}
            <Input label="Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@agency.com" />
            <Input label="Password" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="mt-4 text-sm w-full text-center"
            style={{ color: "var(--text-3)" }}
          >
            {mode === "login" ? "No account? " : "Already have an account? "}
            <span style={{ color: "var(--lime-400)" }}>{mode === "login" ? "Create one" : "Sign in"}</span>
          </button>
        </div>

        {mode === "login" && (
          <div className="card p-4 mt-4 fade-in">
            <div className="text-xs uppercase tracking-wide font-semibold mb-2.5" style={{ color: "var(--text-muted)" }}>
              Demo accounts (password: password123)
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO.map((d) => (
                <button key={d.email} onClick={() => quickFill(d.email)}
                  className="text-left px-3 py-2 rounded-lg text-xs transition-all"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border-2)", color: "var(--text-2)" }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
