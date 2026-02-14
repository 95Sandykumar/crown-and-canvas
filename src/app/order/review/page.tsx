"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingCart, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStepper } from "@/components/layout/order-stepper";
import { useOrderFlowStore } from "@/stores/order-flow-store";
import { useCartStore } from "@/stores/cart-store";
import { getStyleById } from "@/data/styles";
import { getTierById, getSizeById, ADD_ONS, formatPrice } from "@/data/products";

export default function ReviewPage() {
  const router = useRouter();
  const store = useOrderFlowStore();
  const addItem = useCartStore((s) => s.addItem);

  const style = store.selectedStyleId ? getStyleById(store.selectedStyleId) : null;
  const tier = store.selectedTierId ? getTierById(store.selectedTierId) : null;
  const size =
    store.selectedTierId && store.selectedSizeId
      ? getSizeById(store.selectedTierId, store.selectedSizeId)
      : null;

  if (!style || !tier || !size) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-charcoal/60">Missing order information.</p>
          <Button onClick={() => router.push("/order/upload")} variant="outline">
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  let subtotal = size.priceInCents;
  if (store.giftWrapping) subtotal += ADD_ONS.giftWrapping.priceInCents;
  if (store.rushProcessing) subtotal += ADD_ONS.rushProcessing.priceInCents;

  const handleAddToCart = () => {
    addItem({
      id: `${style.id}-${tier.id}-${size.id}-${Date.now()}`,
      styleId: style.id,
      styleName: style.name,
      stylePreview: style.previewImage,
      tierId: tier.id,
      tierName: tier.name,
      sizeId: size.id,
      sizeLabel: size.label,
      petName: store.petName,
      petPhotoUrl: store.petPhotoUrl ?? "",
      priceInCents: size.priceInCents,
      quantity: 1,
    });

    store.reset();
    router.push("/cart");
  };

  return (
    <div className="bg-cream min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <OrderStepper currentStep="review" />

        <div className="mt-8 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="font-serif text-3xl font-bold text-charcoal">
              Review Your Order
            </h1>
            <p className="text-charcoal/60">
              Make sure everything looks perfect before adding to cart
            </p>
          </div>

          {/* Order summary card */}
          <div className="rounded-2xl bg-white border border-border/40 overflow-hidden shadow-sm">
            <div className="grid sm:grid-cols-[200px_1fr]">
              {/* Pet photo */}
              {store.petPhotoUrl && (
                <div className="relative aspect-square sm:aspect-auto">
                  <Image
                    src={store.petPhotoUrl}
                    alt={store.petName}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Details */}
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-charcoal/50 uppercase tracking-wider">Pet Name</p>
                  <p className="text-lg font-semibold text-charcoal">{store.petName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-charcoal/50 uppercase tracking-wider">Style</p>
                    <p className="text-sm font-medium text-charcoal">{style.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal/50 uppercase tracking-wider">Product</p>
                    <p className="text-sm font-medium text-charcoal">{tier.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal/50 uppercase tracking-wider">Size</p>
                    <p className="text-sm font-medium text-charcoal">{size.label}</p>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal/50 uppercase tracking-wider">Price</p>
                    <p className="text-sm font-bold text-royal">{formatPrice(size.priceInCents)}</p>
                  </div>
                </div>

                {/* Add-ons */}
                {(store.giftWrapping || store.rushProcessing) && (
                  <div className="border-t border-border/40 pt-4 space-y-2">
                    <p className="text-xs text-charcoal/50 uppercase tracking-wider">Add-ons</p>
                    {store.giftWrapping && (
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-charcoal">
                          <Check className="h-3 w-3 text-gold" />
                          {ADD_ONS.giftWrapping.label}
                        </span>
                        <span className="text-charcoal/70">+{formatPrice(ADD_ONS.giftWrapping.priceInCents)}</span>
                      </div>
                    )}
                    {store.rushProcessing && (
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-charcoal">
                          <Check className="h-3 w-3 text-gold" />
                          {ADD_ONS.rushProcessing.label}
                        </span>
                        <span className="text-charcoal/70">+{formatPrice(ADD_ONS.rushProcessing.priceInCents)}</span>
                      </div>
                    )}
                    {store.giftNote && (
                      <div className="mt-2 p-3 rounded-lg bg-cream text-sm text-charcoal/60 italic">
                        &ldquo;{store.giftNote}&rdquo;
                      </div>
                    )}
                  </div>
                )}

                {/* Total */}
                <div className="border-t border-border/40 pt-4 flex justify-between items-center">
                  <span className="font-medium text-charcoal">Total</span>
                  <span className="text-2xl font-bold text-royal">{formatPrice(subtotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/order/customize")}
              className="flex-1 py-6 gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              onClick={handleAddToCart}
              size="lg"
              className="flex-[2] bg-gold hover:bg-gold-light text-charcoal py-6 text-base font-semibold gap-2"
            >
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
