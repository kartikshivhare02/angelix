import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const { email } = parsed.data;

  // If Supabase is not configured, return success
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
    return NextResponse.json({ success: true });
  }

  try {
    let supabase;
    try {
      supabase = await createAdminClient();
    } catch {
      supabase = await createClient();
    }

    // Upsert to newsletter_subscribers using admin client (bypassing RLS)
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email, subscribed_at: new Date().toISOString(), is_active: true }, { onConflict: "email" });

    if (error) {
      console.warn("[Newsletter] DB upsert warning:", error.message);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.warn("[Newsletter] Exception:", err);
    return NextResponse.json({ success: true });
  }
}
