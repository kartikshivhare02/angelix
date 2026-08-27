"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  email: z.string().email(),
  phone: z.string().min(10, "Enter valid phone number"),
  password: z.string().min(8, "Minimum 8 characters"),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: values.email.trim().toLowerCase(),
        password: values.password,
        options: {
          data: {
            first_name: values.first_name.trim(),
            last_name: values.last_name.trim(),
            phone: values.phone.trim(),
          },
        },
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      // Upsert profile record with auth_user_id
      if (data.user) {
        await supabase.from("profiles").upsert(
          {
            auth_user_id: data.user.id,
            first_name: values.first_name.trim(),
            last_name: values.last_name.trim(),
            email: values.email.trim().toLowerCase(),
            phone: values.phone.trim(),
            role: "customer",
          },
          { onConflict: "auth_user_id" }
        );
      }

      if (data.session) {
        toast.success("Account created! Welcome to ANGLELIX.");
        router.push("/account");
      } else {
        toast.success("Account created! You can now sign in.");
        router.push("/login");
      }
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ id, label, error, type = "text" }: any) => (
    <div>
      <label htmlFor={id} className="label-caps" style={{ color: "var(--color-text-muted)", display: "block", marginBottom: "0.4rem" }}>{label}</label>
      <input id={id} type={type} className="input-base" {...register(id)} />
      {error && <p style={{ fontSize: "0.72rem", color: "#c0392b", marginTop: "0.3rem" }}>{String(error)}</p>}
    </div>
  );

  return (
    <div className="container-site section-py" style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: "480px" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Join ANGLELIX</p>
          <h1 className="heading-editorial" style={{ fontSize: "2rem" }}>Create Account</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Field id="first_name" label="First Name" error={errors.first_name?.message} />
            <Field id="last_name" label="Last Name" error={errors.last_name?.message} />
          </div>
          <Field id="email" label="Email" type="email" error={errors.email?.message} />
          <Field id="phone" label="Phone Number" type="tel" error={errors.phone?.message} />
          <Field id="password" label="Password" type="password" error={errors.password?.message} />
          <Field id="confirm_password" label="Confirm Password" type="password" error={errors.confirm_password?.message} />

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-text-muted)", textAlign: "center", marginTop: "1.5rem" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--color-text)", fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
