"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cart-store";

export function useCart() {
  const [isHydrated, setIsHydrated] = useState(false);
  const store = useCartStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return {
    ...store,
    isHydrated,
    itemCount: isHydrated ? store.getItemCount() : 0,
    subtotal: isHydrated ? store.getSubtotal() : 0,
  };
}
