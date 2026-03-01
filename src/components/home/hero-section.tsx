import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cream via-white to-cream-dark">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234A1D96' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-royal/10 px-4 py-1.5 text-sm font-medium text-royal">
              <Sparkles className="h-4 w-4" />
              Over 10,000 happy pet parents
            </div>

            <h1 className="font-serif text-4xl font-bold tracking-tight text-charcoal sm:text-5xl lg:text-6xl">
              Turn Your Pet Into{" "}
              <span className="text-royal">Royalty</span>
            </h1>

            <p className="text-lg font-medium text-gold italic">
              Frame Your Pet&apos;s Personality
            </p>

            <p className="mx-auto max-w-lg text-lg text-charcoal/60 lg:mx-0">
              Upload a photo of your beloved pet and we&apos;ll transform them into a
              stunning royal portrait. Choose from 20+ styles &mdash; Renaissance kings,
              military generals, and more.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/order/upload">
                <Button size="lg" className="w-full sm:w-auto bg-royal hover:bg-royal-dark text-white text-base px-8 py-6 gap-2">
                  Create Your Portrait
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/styles">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 border-royal/20 text-royal hover:bg-royal/5">
                  Browse Styles
                </Button>
              </Link>
            </div>

            {/* Trust badges inline */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-charcoal/50 lg:justify-start">
              <span className="flex items-center gap-1.5">
                <span className="text-gold">&#9733;</span> 4.9/5 Rating
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-gold">&#10003;</span> Satisfaction Guarantee
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-gold">&#9829;</span> Perfect Gift
              </span>
            </div>
          </div>

          {/* Right: Tilted Before & After showcase */}
          <div className="relative mx-auto h-[420px] w-full max-w-md sm:h-[480px] lg:h-[520px] lg:max-w-none">
            {/* Card 1: Before — original pet photo */}
            <div className="absolute left-0 top-6 z-10 w-[55%] -rotate-6 transition-transform duration-500 hover:-rotate-3 hover:scale-105">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border-2 border-gold/30 bg-white shadow-xl shadow-charcoal/10">
                <Image
                  src="/portraits/renaissance-king/before.webp"
                  alt="Original pet photo — before transformation"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 45vw, 280px"
                  priority
                />
                {/* Before label */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-charcoal shadow-sm">
                    Before
                  </span>
                </div>
              </div>
            </div>

            {/* Sparkle connector between cards */}
            <div className="absolute left-[46%] top-[45%] z-20 -translate-x-1/2 -translate-y-1/2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>

            {/* Card 2: After — same pet as Renaissance King portrait */}
            <div className="absolute right-0 top-0 z-15 w-[55%] rotate-3 transition-transform duration-500 hover:rotate-0 hover:scale-105">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border-2 border-gold/30 bg-white shadow-xl shadow-royal/15">
                <Image
                  src="/portraits/renaissance-king/after.webp"
                  alt="Renaissance King portrait — after transformation"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 45vw, 280px"
                  priority
                />
                {/* After label */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-flex items-center rounded-full bg-gold/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    After
                  </span>
                </div>
                {/* Style nameplate */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal/60 to-transparent p-4 pt-8">
                  <p className="font-serif text-sm font-semibold text-white drop-shadow-md">
                    &ldquo;The Renaissance King&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Floating price badge */}
            <div className="absolute -top-3 right-0 z-30 rounded-2xl bg-gold px-4 py-2 shadow-lg rotate-6">
              <p className="text-sm font-bold text-charcoal">From $29.99</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
