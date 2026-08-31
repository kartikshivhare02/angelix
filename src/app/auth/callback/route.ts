import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || searchParams.get("redirect") || "/account";

  // Prevent open redirect vulnerabilities by ensuring relative path
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && data.user) {
        const user = data.user;
        const userMeta = user.user_metadata || {};
        const fullName = (userMeta.full_name || userMeta.name || "").trim();
        const nameParts = fullName.split(" ");
        const firstName = (userMeta.first_name || nameParts[0] || "").trim();
        const lastName = (userMeta.last_name || nameParts.slice(1).join(" ") || "").trim();
        const email = (user.email || "").toLowerCase().trim();

        // Ensure user profile exists in profiles table
        try {
          const adminClient = await createAdminClient();
          await adminClient.from("profiles").upsert(
            {
              auth_user_id: user.id,
              email,
              first_name: firstName,
              last_name: lastName,
              role: "customer",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "auth_user_id" }
          );
        } catch (profileErr) {
          console.error("[Auth Callback] Profile sync warning:", profileErr);
        }

        // Return redirect to intended destination
        return NextResponse.redirect(`${origin}${safeNext}`);
      } else if (error) {
        console.error("[Auth Callback] exchangeCodeForSession error:", error);
      }
    } catch (err) {
      console.error("[Auth Callback] Fatal error:", err);
    }
  }

  // If code exchange failed or no code provided
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
