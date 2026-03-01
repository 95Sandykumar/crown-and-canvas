# Crown & Canvas — Business Operating Playbook

> **Mission:** Turn pet photos into premium royal portrait artwork. Hit $100K/month revenue. This is non-negotiable.

---

## Identity

Crown & Canvas is a direct-to-consumer e-commerce brand selling custom AI-generated pet portraits — digital downloads, gallery-wrapped canvases, and museum-quality framed prints. We are a **premium brand**. We do NOT compete on price. We compete on quality, speed, and emotional impact. 65% of orders are gifts.

**Tagline:** Frame Your Pet's Personality

---

## Project Structure

```
crown-and-canvas/
├── src/
│   ├── app/                              # Next.js 16 App Router pages
│   │   ├── page.tsx                      # Home — hero, social proof, testimonials, CTA
│   │   ├── layout.tsx                    # Root layout (Navbar + Footer)
│   │   ├── about/page.tsx                # Brand story & values
│   │   ├── styles/
│   │   │   ├── page.tsx                  # Style gallery with category filters
│   │   │   └── [slug]/page.tsx           # Individual style detail page
│   │   ├── faq/page.tsx                  # 10 FAQ items
│   │   ├── privacy/page.tsx              # Privacy policy
│   │   ├── terms/page.tsx                # Terms of service
│   │   ├── order/                        # 4-step order flow
│   │   │   ├── upload/page.tsx           # Step 1: Upload pet photo + name
│   │   │   ├── select-style/page.tsx     # Step 2: Choose portrait style
│   │   │   ├── customize/page.tsx        # Step 3: Tier, size, add-ons
│   │   │   └── review/page.tsx           # Step 4: Review & checkout
│   │   ├── cart/page.tsx                 # Shopping cart
│   │   ├── checkout/
│   │   │   ├── page.tsx                  # Stripe Checkout redirect
│   │   │   └── success/page.tsx          # Order confirmation
│   │   ├── api/
│   │   │   ├── checkout/route.ts         # Creates Stripe session + uploads photos to Blob
│   │   │   ├── checkout/session/route.ts # Retrieves order details from Stripe
│   │   │   ├── generate/route.ts         # AI portrait generation endpoint
│   │   │   └── webhooks/stripe/route.ts  # Payment webhook handler
│   │   ├── robots.ts                     # SEO — robots.txt
│   │   └── sitemap.ts                    # SEO — sitemap.xml
│   ├── components/
│   │   ├── home/                         # Homepage marketing sections
│   │   │   ├── hero-section.tsx          # Before/after showcase + CTA
│   │   │   ├── social-proof-bar.tsx      # "10,000+ happy pet parents"
│   │   │   ├── how-it-works.tsx          # 4-step process explainer
│   │   │   ├── style-showcase.tsx        # Featured portrait styles
│   │   │   ├── video-reels.tsx           # Embedded TikTok/Instagram content
│   │   │   ├── testimonials.tsx          # Customer reviews with star ratings
│   │   │   ├── gift-banner.tsx           # Holiday/gift marketing CTA
│   │   │   └── trust-badges.tsx          # 4.9/5 rating, guarantee badges
│   │   ├── layout/
│   │   │   ├── navbar.tsx                # Top navigation + cart icon
│   │   │   ├── footer.tsx                # Footer with links & social
│   │   │   └── order-stepper.tsx         # Order flow progress indicator
│   │   └── ui/                           # shadcn/ui Radix primitives
│   ├── data/
│   │   ├── styles.ts                     # 20 portrait styles with AI prompts
│   │   ├── products.ts                   # 3 tiers + pricing + add-ons
│   │   ├── testimonials.ts               # 6 customer reviews
│   │   ├── faq.ts                        # 10 FAQ entries
│   │   └── video-reels.ts               # 10 social media embeds
│   ├── lib/
│   │   ├── blob.ts                       # Vercel Blob upload helpers
│   │   ├── gemini.ts                     # Google Gemini AI integration
│   │   ├── stripe.ts                     # Stripe client initialization
│   │   ├── constants.ts                  # Site name, nav links, order steps
│   │   └── utils.ts                      # Utility functions (cn, etc.)
│   ├── stores/
│   │   ├── cart-store.ts                 # Zustand — shopping cart (localStorage)
│   │   └── order-flow-store.ts           # Zustand — order progress (sessionStorage)
│   ├── hooks/
│   │   └── use-cart.ts                   # Cart hook with hydration guard
│   ├── types/
│   │   └── index.ts                      # TypeScript interfaces
│   └── globals.css                       # Tailwind v4 + custom CSS variables
├── public/
│   └── portraits/                        # 20 style folders with before/after WebP images
├── CLAUDE.md                             # This file — operating playbook
├── to do.md                              # Active implementation backlog
├── .env.example                          # Environment variable template
├── .env.local                            # Local dev vars (DO NOT COMMIT)
├── package.json                          # Dependencies & scripts
├── next.config.ts                        # Image optimization & remote patterns
├── tailwind.config.ts                    # Custom colors & theme
├── tsconfig.json                         # TypeScript strict mode
└── .vercel/                              # Vercel deployment config
```

---

## Tech Stack

| Layer | Tool | Why |
|-------|------|-----|
| **Framework** | Next.js 16 App Router | Vercel-optimized, server components, edge network |
| **UI** | React 19 + Tailwind CSS v4 | Fast iteration, responsive by default |
| **Components** | shadcn/ui (Radix primitives) | Accessible, composable, no vendor lock |
| **Animations** | Framer Motion 12 | Smooth transitions, before/after reveals |
| **Icons** | Lucide React | Consistent, lightweight icon set |
| **Payments** | Stripe Checkout | Handles tax, receipts, disputes, Apple/Google Pay |
| **Storage** | Vercel Blob | Pet photos + generated portraits |
| **AI Generation** | Google Gemini (swappable) | Portrait generation pipeline, queues manual fallback |
| **Email** | Resend | Transactional emails (order confirmation, delivery) |
| **State** | Zustand 5 | Cart + order flow, persisted to storage |
| **Validation** | Zod 4 | Schema validation for API inputs |
| **Types** | TypeScript 5 (strict) | End-to-end type safety |
| **Hosting** | Vercel | Auto-scaling, global CDN, zero-config deploys |
| **Database** | None yet (Stripe is order DB) | Add Postgres when order dashboard needed |

---

## Revenue Math

| Scenario | AOV | Orders/Month | Revenue |
|----------|-----|-------------|---------|
| Conservative | $60 | 1,667 | $100K |
| **Target** | **$85** | **1,176** | **$100K** |
| Premium-heavy | $120 | 834 | $100K |

**Strategy:** Push AOV to $85+ via canvas/framed upsells, multi-pet bundles, gift wrapping add-ons, and rush processing.

---

## Pricing & Margins

| Tier | What Customer Gets | Price Range | COGS | Margin |
|------|-------------------|-------------|------|--------|
| **Digital Download** | High-res JPG + PNG (300 DPI) | $29.99 | ~$1.50 (AI compute) | ~95% |
| **Premium Canvas** | Gallery-wrapped canvas, ready to hang | $59.99–$89.99 | ~$15–25 (print partner) | ~70% |
| **Luxury Framed** | Museum-quality wood frame + UV glass | $99.99–$149.99 | ~$25–40 (print partner) | ~65% |

**Add-on Upsells (pure margin):**
- Rush Processing (3-5 business days): +$14.99
- Premium Gift Wrapping: +$9.99
- Shelter Pet Donation: variable (goodwill + tax write-off)

---

## Portrait Styles (20 Total)

| Category | Styles | Count |
|----------|--------|-------|
| **Renaissance** | The King, The Queen, The Scholar, The Duke | 4 |
| **Military** | The General, The Admiral, The Colonel, The Ace Pilot | 4 |
| **Royalty** | The Emperor, The Empress, The Prince, The Princess | 4 |
| **Fantasy** | The Wizard, The Knight, The Dragon Rider | 3 |
| **Modern** | The Astronaut, The Superhero, The Chef, The DJ, The Cowboy | 5 |

Each style has: before/after WebP images, detailed AI prompt, pet compatibility (dog/cat/both), popularity flag.
Style data lives in `src/data/styles.ts`. Each style page is a SEO landing page.

---

## Order Flow & Fulfillment

### Customer Journey
```
Browse Homepage → Explore Styles → Start Order
  → Step 1: Upload Photo + Pet Name
  → Step 2: Select Portrait Style
  → Step 3: Choose Tier (Digital/Canvas/Framed) + Size + Add-ons
  → Step 4: Review Cart → Enter Email/Name → Checkout
  → Stripe Checkout (hosted, secure)
  → Order Confirmation Page
  → Portrait Delivered via Email (digital) or Shipped (physical)
```

### Backend Order Pipeline
```
POST /api/checkout
  → Upload pet photos to Vercel Blob (base64 → URL)
  → Create Stripe Checkout session with line items + metadata
  → Redirect customer to Stripe

Stripe fires checkout.session.completed webhook
  → POST /api/webhooks/stripe
  → Log order, parse metadata (photo URLs, style, tier, size)
  → Fire-and-forget POST /api/generate for each portrait
  → Send order notification email to business owner (Resend)
  → Send order confirmation email to customer (Resend)

POST /api/generate (secured by INTERNAL_API_SECRET)
  → Call Gemini API with style prompt + pet photo
  → Upload generated portrait to Vercel Blob
  → Send portrait delivery email to customer
  → If AI unavailable: gracefully queue for manual processing
```

### Fulfillment Phases

**Phase 1 — NOW (Manual):**
- Orders visible in Stripe Dashboard
- Pet photos stored in Vercel Blob (URLs in Stripe metadata `orderData`)
- Manually create portraits using AI tool or freelancer
- Email finished portrait to customer
- Canvas/framed orders: manually forward to print partner

**Phase 2 — SOON (Semi-Automated):**
- AI generation pipeline active (Gemini or Nano Banana)
- Manual quality review before sending
- Auto-email via Resend once approved

**Phase 3 — SCALE (Fully Automated):**
- AI generates → auto quality check → auto email delivery
- Canvas/framed orders auto-forwarded to print fulfillment API (Prodigi)
- Customer gets tracking number automatically
- Order dashboard for internal tracking

---

## Physical Product Fulfillment (Print-on-Demand)

| Partner | Canvas | Framed | API | Shipping | Status |
|---------|--------|--------|-----|----------|--------|
| **Prodigi** (recommended) | Yes | Yes | REST API | Global, 5-7 days | Not integrated yet |
| Printful | Yes | Yes | REST API | US/EU, 4-8 days | Backup option |
| Gooten | Yes | Yes | REST API | Global, 5-10 days | Backup option |

**Integration flow:** Customer orders → AI generates portrait → upload high-res to Prodigi API → Prodigi prints, packs, ships to customer → tracking number emailed.

---

## Environment Variables

### Production (Set in Vercel Dashboard)

| Variable | Value | Status |
|---|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | LIVE |
| `STRIPE_SECRET_KEY` | `sk_live_...` | LIVE |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Needs webhook endpoint configured |
| `NEXT_PUBLIC_APP_URL` | `https://yourdomain.com` | Update after custom domain |
| `BLOB_READ_WRITE_TOKEN` | `vercel_blob_...` | NOT SET — create Blob store in Vercel |
| `INTERNAL_API_SECRET` | _(set in Vercel Dashboard — generate with `openssl rand -hex 32`)_ | Rotated — never commit actual value |
| `RESEND_API_KEY` | `re_...` | Set up, using onboarding@resend.dev |
| `RESEND_FROM_EMAIL` | `Crown & Canvas <orders@yourdomain.com>` | Update after domain verified in Resend |
| `ORDER_NOTIFICATION_EMAIL` | your personal email | Where you receive new order alerts |
| `GOOGLE_AI_API_KEY` | _(leave blank for now)_ | Set when ready for auto-generation |

---

## Marketing & Growth Strategy

### Paid Ads (Facebook / Instagram) — Priority #1
- **Why:** Pet owners are the #1 targetable audience on Meta platforms
- **Creative:** Before/after pet portrait transformation carousels & reels
- **Audience:** Dog/cat owners, pet gift buyers, age 25-55, household income $50K+
- **Budget:** Start $50/day, scale what converts (target 3x+ ROAS)
- **Target CAC:** <$25 at $85 AOV = healthy unit economics
- **Ad hooks:**
  - "Watch your dog become a king in 30 seconds"
  - "The gift that made her cry happy tears"
  - "Your pet deserves to be royalty"
  - "This isn't a painting — it's AI magic"
- **Retargeting:** Site visitors who didn't purchase → show testimonials + urgency

### Organic Social / UGC — Priority #2
- Post before/after transformations daily on TikTok, Instagram Reels, Facebook
- "Watch your pet become royalty" transformation video format
- Encourage customer shares: 10% off next order for posting with hashtag
- Pet influencer partnerships: $100-500 per post, micro-influencers (10K-100K followers)
- User-generated content is the best social proof — reshare everything

### SEO — Priority #3
- **Target keywords:** "custom pet portrait", "pet portrait gift", "dog portrait painting", "cat portrait art", "pet memorial portrait"
- **Content strategy:** Blog posts for seasonal + evergreen traffic
  - "Best Pet Portrait Gift Ideas for [Holiday]"
  - "How to Choose the Perfect Pet Portrait Style"
  - "Custom Pet Portraits: What to Expect"
- Each of the 20 style pages is already an SEO landing page
- Sitemap and robots.txt already configured

### Email Marketing — Priority #4
- **Post-purchase:** "Your friends' pets deserve this too" → referral offer
- **Abandoned cart:** Recovery sequence (30 min, 24hr, 72hr)
- **Holiday campaigns:**
  - Christmas countdown (Oct-Dec) — 40%+ of annual revenue
  - Mother's Day / Father's Day — "From your fur baby"
  - Valentine's Day — "For the pet parent you love"
  - National Pet Day (April 11) — limited-time promo
- **Win-back:** 90 days post-purchase → "Time for another portrait?"

### Referral / Word-of-Mouth — Priority #5
- Referral program: Give $10, get $10
- Include referral card / QR code in physical shipments
- "Share your portrait" CTA on order confirmation page
- Social sharing buttons on delivery email

---

## Sales Psychology & Copywriting

### Value Proposition
- **Emotional:** "Turn your pet into royalty" — emotional transformation, not a product
- **Gift angle:** 65% of orders are gifts — lean into this heavily
- **Urgency:** "Order by [date] for delivery by [holiday]"
- **Scarcity:** Limited-edition seasonal styles (holiday, Valentine's)
- **Social proof:** Star ratings, review counts, "10,000+ happy pet parents"

### Objection Handling
| Objection | Response |
|-----------|----------|
| "It's too expensive" | "Our customers say it's the best gift they've ever given. Museum-quality materials, not a cheap print." |
| "Is it really AI?" | "AI-assisted, human-reviewed. Every portrait gets quality checked before delivery." |
| "What if I don't like it?" | "100% satisfaction guarantee. 30-day full refund, no questions asked." |
| "How long does it take?" | "Digital: 24-48 hours. Canvas/framed: 5-7 business days. Rush available." |
| "Is this legit?" | Star ratings, testimonials, secure Stripe checkout, money-back guarantee. |

### CTA Framework
- Primary: "Create Your Portrait" (action-oriented, personal)
- Secondary: "Browse Styles" (low-commitment entry point)
- Urgency: "Order by [date] for [holiday] delivery"
- Gift: "Give the Gift of Royalty"
- Trust: "100% Satisfaction Guaranteed"

---

## Metrics to Track (From Day 1)

### Revenue Metrics
- Monthly recurring revenue (MRR)
- Average order value (AOV) — target: $85+
- Orders per day / per week / per month
- Revenue by tier (digital vs canvas vs framed)
- Upsell attach rate (gift wrap, rush, donation)

### Marketing Metrics
- Customer acquisition cost (CAC) — target: <$25
- Return on ad spend (ROAS) — target: 3x+
- Cost per click (CPC) on Meta ads
- Conversion rate: visitor → order — target: 2-4%
- Email open rate / click rate
- Social media engagement rate

### Operational Metrics
- Order-to-delivery time (digital + physical)
- Refund / return rate — target: <5%
- Customer satisfaction score
- Portrait quality rejection rate
- Support ticket volume

### Tools Needed (Not Yet Set Up)
- Google Analytics 4 (GA4) — site traffic, funnels, conversion tracking
- Meta Pixel — ad attribution, lookalike audiences, retargeting
- Stripe Dashboard — revenue, orders, disputes
- Vercel Analytics — page performance, vitals
- Hotjar or similar — heatmaps, session recordings (optional, later)

---

## Seasonal Calendar

| Month | Event | Action |
|-------|-------|--------|
| January | New Year | "New year, immortalize your pet" promo |
| February | Valentine's Day | "For the pet parent you love" campaign |
| March | Spring | New spring-themed style? |
| April | National Pet Day (Apr 11) | Flash sale, social push |
| May | Mother's Day | "From your fur baby to the best mom" |
| June | Father's Day | "From your fur baby to the best dad" |
| July-August | Summer lull | Build content, optimize, test new styles |
| September | Back to school | "Your pet misses you" angle (college students) |
| October | Halloween | Halloween-themed portrait style? |
| November | Black Friday / Cyber Monday | Biggest discount of the year (10-15% max, keep premium) |
| December | Christmas | 40%+ of annual revenue. Order deadlines. Gift guides. Full push. |

---

## Mistakes to Avoid

- **DO NOT** compete on price. We are premium. Discounts erode brand value.
- **DO NOT** launch ads without conversion tracking (GA4 + Meta Pixel). You're burning money blind.
- **DO NOT** skip quality review on AI-generated portraits. One bad portrait = bad review = lost trust.
- **DO NOT** over-promise delivery times. Under-promise, over-deliver.
- **DO NOT** ignore email list building. Every visitor should be captured (exit-intent popup, footer signup).
- **DO NOT** forget mobile optimization. 70%+ of traffic will be mobile from social ads.
- **DO NOT** commit secrets to git. Use `.env.local` locally, Vercel env vars in production.
- **DO NOT** launch without a working refund/support process. Have a support email ready.

---

## Three Highest-Leverage Moves (Right Now)

### 1. Get the site live with a custom domain
Connect domain in Vercel, set `NEXT_PUBLIC_APP_URL`, configure Stripe webhook endpoint, verify Resend email domain. This unblocks everything.

### 2. Set up analytics + Meta Pixel before spending a single dollar on ads
Install GA4 and Meta Pixel. Configure conversion events (purchase, add-to-cart, begin-checkout). Without this, you cannot optimize ads or build lookalike audiences.

### 3. Create 3 ad creatives and launch a $50/day test campaign
Before/after pet portrait transformation carousel. Customer testimonial video. "Watch your pet become royalty" reel. Test on Facebook/Instagram targeting pet owners age 25-55. Let it run 7 days, kill losers, scale winners.

---

## Business Priority List (Current)

### MUST DO (Blocks Revenue)
1. Set `BLOB_READ_WRITE_TOKEN` in Vercel — photo uploads will fail without this
2. Configure Stripe webhook endpoint for production domain
3. Connect custom domain in Vercel
4. Verify domain in Resend, update `RESEND_FROM_EMAIL`
5. Set `ORDER_NOTIFICATION_EMAIL` so you receive order alerts
6. Test a full purchase flow end-to-end on production

### SHOULD DO (First Week Live)
7. Install Google Analytics 4 + Meta Pixel
8. Set up Meta Business Manager + ad account
9. Create first 3 ad creatives (before/after transformations)
10. Launch $50/day test campaign on Meta
11. Set up abandoned cart email flow
12. Sign up for Prodigi, order a test sample canvas

### NICE TO HAVE (First Month)
13. Set up AI generation pipeline (Gemini or Nano Banana API key)
14. Build order dashboard (add Postgres, admin page)
15. Add email popup for list building (exit intent + footer)
16. Blog: first 3 SEO articles
17. Set up referral program
18. Add star ratings with review counts below each product card
19. Add multi-pet bundle discount logic

---

## Code Conventions

- TypeScript strict mode — no `any` types
- Tailwind CSS v4 for all styling — no inline styles, no CSS modules
- App Router with server components by default
- `"use client"` only when needed (interactivity, hooks, browser APIs)
- Keep API routes lean — business logic belongs in `src/lib/`
- Data files live in `src/data/` — styles, products, testimonials, FAQs
- State management in `src/stores/` — Zustand with persistence
- Custom hooks in `src/hooks/`
- Type definitions in `src/types/`
- Never commit secrets — `.env.local` locally, Vercel env vars in production
- Commit messages: `feat:`, `fix:`, `chore:`, `docs:` prefixes
- Images: WebP format, optimize for web, use `next/image` with proper dimensions

---

## Key File Quick Reference

| What | Where |
|------|-------|
| Homepage | `src/app/page.tsx` |
| Style gallery | `src/app/styles/page.tsx` |
| Style detail | `src/app/styles/[slug]/page.tsx` |
| Order flow | `src/app/order/upload/`, `select-style/`, `customize/`, `review/` |
| Stripe checkout API | `src/app/api/checkout/route.ts` |
| Stripe webhook | `src/app/api/webhooks/stripe/route.ts` |
| AI generation | `src/app/api/generate/route.ts` |
| Portrait styles data | `src/data/styles.ts` |
| Product tiers + pricing | `src/data/products.ts` |
| Testimonials | `src/data/testimonials.ts` |
| Cart state | `src/stores/cart-store.ts` |
| Order flow state | `src/stores/order-flow-store.ts` |
| Blob storage helpers | `src/lib/blob.ts` |
| Gemini AI integration | `src/lib/gemini.ts` |
| Stripe client | `src/lib/stripe.ts` |
| Site constants | `src/lib/constants.ts` |
| Global CSS | `src/globals.css` |
| Env template | `.env.example` |
| Implementation backlog | `to do.md` |

---

## Deep Work Options (High-Impact Sessions)

When you have a focused block of time, pick one of these:

| Session | Time | Impact |
|---------|------|--------|
| **Full production deploy** — domain, env vars, webhook, Resend, end-to-end test | 2-3 hours | Unblocks everything |
| **Analytics setup** — GA4, Meta Pixel, conversion events, test tracking | 1-2 hours | Unblocks paid ads |
| **Ad creative production** — 3 before/after carousel + 1 video reel | 2-3 hours | Unblocks revenue |
| **Prodigi integration** — sign up, test sample, plan API integration | 1-2 hours | Unblocks physical fulfillment |
| **Email flows** — abandoned cart sequence, post-purchase referral, welcome series | 2-3 hours | Increases LTV |
| **AI pipeline activation** — get API key, test generation quality, tune prompts | 1-2 hours | Automates fulfillment |
| **SEO content** — write 3 blog posts targeting high-intent keywords | 3-4 hours | Long-term organic traffic |

---

## Names & Lingo

| Term | Meaning |
|------|---------|
| **Portrait** | The AI-generated artwork of a customer's pet |
| **Style** | One of 20 artistic themes (e.g., The King, The Astronaut) |
| **Tier** | Product level: Digital, Canvas, or Framed |
| **Order flow** | The 4-step process: Upload → Style → Customize → Review |
| **AOV** | Average Order Value — target $85+ |
| **CAC** | Customer Acquisition Cost — target <$25 |
| **ROAS** | Return on Ad Spend — target 3x+ |
| **UGC** | User-Generated Content — customer photos/videos of their portraits |
| **Blob** | Vercel Blob — cloud storage for pet photos and generated portraits |
| **Nano Banana** | Alternative AI generation API (potential swap for Gemini) |
| **Prodigi** | Recommended print-on-demand partner for physical products |
| **Resend** | Transactional email provider |
| **Fire-and-forget** | Async API call that doesn't block the response (used for AI generation) |

---

*Last updated: February 2026. This is the single source of truth for Crown & Canvas operations.*
