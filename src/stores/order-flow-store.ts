"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { OrderFlowState, OrderStep } from "@/types";

interface OrderFlowActions {
  setPetName: (name: string) => void;
  setPetPhoto: (url: string) => void;
  setStyle: (styleId: string) => void;
  setTier: (tierId: string) => void;
  setSize: (sizeId: string) => void;
  setGiftWrapping: (enabled: boolean) => void;
  setGiftNote: (note: string) => void;
  setRushProcessing: (enabled: boolean) => void;
  goToStep: (step: OrderStep) => void;
  reset: () => void;
}

const initialState: OrderFlowState = {
  petName: "",
  petPhotoUrl: null,
  selectedStyleId: null,
  selectedTierId: null,
  selectedSizeId: null,
  giftWrapping: false,
  giftNote: "",
  rushProcessing: false,
  currentStep: "upload",
};

export const useOrderFlowStore = create<OrderFlowState & OrderFlowActions>()(
  persist(
    (set) => ({
      ...initialState,

      setPetName: (name) => set({ petName: name }),
      setPetPhoto: (url) => set({ petPhotoUrl: url }),
      setStyle: (styleId) => set({ selectedStyleId: styleId }),
      setTier: (tierId) => set({ selectedTierId: tierId, selectedSizeId: null }),
      setSize: (sizeId) => set({ selectedSizeId: sizeId }),
      setGiftWrapping: (enabled) => set({ giftWrapping: enabled }),
      setGiftNote: (note) => set({ giftNote: note }),
      setRushProcessing: (enabled) => set({ rushProcessing: enabled }),
      goToStep: (step) => set({ currentStep: step }),
      reset: () => set(initialState),
    }),
    {
      name: "crown-canvas-order",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? sessionStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
    }
  )
);
