# Crown & Canvas — Active Backlog

## Completed
- [x] Add tagline — "Frame Your Pet's Personality"
- [x] Add star ratings with review count numbers below product cards
- [x] GA4 + Meta Pixel analytics integration (code ready, needs IDs in Vercel)
- [x] JSON-LD structured data (Organization schema)
- [x] OG tags, sitemap, robots.txt
- [x] Stripe webhook configured for production
- [x] Custom domain connected (crownandcanvas.us)
- [x] Security hardening — server-side pricing, input validation, XSS prevention, CSRF protection, security headers
- [x] Secret rotation (INTERNAL_API_SECRET)
- [x] Blog system — 3 SEO articles, blog index, individual post pages, sitemap integration
- [x] Full production build verified (46 pages, all API routes functional)
- [x] Code audit — checkout, webhook, generation pipeline, blob storage, all clean

## BLOCKERS — Must Complete to Process Orders (Manual Steps)

### Critical (Blocks ALL revenue)
- [ ] **Enable Stripe 2FA** — Dashboard > Settings > Security > Enable 2FA (11 days overdue!)
- [ ] **Set `BLOB_READ_WRITE_TOKEN`** — Vercel Dashboard > Storage > Blob > Create Store > Copy token to env vars
- [ ] **End-to-end test purchase** — Make a real $29.99 test order on crownandcanvas.us, then refund

### Important (Blocks features but not orders)
- [ ] Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Vercel (create GA4 property first)
- [ ] Set `NEXT_PUBLIC_META_PIXEL_ID` in Vercel (create pixel in Meta Business Manager)
- [ ] Verify crownandcanvas.us domain in Resend, update `RESEND_FROM_EMAIL`
- [ ] Set `ORDER_NOTIFICATION_EMAIL` so you receive order alerts
- [ ] Consider making GitHub repo private (old secret in git history)

## Future Features
- [ ] AI generation pipeline activation (set `GOOGLE_AI_API_KEY`)
- [ ] Prodigi print-on-demand integration for canvas/framed orders
- [ ] Order dashboard (add Postgres + admin page)
- [ ] Email popup for list building (exit intent + footer signup)
- [ ] Abandoned cart email flow
- [ ] Referral program (give $10, get $10)
- [ ] Multi-pet bundle discount logic
- [ ] Customer gallery / UGC collection page
