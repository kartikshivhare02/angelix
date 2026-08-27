import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types";

interface Props {
  product?: Product | null;
}

export function FeaturedFragrance({ product }: Props) {
  if (!product) return null;

  const notesList = [
    ...(product.top_notes ?? []),
    ...(product.middle_notes ?? []),
    ...(product.base_notes ?? []),
  ].slice(0, 3);

  return (
    <section
      style={{
        background: "var(--color-cream)",
        padding: "0",
      }}
    >
      <div
        className="featured-two-col"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: "600px",
        }}
      >
        {/* Image */}
        <div style={{ position: "relative", minHeight: "500px", background: "#eaeaea" }}>
          {product.main_image_url ? (
            <Image
              src={product.main_image_url}
              alt={`${product.name} — Featured Fragrance`}
              fill
              unoptimized
              sizes="50vw"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#bbb", fontFamily: "var(--font-serif)", fontSize: "2rem" }}>
              {product.name}
            </div>
          )}
        </div>

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "5rem 4rem",
          }}
        >
          <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
            Featured Fragrance
          </p>
          <h2
            className="heading-editorial"
            style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", marginBottom: "1.5rem" }}
          >
            {product.name}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1rem",
              color: "var(--color-text-muted)",
              lineHeight: 1.7,
              marginBottom: "2rem",
              maxWidth: "380px",
            }}
          >
            {product.short_description || product.full_description || "An exquisite olfactory creation crafted with precision and passion."}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "2.5rem" }}>
            {notesList.length > 0 && (
              <p className="label-caps" style={{ color: "var(--color-text-muted)" }}>
                {notesList.join(" · ")}
              </p>
            )}
            <p className="label-caps" style={{ color: "var(--color-text-muted)" }}>
              {product.concentration} · {product.volume_ml}ml
            </p>
            {product.gender && (
              <p className="label-caps" style={{ color: "var(--color-text-muted)" }}>
                {product.gender}
              </p>
            )}
          </div>
          <Link href={`/product/${product.slug}`} className="btn-primary" style={{ alignSelf: "flex-start" }}>
            Explore {product.name}
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .featured-two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

