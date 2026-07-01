// client/src/layouts/AppLayout.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { ROLE_LABEL } from "@/lib/utils";
import { BrandMark } from "@/components/ui";

const NAV = {
  super_admin:  { path: "/super-admin", label: "Control Center" },
  agency_owner: { path: "/agency",      label: "Dashboard" },
  producer:     { path: "/producer",    label: "Dashboard" },
  telemarketer: { path: "/telemarketer",label: "Dashboard" },
};

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const nav = NAV[user?.role];

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      <aside className="w-64 flex-shrink-0 flex flex-col relative" style={{ background: "var(--surface)", borderRight: "1px solid var(--border-2)" }}>
        <div className="absolute top-0 inset-x-0 h-40 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% -20%, var(--lime-glow) 0%, transparent 70%)" }} />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid var(--border-2)" }}>
          <BrandMark size={40} />
          <div className="leading-none">
            <div className="font-display font-bold text-[15px] tracking-tight" style={{ color: "var(--text)" }}>Yield</div>
            <div className="font-display font-bold text-[15px] tracking-tight" style={{ color: "var(--lime-400)" }}>Transfers</div>
          </div>
        </div>

        {/* User */}
        <div className="relative z-10 px-5 py-4" style={{ borderBottom: "1px solid var(--border-2)" }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-xl font-display font-semibold text-sm"
              style={{ width: 38, height: 38, background: "var(--lime-glow)", color: "var(--lime-400)", border: "1px solid var(--border-2)" }}>
              {(user?.fullName || "U").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-medium text-sm truncate" style={{ color: "var(--text)" }}>{user?.fullName}</div>
              <div className="text-xs font-medium" style={{ color: "var(--lime-400)" }}>{ROLE_LABEL[user?.role]}</div>
            </div>
          </div>
          {user?.agencyName && (
            <div className="text-xs mt-2 truncate font-mono" style={{ color: "var(--text-muted)" }}>{user.agencyName}</div>
          )}
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex-1 px-3 py-4">
          {nav && (
            <Link to={nav.path} style={{ textDecoration: "none" }}>
              <div className={`nav-item ${location.pathname.startsWith(nav.path) ? "active" : ""}`}>
                <LayoutDashboard size={18} />
                <span className="flex-1">{nav.label}</span>
                {location.pathname.startsWith(nav.path) && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
              </div>
            </Link>
          )}
        </nav>

        <div className="relative z-10 px-3 pb-5">
          <div className="text-xs px-3 mb-2 font-mono" style={{ color: "var(--text-muted)" }}>v1.0</div>
          <button onClick={handleLogout} className="nav-item w-full">
            <LogOut size={16} /><span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto grid-bg">{children}</main>
    </div>
  );
}
