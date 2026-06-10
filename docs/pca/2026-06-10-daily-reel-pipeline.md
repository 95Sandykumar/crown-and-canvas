# PCA: Daily Instagram Reel Pipeline Never Ran

**Date:** 2026-06-10
**Status:** Fixed, verified end-to-end same day
**Impact:** 3 missed posting days (Jun 8, 9, 10 before fix). Queue showed 1 posted, 28 pending. No data loss.

## Summary

The "autonomous" daily reel pipeline built on 2026-06-07 never made a single automatic post. It was designed around a GitHub Actions cron, but the workflow never reached GitHub and could not have worked even if it had. Only the Day-1 reel went out, and that was posted manually via browser automation.

## Root Cause Chain (three independent failures, any one fatal)

1. **The pipeline was never pushed to GitHub.** All 3 pipeline commits (plus 5 blog commits) sat on local `master`, 8 commits ahead of `origin/master`. GitHub only fires `schedule:` triggers from the workflow file on the remote default branch. Remote had no workflow, so the cron simply did not exist. Zero runs, zero failures, zero alerts: a silent gap.

2. **The push credential cannot push workflows.** Both the stored git credential and the gh CLI token have scopes `gist, read:org, repo` but not `workflow`. Any push containing `.github/workflows/*` is rejected by GitHub ("refusing to allow an OAuth App to create or update workflow"). This is almost certainly why the commits got stranded on Jun 7.

3. **The workflow's posting path was fiction.** It posts via the Instagram Graph API and requires repo secrets `IG_USER_ID`, `IG_ACCESS_TOKEN`, `BLOB_READ_WRITE_TOKEN`. `gh secret list` is empty, and no IG Business account / Meta app exists to mint a token. The only mechanism that has ever posted a reel is browser automation against the saved login at `~/.playwright-mcp-profile` (claudeclaw `scripts/post-reel-v3.mjs`), which only exists on this machine and can never run on a GitHub-hosted runner.

**Latent fourth issue found during verification:** a stale automation Chrome (puppeteer 148) was still running against `.playwright-mcp-profile`, locking it and bumping its profile version, which made fresh puppeteer launches die with exit code 33 (downgrade migration hitting access-denied on locked dirs).

## Why It Wasn't Caught

- The design (CI cron) and the reality (local browser session) were incompatible from day one, but the workflow was written as if the API path existed.
- A cron that never gets registered fails silently. There was no "pipeline did not run today" alarm.
- Done was reported at "merged to master" (local), not at "first scheduled run produced a live reel."

## Corrective Actions (all done 2026-06-10)

| # | Action | Where |
|---|--------|-------|
| 1 | New local poster `scripts/post-reel-local.mjs`: renders next pending reel (Remotion, no secrets), posts via proven claudeclaw `post-reel-v3.mjs` (saved session), marks queue + commits + pushes **only after the share is verified**. Idempotent per local day. | crown-and-canvas |
| 2 | Kills stale `.playwright-mcp-profile` Chromes before launching and pins the newest cached Chrome via `PUPPETEER_EXECUTABLE_PATH` (prevents the lock + downgrade crash). | `post-reel-local.mjs` |
| 3 | PM2 cron `crown-ig-reel` at **16:00 daily + 20:00 catch-up** (America/Chicago). The 20:00 firing no-ops if 16:00 posted (idempotency), and catches up if the laptop was off at 16:00. `pm2 save` done. | claudeclaw `ecosystem.config.cjs` |
| 4 | GitHub workflow removed from `.github/workflows/` (unpushable + dead). Preserved with resurrection notes at `docs/instagram-post.workflow.yml.disabled`. Unpushed history rewritten (local-only commits) to drop the workflow file, then everything pushed: `origin/master` is now in sync. | crown-and-canvas |

## Verification + Incident #2 Found During It (Wrong Account)

The first live run rendered and posted successfully — but to the **wrong Instagram account**. The saved automation profile (`~/.playwright-mcp-profile`) was no longer logged into `@crownandcanvas.us`: its active session had silently become Boss's personal account `@the_homie_24` sometime after Jun 7, and the brand session was fully logged out (the account switcher shows a login form, not a switch option). The poster (`post-reel-v3.mjs`) only checked "is a session logged in", not "is it the RIGHT session". Boss caught it immediately and deleted the mis-posted reel; the queue item was reverted to pending.

**Corrective actions for incident #2:**
- New guard `claudeclaw/scripts/ig-active-account.mjs` + hard pre-flight in `post-reel-local.mjs`: the run aborts BEFORE rendering or posting unless the active session is exactly `@crownandcanvas.us`. A wrong-account post is now structurally impossible.
- Remaining manual step (Boss-only, one-time): log the automation profile back into `@crownandcanvas.us`. The moment that's done, the next cron firing posts automatically — no other action needed.

**Daily proof going forward:** a `chore(instagram): posted <id>` commit lands on GitHub each day a reel goes out. **No commit by ~20:30 CST = the day failed; check `pm2 logs crown-ig-reel`.**

## Lessons

0. **Verify the identity, not just the session.** A logged-in browser profile is shared mutable state — anything (or anyone) can change which account is active. Automation that publishes must assert WHO it is publishing as, every run.
1. **"Scheduled" only counts when the scheduler has actually accepted the job.** For GitHub cron: verify with `gh workflow list` after pushing. For PM2: verify the process appears with the cron in `pm2 list` + `pm2 save`.
2. **Never design automation around credentials that don't exist yet.** The API-based workflow was aspirational; the working mechanism (browser session) dictated where the cron must live (this machine).
3. **Push is part of done.** `git status -sb` showing `[ahead N]` at session end means the work is not deployed.
4. **The push credential lacks `workflow` scope.** Any future attempt to ship GitHub Actions files needs `gh auth refresh -s workflow` (one-time, interactive) first.

## To Resurrect the CI/API Path Later (optional)

1. Convert IG account to Business, create Meta app with `instagram_content_publish`.
2. Set repo secrets `IG_USER_ID`, `IG_ACCESS_TOKEN`, `BLOB_READ_WRITE_TOKEN`.
3. `gh auth refresh -s workflow`, move `docs/instagram-post.workflow.yml.disabled` back to `.github/workflows/instagram-post.yml`, re-enable the schedule block.
4. Retire the PM2 `crown-ig-reel` job at the same time (never both).
