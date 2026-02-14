import Image from "next/image";
import Link from "next/link";
import { Crown, Heart, Palette, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Crown & Canvas — transforming beloved pets into stunning royal portraits since 2026.",
};

const values = [
  {
    icon: Heart,
    title: "Made with Love",
    description: "Every portrait is crafted with care and attention to detail, because your pet deserves nothing less.",
  },
  {
    icon: Palette,
    title: "Artistic Excellence",
    description: "Our AI-powered process combined with human quality control ensures museum-quality results every time.",
  },
  {
    icon: Truck,
    title: "Fast & Reliable",
    description: "Digital proofs in 24-48 hours. Canvas and framed prints shipped with care within 5-7 business days.",
  },
  {
    icon: Crown,
    title: "Premium Quality",
    description: "We use only the finest materials — premium cotton canvas, museum-quality frames, and archival paper.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-cream min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-royal to-royal-dark text-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <Crown className="h-12 w-12 text-gold mx-auto" />
          <h1 className="font-serif text-4xl font-bold sm:text-5xl">
            Our Story
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/70">
            We believe every pet is royalty. Crown & Canvas was born from a simple idea:
            give pet owners a way to celebrate their furry companions in the most regal way possible.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <h2 className="font-serif text-3xl font-bold text-charcoal">
                Why We Do This
              </h2>
              <div className="space-y-4 text-charcoal/60 leading-relaxed">
                <p>
                  It started with a Golden Retriever named Charlie. When our founder saw a Renaissance-style
                  portrait of a friend&apos;s cat, they knew Charlie deserved the same royal treatment.
                  But the existing options were too expensive, too slow, or didn&apos;t capture the personality
                  of the pet.
                </p>
                <p>
                  So we built Crown & Canvas — combining cutting-edge AI technology with human artistry
                  to create stunning royal pet portraits that are affordable, fast, and absolutely delightful.
                </p>
                <p>
                  Today, we&apos;ve created thousands of royal portraits for pet lovers around the world.
                  Each one tells a unique story of love between a pet and their human.
                </p>
              </div>
            </div>

            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=800&fit=crop"
                alt="A happy dog that inspired Crown & Canvas"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-charcoal text-center mb-12">
            What We Stand For
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div key={value.title} className="text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream">
                  <value.icon className="h-7 w-7 text-royal" />
                </div>
                <h3 className="font-semibold text-charcoal">{value.title}</h3>
                <p className="text-sm text-charcoal/60 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cream-dark py-16">
        <div className="mx-auto max-w-3xl px-4 text-center space-y-6">
          <h2 className="font-serif text-3xl font-bold text-charcoal">
            Ready to Crown Your Pet?
          </h2>
          <p className="text-charcoal/60">
            Join thousands of happy pet parents who&apos;ve transformed their pets into royalty.
          </p>
          <Link href="/order/upload">
            <Button size="lg" className="bg-royal hover:bg-royal-dark text-white gap-2 px-8 py-6 text-base">
              Create Your Portrait <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
