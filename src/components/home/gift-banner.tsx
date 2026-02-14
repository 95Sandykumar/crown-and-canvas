import Link from "next/link";
import { Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GiftBanner() {
  return (
    <section className="bg-royal py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:text-left lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-gold">
              <Gift className="h-4 w-4" />
              #1 Gift for Pet Lovers
            </div>
            <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
              The Perfect Gift That Makes<br className="hidden sm:inline" /> Everyone Cry Happy Tears
            </h2>
            <p className="text-lg text-white/70 max-w-xl">
              65% of our portraits are purchased as gifts. Add gift wrapping
              and a personalized note to make it extra special.
            </p>
          </div>
          <Link href="/order/upload">
            <Button size="lg" className="bg-gold hover:bg-gold-light text-charcoal text-base font-semibold px-8 py-6 gap-2">
              Send a Gift <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
