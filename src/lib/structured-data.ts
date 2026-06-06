import type { FAQ, Testimonial } from "@/types";

const DEFAULT_SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://crownandcanvas.us";

/**
 * FAQPage schema. Lets Google show FAQ rich results and gives AI engines
 * clean question/answer pairs to quote directly.
 */
export function buildFaqPageJsonLd(faqs: readonly FAQ[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question" as const,
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer" as const,
        text: faq.answer,
      },
    })),
  };
}

/**
 * Product schema carrying a site-wide AggregateRating + Review list built
 * from customer testimonials. Surfaces the star rating in search/AI results.
 */
export function buildReviewAggregateJsonLd(
  testimonials: readonly Testimonial[],
  siteUrl: string = DEFAULT_SITE_URL
) {
  const count = testimonials.length;
  const ratingValue =
    count > 0
      ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / count).toFixed(1)
      : "5.0";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Custom Pet Royal Portrait",
    description:
      "Custom royal pet portraits from your photo — digital downloads, gallery-wrapped canvases, and framed prints.",
    brand: { "@type": "Brand", name: "Crown & Canvas" },
    url: siteUrl,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue,
      reviewCount: count.toString(),
      bestRating: "5",
      worstRating: "1",
    },
    review: testimonials.slice(0, 6).map((t) => ({
      "@type": "Review" as const,
      reviewRating: {
        "@type": "Rating" as const,
        ratingValue: t.rating.toString(),
        bestRating: "5",
      },
      author: { "@type": "Person" as const, name: t.name },
      reviewBody: t.quote,
    })),
  };
}
