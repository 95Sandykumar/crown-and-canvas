import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPopularStyles } from "@/data/styles";
import { Badge } from "@/components/ui/badge";
import { BeforeAfterCrossfade } from "@/components/ui/before-after-crossfade";

export function StyleShowcase() {
  const popularStyles = getPopularStyles();

  return (
    <section className="bg-cream py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-bold text-charcoal sm:text-4xl">
              Popular Styles
            </h2>
            <p className="text-lg text-charcoal/60">
              Our most loved royal portrait styles
            </p>
          </div>
          <Link href="/styles">
            <Button variant="outline" className="gap-2 border-royal/20 text-royal hover:bg-royal/5">
              View All Styles <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
          {popularStyles.map((style, index) => (
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
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-white">
                    Create Portrait <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-charcoal">{style.name}</h3>
                <Badge variant="secondary" className="mt-1 text-[10px] bg-cream text-charcoal/60">
                  {style.category}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
