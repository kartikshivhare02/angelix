import { createClient } from "@/lib/supabase/server";

export async function assertAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Check admins table
  const { data: adminData } = await supabase
    .from("admins")
    .select("id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminData) return user;

  // Fallback: check profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .or(`auth_user_id.eq.${user.id},id.eq.${user.id}`)
    .maybeSingle();

  if (profile?.role === "admin" || profile?.role === "super_admin") {
    // Auto-heal admin row
    await supabase
      .from("admins")
      .insert({ user_id: user.id, role: profile.role })
      .select()
      .maybeSingle();
    return user;
  }

  return null;
}
