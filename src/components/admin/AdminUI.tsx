// Shared admin UI utility styles — used across admin pages
export const TH: React.CSSProperties = {
  padding: "0.6rem 1rem",
  textAlign: "left",
  fontFamily: "var(--font-sans)",
  fontSize: "0.68rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#999",
  background: "#f9f9f9",
  borderBottom: "1px solid #eee",
  whiteSpace: "nowrap",
};

export const TD: React.CSSProperties = {
  padding: "0.85rem 1rem",
  fontFamily: "var(--font-sans)",
  fontSize: "0.82rem",
  borderBottom: "1px solid #f5f5f5",
  verticalAlign: "middle",
};

export const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:          { bg: "#FFF8E1", color: "#F59E0B" },
  confirmed:        { bg: "#E8F5E9", color: "#27AE60" },
  processing:       { bg: "#E3F2FD", color: "#2196F3" },
  packed:           { bg: "#F3E5F5", color: "#9C27B0" },
  shipped:          { bg: "#E0F2F1", color: "#009688" },
  out_for_delivery: { bg: "#FFF3E0", color: "#FF9800" },
  delivered:        { bg: "#E8F5E9", color: "#27AE60" },
  cancelled:        { bg: "#FDECEA", color: "#E53935" },
  refunded:         { bg: "#FFF3E0", color: "#FF9800" },
  paid:             { bg: "#E8F5E9", color: "#27AE60" },
  failed:           { bg: "#FDECEA", color: "#E53935" },
};

export function Badge({ label, type = "neutral" }: { label: string; type?: string }) {
  const c = STATUS_COLORS[type] ?? { bg: "#f5f5f5", color: "#666" };
  return (
    <span style={{
      display: "inline-block",
      padding: "0.18rem 0.55rem",
      background: c.bg,
      color: c.color,
      fontFamily: "var(--font-sans)",
      fontSize: "0.68rem",
      fontWeight: 700,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      borderRadius: "2px",
    }}>
      {label}
    </span>
  );
}

export function AdminPageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
      <div>
        {subtitle && <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#999", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.25rem" }}>{subtitle}</p>}
        <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "1.5rem", fontWeight: 700, color: "#111" }}>{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function AdminCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #eee", ...style }}>
      {children}
    </div>
  );
}

export function AdminInput({ label, id, ...props }: { label: string; id: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      <label htmlFor={id} style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#666" }}>{label}</label>
      <input id={id} style={{ padding: "0.6rem 0.75rem", border: "1px solid #ddd", fontFamily: "var(--font-sans)", fontSize: "0.85rem", outline: "none", borderRadius: "2px", width: "100%" }} {...props} />
    </div>
  );
}

export function AdminSelect({ label, id, children, ...props }: { label: string; id: string; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      <label htmlFor={id} style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#666" }}>{label}</label>
      <select id={id} style={{ padding: "0.6rem 0.75rem", border: "1px solid #ddd", fontFamily: "var(--font-sans)", fontSize: "0.85rem", outline: "none", borderRadius: "2px", background: "#fff", cursor: "pointer" }} {...props}>
        {children}
      </select>
    </div>
  );
}

export function AdminTextarea({ label, id, ...props }: { label: string; id: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      <label htmlFor={id} style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#666" }}>{label}</label>
      <textarea id={id} style={{ padding: "0.6rem 0.75rem", border: "1px solid #ddd", fontFamily: "var(--font-sans)", fontSize: "0.85rem", outline: "none", borderRadius: "2px", resize: "vertical", minHeight: "100px" }} {...props} />
    </div>
  );
}

export function AdminBtn({ children, variant = "primary", ...props }: { children: React.ReactNode; variant?: "primary" | "outline" | "danger" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: "#111", color: "#fff", border: "1px solid #111" },
    outline: { background: "#fff", color: "#111", border: "1px solid #ddd" },
    danger:  { background: "#fff", color: "#e53935", border: "1px solid #e53935" },
  };
  return (
    <button
      style={{
        padding: "0.6rem 1.25rem",
        fontFamily: "var(--font-sans)",
        fontSize: "0.78rem",
        fontWeight: 600,
        letterSpacing: "0.06em",
        cursor: "pointer",
        borderRadius: "2px",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        transition: "opacity 0.15s",
        ...styles[variant],
        ...(props.disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}),
      }}
      {...props}
    >
      {children}
    </button>
  );
}
