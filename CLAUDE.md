# Crown & Canvas — Operating Playbook

> **Mission:** $100K/month revenue. This is non-negotiable.

## Identity

Crown & Canvas turns pet photos into royal portrait artwork — digital, canvas, and framed.
We are a premium brand. We do NOT compete on price. We compete on quality, speed, and emotional impact.

## Revenue Math

| Scenario | AOV | Orders/Month | Revenue |
|----------|-----|-------------|---------|
| Conservative | $60 | 1,667 | $100K |
| Target | $85 | 1,176 | $100K |
| Premium-heavy | $120 | 834 | $100K |

**Strategy:** Push AOV to $85+ through canvas/framed upsells, multi-pet bundles, and gift wrapping.

## Current Architecture

```
Next.js 16 on Vercel → Stripe Checkout → Webhook → Order Notification Email
Pet photos stored in Vercel Blob
AI generation pipeline (Gemini) built but NOT active — waiting for Nano Banana API
```

### Key Files
- `src/app/api/checkout/route.ts` — Creates Stripe session, uploads pet photos to Blob
- `src/app/api/webhooks/stripe/route.ts` — Processes payments, triggers generation, sends emails
- `src/app/api/generate/route.ts` — Portrait generation endpoint (gracefully queues for manual when AI is off)
- `src/lib/blob.ts` — Vercel Blob upload helpers
- `src/lib/gemini.ts` — Google Gemini integration (swappable for Nano Banana)
- `src/data/styles.ts` — 20 portrait styles with AI prompts

### Environment Variables (Production on Vercel)
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Live Stripe keys
- `STRIPE_WEBHOOK_SECRET` — Webhook signing (whsec_...)
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob storage
- `INTERNAL_API_SECRET` — Secures /api/generate
- `NEXT_PUBLIC_APP_URL` — https://crown-and-canvas.vercel.app
- `GOOGLE_AI_API_KEY` — Not set yet (manual processing until Nano Banana ready)
- `RESEND_API_KEY` — Not set yet (order emails via Stripe dashboard for now)
- `ORDER_NOTIFICATION_EMAIL` — Not set yet

## Order Fulfillment Strategy

### Phase 1: NOW (Manual)
- Orders come in via Stripe → visible in Stripe Dashboard
- Pet photos stored in Vercel Blob (URLs in Stripe metadata `orderData`)
- Manually create portraits using reference tool (Nano Banana when ready, or freelancer)
- Email finished portrait to customer manually
- **For canvas/framed orders:** Use print-on-demand partner (see below)

### Phase 2: SOON (Semi-Automated)
- Nano Banana API integrated → portraits auto-generated
- Still manually review quality before sending
- Auto-email via Resend once approved

### Phase 3: SCALE (Fully Automated)
- AI generates → auto quality check → auto email delivery
- Canvas/framed orders auto-forwarded to print fulfillment API
- Customer gets tracking number automatically

## Physical Product Fulfillment

Canvas and framed prints require a print-on-demand partner. Options:

| Partner | Canvas | Framed | API | Shipping |
|---------|--------|--------|-----|----------|
| **Prodigi** | Yes | Yes | REST API | Global, 5-7 days |
| **Printful** | Yes | Yes | REST API | US/EU, 4-8 days |
| **Gooten** | Yes | Yes | REST API | Global, 5-10 days |

**Recommendation:** Start with **Prodigi** — best quality for art prints, global shipping, straightforward API.

**Flow:**
1. Customer orders canvas/framed tier
2. AI generates portrait (or manual)
3. Upload high-res portrait to Prodigi via API
4. Prodigi prints, packs, ships directly to customer
5. We get tracking number → email to customer

**Margins:** Print cost ~$15-25 for canvas, ~$25-40 for framed. We charge $49.99-$149.99. Healthy 60-75% margins.

## Pricing Strategy (Current)

| Tier | What They Get | Price Range | Margin |
|------|---------------|-------------|--------|
| Digital Download | High-res digital portrait | $29.99-$39.99 | ~95% |
| Premium Canvas | Gallery-wrapped canvas print | $69.99-$99.99 | ~70% |
| Luxury Framed | Museum-quality framed print | $99.99-$149.99 | ~65% |

**Upsells:**
- Rush Processing: +$14.99 (pure margin)
- Gift Wrapping: +$9.99 (pure margin)
- Shelter Donation: variable (goodwill + tax deduction)

## Growth Levers (Priority Order)

### 1. Paid Ads (Facebook/Instagram)
- Pet owners are the #1 targetable audience on Meta
- Creative: Before/after pet portrait transformations
- Target: Dog/cat owners, pet gift buyers, age 25-55
- Budget: Start $50/day, scale what works
- Target CAC: <$25 (3x+ ROAS at $85 AOV)

### 2. Organic Social / UGC
- Encourage customers to share portraits → offer 10% off next order
- TikTok/Reels: "Watch your pet become royalty" transformation videos
- Pet influencer partnerships ($100-500 per post)

### 3. SEO
- Target: "custom pet portrait", "pet portrait gift", "dog portrait painting"
- Blog: "Best Pet Portrait Gift Ideas", seasonal content
- Each style page is already an SEO landing page

### 4. Email Marketing
- Post-purchase: "Your friends' pets deserve this too" referral
- Abandoned cart recovery
- Holiday campaigns (Christmas, Mother's Day, Valentine's)

### 5. Seasonal Pushes
- Christmas (Oct-Dec): 40%+ of annual revenue
- Mother's/Father's Day: "From your fur baby"
- Valentine's Day: Pet parent gifts
- National Pet Day (April 11)

## Technical Decisions

- **Framework:** Next.js 16 App Router (Vercel-optimized)
- **Payments:** Stripe Checkout (handles tax, receipts, disputes)
- **Storage:** Vercel Blob (pet photos + generated portraits)
- **Email:** Resend (transactional) — set up when ready
- **AI:** Gemini pipeline built, swappable to Nano Banana
- **Hosting:** Vercel (auto-scaling, edge network)
- **No database yet** — Stripe is the order database for now. Add Postgres when we need order dashboard/tracking.

## Code Conventions

- TypeScript strict mode
- Tailwind CSS for styling
- App Router with server components by default
- `"use client"` only when needed (interactivity, hooks)
- Keep API routes lean — business logic in `src/lib/`
- Never commit secrets — use `.env.local` locally, Vercel env vars in production
- Commit messages: `feat:`, `fix:`, `chore:` prefixes

## Pre-Launch Vercel Environment Variables Checklist

Set ALL of these in Vercel → Project Settings → Environment Variables (Production):

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | From Stripe Dashboard → Developers → API Keys |
| `STRIPE_SECRET_KEY` | `sk_live_...` | From Stripe Dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Create webhook at dashboard.stripe.com/webhooks → endpoint: `https://yourdomain.com/api/webhooks/stripe` → event: `checkout.session.completed` |
| `NEXT_PUBLIC_APP_URL` | `https://yourdomain.com` | Your final production domain |
| `BLOB_READ_WRITE_TOKEN` | `vercel_blob_...` | Vercel Dashboard → project → Storage → Blob → Create store |
| `INTERNAL_API_SECRET` | `8f1368cdfce1059f483687c53195a9b9104e24cddb257bf9e1bc8773c3497b79` | Already generated — paste this exact value |
| `RESEND_API_KEY` | `re_...` | Already set up |
| `RESEND_FROM_EMAIL` | `Crown & Canvas <orders@yourdomain.com>` | Update after domain verified in Resend |
| `ORDER_NOTIFICATION_EMAIL` | your email | Where YOU receive new order alerts |
| `GOOGLE_AI_API_KEY` | _(leave blank for now)_ | Set when ready for auto-generation |

## Immediate TODO

1. ~~**Set up Resend**~~ — DONE. Using onboarding@resend.dev for now.
2. **REMINDER: Switch Resend from email** — Once custom domain is connected, verify domain in Resend and change from `onboarding@resend.dev` to `orders@yourdomain.com`. Also update `RESEND_FROM_EMAIL` env var on Vercel.
3. **Set up Nano Banana** — Get API, swap into generation pipeline
4. **Choose print partner** — Sign up for Prodigi/Printful, test a sample order
5. **Custom domain** — Connect your domain in Vercel
6. **First ad creative** — Before/after transformation video/carousel
7. **Google Analytics / Meta Pixel** — Track conversions from day 1
