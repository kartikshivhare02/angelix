import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const { email } = parsed.data;

  // If Supabase is not configured, return success silently
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
    return NextResponse.json({ success: true });
  }

  const supabase = await createClient();

  // Upsert to avoid duplicate constraint errors
  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert({ email, subscribed_at: new Date().toISOString(), is_active: true }, { onConflict: "email" });

  if (error) {
    console.error("[Newsletter] Upsert error:", error.message);
    return NextResponse.json({ error: "Could not subscribe. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
