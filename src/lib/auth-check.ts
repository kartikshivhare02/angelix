import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

/**
 * Checks if a customer is logged in. If not, prompts and redirects to /login.
 * Returns true if authenticated, false if redirecting.
 */
export async function checkAuthOrRedirect(customRedirectPath?: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    toast.info("Please sign in to add items to your shopping bag.");
    const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
    const target = customRedirectPath || currentPath;
    window.location.href = `/login?redirect=${encodeURIComponent(target)}`;
    return false;
  }

  return true;
}

