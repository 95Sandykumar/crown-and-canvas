"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, CreditCard, AlertCircle, Heart, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/data/products";

const DONATION_OPTIONS = [
  { amount: 0, label: "No thanks" },
  { amount: 200, label: "$2" },
  { amount: 500, label: "$5" },
  { amount: 1000, label: "$10" },
  { amount: 2500, label: "$25" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, isHydrated, giftWrapping, rushProcessing } = useCart();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [donationCents, setDonationCents] = useState(500); // Default $5 selected
  const [customDonation, setCustomDonation] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isHydrated) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-royal border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  const effectiveDonation = showCustom
    ? Math.round((parseFloat(customDonation) || 0) * 100)
    : donationCents;

  const grandTotal = subtotal + effectiveDonation;

  const handleCheckout = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          email,
          name,
          donationCents: effectiveDonation,
          giftWrapping,
          rushProcessing,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Clear cart before redirecting to Stripe
      clearCart();

      // Redirect to Stripe Checkout (validate URL to prevent open redirect)
      if (data.url && typeof data.url === "string" && data.url.startsWith("https://checkout.stripe.com/")) {
        window.location.href = data.url;
      } else {
        setError("Failed to create checkout session. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <h1 className="font-serif text-3xl font-bold text-charcoal">Checkout</h1>
          <div className="flex items-center justify-center gap-2 text-sm text-charcoal/50">
            <Lock className="h-4 w-4" />
            Secure checkout
          </div>
        </div>

        <div className="space-y-6">
          {/* Order summary */}
          <div className="rounded-xl bg-white border border-border/40 p-6 space-y-4">
            <h2 className="font-semibold text-charcoal">Order Summary</h2>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-charcoal/70">
                  {item.styleName} — {item.tierName} ({item.sizeLabel}) x{item.quantity}
                </span>
                <span className="font-medium text-charcoal">
                  {formatPrice(item.priceInCents * item.quantity)}
                </span>
              </div>
            ))}
            {giftWrapping && (
              <div className="flex justify-between text-sm">
                <span className="text-charcoal/70">Gift Wrapping</span>
                <span className="font-medium text-charcoal">{formatPrice(999)}</span>
              </div>
            )}
            {rushProcessing && (
              <div className="flex justify-between text-sm">
                <span className="text-charcoal/70">Rush Processing</span>
                <span className="font-medium text-charcoal">{formatPrice(1499)}</span>
              </div>
            )}
            <div className="border-t border-border/40 pt-3 flex justify-between">
              <span className="text-sm text-charcoal/60">Subtotal</span>
              <span className="font-medium text-charcoal">{formatPrice(subtotal)}</span>
            </div>
          </div>

          {/* Contact info */}
          <div className="rounded-xl bg-white border border-border/40 p-6 space-y-4">
            <h2 className="font-semibold text-charcoal">Contact Information</h2>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium text-charcoal">
                  Full Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="bg-cream/50"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-charcoal">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="bg-cream/50"
                />
                <p className="text-xs text-charcoal/40">
                  We&apos;ll send your digital proof and order updates here
                </p>
              </div>
            </div>
          </div>

          {/* Donation section */}
          <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <PawPrint className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h2 className="font-semibold text-charcoal flex items-center gap-1.5">
                  Help Shelter Pets <Heart className="h-4 w-4 text-red-400 fill-red-400" />
                </h2>
                <p className="text-xs text-charcoal/60">
                  Every pet deserves a loving home
                </p>
              </div>
            </div>

            <p className="text-sm text-charcoal/70 leading-relaxed">
              Add an optional donation to support abandoned and shelter pets.
              100% of your donation goes to partner shelters helping pets find their forever homes.
            </p>

            {/* Preset amounts */}
            {!showCustom && (
              <div className="grid grid-cols-5 gap-2">
                {DONATION_OPTIONS.map((option) => {
                  const isSelected = donationCents === option.amount;
                  return (
                    <button
                      key={option.amount}
                      onClick={() => setDonationCents(option.amount)}
                      className={`rounded-lg py-2.5 px-2 text-sm font-medium transition-all ${
                        isSelected
                          ? "bg-amber-500 text-white shadow-sm"
                          : "bg-white text-charcoal/70 border border-amber-200/60 hover:border-amber-300 hover:bg-amber-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Custom amount */}
            {showCustom ? (
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-charcoal/50">$</span>
                  <Input
                    type="number"
                    min="0"
                    max="1000"
                    step="1"
                    value={customDonation}
                    onChange={(e) => setCustomDonation(e.target.value)}
                    placeholder="0.00"
                    className="pl-7 bg-white"
                  />
                </div>
                <button
                  onClick={() => { setShowCustom(false); setCustomDonation(""); }}
                  className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                >
                  Use preset amounts instead
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCustom(true)}
                className="text-xs text-amber-600 hover:text-amber-700 font-medium"
              >
                Enter custom amount
              </button>
            )}

            {effectiveDonation > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-100/60 px-3 py-2">
                <Heart className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  Thank you! Your <span className="font-semibold">{formatPrice(effectiveDonation)}</span> donation will help shelter pets find loving homes.
                </p>
              </div>
            )}
          </div>

          {/* Payment notice */}
          <div className="rounded-xl bg-royal/5 border border-royal/10 p-4">
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-royal mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-charcoal">Secure Payment</p>
                <p className="text-xs text-charcoal/50 mt-0.5">
                  You&apos;ll be redirected to our secure Stripe checkout to complete payment.
                  We accept Visa, Mastercard, Amex, Apple Pay, and Google Pay.
                </p>
              </div>
            </div>
          </div>

          {/* Grand total */}
          <div className="rounded-xl bg-white border border-border/40 p-5">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-charcoal/60">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {effectiveDonation > 0 && (
                <div className="flex justify-between text-sm text-amber-600">
                  <span className="flex items-center gap-1">
                    <PawPrint className="h-3 w-3" /> Shelter donation
                  </span>
                  <span>{formatPrice(effectiveDonation)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-charcoal/60">
                <span>Shipping</span>
                <span className="text-royal font-medium">Free</span>
              </div>
              <div className="border-t border-border/40 pt-3 flex justify-between">
                <span className="font-semibold text-charcoal">Total</span>
                <span className="text-2xl font-bold text-royal">{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <Button
            size="lg"
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-royal hover:bg-royal-dark text-white py-6 text-base gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Pay {formatPrice(grandTotal)}
              </>
            )}
          </Button>

          <p className="text-center text-xs text-charcoal/40">
            By placing your order, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-charcoal/60">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="underline hover:text-charcoal/60">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
