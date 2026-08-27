import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password, first_name, last_name, phone } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const adminClient = await createAdminClient();

    // Create user programmatically with email_confirm: true so no rate-limited email is sent
    const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: first_name?.trim() || "",
        last_name: last_name?.trim() || "",
        phone: phone?.trim() || "",
      },
    });

    if (createError) {
      // Check if user already exists
      if (createError.message.includes("already registered") || createError.message.includes("already exists")) {
        return NextResponse.json({ error: "An account with this email already exists. Please sign in." }, { status: 409 });
      }
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // Upsert profile record
    if (userData.user) {
      await adminClient.from("profiles").upsert(
        {
          auth_user_id: userData.user.id,
          first_name: first_name?.trim() || "",
          last_name: last_name?.trim() || "",
          email: cleanEmail,
          phone: phone?.trim() || "",
          role: "customer",
        },
        { onConflict: "auth_user_id" }
      );
    }

    return NextResponse.json({ success: true, user: userData.user });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to register account." }, { status: 500 });
  }
}
