"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, AlertCircle, Gift, Zap, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderStepper } from "@/components/layout/order-stepper";
import { useOrderFlowStore } from "@/stores/order-flow-store";
import { useCartStore } from "@/stores/cart-store";
import { PRODUCT_TIERS, ADD_ONS, formatPrice, getSizeById } from "@/data/products";
import { getStyleById } from "@/data/styles";
import { trackAddToCart } from "@/lib/analytics";

export default function CustomizePage() {
  const router = useRouter();
  const store = useOrderFlowStore();
  const addItem = useCartStore((s) => s.addItem);
  const setCartGiftWrapping = useCartStore((s) => s.setGiftWrapping);
  const setCartGiftNote = useCartStore((s) => s.setGiftNote);
  const setCartRushProcessing = useCartStore((s) => s.setRushProcessing);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  // Set once we start adding to cart so the missing-photo guard below doesn't
  // bounce to /upload when store.reset() nulls the photo just before /cart.
  const submittingRef = useRef(false);

  const selectedStyle = store.selectedStyleId
    ? getStyleById(store.selectedStyleId)
    : null;

  // A refresh strips the pet photo from session storage (it is never persisted),
  // which would let an order proceed with no photo to fulfill. Send the customer
  // back to the upload step to re-add it.
  useEffect(() => {
    if (!store.petPhotoUrl && !submittingRef.current) {
      router.replace("/order/upload");
    }
  }, [store.petPhotoUrl, router]);

  // AOV anchor: default to Premium Canvas (12x16) so the recommended path is the
  // physical product, not the $29.99 digital. Only applies when nothing is chosen
  // yet — a customer can still pick any tier (incl. digital) freely.
  useEffect(() => {
    if (!store.selectedTierId) {
      store.setTier("canvas");
      store.setSize("canvas-12x16");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedTier = store.selectedTierId
    ? PRODUCT_TIERS.find((t) => t.id === store.selectedTierId)
    : null;

  // Digital downloads have nothing to size, wrap, or rush-ship: they are a
  // single high-res file delivered instantly by email. Size selection and the
  // physical add-ons only apply to canvas and framed products.
  const isPhysical = selectedTier ? selectedTier.type !== "digital" : false;

  const handleSelectTier = (tier: (typeof PRODUCT_TIERS)[number]) => {
    store.setTier(tier.id);
    setError(null);
    if (tier.type === "digital") {
      // Auto-select the only size and clear physical-only add-ons so they don't
      // carry over from a previously selected canvas/framed tier.
      store.setSize(tier.sizes[0].id);
      store.setGiftWrapping(false);
      store.setGiftNote("");
      store.setRushProcessing(false);
    }
  };

  const selectedSize = store.selectedTierId && store.selectedSizeId
    ? getSizeById(store.selectedTierId, store.selectedSizeId)
    : null;

  let total = selectedSize?.priceInCents ?? 0;
  if (isPhysical && store.giftWrapping) total += ADD_ONS.giftWrapping.priceInCents;
  if (isPhysical && store.rushProcessing) total += ADD_ONS.rushProcessing.priceInCents;

  const handleAddToCart = async () => {
    if (!store.selectedTierId || !selectedTier) {
      setError("Please select a product type.");
      return;
    }
    if (!store.selectedSizeId || !selectedSize) {
      setError("Please select a size.");
      return;
    }
    if (!selectedStyle || !store.petPhotoUrl) {
      router.replace("/order/upload");
      return;
    }

    setAdding(true);
    setError(null);
    submittingRef.current = true;

    // Upload the photo to Blob now so the cart stores a small URL, not a
    // multi-MB base64 string. Fall back to the raw data URL if upload fails
    // (e.g. Blob not configured locally) — checkout uploads it as a backstop.
    let photoUrl = store.petPhotoUrl;
    if (photoUrl.startsWith("data:")) {
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl: photoUrl }),
        });
        const data = await res.json();
        if (res.ok && data.url) photoUrl = data.url;
      } catch {
        // keep the base64 data URL as a fallback
      }
    }

    addItem({
      id: `${selectedStyle.id}-${selectedTier.id}-${selectedSize.id}-${Date.now()}`,
      styleId: selectedStyle.id,
      styleName: selectedStyle.name,
      stylePreview: selectedStyle.previewImage,
      tierId: selectedTier.id,
      tierName: selectedTier.name,
      sizeId: selectedSize.id,
      sizeLabel: selectedSize.label,
      petName: store.petName,
      petPhotoUrl: photoUrl,
      priceInCents: selectedSize.priceInCents,
      quantity: 1,
    });

    // Carry add-ons into the cart (cart-level). Only physical items set them so a
    // digital add-on selection can't wipe gift wrapping chosen for a canvas item.
    if (isPhysical) {
      setCartGiftWrapping(store.giftWrapping);
      setCartGiftNote(store.giftNote);
      setCartRushProcessing(store.rushProcessing);
    }

    trackAddToCart({
      styleId: selectedStyle.id,
      styleName: selectedStyle.name,
      tierName: selectedTier.name,
      valueCents: selectedSize.priceInCents,
    });

    store.reset();
    router.push("/cart");
  };

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
                    onClick={() => handleSelectTier(tier)}
                    className={`relative rounded-xl p-5 text-left transition-all ${
                      isSelected
                        ? "bg-white ring-2 ring-royal shadow-lg"
                        : "bg-white border border-border/40 hover:border-gold/30 hover:shadow-md"
                    }`}
                  >
                    {tier.id === "canvas" && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-gold px-3 py-0.5 text-[10px] font-bold text-charcoal">
                          Most Popular
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

          {/* Digital delivery note — no size to choose */}
          {selectedTier && !isPhysical && (
            <div className="rounded-xl bg-white border border-border/40 p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-royal/10 flex-shrink-0">
                <Check className="h-5 w-5 text-royal" />
              </div>
              <p className="text-sm text-charcoal/70">
                Your high-resolution file is delivered instantly by email. No size, wrapping, or shipping needed.
              </p>
            </div>
          )}

          {/* Size selector — physical products only */}
          {isPhysical && (
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

          {/* Add-ons — physical products only (digital has nothing to wrap or rush-ship) */}
          {isPhysical && (
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
          )}

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
              onClick={() => router.push("/order/upload")}
              className="flex-1 py-6"
              disabled={adding}
            >
              Back
            </Button>
            <Button
              onClick={handleAddToCart}
              size="lg"
              disabled={adding}
              className="flex-[2] bg-royal hover:bg-royal-dark text-white py-6 text-base gap-2"
            >
              {adding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Adding...
                </>
              ) : (
                <>
                  Add to Cart <ShoppingCart className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
