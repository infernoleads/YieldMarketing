// client/src/pages/Landing.jsx
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowUpRight, PhoneCall, Users, BarChart3, ShieldCheck, Check, MessageSquare, ListChecks } from "lucide-react";
import { useAuth, roleHome } from "@/lib/AuthContext";
import { BrandMark, Button } from "@/components/ui";

const STATS = [
  { value: "3.2x", label: "Avg. pipeline lift" },
  { value: "40hrs", label: "Saved per agent / month" },
  { value: "24/7", label: "Transfer coverage" },
  { value: "98%", label: "Client retention" },
];

const FEATURES = [
  { icon: PhoneCall, title: "Live transfers", body: "Vetted telemarketers dial, qualify, and warm-transfer prospects straight to your producers." },
  { icon: ListChecks, title: "Lead pipeline", body: "Every lead flows through a clean New → Contacted → Quoted → Sold pipeline your whole team can see." },
  { icon: Users, title: "Team management", body: "Owners invite producers and telemarketers, assign work, and track who's online in real time." },
  { icon: MessageSquare, title: "Built-in messaging", body: "Coordinate on leads without leaving the app — no more scattered texts and group chats." },
  { icon: BarChart3, title: "Performance reports", body: "Conversion rates, telemarketer scorecards, and status breakdowns — scheduled to any inbox." },
  { icon: ShieldCheck, title: "Role-based access", body: "Super admin, agency owner, producer, telemarketer. Everyone sees exactly what they should." },
];

const PLANS = [
  {
    name: "1 Telemarketer", price: "699", featured: false,
    perks: ["1 dedicated telemarketer", "Live warm transfers", "Full lead pipeline", "Team messaging", "Standard reporting"],
  },
  {
    name: "2 Telemarketers", price: "1,249", featured: true,
    perks: ["2 dedicated telemarketers", "Everything in the 1-seat plan", "Priority transfer routing", "Advanced reporting", "Scheduled report delivery"],
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  useEffect(() => { if (user) navigate(roleHome(user.role), { replace: true }); }, [user, navigate]);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Nav */}
      <header className="sticky top-0 z-40" style={{ background: "rgba(10,13,7,.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border-2)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandMark size={34} />
            <span className="font-display font-bold text-[15px]" style={{ color: "var(--text)" }}>Yield Transfers</span>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm" style={{ color: "var(--text-2)" }}>
            <a href="#platform" className="hover:text-white transition-colors">Platform</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link to="/book-appointment" className="hover:text-white transition-colors" style={{ color: "var(--text-2)" }}>Book a call</Link>
          </nav>
          <div className="flex items-center gap-2.5">
            <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
            <Link to="/book-appointment" className="btn btn-primary btn-sm">Get started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden grid-bg">
        <div className="absolute inset-x-0 top-0 h-[520px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, var(--lime-glow) 0%, transparent 60%)" }} />
        <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-7 fade-in"
            style={{ border: "1px solid var(--border-hi)", background: "var(--lime-glow)", color: "var(--lime-400)", fontSize: 13 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--lime-400)" }} />
            Telemarketing built for insurance agencies
          </div>
          <h1 className="font-display font-bold tracking-tight fade-in" style={{ color: "var(--text)", fontSize: "clamp(2.4rem, 6vw, 4.2rem)", lineHeight: 1.05 }}>
            Turn cold lists into<br />
            <span style={{ color: "var(--lime-400)" }}>warm transfers.</span>
          </h1>
          <p className="mt-6 text-lg max-w-2xl mx-auto fade-in" style={{ color: "var(--text-2)" }}>
            Yield Transfers gives your agency dedicated telemarketers, a live lead pipeline, and the reporting to prove
            it's working — all in one platform you actually own.
          </p>
          <div className="mt-9 flex items-center justify-center gap-3 flex-wrap fade-in">
            <Link to="/book-appointment" className="btn btn-primary">Book an appointment <ArrowUpRight size={17} /></Link>
            <a href="#pricing" className="btn btn-ghost">See pricing</a>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative max-w-5xl mx-auto px-6 pb-16">
          <div className="card grid grid-cols-2 md:grid-cols-4 divide-x" style={{ borderColor: "var(--border-2)" }}>
            {STATS.map((s) => (
              <div key={s.label} className="p-6 text-center" style={{ borderColor: "var(--border)" }}>
                <div className="font-display font-bold text-3xl" style={{ color: "var(--lime-400)" }}>{s.value}</div>
                <div className="text-xs mt-1.5 uppercase tracking-wide" style={{ color: "var(--text-3)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform / features */}
      <section id="platform" className="max-w-6xl mx-auto px-6 py-24">
        <div className="max-w-2xl">
          <div className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: "var(--lime-500)" }}>The platform</div>
          <h2 className="font-display font-bold tracking-tight" style={{ color: "var(--text)", fontSize: "clamp(1.8rem,4vw,2.6rem)" }}>
            Everything your agency needs to run transfers
          </h2>
          <p className="mt-4 text-base" style={{ color: "var(--text-2)" }}>
            One workspace for owners, producers, and telemarketers — instead of five disconnected tools.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {FEATURES.map((f) => (
            <div key={f.title} className="card card-hover p-6">
              <div className="flex items-center justify-center rounded-xl mb-4"
                style={{ width: 44, height: 44, background: "var(--lime-glow)", border: "1px solid var(--border-2)" }}>
                <f.icon size={20} style={{ color: "var(--lime-400)" }} />
              </div>
              <h3 className="font-display font-semibold text-lg" style={{ color: "var(--text)" }}>{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <div className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: "var(--lime-500)" }}>Pricing</div>
          <h2 className="font-display font-bold tracking-tight" style={{ color: "var(--text)", fontSize: "clamp(1.8rem,4vw,2.6rem)" }}>
            Simple, per-seat pricing
          </h2>
          <p className="mt-4" style={{ color: "var(--text-2)" }}>No setup fees. Cancel anytime. Scale a seat up or down as you grow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-3xl mx-auto">
          {PLANS.map((p) => (
            <div key={p.name} className="card p-8 relative"
              style={p.featured ? { borderColor: "var(--border-hi)", boxShadow: "var(--shadow-lime)" } : {}}>
              {p.featured && (
                <div className="absolute -top-3 left-8 px-3 py-1 rounded-full text-xs font-semibold font-display"
                  style={{ background: "var(--lime-500)", color: "var(--ink)" }}>Most popular</div>
              )}
              <h3 className="font-display font-semibold text-lg" style={{ color: "var(--text)" }}>{p.name}</h3>
              <div className="mt-4 flex items-end gap-1">
                <span className="font-display font-bold text-5xl" style={{ color: "var(--text)" }}>${p.price}</span>
                <span className="mb-1.5 text-sm" style={{ color: "var(--text-3)" }}>/month</span>
              </div>
              <ul className="mt-6 space-y-3">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-2)" }}>
                    <Check size={17} style={{ color: "var(--lime-400)", flexShrink: 0, marginTop: 1 }} /> {perk}
                  </li>
                ))}
              </ul>
              <Link to="/book-appointment" className={`btn ${p.featured ? "btn-primary" : "btn-ghost"} w-full mt-8`}>
                Get started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="card p-12 text-center relative overflow-hidden" style={{ borderColor: "var(--border-hi)" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 120%, var(--lime-glow) 0%, transparent 60%)" }} />
          <h2 className="relative font-display font-bold tracking-tight" style={{ color: "var(--text)", fontSize: "clamp(1.8rem,4vw,2.6rem)" }}>
            Ready to fill your pipeline?
          </h2>
          <p className="relative mt-4 max-w-lg mx-auto" style={{ color: "var(--text-2)" }}>
            Book a 20-minute call and we'll map out a transfer plan for your agency.
          </p>
          <Link to="/book-appointment" className="btn btn-primary mt-8 relative">Book an appointment <ArrowUpRight size={17} /></Link>
        </div>
      </section>

      <footer className="border-t" style={{ borderColor: "var(--border-2)" }}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BrandMark size={28} />
            <span className="font-display font-semibold text-sm" style={{ color: "var(--text-2)" }}>Yield Transfers</span>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>© {new Date().getFullYear()} Yield Transfers. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
