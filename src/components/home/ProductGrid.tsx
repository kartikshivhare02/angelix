import { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";

interface Props {
  products: Product[];
}

export function ProductGrid({ products }: Props) {
  if (products.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-text-muted)" }}>
        <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 300 }}>
          No fragrances found
        </p>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
          Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <style>{`
        .product-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        @media (min-width: 640px) {
          .product-grid { grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
        }
        @media (min-width: 900px) {
          .product-grid { grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        }
        @media (min-width: 1200px) {
          .product-grid { grid-template-columns: repeat(4, 1fr); gap: 2rem 1.5rem; }
        }
      `}</style>
    </>
  );
}
