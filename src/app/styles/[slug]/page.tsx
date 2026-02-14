import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PORTRAIT_STYLES, getStyleBySlug } from "@/data/styles";
import { formatPrice } from "@/data/products";
import { BeforeAfterCrossfade } from "@/components/ui/before-after-crossfade";

export function generateStaticParams() {
  return PORTRAIT_STYLES.map((style) => ({ slug: style.slug }));
}

export default async function StyleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const style = getStyleBySlug(slug);

  if (!style) {
    notFound();
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/styles"
          className="inline-flex items-center gap-2 text-sm text-charcoal/60 hover:text-royal mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Styles
        </Link>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-xl border border-gold/20">
            <BeforeAfterCrossfade
              beforeImage={style.beforeImage}
              afterImage={style.previewImage}
              alt={style.name}
              priority
              imageClassName="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              characterTitle={style.characterTitle}
            />
          </div>

          {/* Details */}
          <div className="space-y-6 lg:py-8">
            <div className="space-y-3">
              <Badge variant="secondary" className="bg-cream-dark text-charcoal/60">
                {style.category}
              </Badge>
              {style.popular && (
                <Badge className="ml-2 bg-gold text-charcoal">Popular</Badge>
              )}
              <h1 className="font-serif text-3xl font-bold text-charcoal sm:text-4xl">
                {style.name}
              </h1>
              <p className="text-lg text-charcoal/60 leading-relaxed">
                {style.description}
              </p>
            </div>

            <div className="border-t border-border/40 pt-6 space-y-4">
              <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wider">Pricing</h3>
              <div className="grid gap-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-border/40">
                  <span className="text-sm text-charcoal">Digital Download</span>
                  <span className="text-sm font-semibold text-charcoal">{formatPrice(2999)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-border/40">
                  <span className="text-sm text-charcoal">Premium Canvas</span>
                  <span className="text-sm font-semibold text-charcoal">{formatPrice(5999)} - {formatPrice(8999)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-border/40">
                  <span className="text-sm text-charcoal">Luxury Framed</span>
                  <span className="text-sm font-semibold text-charcoal">{formatPrice(9999)} - {formatPrice(14999)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border/40 pt-6 space-y-3">
              <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wider">Available For</h3>
              <div className="flex gap-2">
                {style.petTypes.map((type) => (
                  <Badge key={type} variant="outline" className="capitalize">
                    {type === "any" ? "All Pets" : `${type}s`}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Link href={`/order/upload?style=${style.id}`}>
                <Button size="lg" className="w-full bg-royal hover:bg-royal-dark text-white text-base py-6 gap-2">
                  Create This Portrait <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
