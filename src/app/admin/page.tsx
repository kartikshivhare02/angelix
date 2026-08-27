import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

async function getDashboardStats() {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split("T")[0];

    const [
      { count: todayOrders },
      { data: revenue },
      { count: pendingOrders },
      { count: totalCustomers },
      { count: lowStock },
      { data: recentOrders },
    ] = await Promise.all([
      supabase.from("orders").select("id", { count: "exact" }).gte("created_at", `${today}T00:00:00`),
      supabase.from("orders").select("total_amount").eq("payment_status", "paid"),
      supabase.from("orders").select("id", { count: "exact" }).eq("status", "pending"),
      supabase.from("profiles").select("id", { count: "exact" }),
      supabase.from("products").select("id", { count: "exact" }).filter("stock_quantity", "lte", "low_stock_threshold"),
      supabase.from("orders").select("id, order_number, total_amount, status, created_at, shipping_first_name, shipping_last_name").order("created_at", { ascending: false }).limit(10),
    ]);

    const totalRevenue = revenue?.reduce((sum, o) => sum + (o.total_amount || 0), 0) ?? 0;

    return { todayOrders: todayOrders ?? 0, totalRevenue, pendingOrders: pendingOrders ?? 0, totalCustomers: totalCustomers ?? 0, lowStock: lowStock ?? 0, recentOrders: recentOrders ?? [] };
  } catch {
    return { todayOrders: 0, totalRevenue: 0, pendingOrders: 0, totalCustomers: 0, lowStock: 0, recentOrders: [] };
  }
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#f39c12", processing: "#2980b9", packed: "#8e44ad",
  shipped: "#16a085", delivered: "#27ae60", cancelled: "#c0392b", refunded: "#7f8c8d",
};

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const CARDS = [
    { label: "Today's Orders", value: stats.todayOrders, href: "/admin/orders" },
    { label: "Total Revenue", value: formatPrice(stats.totalRevenue), href: "/admin/orders" },
    { label: "Pending Orders", value: stats.pendingOrders, href: "/admin/orders?status=pending" },
    { label: "Total Customers", value: stats.totalCustomers, href: "/admin/customers" },
    { label: "Low Stock Items", value: stats.lowStock, href: "/admin/products" },
  ];

  return (
    <div style={{ padding: "2.5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#999", letterSpacing: "0.06em", textTransform: "uppercase" }}>Overview</p>
        <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "1.75rem", fontWeight: 700, color: "#111", marginTop: "0.25rem" }}>Dashboard</h1>
      </div>

      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
        {CARDS.map(({ label, value, href }) => (
          <Link
            key={label}
            href={href}
            style={{
              background: "#fff",
              border: "1px solid #eee",
              padding: "1.5rem",
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem",
              transition: "box-shadow 0.2s",
            }}
            className="hover:shadow-md"
          >
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#999", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "1.75rem", fontWeight: 700, color: "#111" }}>{value}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
        {[
          { label: "Add Product", href: "/admin/products/new" },
          { label: "View Orders", href: "/admin/orders" },
          { label: "Add Coupon", href: "/admin/coupons/new" },
          { label: "Edit Banners", href: "/admin/banners" },
        ].map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            style={{
              padding: "0.6rem 1.25rem",
              background: "#111",
              color: "#fff",
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              fontWeight: 500,
              letterSpacing: "0.06em",
              textDecoration: "none",
              transition: "opacity 0.2s",
            }}
            className="hover:opacity-80"
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div style={{ background: "#fff", border: "1px solid #eee" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", fontWeight: 700 }}>Recent Orders</h2>
          <Link href="/admin/orders" style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#999", textDecoration: "underline" }}>View all</Link>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9f9f9" }}>
                {["Order", "Customer", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#999", borderBottom: "1px solid #eee" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "#999" }}>No orders yet</td></tr>
              ) : (
                stats.recentOrders.map((order: any) => (
                  <tr key={order.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <Link href={`/admin/orders/${order.id}`} style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 600, color: "#111", textDecoration: "none" }}>#{order.order_number}</Link>
                    </td>
                    <td style={{ padding: "0.9rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.82rem" }}>{order.shipping_first_name} {order.shipping_last_name}</td>
                    <td style={{ padding: "0.9rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 600 }}>{formatPrice(order.total_amount)}</td>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <span style={{ padding: "0.2rem 0.6rem", background: STATUS_COLORS[order.status] + "20", color: STATUS_COLORS[order.status], fontFamily: "var(--font-sans)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.9rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "#999" }}>
                      {new Date(order.created_at).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
