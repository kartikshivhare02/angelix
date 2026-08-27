import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { assertAdmin } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Bypass admin wrapper and checks for the admin login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const supabase = await createClient();
  const user = await assertAdmin(supabase);

  if (!user) {
    const { data: { user: rawUser } } = await supabase.auth.getUser();
    if (!rawUser) {
      redirect("/admin/login?redirect=/admin");
    } else {
      redirect("/admin/login?error=admin_access_required");
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8f8f8" }}>
      <AdminSidebar />
      <main style={{ flex: 1, overflow: "auto" }}>
        {children}
      </main>
    </div>
  );
}

