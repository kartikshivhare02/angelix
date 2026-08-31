"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem } from "@/lib/types";
import { toast } from "sonner";
import { formatProductSize } from "@/lib/utils";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (product_id: string, volume_ml?: number) => void;
  updateQuantity: (product_id: string, quantity: number, volume_ml?: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
  totalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (incoming) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.product_id === incoming.product_id && i.volume_ml === incoming.volume_ml
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product_id === incoming.product_id && i.volume_ml === incoming.volume_ml
                  ? { ...i, quantity: i.quantity + incoming.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, incoming] };
        });
        toast.success(`${incoming.name} added to cart`, {
          description: `${formatProductSize(incoming.volume_ml, incoming)} · ${incoming.concentration}`,
        });
        get().openCart();
      },

      removeItem: (product_id, volume_ml?: number) => {
        set((state) => ({
          items: state.items.filter((i) =>
            volume_ml !== undefined
              ? !(i.product_id === product_id && i.volume_ml === volume_ml)
              : i.product_id !== product_id
          ),
        }));
      },

      updateQuantity: (product_id, quantity, volume_ml?: number) => {
        if (quantity <= 0) {
          get().removeItem(product_id, volume_ml);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            (volume_ml !== undefined ? i.product_id === product_id && i.volume_ml === volume_ml : i.product_id === product_id)
              ? { ...i, quantity }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      openCart:   () => set({ isOpen: true }),
      closeCart:  () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal:   () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "anglelix-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
