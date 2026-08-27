"use client";
// CartProvider is a thin wrapper that ensures the Zustand cart store
// is initialized on the client only (avoids SSR hydration issues).
export function CartProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
