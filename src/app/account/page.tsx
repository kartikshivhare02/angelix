"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Profile } from "@/lib/types";
import { User, Phone, Mail, Calendar, MessageCircle, ShieldCheck, ArrowRight } from "lucide-react";

const schema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  phone: z.string().min(10, "Enter valid phone").optional().or(z.literal("")),
  whatsapp_number: z.string().optional().or(z.literal("")),
  date_of_birth: z.string().optional().or(z.literal("")),
  marketing_consent: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const res = await fetch("/api/account/profile");
      if (res.ok) {
        const { profile: p, isAdmin: adminStatus } = await res.json();
        setProfile(p);
        if (adminStatus || p?.role === "admin" || p?.role === "super_admin") {
          setIsAdmin(true);
        }
        reset({
          first_name: p.first_name ?? "",
          last_name: p.last_name ?? "",
          phone: p.phone ?? "",
          whatsapp_number: p.whatsapp_number ?? "",
          date_of_birth: p.date_of_birth ?? "",
          marketing_consent: p.marketing_consent ?? false,
        });
      }
      setLoading(false);
    };
    init();
  }, [router, reset]);

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (data.error) {
      toast.error(data.error);
    } else {
      setProfile(data.profile);
      setEdit(false);
      toast.success("Profile updated");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: "56px", width: "100%" }} />
        ))}
      </div>
    );
  }

  const Field = ({ id, label, error, type = "text", readOnly = false }: { id: keyof FormValues; label: string; error?: string; type?: string; readOnly?: boolean }) => (
    <div>
      <label htmlFor={id} className="label-caps" style={{ color: "var(--color-text-muted)", display: "block", marginBottom: "0.4rem" }}>
        {label}
      </label>
      {edit && !readOnly ? (
        <>
          <input
            id={id}
            type={type}
            className="input-base"
            {...register(id as any)}
          />
          {error && <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#c0392b", marginTop: "0.25rem" }}>{error}</p>}
        </>
      ) : (
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--color-text)", padding: "0.75rem 0", borderBottom: "1px solid var(--color-border)" }}>
          {(profile as any)?.[id] || <span style={{ color: "var(--color-text-light)" }}>—</span>}
        </p>
      )}
    </div>
  );

  return (
    <div>
      {isAdmin && (
        <div
          style={{
            background: "#111",
            color: "#fff",
            padding: "1.5rem 1.75rem",
            marginBottom: "2rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            border: "1px solid #222",
            boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck size={22} color="#fff" />
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.04em", color: "#fff" }}>
                Administrator Access Detected
              </p>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "rgba(255,255,255,0.7)", marginTop: "0.15rem" }}>
                Manage orders, products, inventory, customers, coupons, and site settings.
              </p>
            </div>
          </div>
          <Link
            href="/admin"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#fff",
              color: "#111",
              padding: "0.65rem 1.25rem",
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              textDecoration: "none",
              transition: "opacity 0.2s",
            }}
            className="hover:opacity-90"
          >
            <span>Open Admin Dashboard</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: "48px", height: "48px",
            background: "var(--color-bg-soft)",
            border: "1px solid var(--color-border)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <User size={20} strokeWidth={1} />
          </div>
          <div>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: 400 }}>
              {profile?.first_name} {profile?.last_name}
            </p>
            <p className="label-caps" style={{ color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
              {profile?.role ?? "Customer"}
            </p>
          </div>
        </div>
        <button
          onClick={() => edit ? setEdit(false) : setEdit(true)}
          className={edit ? "btn-outline" : "btn-primary"}
          style={{ padding: "0.6rem 1.25rem", fontSize: "0.72rem" }}
        >
          {edit ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: "grid", gap: "1.5rem" }}>

          {/* Personal Info */}
          <section style={{ border: "1px solid var(--color-border)", padding: "1.75rem" }}>
            <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
              Personal Information
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              <Field id="first_name" label="First Name" error={errors.first_name?.message} />
              <Field id="last_name" label="Last Name" error={errors.last_name?.message} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginTop: "1.25rem" }}>
              <div>
                <label className="label-caps" style={{ color: "var(--color-text-muted)", display: "block", marginBottom: "0.4rem" }}>
                  Email
                </label>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--color-text)", padding: "0.75rem 0", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Mail size={14} strokeWidth={1.5} style={{ color: "var(--color-text-muted)" }} />
                  {profile?.email}
                </p>
              </div>
              <Field id="date_of_birth" label="Date of Birth" type="date" error={errors.date_of_birth?.message} />
            </div>
          </section>

          {/* Contact */}
          <section style={{ border: "1px solid var(--color-border)", padding: "1.75rem" }}>
            <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
              Contact Details
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              <div>
                <label className="label-caps" style={{ color: "var(--color-text-muted)", display: "block", marginBottom: "0.4rem" }}>
                  Phone
                </label>
                {edit ? (
                  <>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }}>
                        <Phone size={14} strokeWidth={1.5} style={{ color: "var(--color-text-muted)" }} />
                      </span>
                      <input id="phone" type="tel" className="input-base" style={{ paddingLeft: "2.5rem" }} {...register("phone")} />
                    </div>
                    {errors.phone && <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#c0392b", marginTop: "0.25rem" }}>{errors.phone.message}</p>}
                  </>
                ) : (
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", padding: "0.75rem 0", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Phone size={14} strokeWidth={1.5} style={{ color: "var(--color-text-muted)" }} />
                    {profile?.phone || <span style={{ color: "var(--color-text-light)" }}>—</span>}
                  </p>
                )}
              </div>
              <div>
                <label className="label-caps" style={{ color: "var(--color-text-muted)", display: "block", marginBottom: "0.4rem" }}>
                  WhatsApp Number
                </label>
                {edit ? (
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }}>
                      <MessageCircle size={14} strokeWidth={1.5} style={{ color: "var(--color-text-muted)" }} />
                    </span>
                    <input id="whatsapp_number" type="tel" className="input-base" style={{ paddingLeft: "2.5rem" }} {...register("whatsapp_number")} />
                  </div>
                ) : (
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", padding: "0.75rem 0", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <MessageCircle size={14} strokeWidth={1.5} style={{ color: "var(--color-text-muted)" }} />
                    {profile?.whatsapp_number || <span style={{ color: "var(--color-text-light)" }}>—</span>}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Preferences */}
          {edit && (
            <section style={{ border: "1px solid var(--color-border)", padding: "1.75rem" }}>
              <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
                Preferences
              </h2>
              <label style={{ display: "flex", alignItems: "center", gap: "0.65rem", cursor: "pointer" }}>
                <input type="checkbox" {...register("marketing_consent")} style={{ width: "16px", height: "16px" }} />
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                  Receive exclusive offers and fragrance updates via email
                </span>
              </label>
            </section>
          )}

          {edit && (
            <button type="submit" disabled={saving} className="btn-primary" style={{ alignSelf: "flex-start", minWidth: "160px", justifyContent: "center" }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
