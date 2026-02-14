import Link from "next/link";
import { CheckCircle, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  return (
    <div className="bg-cream min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-royal/10 animate-scale-in">
          <CheckCircle className="h-10 w-10 text-royal" />
        </div>

        <div className="space-y-3 animate-fade-in-up">
          <h1 className="font-serif text-4xl font-bold text-charcoal">
            Order Confirmed!
          </h1>
          <p className="text-lg text-charcoal/60 max-w-md mx-auto">
            Thank you for your order! We&apos;re excited to start creating your royal pet portrait.
          </p>
        </div>

        <div className="rounded-xl bg-white border border-border/40 p-6 text-left space-y-4 max-w-md mx-auto animate-fade-in-up">
          <h2 className="font-semibold text-charcoal text-center">What Happens Next</h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/20 text-sm font-bold text-gold flex-shrink-0">
                1
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal">Digital Proof in 24-48 Hours</p>
                <p className="text-xs text-charcoal/50">We&apos;ll email you a preview of your portrait for approval.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/20 text-sm font-bold text-gold flex-shrink-0">
                2
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal">Review & Approve</p>
                <p className="text-xs text-charcoal/50">Request revisions or approve your portrait as-is.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/20 text-sm font-bold text-gold flex-shrink-0">
                3
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal">Production & Delivery</p>
                <p className="text-xs text-charcoal/50">Canvas & framed prints ship within 5-7 business days.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-charcoal/50">
          <Mail className="h-4 w-4" />
          Check your email for order confirmation details
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/order/upload">
            <Button size="lg" className="bg-royal hover:bg-royal-dark text-white gap-2 px-8 py-6">
              Create Another Portrait <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/">
            <Button size="lg" variant="outline" className="px-8 py-6">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
