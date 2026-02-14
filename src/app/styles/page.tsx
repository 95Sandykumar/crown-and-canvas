"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PORTRAIT_STYLES, STYLE_CATEGORIES } from "@/data/styles";
import { BeforeAfterCrossfade } from "@/components/ui/before-after-crossfade";
import type { Metadata } from "next";

export default function StylesPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filtered =
    activeCategory === "All"
      ? PORTRAIT_STYLES
      : PORTRAIT_STYLES.filter((s) => s.category === activeCategory);

  return (
    <div className="bg-cream min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-10">
          <h1 className="font-serif text-4xl font-bold text-charcoal sm:text-5xl">
            Portrait Styles
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-charcoal/60">
            Choose from our collection of {PORTRAIT_STYLES.length} stunning royal portrait styles.
            Each one is crafted to turn your pet into a masterpiece.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {STYLE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-royal text-white"
                  : "bg-white text-charcoal/60 hover:bg-royal/5 hover:text-royal border border-border/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
          {filtered.map((style, index) => (
            <Link
              key={style.id}
              href={`/styles/${style.slug}`}
              className="group relative overflow-hidden rounded-xl bg-white shadow-sm border border-border/40 hover:shadow-lg hover:border-gold/30 transition-all duration-300"
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                <BeforeAfterCrossfade
                  beforeImage={style.beforeImage}
                  afterImage={style.previewImage}
                  alt={style.name}
                  imageClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  staggerOffset={index * 300}
                  characterTitle={style.characterTitle}
                />
                {style.popular && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-gold text-charcoal text-[10px] font-bold">Popular</Badge>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-white">
                    View Details <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-charcoal">{style.name}</h3>
                <p className="text-xs text-charcoal/50 mt-0.5">{style.category}</p>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-charcoal/50">No styles found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
