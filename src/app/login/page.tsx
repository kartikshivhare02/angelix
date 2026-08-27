"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Minimum 8 characters"),
});

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values: any) => {
    setLoading(true);
    const supabase = createClient();
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password });
    if (error) { toast.error(error.message); setLoading(false); return; }
    
    toast.success("Welcome back!");

    // If explicit redirect param exists, respect it
    if (redirectParam) {
      router.push(redirectParam);
      router.refresh();
      return;
    }

    router.push("/account");
    router.refresh();
  };

  return (
    <div className="container-site section-py" style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Welcome Back</p>
          <h1 className="heading-editorial" style={{ fontSize: "2rem" }}>Sign In</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label htmlFor="email" className="label-caps" style={{ color: "var(--color-text-muted)", display: "block", marginBottom: "0.4rem" }}>Email</label>
            <input id="email" type="email" className="input-base" {...register("email")} />
            {errors.email && <p style={{ fontSize: "0.72rem", color: "#c0392b", marginTop: "0.3rem" }}>{String(errors.email.message)}</p>}
          </div>
          <div>
            <label htmlFor="password" className="label-caps" style={{ color: "var(--color-text-muted)", display: "block", marginBottom: "0.4rem" }}>Password</label>
            <input id="password" type="password" className="input-base" {...register("password")} />
            {errors.password && <p style={{ fontSize: "0.72rem", color: "#c0392b", marginTop: "0.3rem" }}>{String(errors.password.message)}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-text-muted)", textAlign: "center", marginTop: "1.5rem" }}>
          New to ANGLELIX?{" "}
          <Link href="/register" style={{ color: "var(--color-text)", fontWeight: 600 }}>Create an account</Link>
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
