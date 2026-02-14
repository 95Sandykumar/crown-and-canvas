"use client";

import { Star, Quote } from "lucide-react";
import { TESTIMONIALS } from "@/data/testimonials";

export function Testimonials() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-serif text-3xl font-bold text-charcoal sm:text-4xl">
            Loved by Pet Parents
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-charcoal/60">
            Join thousands of happy customers who&apos;ve turned their pets into royalty
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/40 bg-cream/50 p-6 space-y-4 hover:shadow-md transition-shadow"
            >
              <Quote className="h-6 w-6 text-gold/40" />
              <p className="text-sm text-charcoal/70 leading-relaxed italic">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-1">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <div className="border-t border-border/40 pt-4">
                <p className="text-sm font-semibold text-charcoal">{testimonial.name}</p>
                <p className="text-xs text-charcoal/50">
                  {testimonial.petName} the {testimonial.petType}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
