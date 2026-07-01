// client/src/components/PageHeader.jsx
export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="font-display font-bold tracking-tight" style={{ color: "var(--text)", fontSize: "clamp(1.5rem,3vw,2rem)" }}>
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-sm" style={{ color: "var(--text-3)" }}>{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </div>
  );
}
