import { OrderStatus } from "@/lib/types";

/** Format price in INR */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Generate ANGLELIX order number from sequential ID */
export function formatOrderNumber(id: number): string {
  const year = new Date().getFullYear();
  return `ANG-${year}-${String(id).padStart(6, "0")}`;
}

/** Generate random ANGLELIX order number */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomStr = Math.floor(100000 + Math.random() * 900000);
  return `ANG-${year}-${randomStr}`;
}

/**
 * Check whether a product, category, or item represents a Solid formulation (Solid Perfume, Wax, Balm, Butter).
 */
export function isSolidProduct(productOrCategory?: any): boolean {
  if (!productOrCategory) return false;

  if (typeof productOrCategory === "string") {
    const s = productOrCategory.toLowerCase();
    return s.includes("solid") || s.includes("wax") || s.includes("balm") || s.includes("butter") || s.includes("gram") || s.includes("gm");
  }

  const categoryStr = typeof productOrCategory.category === "string"
    ? productOrCategory.category
    : productOrCategory.category?.name || productOrCategory.category?.slug || productOrCategory.category_name || "";

  const concentration = productOrCategory.concentration || "";
  const name = productOrCategory.name || productOrCategory.product_name || "";
  const unit = productOrCategory.unit || "";
  const slug = productOrCategory.slug || productOrCategory.product_slug || "";

  const combined = `${categoryStr} ${concentration} ${name} ${unit} ${slug}`.toLowerCase();

  return (
    combined.includes("solid") ||
    combined.includes("wax") ||
    combined.includes("balm") ||
    combined.includes("butter") ||
    combined.includes("gram") ||
    combined.includes(" gm") ||
    combined.endsWith("g")
  );
}

/**
 * Get unit string ('g' for solids, 'ml' for liquids/sprays)
 */
export function getProductUnit(productOrCategory?: any): "g" | "ml" {
  return isSolidProduct(productOrCategory) ? "g" : "ml";
}

/**
 * Format size with correct unit (e.g. "100g" for solid perfumes, "100ml" for liquids)
 */
export function formatProductSize(size: number | string | null | undefined, productOrCategory?: any): string {
  const num = Number(size) || 100;
  const unit = getProductUnit(productOrCategory);
  return `${num}${unit}`;
}

/** Get human-readable order status label */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending:           "Order Placed",
  confirmed:         "Payment Confirmed",
  processing:        "Processing",
  packed:            "Packed",
  shipped:           "Shipped",
  out_for_delivery:  "Out for Delivery",
  delivered:         "Delivered",
  cancelled:         "Cancelled",
  refunded:          "Refunded",
};

/** Get ordered list of active status steps for the timeline */
export const ORDER_STATUS_STEPS: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

/** Truncate text to a max length */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}

/** Slugify a string */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/** Check if a banner/promo is currently active */
export function isActiveNow(
  isActive: boolean,
  startDate: string | null,
  endDate: string | null
): boolean {
  if (!isActive) return false;
  const now = new Date();
  if (startDate && new Date(startDate) > now) return false;
  if (endDate && new Date(endDate) < now) return false;
  return true;
}

/** Compute discounted price */
export function computeDiscountedPrice(
  originalPrice: number,
  salePrice: number | null
): { price: number; discountPercent: number | null } {
  if (!salePrice || salePrice >= originalPrice) {
    return { price: originalPrice, discountPercent: null };
  }
  const discountPercent = Math.round(
    ((originalPrice - salePrice) / originalPrice) * 100
  );
  return { price: salePrice, discountPercent };
}
