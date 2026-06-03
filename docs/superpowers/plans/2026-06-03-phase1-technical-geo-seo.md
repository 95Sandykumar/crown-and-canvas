# Phase 1: Technical GEO/SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every Crown & Canvas page maximally rankable in Google and citable by generative engines (ChatGPT, Perplexity, Gemini, Google AI Overviews) through AI-crawler permissions, complete structured data, canonical URLs, and answer-shaped content.

**Architecture:** Pure JSON-LD builder functions in `src/lib/structured-data.ts` (unit-tested) consumed by a tiny `<JsonLd>` component injected into pages. Crawler rules in `robots.ts` plus a static `llms.txt`. Canonical URLs via Next.js `alternates.canonical` in per-page metadata. No redesign — surgical edits only.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript (strict), Vitest (new), schema.org JSON-LD.

**Scope note — already done, do NOT rebuild:** `blog/[slug]/page.tsx` already emits Article + BreadcrumbList JSON-LD; `styles/[slug]/page.tsx` already emits Product + AggregateOffer + AggregateRating; `layout.tsx` emits Organization + WebSite. This plan fills the genuine gaps only: AI-crawler rules, `llms.txt`, FAQPage schema, site-level Review/AggregateRating, canonical URLs, and an answer-shaped definitional opener.

---

## File Structure

| File | Responsibility | Action |
|------|----------------|--------|
| `vitest.config.ts` | Test runner config with `@/` alias | Create |
| `package.json` | Add `test` scripts + `vitest` devDep | Modify |
| `src/lib/structured-data.ts` | Pure JSON-LD builders (FAQPage, Review aggregate) | Create |
| `src/lib/structured-data.test.ts` | Unit tests for builders | Create |
| `src/components/json-ld.tsx` | Renders a `<script type="application/ld+json">` | Create |
| `src/app/robots.ts` | AI-crawler allow rules | Modify |
| `src/app/robots.test.ts` | Asserts AI bots present | Create |
| `public/llms.txt` | AI-model content pointer | Create |
| `src/app/faq/page.tsx` | Inject FAQPage JSON-LD + canonical | Modify |
| `src/app/page.tsx` | Inject Review/AggregateRating JSON-LD + canonical | Modify |
| `src/app/styles/[slug]/page.tsx` | Add canonical to generateMetadata | Modify |
| `src/app/blog/[slug]/page.tsx` | Add canonical to generateMetadata | Modify |
| `src/app/styles/page.tsx` | Add canonical | Modify |
| `src/app/about/page.tsx` | Add canonical + answer-shaped opener | Modify |

---

## Task 1: Set up Vitest test harness

The repo currently has no test runner. Add the minimal Vitest setup so builders can be TDD'd and Phase 2 has a harness.

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`
- Test: `src/lib/sanity.test.ts` (temporary, deleted in Step 5)

- [ ] **Step 1: Add vitest dependency**

Run:
```bash
npm install -D vitest@^3
```
Expected: `vitest` appears under devDependencies, install succeeds.

- [ ] **Step 2: Create vitest config with path alias**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

- [ ] **Step 3: Add test scripts to package.json**

In `package.json` `"scripts"`, add:
```json
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 4: Write a sanity test and run it**

Create `src/lib/sanity.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("vitest harness", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```
Run: `npm test`
Expected: 1 passed.

- [ ] **Step 5: Delete the sanity test and commit**

```bash
rm src/lib/sanity.test.ts
git add vitest.config.ts package.json package-lock.json
git commit -m "chore: add vitest test harness"
```

---

## Task 2: AI crawler permissions + llms.txt

Generative engines only cite you if their bots are allowed to crawl. Make crawler access explicit and add `llms.txt`.

**Files:**
- Modify: `src/app/robots.ts`
- Create: `src/app/robots.test.ts`
- Create: `public/llms.txt`

- [ ] **Step 1: Write the failing test**

Create `src/app/robots.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import robots from "./robots";

describe("robots", () => {
  it("allows the major AI crawlers", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const agents = rules.flatMap((r) =>
      Array.isArray(r.userAgent) ? r.userAgent : [r.userAgent]
    );
    for (const bot of ["GPTBot", "PerplexityBot", "ClaudeBot", "Google-Extended"]) {
      expect(agents).toContain(bot);
    }
  });

  it("keeps private routes disallowed for the wildcard agent", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const wildcard = rules.find((r) => r.userAgent === "*");
    expect(wildcard?.disallow).toContain("/api/");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test src/app/robots.test.ts`
Expected: FAIL — current `robots.ts` returns a single object whose `userAgent` is only `"*"`, so `GPTBot` is not found.

- [ ] **Step 3: Implement the AI-crawler rules**

Replace the entire contents of `src/app/robots.ts`:
```ts
import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://crownandcanvas.com";

// Bots that power AI answer engines + search. We explicitly allow them so
// Crown & Canvas can be crawled, indexed, and cited in AI-generated answers.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "ClaudeBot",
  "Claude-Web",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
];

const DISALLOW = ["/api/", "/cart", "/checkout/", "/order/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test src/app/robots.test.ts`
Expected: 2 passed.

- [ ] **Step 5: Create llms.txt**

Create `public/llms.txt`:
```
# Crown & Canvas

> Crown & Canvas is a custom pet portrait studio that turns a pet's photo into museum-quality royal artwork — available as instant digital downloads, gallery-wrapped canvases, and framed prints. Digital proofs are delivered in 24-48 hours. About 65% of orders are gifts. Every order is backed by a 100% satisfaction, 30-day money-back guarantee.

## Key Pages
- Portrait styles (20 royal, military, fantasy, and modern themes): /styles
- Start an order (upload photo, pick a style): /order/upload
- How it works and common questions: /faq
- Brand story: /about
- Articles on pet portraits, gifting, and pet memorials: /blog

## Products
- Digital Download: high-resolution JPG + PNG, from $29.99
- Premium Canvas: gallery-wrapped, ready to hang, $59.99-$89.99
- Luxury Framed: museum-quality wood frame, $99.99-$149.99

## Contact
- Email: hello@crownandcanvas.com
```

- [ ] **Step 6: Commit**

```bash
git add src/app/robots.ts src/app/robots.test.ts public/llms.txt
git commit -m "feat(seo): allow AI crawlers in robots + add llms.txt"
```

---

## Task 3: Structured-data builders + JsonLd component

Pure, tested builders for the two missing schema types, plus a reusable injector component.

**Files:**
- Create: `src/lib/structured-data.ts`
- Create: `src/lib/structured-data.test.ts`
- Create: `src/components/json-ld.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/lib/structured-data.test.ts`:
```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test src/lib/structured-data.test.ts`
Expected: FAIL — module `./structured-data` does not exist.

- [ ] **Step 3: Implement the builders**

Create `src/lib/structured-data.ts`:
```ts
import type { FAQ, Testimonial } from "@/types";

const DEFAULT_SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://crownandcanvas.com";

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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test src/lib/structured-data.test.ts`
Expected: 3 passed.

- [ ] **Step 5: Create the JsonLd component**

Create `src/components/json-ld.tsx`:
```tsx
/**
 * Renders a JSON-LD structured-data script tag. Server component — no "use client".
 */
export function JsonLd({ data }: { readonly data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/structured-data.ts src/lib/structured-data.test.ts src/components/json-ld.tsx
git commit -m "feat(seo): add FAQPage + Review structured-data builders"
```

---

## Task 4: FAQPage schema + canonical on /faq

**Files:**
- Modify: `src/app/faq/page.tsx`

- [ ] **Step 1: Add imports**

In `src/app/faq/page.tsx`, after the existing `import { FAQS } from "@/data/faq";` line, add:
```ts
import { JsonLd } from "@/components/json-ld";
import { buildFaqPageJsonLd } from "@/lib/structured-data";
```

- [ ] **Step 2: Add canonical to the metadata export**

Replace the existing `export const metadata` block with:
```ts
export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Crown & Canvas pet royal portraits.",
  alternates: { canonical: "/faq" },
};
```

- [ ] **Step 3: Inject the FAQPage JSON-LD**

In the returned JSX, change the opening of the outer div from:
```tsx
  return (
    <div className="bg-cream min-h-screen">
```
to:
```tsx
  return (
    <div className="bg-cream min-h-screen">
      <JsonLd data={buildFaqPageJsonLd(FAQS)} />
```

- [ ] **Step 4: Verify build + rendered schema**

Run: `npm run build`
Expected: build succeeds, `/faq` is statically generated.

Run: `npx next start &` then `curl -s http://localhost:3000/faq | grep -c '"@type":"FAQPage"'` then stop the server.
Expected: `1` (the FAQPage script is present). If `next start` is impractical, instead confirm the JSX change compiles in the build output with no type errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/faq/page.tsx
git commit -m "feat(seo): FAQPage schema + canonical on /faq"
```

---

## Task 5: Review/AggregateRating schema + canonical on home

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add imports and metadata**

Replace the current import block at the top of `src/app/page.tsx` (the lines importing the home components) by adding these lines above them:
```ts
import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { buildReviewAggregateJsonLd } from "@/lib/structured-data";
import { TESTIMONIALS } from "@/data/testimonials";
```

Then, after the imports and before `export default function HomePage()`, add:
```ts
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};
```

- [ ] **Step 2: Inject the JSON-LD into the fragment**

Change the component body from:
```tsx
  return (
    <>
      <HeroSection />
```
to:
```tsx
  return (
    <>
      <JsonLd data={buildReviewAggregateJsonLd(TESTIMONIALS)} />
      <HeroSection />
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds, `/` static. No TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(seo): site Review + AggregateRating schema + canonical on home"
```

---

## Task 6: Canonical URLs on remaining pages

Add `alternates.canonical` so every indexable page declares its preferred URL. `metadataBase` is already set in `layout.tsx`, so relative paths resolve to absolute canonicals.

**Files:**
- Modify: `src/app/styles/[slug]/page.tsx`
- Modify: `src/app/blog/[slug]/page.tsx`
- Modify: `src/app/styles/page.tsx`
- Modify: `src/app/about/page.tsx`

- [ ] **Step 1: Style detail canonical**

In `src/app/styles/[slug]/page.tsx`, inside `generateMetadata`, change the returned object from:
```ts
  return {
    title: `${style.name} — Custom Pet Portrait`,
    description: style.description,
    openGraph: {
```
to:
```ts
  return {
    title: `${style.name} — Custom Pet Portrait`,
    description: style.description,
    alternates: { canonical: `/styles/${style.slug}` },
    openGraph: {
```

- [ ] **Step 2: Blog detail canonical**

In `src/app/blog/[slug]/page.tsx`, inside `generateMetadata`, change the returned object from:
```ts
  return {
    title: post.title,
    description: post.description,
    keywords: [...post.tags],
    authors: [{ name: post.author }],
    openGraph: {
```
to:
```ts
  return {
    title: post.title,
    description: post.description,
    keywords: [...post.tags],
    authors: [{ name: post.author }],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
```

- [ ] **Step 3: Styles listing canonical**

In `src/app/styles/page.tsx`, locate the `export const metadata: Metadata = { ... }` object and add this field inside it:
```ts
  alternates: { canonical: "/styles" },
```
(If the file uses `generateMetadata` instead, add the same `alternates` field to its returned object.)

- [ ] **Step 4: About canonical**

In `src/app/about/page.tsx`, replace the existing `export const metadata` block with:
```ts
export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Crown & Canvas — transforming beloved pets into stunning royal portraits since 2026.",
  alternates: { canonical: "/about" },
};
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: build succeeds, no type errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/styles/[slug]/page.tsx src/app/blog/[slug]/page.tsx src/app/styles/page.tsx src/app/about/page.tsx
git commit -m "feat(seo): canonical URLs on style, blog, styles, and about pages"
```

---

## Task 7: Answer-shaped definitional opener on /about

GEO research shows AI engines preferentially cite content with a clear definitional sentence and concrete statistics. Add a short, quotable lede to the About hero.

**Files:**
- Modify: `src/app/about/page.tsx`

- [ ] **Step 1: Add a definitional + stat sentence to the hero**

In `src/app/about/page.tsx`, in the hero `<section>`, change:
```tsx
          <p className="mx-auto max-w-2xl text-lg text-white/70">
            We believe every pet is royalty. Crown & Canvas was born from a simple idea:
            give pet owners a way to celebrate their furry companions in the most regal way possible.
          </p>
```
to:
```tsx
          <p className="mx-auto max-w-2xl text-lg text-white/70">
            Crown & Canvas is a custom pet portrait studio that turns your pet&apos;s photo into
            museum-quality royal artwork, delivered as a digital download in 24-48 hours or a
            framed print in 5-7 days. Since 2026 we have helped thousands of pet owners — about
            65% of them buying a portrait as a gift — celebrate their companions as royalty.
          </p>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/about/page.tsx
git commit -m "feat(geo): add answer-shaped definitional opener to about page"
```

---

## Task 8: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full test suite passes**

Run: `npm test`
Expected: all tests pass (robots + structured-data).

- [ ] **Step 2: Production build is green**

Run: `npm run build`
Expected: build completes with no errors; `/faq`, `/`, `/about`, `/styles`, style + blog detail routes all generated.

- [ ] **Step 3: Confirm rendered structured data**

Start the server: `npx next start` (in a background shell), then:
```bash
curl -s http://localhost:3000/ | grep -o '"@type":"AggregateRating"' | head -1
curl -s http://localhost:3000/faq | grep -o '"@type":"FAQPage"' | head -1
curl -s http://localhost:3000/robots.txt | grep -i gptbot
curl -s http://localhost:3000/llms.txt | head -1
```
Expected: each command prints a match (`"@type":"AggregateRating"`, `"@type":"FAQPage"`, a `GPTBot` line, and `# Crown & Canvas`). Stop the server afterward.

- [ ] **Step 4: Manual external check (note for Boss, not blocking)**

After deploy, paste a style URL and `/faq` into Google's Rich Results Test (search.google.com/test/rich-results) to confirm Product, FAQPage, and Article validate with zero errors.

- [ ] **Step 5: Write the project sync file**

Per the project CLAUDE.md integration rule, create `c:\Users\95san\Documents\AI & Business\builder\claudeclaw\hq\sync\incoming\crown-and-canvas-<timestamp>.json` summarizing the Phase 1 changes (files modified, decisions, next step = Phase 2 content engine).

---

## Self-Review

**Spec coverage (Phase 1 section of the design doc):**
- 1.1 AI crawler access → Task 2 (robots + llms.txt). ✅
- 1.2 Structured data: Product/Article/Breadcrumb already existed (scope note); FAQPage → Task 4; Review/AggregateRating → Task 3+5. ✅
- 1.3 Answer-shaped content → Task 7 (definitional opener + stat). FAQPage Q&A (Task 4) also serves this. ✅
- 1.4 Canonical URLs → Tasks 4, 5, 6. ✅
- 1.5 Internal linking → blog↔style links already exist (blog CTA → /styles, /order; related posts). No gap; not a separate task. ✅

**Placeholder scan:** No TBD/TODO. Every code step shows full code. Step 3 of Task 6 has one conditional (metadata vs generateMetadata) with both branches specified.

**Type consistency:** `buildFaqPageJsonLd` and `buildReviewAggregateJsonLd` names match between Task 3 (definition), tests, and Tasks 4–5 (usage). `JsonLd` prop is `data` everywhere. FAQ/Testimonial types imported from `@/types` consistently.

**Out of scope (correctly excluded):** Phase 2 content engine, Phase 3 audience tuning, GA4/attribution rollup.
