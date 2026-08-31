"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters"),
});

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || searchParams.get("next") || "/account";
  const errorParam = searchParams.get("error");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (errorParam === "auth_failed") {
      toast.error("Google authentication could not be completed. Please try again.");
    }
  }, [errorParam]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(redirectParam)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        toast.error(error.message || "Failed to initialize Google login.");
        setGoogleLoading(false);
      }
    } catch (err: any) {
      toast.error(err?.message || "Google sign-in encountered an issue.");
      setGoogleLoading(false);
    }
  };

  const onSubmit = async (values: any) => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email.trim().toLowerCase(),
      password: values.password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Welcome back to ANGLELIX!");

    if (redirectParam) {
      router.push(redirectParam);
    } else {
      router.push("/account");
    }
    router.refresh();
  };

  return (
    <div className="container-site section-py" style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>
            Welcome Back
          </p>
          <h1 className="heading-editorial" style={{ fontSize: "2.2rem" }}>
            Sign In
          </h1>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.4rem" }}>
            Access your orders, saved addresses and preferences
          </p>
        </div>

        {/* Google OAuth Login Button */}
        <button
          type="button"
          disabled={googleLoading || loading}
          onClick={handleGoogleSignIn}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            padding: "0.85rem 1rem",
            background: "#ffffff",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.88rem",
            fontWeight: 600,
            cursor: googleLoading ? "wait" : "pointer",
            transition: "all 0.2s ease",
            borderRadius: "2px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--color-text)";
            e.currentTarget.style.background = "#fafafa";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.background = "#ffffff";
          }}
        >
          {googleLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Connecting with Google...</span>
            </>
          ) : (
            <>
              <GoogleIcon />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "1.75rem 0",
            gap: "1rem",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
            }}
          >
            Or with email
          </span>
          <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label htmlFor="email" className="label-caps" style={{ color: "var(--color-text-muted)", display: "block", marginBottom: "0.4rem" }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="input-base"
              {...register("email")}
            />
            {errors.email && (
              <p style={{ fontSize: "0.72rem", color: "#c0392b", marginTop: "0.3rem" }}>
                {String(errors.email.message)}
              </p>
            )}
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
              <label htmlFor="password" className="label-caps" style={{ color: "var(--color-text-muted)" }}>
                Password
              </label>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="input-base"
              {...register("password")}
            />
            {errors.password && (
              <p style={{ fontSize: "0.72rem", color: "#c0392b", marginTop: "0.3rem" }}>
                {String(errors.password.message)}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem", padding: "0.85rem" }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Loader2 size={16} className="animate-spin" /> Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-text-muted)", textAlign: "center", marginTop: "1.75rem" }}>
          New to ANGLELIX?{" "}
          <Link href="/register" style={{ color: "var(--color-text)", fontWeight: 600 }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container-site section-py" style={{ textAlign: "center", color: "var(--color-text-muted)" }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
