"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Plus, X, UserCheck } from "lucide-react";
import { toast } from "sonner";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCust, setNewCust] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    whatsapp_number: "",
    password: "",
  });

  const limit = 25;

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (query) params.set("query", query);
    fetch(`/api/admin/customers?${params}`)
      .then((r) => r.json())
      .then((d) => { setCustomers(d.customers ?? []); setTotal(d.total ?? 0); })
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, query]);

  const totalPages = Math.ceil(total / limit);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search);
    setPage(1);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.first_name.trim() || !newCust.email.trim()) {
      toast.error("First name and email are required.");
      return;
    }
    setCreating(true);
    const toastId = toast.loading("Creating customer account...");
    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCust),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error, { id: toastId });
        return;
      }
      toast.success("Customer created successfully!", { id: toastId });
      setModalOpen(false);
      setNewCust({ first_name: "", last_name: "", email: "", phone: "", whatsapp_number: "", password: "" });
      load();
    } catch {
      toast.error("Failed to create customer.", { id: toastId });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ padding: "2.5rem" }}>
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#999", letterSpacing: "0.06em", textTransform: "uppercase" }}>Admin</p>
          <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "1.75rem", fontWeight: 700, color: "#111", marginTop: "0.25rem" }}>Customers</h1>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "#999", marginTop: "0.25rem" }}>Manage registered customers and view purchase histories.</p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email..."
              className="input-base"
              style={{ width: "220px" }}
            />
            <button type="submit" className="btn-outline" style={{ padding: "0.6rem 1rem", fontSize: "0.78rem" }}>
              Search
            </button>
          </form>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 1.25rem" }}
          >
            <Plus size={15} /> Add Customer
          </button>
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #eee", overflowX: "auto" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "#999" }}>Loading...</div>
        ) : customers.length === 0 ? (
          <div style={{ padding: "4rem", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", color: "#ccc", marginBottom: "0.5rem" }}>No customers found</p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "#bbb" }}>Customers will appear here after they register or place orders.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9f9f9" }}>
                {["Customer", "Email", "Phone", "WhatsApp", "Joined", "Orders", "Lifetime Spend"].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontFamily: "var(--font-sans)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#999", borderBottom: "1px solid #eee", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c: any) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "0.9rem 1rem" }}>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 600, color: "#111" }}>
                      {c.first_name} {c.last_name}
                    </p>
                  </td>
                  <td style={{ padding: "0.9rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "#555" }}>
                    {c.email}
                  </td>
                  <td style={{ padding: "0.9rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "#555" }}>
                    {c.phone ?? "—"}
                  </td>
                  <td style={{ padding: "0.9rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "#555" }}>
                    {c.whatsapp_number ?? "—"}
                  </td>
                  <td style={{ padding: "0.9rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#999" }}>
                    {new Date(c.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td style={{ padding: "0.9rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 600, textAlign: "center" }}>
                    {c.order_count ?? 0}
                  </td>
                  <td style={{ padding: "0.9rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 600 }}>
                    {formatPrice(c.lifetime_spend ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: "0.5rem 1rem", background: page === 1 ? "#f5f5f5" : "#111", color: page === 1 ? "#ccc" : "#fff", border: "none", fontFamily: "var(--font-sans)", fontSize: "0.78rem", cursor: page === 1 ? "not-allowed" : "pointer" }}>Prev</button>
          <span style={{ padding: "0.5rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#666" }}>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: "0.5rem 1rem", background: page === totalPages ? "#f5f5f5" : "#111", color: page === totalPages ? "#ccc" : "#fff", border: "none", fontFamily: "var(--font-sans)", fontSize: "0.78rem", cursor: page === totalPages ? "not-allowed" : "pointer" }}>Next</button>
        </div>
      )}

      {/* ── Add Customer Modal ── */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => !creating && setModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              width: "min(520px, 96vw)",
              padding: "2rem",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <UserCheck size={20} color="#111" />
                <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "1.15rem", fontWeight: 700, color: "#111" }}>
                  Add New Customer
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                disabled={creating}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#999" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>First Name *</label>
                  <input
                    required
                    className="input-base"
                    value={newCust.first_name}
                    onChange={(e) => setNewCust({ ...newCust, first_name: e.target.value })}
                    placeholder="e.g. Rahul"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input
                    className="input-base"
                    value={newCust.last_name}
                    onChange={(e) => setNewCust({ ...newCust, last_name: e.target.value })}
                    placeholder="e.g. Sharma"
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Email Address *</label>
                <input
                  required
                  type="email"
                  className="input-base"
                  value={newCust.email}
                  onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                  placeholder="rahul@example.com"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input
                    type="tel"
                    className="input-base"
                    value={newCust.phone}
                    onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div>
                  <label style={labelStyle}>WhatsApp Number</label>
                  <input
                    type="tel"
                    className="input-base"
                    value={newCust.whatsapp_number}
                    onChange={(e) => setNewCust({ ...newCust, whatsapp_number: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Temporary Password (Optional)</label>
                <input
                  type="password"
                  className="input-base"
                  value={newCust.password}
                  onChange={(e) => setNewCust({ ...newCust, password: e.target.value })}
                  placeholder="Leave blank to auto-generate"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={creating}
                  style={{
                    padding: "0.65rem 1.25rem",
                    background: "none",
                    border: "1px solid #ddd",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary"
                  style={{ opacity: creating ? 0.7 : 1 }}
                >
                  {creating ? "Creating..." : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-sans)",
  fontSize: "0.72rem",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#999",
  marginBottom: "0.4rem",
};

