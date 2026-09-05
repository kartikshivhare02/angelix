"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, Lock, Mail, ArrowRight } from "lucide-react";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "/admin";
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormData) => {
    setLoading(true);
    const toastId = toast.loading("Authenticating administrative credentials...");

    try {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (authError || !authData.user) {
        toast.error(authError?.message || "Invalid credentials", { id: toastId });
        setLoading(false);
        return;
      }

      // Check admin status in admins table
      const { data: adminRecord } = await supabase
        .from("admins")
        .select("id, role")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      // Check profiles table fallback
      let isAuthorized = !!adminRecord;
      if (!isAuthorized) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .or(`auth_user_id.eq.${authData.user.id},id.eq.${authData.user.id}`)
          .maybeSingle();

        if (profile?.role === "admin" || profile?.role === "super_admin") {
          isAuthorized = true;
        }
      }

      if (!isAuthorized) {
        // Sign out unauthorized user
        await supabase.auth.signOut();
        toast.error("Access Denied: You do not have administrator permissions.", { id: toastId });
        setLoading(false);
        return;
      }

      toast.success("Authentication successful. Welcome, Administrator.", { id: toastId });
      router.push(redirectParam.startsWith("/admin") ? redirectParam : "/admin");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred", { id: toastId });
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at center, #1a1a1a 0%, #0d0d0d 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(22, 22, 22, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
          padding: "2.5rem 2rem",
          color: "#fff",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              margin: "0 auto 1rem",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
            }}
          >
            <ShieldCheck size={24} color="#e5e5e5" strokeWidth={1.75} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="ANGELIX" style={{ height: "40px", width: "auto", objectFit: "contain" }} />
          </div>
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255, 255, 255, 0.5)",
              marginBottom: "0.25rem",
            }}
          >
            Administrative Portal
          </p>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.75rem",
              fontWeight: 500,
              letterSpacing: "0.05em",
              color: "#fff",
            }}
          >
            ANGELIX Admin
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label
              htmlFor="admin-email"
              style={{
                display: "block",
                fontSize: "0.72rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(255, 255, 255, 0.7)",
                marginBottom: "0.4rem",
              }}
            >
              Admin Email
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                placeholder="admin@angelix.in"
                {...register("email")}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem 0.75rem 2.5rem",
                  background: "rgba(0, 0, 0, 0.4)",
                  border: errors.email ? "1px solid #ef4444" : "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#fff",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.88rem",
                  outline: "none",
                }}
              />
              <Mail
                size={16}
                style={{
                  position: "absolute",
                  left: "0.85rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(255, 255, 255, 0.4)",
                }}
              />
            </div>
            {errors.email && (
              <p style={{ fontSize: "0.72rem", color: "#f87171", marginTop: "0.3rem" }}>
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="admin-password"
              style={{
                display: "block",
                fontSize: "0.72rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(255, 255, 255, 0.7)",
                marginBottom: "0.4rem",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem 0.75rem 2.5rem",
                  background: "rgba(0, 0, 0, 0.4)",
                  border: errors.password ? "1px solid #ef4444" : "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#fff",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.88rem",
                  outline: "none",
                }}
              />
              <Lock
                size={16}
                style={{
                  position: "absolute",
                  left: "0.85rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(255, 255, 255, 0.4)",
                }}
              />
            </div>
            {errors.password && (
              <p style={{ fontSize: "0.72rem", color: "#f87171", marginTop: "0.3rem" }}>
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "0.5rem",
              padding: "0.85rem 1.5rem",
              background: "#fff",
              color: "#000",
              border: "none",
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              opacity: loading ? 0.7 : 1,
              transition: "background 0.2s ease, opacity 0.2s ease",
            }}
          >
            <span>{loading ? "Verifying..." : "Access Dashboard"}</span>
            {!loading && <ArrowRight size={15} />}
          </button>
        </form>

        <div
          style={{
            marginTop: "2rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            textAlign: "center",
          }}
        >
          <a
            href="/"
            style={{
              fontSize: "0.75rem",
              color: "rgba(255, 255, 255, 0.4)",
              textDecoration: "none",
              letterSpacing: "0.05em",
            }}
          >
            ← Return to ANGELIX Store
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#0d0d0d",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#666",
          }}
        >
          Loading portal...
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
