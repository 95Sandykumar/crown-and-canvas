"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderStepper } from "@/components/layout/order-stepper";
import { useOrderFlowStore } from "@/stores/order-flow-store";
import { PORTRAIT_STYLES, STYLE_CATEGORIES } from "@/data/styles";
import { BeforeAfterCrossfade } from "@/components/ui/before-after-crossfade";

export default function SelectStylePage() {
  const router = useRouter();
  const { selectedStyleId, setStyle, goToStep } = useOrderFlowStore();
  const [selected, setSelected] = useState<string | null>(selectedStyleId);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [error, setError] = useState<string | null>(null);

  const filtered =
    activeCategory === "All"
      ? PORTRAIT_STYLES
      : PORTRAIT_STYLES.filter((s) => s.category === activeCategory);

  const handleContinue = () => {
    if (!selected) {
      setError("Please select a portrait style.");
      return;
    }
    setStyle(selected);
    goToStep("customize");
    router.push("/order/customize");
  };

  return (
    <div className="bg-cream min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <OrderStepper currentStep="select-style" />

        <div className="mt-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-serif text-3xl font-bold text-charcoal">
              Choose Your Portrait Style
            </h1>
            <p className="text-charcoal/60">
              Select the perfect royal style for your pet&apos;s portrait
            </p>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-2">
            {STYLE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-royal text-white"
                    : "bg-white text-charcoal/60 hover:bg-royal/5 border border-border/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((style, index) => {
              const isSelected = selected === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => { setSelected(style.id); setError(null); }}
                  className={`relative overflow-hidden rounded-xl bg-white text-left transition-all duration-200 ${
                    isSelected
                      ? "ring-2 ring-royal shadow-lg"
                      : "border border-border/40 hover:border-gold/30 hover:shadow-md"
                  }`}
                >
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <BeforeAfterCrossfade
                      beforeImage={style.beforeImage}
                      afterImage={style.previewImage}
                      alt={style.name}
                      imageClassName="object-cover"
                      showLabels={false}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      staggerOffset={index * 300}
                      characterTitle={style.characterTitle}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-royal/20 flex items-center justify-center">
                        <div className="rounded-full bg-royal p-2">
                          <Check className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    )}
                    {style.popular && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-gold text-charcoal text-[10px]">Popular</Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-sm font-semibold text-charcoal">{style.name}</p>
                    <p className="text-[11px] text-charcoal/50">{style.category}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center justify-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Continue */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/order/upload")}
              className="flex-1 py-6"
            >
              Back
            </Button>
            <Button
              onClick={handleContinue}
              size="lg"
              className="flex-[2] bg-royal hover:bg-royal-dark text-white py-6 text-base gap-2"
            >
              Continue to Customize <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
