"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);

  useEffect(() => {
    if (errorParam === "auth_failed") {
      toast.error("Google authentication could not be completed. Please try again.");
    }
  }, [errorParam]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.replace(redirectParam);
      } else {
        setCheckingExisting(false);
      }
    });
  }, [redirectParam, router]);

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

  if (checkingExisting) {
    return (
      <div className="container-site section-py" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <Loader2 className="animate-spin" size={28} style={{ color: "var(--color-text-muted)" }} />
      </div>
    );
  }

  return (
    <div className="container-site section-py" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "var(--color-bg, #ffffff)",
          border: "1px solid var(--color-border, #e5e5e5)",
          padding: "2.5rem 2rem",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          textAlign: "center",
        }}
      >
        {/* Logo & Header */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.25rem" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ANGELIX" style={{ height: "48px", width: "auto", objectFit: "contain" }} />
        </div>
        <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "0.5rem", fontSize: "0.75rem", letterSpacing: "0.1em" }}>
          Welcome to ANGELIX
        </p>
        <h1 className="heading-editorial" style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
          Sign In
        </h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", color: "var(--color-text-muted)", marginBottom: "2rem", lineHeight: "1.5" }}>
          Access your orders, saved addresses, and exclusive luxury offers with 1-click Google Sign-In.
        </p>

        {/* Google OAuth Login Button */}
        <button
          type="button"
          disabled={googleLoading}
          onClick={handleGoogleSignIn}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.85rem",
            padding: "0.95rem 1.25rem",
            background: "#ffffff",
            border: "1.5px solid var(--color-border, #e2e8f0)",
            color: "var(--color-text, #1a202c)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.95rem",
            fontWeight: 600,
            cursor: googleLoading ? "wait" : "pointer",
            transition: "all 0.2s ease",
            borderRadius: "6px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#111111";
            e.currentTarget.style.background = "#fafafa";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border, #e2e8f0)";
            e.currentTarget.style.background = "#ffffff";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {googleLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              <GoogleIcon />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "1.75rem", lineHeight: "1.4" }}>
          By signing in, you agree to our Terms of Service & Privacy Policy. Fast, secure, and passwordless authentication.
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
