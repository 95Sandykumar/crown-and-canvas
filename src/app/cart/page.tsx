"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/data/products";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, subtotal, itemCount, isHydrated } = useCart();

  if (!isHydrated) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-royal border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-cream min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-cream-dark">
            <ShoppingBag className="h-10 w-10 text-charcoal/30" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-charcoal">Your Cart is Empty</h1>
          <p className="text-charcoal/60">
            Ready to turn your pet into royalty? Start creating your portrait.
          </p>
          <Link href="/order/upload">
            <Button size="lg" className="bg-royal hover:bg-royal-dark text-white gap-2 px-8 py-6">
              Create a Portrait <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold text-charcoal mb-8">
          Your Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
        </h1>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl bg-white border border-border/40 p-4 flex gap-4"
              >
                {/* Pet photo */}
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-cream">
                  {item.petPhotoUrl ? (
                    <Image
                      src={item.petPhotoUrl}
                      alt={item.petName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-charcoal/20">
                      <ShoppingBag className="h-8 w-8" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-charcoal">{item.styleName}</p>
                      <p className="text-sm text-charcoal/50">
                        {item.petName} &middot; {item.tierName} &middot; {item.sizeLabel}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-charcoal/40 hover:text-destructive transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    {/* Quantity */}
                    <div className="flex items-center gap-2 rounded-lg border border-border/40 p-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1.5 rounded hover:bg-cream disabled:opacity-30 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 rounded hover:bg-cream transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <p className="font-bold text-royal">
                      {formatPrice(item.priceInCents * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="rounded-xl bg-white border border-border/40 p-6 h-fit space-y-4 lg:sticky lg:top-24">
            <h2 className="font-semibold text-charcoal">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-charcoal/60">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-charcoal/60">
                <span>Shipping</span>
                <span className="text-royal font-medium">Free</span>
              </div>
            </div>

            <div className="border-t border-border/40 pt-4 flex justify-between">
              <span className="font-semibold text-charcoal">Total</span>
              <span className="text-xl font-bold text-royal">{formatPrice(subtotal)}</span>
            </div>

            <Button
              size="lg"
              onClick={() => router.push("/checkout")}
              className="w-full bg-royal hover:bg-royal-dark text-white py-6 text-base gap-2"
            >
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Button>

            <Link href="/order/upload" className="block">
              <Button variant="outline" size="sm" className="w-full text-sm">
                + Add Another Portrait
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
