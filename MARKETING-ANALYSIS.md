# Crown & Canvas — Complete Marketing Analysis

*Compiled: 2026-06-12. Research-backed (sources at bottom). This is the action document for going 200% on targeting.*

---

## 1. First Customer Investigation

**Customer:** William "Will" McClatchy, Hernando, MS 38632
**Order:** #001, 2026-06-01 ~6:45 PM. The Dragon Rider, Digital Download, $29.99 (Stanley James, white doodle). Delivered same day with loyalty codes.

**Source: UNTRACKED.** Verified directly against the Stripe session metadata (cs_live_a1qVqZ...): no utmSource, no referrer keys exist on the session. The attribution capture commit (fcc3e29) shipped the SAME day he ordered, but after his purchase. customers.csv records him as "direct" which just means "we don't know."

**What we can infer (not proof):**
- Hernando MS is a small suburb of Memphis. Not a tech hub. Random direct typing of crownandcanvas.us is implausible.
- Only active channels on June 1: Instagram (@crownandcanvas.us daily reels) and organic Google/Bing indexing of the 20 style pages.
- He bought the Dragon Rider, a style featured in reels. Most likely source: Instagram reel or a Google search like "custom pet portrait" landing on a style page.

**Status going forward:** every order placed after June 1 evening carries utmSource / utmMedium / utmCampaign / utmContent / utmTerm / referrer in Stripe metadata. Source attribution is solved for customer #2 onward.

---

## 2. Target Audience: Hypothesis vs. Data

**Original hypothesis:** "People who don't know tech, old people with pets who love their pets a lot."

**Verdict: partially wrong, and the wrong part matters for ad targeting.**

| Hypothesis component | Verdict | What the data says |
|---|---|---|
| Loves their pet a lot | CONFIRMED | Pet humanization is structural: 69% of Millennials/Gen Z see pets as family; 70% of US pet owners buy holiday gifts for pets; 74% celebrate pet birthdays with gifts |
| Old people (65+) | REFUTED | Actual buyer data (My Pooch Face, an operating pet portrait brand): strongest demographic is **women 35-60**. Millennials are ~35% of pet owners and ~40% of pet spending. Boomers buy, but they are not the growth segment |
| Non-tech-savvy | REFUTED | The 35-50 female buyer is digital-native: shops on Instagram, discovers on TikTok, trusts UGC. The buying journey is entirely digital |

### The real primary buyer persona: "The Gift-Giving Pet Mom"
- **Who:** Woman, 35-55 (late Millennial / Gen X)
- **Income:** $60K-120K household. Note: an actual pet portrait brand tested affluent zip codes and they UNDERPERFORMED. Target passion, not wealth
- **Trigger:** Buying a gift (65-70% of category orders): Christmas, birthday, Mother's Day, "just because" for a pet-obsessed friend, daughter, sister, or for her own household
- **Where she is:** Instagram + Facebook daily, Pinterest for gift ideas
- **What converts her:** before/after transformation reveals, recipient reaction videos ("my mom cried"), star ratings, satisfaction guarantee

### Secondary persona: "The Memorial Buyer"
- Friend or family member of someone who just lost a pet, buying a sympathy gift (grieving owners rarely buy for themselves but treasure receiving one)
- High intent, low price sensitivity, needs completely different creative: soft tone, "keep their memory alive," zero royal-jokey vibes
- Underserved by competitors who only do the fun angle. This is our wedge segment
- Run as a SEPARATE ad set. Never mix memorial and celebration messaging

### Tertiary persona: "The Pet Dad / Self-Buyer"
- Men 28-45 buying for themselves, skews toward the fun styles (General, Ace Pilot, Dragon Rider). Our actual first customer fits here. Smaller volume, real segment

### Market size context
- US pet industry: $158B (2025), forecast $165B (2026) (APPA)
- AI pet portrait market: ~$240M in 2025 (single source, directional)
- Category repeat purchase rate: 22%; 60% of buyers share portraits on social. Both argue hard for email capture and a referral loop

---

## 3. Channel Strategy (Priority Order)

| # | Channel | Role | Why |
|---|---|---|---|
| 1 | **Meta (FB + IG) paid** | Primary revenue driver | Pet targeting CPM ~$9.56 (vs $14.19 platform median), CPC ~$0.61, pet CPA $15-38. At $85 AOV that is 2.2x-5.7x ROAS. Best-documented channel for this exact niche (Crown & Paw runs here year-round) |
| 2 | **Pinterest** | Organic now, paid later | Audience = female 25-45 higher income = exact buyer overlap. 83% of users make purchase decisions from Pinterest discovery. Pin all 20 styles with keyword-rich descriptions. Near-zero cost |
| 3 | **Instagram organic** | Already built, currently DOWN | Daily reel pipeline exists (crown-ig-reel PM2) but is stopped, blocked on brand login. Restart it. It feeds the ads (Spark-style social proof) and likely sourced customer #1 |
| 4 | **TikTok organic** | Awareness, not direct response | Pet content gets 71% video completion vs 43% ecommerce average; UGC converts 40% better than polished ads. Skews 18-34 so weaker purchase intent at our price point. Repost the same reels, zero extra cost |
| 5 | **Google Search paid** | Later, canvas/framed only | Pet care search converts at 13.4% but ~$56 cost per conversion. Only viable on $99+ tiers. Not now |
| 6 | **Etsy** | Social proof + discovery | Custom pet portraits are a top Etsy niche; built-in gift-buyer intent and review infrastructure. Worth a listing to harvest reviews |

---

## 4. What It Takes to Run the Meta (FB + IG) Campaign

### Phase 0 — Prerequisites (blockers, in order)

1. **Meta Business Manager + ad account** (manual, Boss): business.facebook.com, create Business Portfolio, verify domain crownandcanvas.us (DNS TXT record), add payment method. ~45 min
2. **Create Meta Pixel (Dataset)** in Events Manager, set `NEXT_PUBLIC_META_PIXEL_ID` in Vercel, redeploy. The pixel code is ALREADY in layout.tsx waiting for the env var. ~10 min
3. **Code conversion events** (agent task, ~2-3 hrs): currently only PageView fires. Need:
   - `ViewContent` on style detail pages (value = style viewed)
   - `AddToCart` in cart-store / order flow
   - `InitiateCheckout` on checkout POST
   - `Purchase` with value + currency on /checkout/success (client) AND server-side via Conversions API from the Stripe webhook (dedupe with event_id). Server-side matters: iOS blocks ~30% of browser pixels
4. **GA4 fix:** DONE 2026-06-12. The prod env var was literally `G-37EHK5H48X\n` (stray \n) so the layout regex rejected it and GA4 never loaded since March. Cleaned and redeployed
5. **Instagram account:** link @crownandcanvas.us to the Facebook page so ads can run in IG placements with our handle

### Phase 1 — Creative production (before spending $1)

Minimum 3 ads, target 5-6. All 4:5 vertical (1080x1350) for feed + 9:16 (1080x1920) for Reels/Stories. Captions burned in (85% watch muted). Hook inside 2 seconds, pet first.

| # | Creative | Format | Persona |
|---|---|---|---|
| 1 | Before/after transformation reveal: real photo 2-3s, dramatic music hit, portrait reveal | 15-30s video | Gift Mom + Self-buyer |
| 2 | "Which one is your pet?" style showcase | Carousel (6-8 styles) | Top of funnel |
| 3 | Recipient reaction / "the gift that made her cry" | UGC-style video | Gift Mom |
| 4 | Memorial: "Keep their memory alive forever" soft piano, slow reveal | 15s video | Memorial (separate ad set) |
| 5 | Stanley James case study (ask Will for permission + a testimonial via the loyalty-code follow-up email) | Static or video | Social proof |

Raw material already exists: 20 styles x before/after WebP pairs in public/portraits/ plus the Remotion reel pipeline can render the videos.

**Ad hooks (tested category language):**
- "Watch your dog become royalty in 30 seconds"
- "The gift that made her cry happy tears"
- "What if your dog was a Renaissance General?"
- Memorial: "They were never just a pet."

### Phase 2 — Campaign structure at launch ($50/day)

New pixel = no data, so start MANUAL, not Advantage+ (ASC needs ~50 purchase events/week to learn; we'd be Learning Limited forever at launch budget).

```
Campaign: Sales (website purchases), CBO OFF at first
├── Ad Set A ($20/day): Broad, US, women 30-55, interests: dogs OR cats
│   └── Creatives 1, 2, 3
├── Ad Set B ($20/day): Broad, US, all 25-55, NO interest stacking (let creative target)
│   └── Creatives 1, 3, 5
└── Ad Set C ($10/day): Memorial, US, 30-65, interests: pet loss/rainbow bridge adjacents
    └── Creative 4 only
```

**Rules:**
- Learning phase is 7-14 days. Touch NOTHING during it (no budget edits, no creative swaps; each edit resets learning)
- Kill criteria after ~$50 spent per ad: CTR under 1% or zero ATC. Pet niche benchmarks: CTR 1.7-2.1%, CPC ~$0.61, CPM ~$10-14
- Target CPA $15-25 (category best-in-class $15.29; acceptable ceiling $38 at $85 AOV)
- After 50+ total purchase events: launch an Advantage+ Shopping campaign alongside (ASC averages 32% lower CPA once seeded). Don't run ASC and manual on the same audience simultaneously
- Retargeting ad set once pixel pool exists (~500+ visitors): testimonials + guarantee + 10% style-page abandoners

**UTM discipline:** every ad URL gets `?utm_source=facebook&utm_medium=paid&utm_campaign=launch-june26&utm_content=<creative-name>`. Our checkout writes these to Stripe metadata, so we get per-creative revenue attribution independent of Meta's reporting.

### Phase 3 — Budget and expectations (first 30 days)

| Item | Number |
|---|---|
| Spend | $50/day x 30 = $1,500 |
| Expected CPM | $10-14 → ~115-150K impressions |
| Expected CPC | $0.60-1.20 → ~1,400-2,300 clicks |
| Site conversion (category) | 2.3-3.3% → ~35-70 orders |
| Expected CPA | $21-43 early, improving as pixel learns |
| Revenue at $45 blended AOV* | $1,600-3,200 |

*Current AOV is $29.99 (digital only sold so far). The plan only beats breakeven if canvas/framed upsells lift AOV toward the $85 target. Push physical tiers in ads (show canvas on a wall, not a JPG).

First month realistically lands near breakeven. That is the price of pixel data. Month 2-3 is where ROAS 3x+ becomes achievable with ASC + retargeting + winning creative scaled.

### Seasonality (plan the year)
- **NOW (June):** Father's Day window (to ~June 20), "from your fur baby to the best dad"
- **July-Aug:** cheap CPMs, summer lull. Seed pixel, build creative library, collect UGC
- **Oct 1-Dec 15:** CRITICAL. 40%+ of annual revenue. 70% of pet owners buy their pets holiday gifts ($4B+/yr). Ramp budget from Oct 1
- **Dec 16-24:** digital-only push (instant delivery is our unfair advantage after shipping cutoffs)
- **Jan-Feb:** Valentine's. **Apr-May:** Mother's Day (biggest non-Christmas peak). **Apr 11:** National Pet Day flash promo

---

## 5. Infrastructure Readiness Audit (as of 2026-06-12)

| Item | Status | Action |
|---|---|---|
| GA4 | FIXED today (was silently dead since March: env var had literal `\n`) | Verify gtag loads after deploy finishes; confirm Realtime hits |
| Meta Pixel base code | In layout.tsx, dormant | Boss creates pixel, set NEXT_PUBLIC_META_PIXEL_ID, redeploy |
| Conversion events | MISSING (only PageView) | Builder task: ViewContent/AddToCart/InitiateCheckout/Purchase + server-side CAPI |
| UTM → Stripe attribution | LIVE since June 1 evening | Nothing. Already working |
| Instagram organic pipeline | STOPPED (crown-ig-reel PM2 down, brand login blocked) | Boss: log into @crownandcanvas.us in the automation browser profile, restart PM2 |
| Email capture / abandoned cart | Resend audience exists; no popup, no abandoned-cart flow | Build after ads launch (22% category repeat rate makes this high-LTV) |
| Customer #1 UGC | Not requested yet | Review-request follow-up to Will is still unchecked in ORDER.md. Ask for testimonial + permission to use Stanley's portrait in ads |
| Pinterest | Nonexistent | Create business account, pin all 20 styles (1-2 hr task, free) |

## 6. Action Checklist (ordered)

**Boss (manual, can't be automated):**
1. Create Meta Business Manager + ad account + payment method
2. Create Pixel in Events Manager → give me the ID
3. Log into @crownandcanvas.us in the automation browser profile (unblocks daily reels)
4. Approve $50/day test budget

**Agent (I/Builder can do once #2 is done):**
5. Set pixel env var + redeploy; code the 4 conversion events + Conversions API
6. Verify GA4 fires on live site (deploy in progress)
7. Send Will the review/testimonial request (3-day follow-up is overdue)
8. Produce 5 ad creatives from existing portrait assets + Remotion pipeline
9. Create Pinterest business account assets + pin descriptions
10. Build campaign structure in Ads Manager (Boss approves before launch)

---

## Campaign Log

**2026-06-12 — Google Ads Performance Max launched (Boss, self-serve).** Channel plan said Meta-first, but Boss started with Google PMax. Live campaign uses:
- The 50 researched search themes (this doc, section copy in chat; clusters: core product, royal/renaissance, gift intent, memorial, format, occasion)
- Asset group: 15 headlines / 5 long headlines / 5 descriptions, rewritten to include price anchor ($29.99), 24-48hr delivery, guarantee, gift angle; "10,000 happy pet parents" claim removed as unsubstantiated
- 12 split-frame before/after ad images generated at `creative/google-ads/` (6 styles x landscape 1200x628 + square 1200x1200)
- **CRITICAL open item:** GA4 ↔ Google Ads link + import of `purchase` event as Primary conversion. Until done, PMax optimizes for clicks. Boss was given exact steps 2026-06-12.
- **In progress:** Google Ads API access (manager account + developer token Basic-access application + OAuth). Placeholders in `.env.local` (`GOOGLE_ADS_*`). When filled, build `scripts/google-ads-report.mjs` + PM2 cron for daily spend analysis.

---

## Sources

Key sources behind the numbers (full list in research agent output, 2026-06-12):
- APPA 2025/2026 industry reports ($158B/$165B, 95M pet households)
- MarketingSherpa case study: My Pooch Face buyer demographics (women 35-60, passion over wealth)
- Promodo pet industry benchmarks 2026 (CPC $0.61, CPA $15.29, search CVR 13.4%)
- 27five Meta eCommerce benchmarks 2026 (pet CPM $9.56, CPA trend -5.57% YoY)
- Sovran Meta CPM benchmarks (IG Feed CTR 3.6%, FB Feed ROAS 4.7x pet products)
- Printify custom pet merch data (70% holiday gifting, 74% pet birthdays)
- Petraitly: AI pet portrait market $240M, 22% repeat rate, 60% social sharing (single source, directional)
- ATTN Agency / Alex Neiman: Advantage+ guidance (50 events/week, 32% CPA improvement)
- Wagbar pet spending demographics (Millennials ~40% of spend; $75K+ HHI = 60% of spend)
