import { describe, it, expect } from "vitest";
import { buildFaqPageJsonLd, buildReviewAggregateJsonLd } from "./structured-data";
import type { FAQ, Testimonial } from "@/types";

const faqs: FAQ[] = [
  { question: "How does it work?", answer: "Upload a photo and pick a style." },
  { question: "Is it a good gift?", answer: "Yes — 65% of orders are gifts." },
];

const testimonials: Testimonial[] = [
  { name: "Sarah M.", petName: "Max", petType: "Dog", quote: "He cried happy tears.", rating: 5, petImage: "/a.webp", styleName: "King" },
  { name: "James T.", petName: "Luna", petType: "Cat", quote: "Centerpiece of our room.", rating: 4, petImage: "/b.webp", styleName: "Empress" },
];

describe("buildFaqPageJsonLd", () => {
  it("produces a FAQPage with one Question per FAQ", () => {
    const result = buildFaqPageJsonLd(faqs);
    expect(result["@type"]).toBe("FAQPage");
    expect(result.mainEntity).toHaveLength(2);
    expect(result.mainEntity[0]).toMatchObject({
      "@type": "Question",
      name: "How does it work?",
      acceptedAnswer: { "@type": "Answer", text: "Upload a photo and pick a style." },
    });
  });
});

describe("buildReviewAggregateJsonLd", () => {
  it("averages the ratings and lists reviews", () => {
    const result = buildReviewAggregateJsonLd(testimonials, "https://example.com");
    expect(result["@type"]).toBe("Product");
    expect(result.aggregateRating).toMatchObject({
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "2",
    });
    expect(result.review).toHaveLength(2);
    expect(result.review[0]).toMatchObject({
      "@type": "Review",
      author: { "@type": "Person", name: "Sarah M." },
    });
  });

  it("defaults to 5.0 with zero reviews", () => {
    const result = buildReviewAggregateJsonLd([], "https://example.com");
    expect(result.aggregateRating.ratingValue).toBe("5.0");
    expect(result.aggregateRating.reviewCount).toBe("0");
  });
});
