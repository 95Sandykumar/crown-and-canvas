"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle, Gift, Zap, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderStepper } from "@/components/layout/order-stepper";
import { useOrderFlowStore } from "@/stores/order-flow-store";
import { PRODUCT_TIERS, ADD_ONS, formatPrice, getSizeById } from "@/data/products";
import { getStyleById } from "@/data/styles";

export default function CustomizePage() {
  const router = useRouter();
  const store = useOrderFlowStore();
  const [error, setError] = useState<string | null>(null);

  const selectedStyle = store.selectedStyleId
    ? getStyleById(store.selectedStyleId)
    : null;

  const handleContinue = () => {
    if (!store.selectedTierId) {
      setError("Please select a product type.");
      return;
    }
    if (!store.selectedSizeId) {
      setError("Please select a size.");
      return;
    }
    store.goToStep("review");
    router.push("/order/review");
  };

  const selectedSize = store.selectedTierId && store.selectedSizeId
    ? getSizeById(store.selectedTierId, store.selectedSizeId)
    : null;

  let total = selectedSize?.priceInCents ?? 0;
  if (store.giftWrapping) total += ADD_ONS.giftWrapping.priceInCents;
  if (store.rushProcessing) total += ADD_ONS.rushProcessing.priceInCents;

  return (
    <div className="bg-cream min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <OrderStepper currentStep="customize" />

        <div className="mt-8 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="font-serif text-3xl font-bold text-charcoal">
              Customize Your Portrait
            </h1>
            {selectedStyle && (
              <p className="text-charcoal/60">
                Style: <span className="font-medium text-royal">{selectedStyle.name}</span>
              </p>
            )}
          </div>

          {/* Product Tiers */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-charcoal">Choose Product Type</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {PRODUCT_TIERS.map((tier) => {
                const isSelected = store.selectedTierId === tier.id;
                const minPrice = Math.min(...tier.sizes.map((s) => s.priceInCents));
                return (
                  <button
                    key={tier.id}
                    onClick={() => { store.setTier(tier.id); setError(null); }}
                    className={`relative rounded-xl p-5 text-left transition-all ${
                      isSelected
                        ? "bg-white ring-2 ring-royal shadow-lg"
                        : "bg-white border border-border/40 hover:border-gold/30 hover:shadow-md"
                    }`}
                  >
                    {tier.id === "canvas" && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-gold px-3 py-0.5 text-[10px] font-bold text-charcoal">
                          Best Value
                        </span>
                      </div>
                    )}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-charcoal">{tier.name}</h3>
                      <p className="text-xs text-charcoal/50">{tier.description}</p>
                      <p className="text-lg font-bold text-royal">
                        {formatPrice(minPrice)}
                        {tier.sizes.length > 1 && <span className="text-sm font-normal text-charcoal/50">+</span>}
                      </p>
                      <ul className="space-y-1.5">
                        {tier.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-xs text-charcoal/60">
                            <Check className="h-3 w-3 text-royal flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <div className="rounded-full bg-royal p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size selector */}
          {store.selectedTierId && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-charcoal">Select Size</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {PRODUCT_TIERS.find((t) => t.id === store.selectedTierId)?.sizes.map(
                  (size) => {
                    const isSelected = store.selectedSizeId === size.id;
                    return (
                      <button
                        key={size.id}
                        onClick={() => { store.setSize(size.id); setError(null); }}
                        className={`rounded-lg p-4 text-left transition-all ${
                          isSelected
                            ? "bg-white ring-2 ring-royal"
                            : "bg-white border border-border/40 hover:border-gold/30"
                        }`}
                      >
                        <p className="font-medium text-charcoal">{size.label}</p>
                        {size.dimensions && (
                          <p className="text-xs text-charcoal/50">{size.dimensions}</p>
                        )}
                        <p className="mt-1 font-bold text-royal">{formatPrice(size.priceInCents)}</p>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* Add-ons */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-charcoal">Add-ons</h2>

            {/* Gift wrapping */}
            <button
              onClick={() => store.setGiftWrapping(!store.giftWrapping)}
              className={`w-full rounded-xl p-4 text-left flex items-center gap-4 transition-all ${
                store.giftWrapping
                  ? "bg-white ring-2 ring-gold"
                  : "bg-white border border-border/40 hover:border-gold/30"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 flex-shrink-0">
                <Gift className="h-5 w-5 text-gold" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-charcoal">{ADD_ONS.giftWrapping.label}</p>
                <p className="text-xs text-charcoal/50">Elegant wrapping with a personalized note</p>
              </div>
              <p className="font-semibold text-charcoal">+{formatPrice(ADD_ONS.giftWrapping.priceInCents)}</p>
            </button>

            {store.giftWrapping && (
              <div className="pl-14 space-y-2">
                <label className="text-sm font-medium text-charcoal">Gift Note (optional)</label>
                <Input
                  value={store.giftNote}
                  onChange={(e) => store.setGiftNote(e.target.value)}
                  placeholder="Write a personalized message..."
                  maxLength={200}
                  className="bg-white"
                />
                <p className="text-xs text-charcoal/40">{store.giftNote.length}/200 characters</p>
              </div>
            )}

            {/* Rush processing */}
            <button
              onClick={() => store.setRushProcessing(!store.rushProcessing)}
              className={`w-full rounded-xl p-4 text-left flex items-center gap-4 transition-all ${
                store.rushProcessing
                  ? "bg-white ring-2 ring-gold"
                  : "bg-white border border-border/40 hover:border-gold/30"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 flex-shrink-0">
                <Zap className="h-5 w-5 text-gold" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-charcoal">{ADD_ONS.rushProcessing.label}</p>
                <p className="text-xs text-charcoal/50">Get your portrait faster</p>
              </div>
              <p className="font-semibold text-charcoal">+{formatPrice(ADD_ONS.rushProcessing.priceInCents)}</p>
            </button>
          </div>

          {/* Running total */}
          {selectedSize && (
            <div className="rounded-xl bg-white border border-border/40 p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-charcoal">Estimated Total</span>
                <span className="text-2xl font-bold text-royal">{formatPrice(total)}</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/order/select-style")}
              className="flex-1 py-6"
            >
              Back
            </Button>
            <Button
              onClick={handleContinue}
              size="lg"
              className="flex-[2] bg-royal hover:bg-royal-dark text-white py-6 text-base gap-2"
            >
              Review Order <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
