import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

/**
 * Checks if a customer is logged in.
 * Checks client SDK first, then verifies with /api/auth/me for 100% server cookie reliability.
 * Returns true if authenticated, false if redirecting.
 */
export async function checkAuthOrRedirect(customRedirectPath?: string): Promise<boolean> {
  let user: any = null;

  // 1. Try browser client SDK
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;
  } catch {
    user = null;
  }

  // 2. Fallback to /api/auth/me for server cookie verification
  if (!user) {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      if (data?.authenticated && data?.user) {
        user = data.user;
      }
    } catch {
      user = null;
    }
  }

  if (!user) {
    toast.info("Please sign in to continue with your purchase.");
    const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
    const target = customRedirectPath || currentPath;
    window.location.href = `/login?redirect=${encodeURIComponent(target)}`;
    return false;
  }

  return true;
}

