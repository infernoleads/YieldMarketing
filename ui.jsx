// client/src/components/ui.jsx
// Lightweight, dependency-free UI primitives styled by index.css.
import { cn } from "@/lib/utils";
import { LEAD_STATUS } from "@/lib/utils";

export function Button({ variant = "primary", size, className, ...props }) {
  const v = { primary: "btn-primary", ghost: "btn-ghost", danger: "btn-danger" }[variant] || "btn-primary";
  return <button className={cn("btn", v, size === "sm" && "btn-sm", className)} {...props} />;
}

export function Card({ className, hover, ...props }) {
  return <div className={cn("card", hover && "card-hover", className)} {...props} />;
}

export function Input({ className, label, ...props }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <input className="input" {...props} />
    </div>
  );
}

export function Textarea({ className, label, ...props }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <textarea className="textarea" {...props} />
    </div>
  );
}

export function Select({ className, label, children, ...props }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <select className="select" {...props}>{children}</select>
    </div>
  );
}

export function StatusBadge({ status }) {
  const cfg = LEAD_STATUS[status] || { label: status, color: "#8a927c" };
  return (
    <span className="badge" style={{ color: cfg.color, background: `${cfg.color}1a`, border: `1px solid ${cfg.color}33` }}>
      {cfg.label}
    </span>
  );
}

export function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 fade-in">
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        border: "2.5px solid var(--surface-3)", borderTopColor: "var(--lime-500)",
        animation: "spin .7s linear infinite",
      }} />
      {label && <p className="text-sm" style={{ color: "var(--text-3)" }}>{label}</p>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 fade-in">
      {Icon && (
        <div className="mb-4 flex items-center justify-center" style={{
          width: 52, height: 52, borderRadius: 14,
          background: "var(--lime-glow)", border: "1px solid var(--border-2)",
        }}>
          <Icon size={24} style={{ color: "var(--lime-400)" }} />
        </div>
      )}
      <h3 className="font-display font-semibold text-base" style={{ color: "var(--text)" }}>{title}</h3>
      {children && <p className="mt-1.5 text-sm max-w-sm" style={{ color: "var(--text-3)" }}>{children}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 fade-in">
      <p className="text-sm" style={{ color: "#f87171" }}>{message || "Something went wrong."}</p>
      {onRetry && <Button variant="ghost" size="sm" className="mt-3" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(3px)" }}
      onClick={onClose}
    >
      <div
        className="card fade-in w-full"
        style={{ maxWidth: width, maxHeight: "90vh", overflow: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-2)" }}>
            <h2 className="font-display font-semibold text-lg" style={{ color: "var(--text)" }}>{title}</h2>
            <button onClick={onClose} className="text-2xl leading-none" style={{ color: "var(--text-3)" }}>×</button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: "var(--surface-2)", border: "1px solid var(--border-2)" }}>
      {tabs.map((t) => {
        const active = value === t.value;
        const Icon = t.icon;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
            style={{
              color: active ? "var(--ink)" : "var(--text-3)",
              background: active ? "var(--lime-500)" : "transparent",
              fontFamily: "var(--font-display)",
            }}
          >
            {Icon && <Icon size={15} />} {t.label}
          </button>
        );
      })}
    </div>
  );
}

// Brand mark: ascending transfer arrows in lime.
export function BrandMark({ size = 40 }) {
  return (
    <div className="flex items-center justify-center rounded-xl" style={{
      width: size, height: size,
      background: "linear-gradient(135deg, var(--lime-500), var(--lime-600))",
      boxShadow: "0 4px 16px rgba(163,230,53,.28)",
    }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17 L12 12 L17 17" />
        <path d="M7 12 L12 7 L17 12" opacity="0.55" />
      </svg>
    </div>
  );
}
