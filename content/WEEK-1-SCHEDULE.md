# Instagram Reels — Week 1 Schedule

**Cadence:** 1 reel/day, auto-posted at **22:00 UTC** (5pm ET / 2pm PT) via
`.github/workflows/instagram-post.yml`.
**Source:** `content/instagram-queue.json` (FIFO — posts in queue order).
**Target week:** Mon Jun 8 – Sun Jun 14, 2026 (starts the first day after the
workflow is on `master` AND the IG/Blob secrets are set).

| Day | Date (target) | Category | Reel | Portrait |
|-----|---------------|----------|------|----------|
| 1 | Mon Jun 8 | Behavior | Why does my dog tilt its head when I talk? | Renaissance King |
| 2 | Tue Jun 9 | Training | How do I stop my dog from pulling on the leash? | — |
| 3 | Wed Jun 10 | Health basics | What human foods are dangerous for dogs? (high save value) | — |
| 4 | Thu Jun 11 | Nutrition | How many treats are too many? (the 10% rule) | — |
| 5 | Fri Jun 12 | Is this normal? | Why does my cat sleep in such weird positions? | — |
| 6 | Sat Jun 13 | Gifting & keepsakes | What's the best gift for a pet lover? (product tie-in) | — |
| 7 | Sun Jun 14 | Behavior | What does it mean when my cat slow-blinks at me? | — |

Mix is intentional: dog/cat balance, educational + emotional + one product-tie
(Sat, weekend shopping intent). 22 more pending posts remain in the queue after
this week.

## To reorder the week
Edit the order of objects in `content/instagram-queue.json` — the poster always
takes the first `"status": "pending"` item. Whatever sits first goes out next.

## Activation checklist (manual — only Boss can do these)
1. Merge `feat/instagram-reel-pipeline` → `master` (scheduled runs only fire from master).
2. Switch the Instagram account to **Business/Creator**, linked to a Facebook Page.
3. Create a Meta app with `instagram_basic` + `instagram_content_publish` + `pages_show_list`.
4. Add repo secrets: `IG_USER_ID`, `IG_ACCESS_TOKEN` (long-lived), `BLOB_READ_WRITE_TOKEN`.
5. (Optional) Drop a royalty-free track at `public/audio/hook.mp3` — reels are silent without it.
6. Dry-run: Actions → "Instagram daily reel" → Run workflow (check "Render only" first).
7. Refresh `IG_ACCESS_TOKEN` ~every 60 days.
