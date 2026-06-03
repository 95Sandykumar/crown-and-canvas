# Crown & Canvas — SEO + GEO + Auto Content Engine

**Date:** 2026-06-03
**Status:** Approved design, pending spec review
**Owner:** Rex (CEO agent) / Boss

---

## Goal

Drive more qualified traffic ("footfall") and orders to crownandcanvas.com by:

1. Making every page maximally **rankable in Google** and **citable by generative engines** (ChatGPT, Perplexity, Gemini, Google AI Overviews). This is GEO = Generative Engine Optimization.
2. Running a **fully-automatic content engine** that publishes new SEO/GEO articles on a schedule and refreshes old ones ("keep rotating"), using the existing ClaudeClaw agent system.
3. Tuning topics, readability, and keywords toward an **older-skewing pet-owner audience** (memorial, gifting, companionship angles).

Success = (a) all key pages emit valid structured data and are crawlable by AI bots, (b) the engine publishes/refreshes content unattended with an agent quality gate, (c) content and UX measurably serve older buyers.

---

## Current State (already built — do not rebuild)

- **MDX blog** at `content/blog/` (3 posts) via `src/lib/blog.ts`; routes `app/blog/page.tsx` + `app/blog/[slug]/page.tsx`; included in `sitemap.ts`.
- **First-touch attribution**: `src/lib/attribution.ts` + `AttributionTracker` captures UTM/referrer/landing-path → written into **Stripe Checkout Session metadata** by `app/api/checkout/route.ts`.
- **Analytics**: GA4 + Meta Pixel in `layout.tsx`, gated on `NEXT_PUBLIC_GA_MEASUREMENT_ID` / `NEXT_PUBLIC_META_PIXEL_ID` env vars.
- **JSON-LD**: Organization + WebSite in `layout.tsx`.
- **Data files**: `src/data/styles.ts` (20 styles), `products.ts` (tiers + prices), `testimonials.ts` (reviews + ratings), `faq.ts`.

### Known gaps this design addresses
- No Product / FAQPage / Article / Breadcrumb / Review schema → weak AI citability.
- AI crawler permissions in `robots.ts` unverified; no `llms.txt`.
- No `generateMetadata` canonical URLs on dynamic pages.
- No content automation — the 3 posts are hand-made, nothing rotates.
- No older-audience topic strategy or readability tuning.

### Attribution note (out of scope, flagged)
Order source is recorded per-order in Stripe metadata only (no traffic rollup). Confirm `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set in Vercel so traffic sources aggregate in GA4. Not part of this build.

---

## Phase 1 — Technical GEO/SEO (build first)

The foundation. Mechanical, high-leverage. No content automation depends on un-optimized pages, so this ships before Phase 2.

### 1.1 AI crawler access
- `src/app/robots.ts`: explicitly **allow** `GPTBot`, `OAI-SearchBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, `Bingbot`, plus default `*`.
- New `public/llms.txt` (or `app/llms.txt/route.ts`): markdown pointing AI models at the brand description, top style pages, FAQ, and order URL.

### 1.2 Structured data (schema.org JSON-LD)
A reusable helper module `src/lib/structured-data.ts` exporting typed builders, injected per page via a `<JsonLd>` component or inline `<script type="application/ld+json">`.

| Page | Schema |
|------|--------|
| `styles/[slug]` | `Product` + `Offer` (price from `products.ts`, availability) + `AggregateRating` (from testimonials) |
| `faq` | `FAQPage` (from `faq.ts`) |
| `blog/[slug]` | `Article` (headline, author, datePublished, image) |
| `styles/[slug]`, `blog/[slug]` | `BreadcrumbList` |
| home / about | `Review` items from `testimonials.ts` |

All builders pull from existing data files — single source of truth, no duplicated facts.

### 1.3 Answer-shaped content (GEO patterns)
Apply to home, about, FAQ, and top style pages:
- A one-sentence **definitional opener** ("Crown & Canvas is a custom pet portrait studio that turns your pet's photo into museum-quality royal artwork.").
- **Q&A blocks** with direct, quotable answers.
- **Statistics with attribution** (e.g. "65% of our orders are gifts").
- A **comparison element** (tiers/styles) AI can lift into a summary.

### 1.4 Canonical URLs + per-page metadata
- Add `generateMetadata` to `styles/[slug]` and `blog/[slug]` with title, description, OG image, and `alternates.canonical`.

### 1.5 Internal linking
- Blog posts link to the relevant style page(s) and the order CTA.
- Style pages link to related blog posts (reuse `getRelatedPosts` pattern).

**Phase 1 verification:** Google Rich Results Test passes for Product/FAQ/Article; `robots.txt` shows the AI bot allows; `llms.txt` reachable; each dynamic page emits a canonical tag; build is green.

---

## Phase 2 — Fully-automatic content engine

Publishes new articles and refreshes old ones on a schedule, with no human gate but a mandatory **agent** quality gate.

### 2.1 Writer + gate
- **Catalyst** (content/marketing agent, has `seo-content-writer` + `geo-content-optimizer` skills) writes the article.
- **Sentinel** (mandatory QA per project rules) reviews before publish: brand-voice check, schema validity, no duplicate topic, no banned terms (em-dashes, internal product/bot names), min word count, factual-claim sanity.

### 2.2 Scheduler
- A **PM2 cron** process in ClaudeClaw `ecosystem.config.cjs`, e.g. `crown-content-engine`, ~3×/week (cron TBD in plan). Sets `CLAUDECODE=` empty per existing convention. **Never `schtasks`.**

### 2.3 Topic backlog (self-replenishing)
- A repo data file, `content/topic-queue.json` (or `.ts`): array of briefs `{ keyword, intent, audienceAngle, internalLinks[], status }`.
- Engine pops the next `pending` brief each run.
- When `pending` count drops below a threshold, an agent step proposes new keyword targets (skewed older-audience + high-intent) and appends them → rotates indefinitely.

### 2.4 Run flow (per cron fire)
```
1. Decide mode: NEW (publish) or REFRESH (update oldest/stalest post). Alternate.
2. NEW:    pop next brief → Catalyst writes MDX (frontmatter + GEO answer-shape
           + Phase-1 schema-friendly structure + internal links) → generate hero
           image (nano-banana) → Sentinel QA.
   REFRESH: select oldest post → Catalyst updates stats/date/adds a section →
           Sentinel QA.
3. On QA pass: write to content/blog/<slug>.mdx, git add+commit+push (Vercel
   auto-deploys). On QA fail: log, skip, leave brief pending, ping Boss.
4. Telegram ping to Boss: what published/refreshed + the live URL.
5. Write the project sync file (per project CLAUDE.md integration rule).
```

### 2.5 Safety / reversibility
- Every publish is a **git commit** → fully revertable.
- Brand-term blocklist enforced by Sentinel.
- Single-instance guard so overlapping cron runs don't double-publish (reuse the fulfillment worker's lock pattern).

**Phase 2 verification:** a manual dry-run produces a valid MDX file that passes Sentinel and renders; a real cron fire publishes + deploys + pings; refresh mode updates an existing post's date and content.

---

## Phase 3 — Older-audience tuning

### 3.1 Topic strategy (seeds the Phase 2 backlog)
High-intent, emotional, older-skewing themes: pet memorial / remembrance portraits, "a gift from the grandkids," honoring a late pet, companion pets for empty-nesters/retirees, portrait as a keepsake.

### 3.2 Readability / accessibility pass
- Larger base font, strong contrast, simplified primary CTA.
- Prominent phone/email reassurance and 30-day guarantee (older buyers convert on trust).
- Verify mobile legibility (70%+ traffic is mobile).

### 3.3 Keyword angles
Document a keyword map (e.g. "pet memorial portrait", "remembrance gift for pet loss", "portrait of my late dog") that serves both SEO content and ad targeting.

**Phase 3 verification:** backlog seeded with older-audience briefs; readability changes pass a contrast/font check; keyword map documented.

---

## Build Order & Decomposition

1. **Phase 1** ships standalone (technical SEO/GEO). Independently valuable.
2. **Phase 2** depends on Phase 1 (engine produces Phase-1-shaped content).
3. **Phase 3** seeds Phase 2's backlog and is a parallel UX pass.

Each phase gets its own implementation plan. This spec covers all three; the first plan targets **Phase 1**.

## Out of Scope
- Stripe attribution rollup / GA4 dashboarding (flagged, separate).
- Paid ad campaign setup.
- Print-fulfillment (Prodigi) integration.
- Net-new visual redesign beyond the Phase 3 readability pass.

## Open Questions
- Exact cron cadence for the engine (decide in Phase 2 plan).
- Whether `llms.txt` lives as a static file or a route (decide in Phase 1 plan).
