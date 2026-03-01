"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  giftWrapping: boolean;
  giftNote: string;
  rushProcessing: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  setGiftWrapping: (enabled: boolean) => void;
  setGiftNote: (note: string) => void;
  setRushProcessing: (enabled: boolean) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      giftWrapping: false,
      giftNote: "",
      rushProcessing: false,

      addItem: (item) =>
        set((state) => ({ items: [...state.items, item] })),

      removeItem: (itemId) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== itemId) })),

      updateQuantity: (itemId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId ? { ...i, quantity: Math.max(1, quantity) } : i
          ),
        })),

      setGiftWrapping: (enabled) => set({ giftWrapping: enabled }),
      setGiftNote: (note) => set({ giftNote: note }),
      setRushProcessing: (enabled) => set({ rushProcessing: enabled }),

      clearCart: () =>
        set({
          items: [],
          giftWrapping: false,
          giftNote: "",
          rushProcessing: false,
        }),

      getSubtotal: () => {
        const state = get();
        const itemsTotal = state.items.reduce((sum, item) => sum + item.priceInCents * item.quantity, 0);
        const addOns = (state.giftWrapping ? 999 : 0) + (state.rushProcessing ? 1499 : 0);
        return itemsTotal + addOns;
      },

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "crown-canvas-cart",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
    }
  )
);
