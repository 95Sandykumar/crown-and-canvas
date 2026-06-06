# Phase 2: Fully-Automatic Content Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A PM2-cron content engine that, 3×/week, has the Catalyst (marketer) agent write a new older-audience-focused SEO/GEO article (or refresh an old one), gates it through the Sentinel (qa) agent, and on approval commits + pushes to the crown-and-canvas repo (Vercel auto-deploys), then pings Boss via the Telegram digest.

**Architecture:** Modeled exactly on the existing `rex-trigger.ts` pattern. A trigger script in **claudeclaw** uses the Claude Agent SDK `query()` with `cwd` pointed at the **crown-and-canvas** repo. Two scoped agent calls per run: (1) marketer writes the MDX into the working tree, (2) qa reviews the staged file and returns APPROVE/REJECT. The *script* — not the agent — enforces the gate: APPROVE → `git commit && git push`; REJECT → `git checkout --` (discard) + log. The content backlog (`content/topic-queue.json`) and articles (`content/blog/*.mdx`) live in crown-and-canvas. Git is the safety boundary: every publish is a revertable commit.

**Tech Stack:** Node 22 + TypeScript (ESM), `@anthropic-ai/claude-agent-sdk`, tsx, PM2 cron, Vitest. Writer model: `claude-sonnet-4-6`. QA model: `claude-sonnet-4-6`.

**Locked decisions:** 3×/week (Mon+Wed publish, Fri refresh); reuse existing `/public/portraits` images (briefs carry the image path); older-skew topics (memorial/gift heavy); Sonnet.

**Repo paths (absolute):**
- crown-and-canvas: `c:\Users\95san\Documents\AI & Business\AI Agency\Pet portait\crown-and-canvas`
- claudeclaw: `c:\Users\95san\Documents\AI & Business\builder\claudeclaw`

---

## File Structure

| File | Repo | Responsibility | Action |
|------|------|----------------|--------|
| `content/topic-queue.json` | crown-and-canvas | Seeded backlog of older-skew article briefs | Create |
| `src/content-engine/queue.ts` | claudeclaw | Pure helpers: read/pick/mark/count briefs | Create |
| `src/content-engine/queue.test.ts` | claudeclaw | Unit tests for queue helpers | Create |
| `src/content-engine-trigger.ts` | claudeclaw | Cron orchestrator (write → qa-gate → commit/push → digest) | Create |
| `ecosystem.config.cjs` | claudeclaw | 3 PM2 cron entries (Mon/Wed publish, Fri refresh) | Modify |

---

## Task 1: Seed the topic backlog (crown-and-canvas)

The engine's fuel. Each brief carries everything the writer needs, including a pre-chosen hero image from the existing portrait library (no runtime image generation).

**Files:**
- Create: `content/topic-queue.json` (in crown-and-canvas)

- [ ] **Step 1: Create the seeded backlog**

Create `content/topic-queue.json`:
```json
{
  "briefs": [
    {
      "slug": "pet-memorial-portrait-honoring-a-late-dog-or-cat",
      "title": "Pet Memorial Portraits: A Gentle Way to Honor a Dog or Cat You've Lost",
      "keyword": "pet memorial portrait",
      "audienceAngle": "Grieving older pet owners who want a dignified keepsake of a pet that passed.",
      "image": "/portraits/royalty-princess/after.webp",
      "imageAlt": "A regal memorial portrait of a beloved pet",
      "internalLinks": ["/styles", "/order/upload"],
      "status": "pending"
    },
    {
      "slug": "best-pet-portrait-gift-from-the-grandchildren",
      "title": "The Pet Portrait Gift From the Grandkids That Brings Grandparents to Tears",
      "keyword": "pet portrait gift for grandparents",
      "audienceAngle": "Adult children/grandchildren buying for an older relative who dotes on their pet.",
      "image": "/portraits/renaissance-king/after.webp",
      "imageAlt": "A royal pet portrait given as a heartfelt gift",
      "internalLinks": ["/styles", "/order/upload"],
      "status": "pending"
    },
    {
      "slug": "custom-pet-portrait-companion-for-empty-nesters",
      "title": "Why a Custom Pet Portrait Is the Perfect Keepsake for Empty Nesters",
      "keyword": "custom pet portrait",
      "audienceAngle": "Retirees and empty-nesters whose pet is their daily companion.",
      "image": "/portraits/renaissance-queen/after.webp",
      "imageAlt": "An elegant custom portrait of a companion pet",
      "internalLinks": ["/styles", "/about"],
      "status": "pending"
    },
    {
      "slug": "how-to-choose-a-photo-for-your-pet-portrait",
      "title": "How to Choose the Perfect Photo for Your Pet's Portrait (Simple Guide)",
      "keyword": "best photo for pet portrait",
      "audienceAngle": "Less tech-savvy buyers who need clear, reassuring, large-text guidance.",
      "image": "/portraits/renaissance-scholar/after.webp",
      "imageAlt": "A pet portrait created from a clear reference photo",
      "internalLinks": ["/faq", "/order/upload"],
      "status": "pending"
    },
    {
      "slug": "renaissance-pet-portraits-explained",
      "title": "Renaissance Pet Portraits: Turn Your Dog or Cat Into Royalty",
      "keyword": "renaissance pet portrait",
      "audienceAngle": "Classic, traditional buyers drawn to old-master art styles.",
      "image": "/portraits/renaissance-duke/after.webp",
      "imageAlt": "A Renaissance-style royal pet portrait",
      "internalLinks": ["/styles/renaissance-king", "/order/upload"],
      "status": "pending"
    },
    {
      "slug": "pet-portrait-for-mothers-day-from-the-dog",
      "title": "A Pet Portrait for Mother's Day — 'From the Dog' (She'll Love It)",
      "keyword": "pet portrait mothers day gift",
      "audienceAngle": "Gifting a portrait to an older mother/grandmother on behalf of her pet.",
      "image": "/portraits/royalty-empress/after.webp",
      "imageAlt": "A Mother's Day pet portrait gift",
      "internalLinks": ["/styles", "/order/upload"],
      "status": "pending"
    },
    {
      "slug": "framed-vs-canvas-pet-portrait-which-to-choose",
      "title": "Framed or Canvas Pet Portrait? A Plain-English Guide to Choosing",
      "keyword": "framed vs canvas pet portrait",
      "audienceAngle": "Buyers comparing physical product tiers who want a clear recommendation.",
      "image": "/portraits/military-general/after.webp",
      "imageAlt": "A framed and a canvas pet portrait side by side",
      "internalLinks": ["/styles", "/order/upload"],
      "status": "pending"
    },
    {
      "slug": "pet-portrait-as-a-sympathy-gift-for-pet-loss",
      "title": "Pet Loss Sympathy Gifts: Why a Portrait Comforts More Than Flowers",
      "keyword": "pet loss sympathy gift",
      "audienceAngle": "People comforting an older friend/relative grieving a pet.",
      "image": "/portraits/royalty-prince/after.webp",
      "imageAlt": "A comforting memorial pet portrait",
      "internalLinks": ["/styles", "/order/upload"],
      "status": "pending"
    }
  ]
}
```

- [ ] **Step 2: Commit (crown-and-canvas)**

```bash
cd "c:/Users/95san/Documents/AI & Business/AI Agency/Pet portait/crown-and-canvas"
git add content/topic-queue.json
git commit -m "feat(content): seed older-audience SEO/GEO topic backlog"
git push origin master
```

---

## Task 2: Queue helper library (claudeclaw)

Pure, tested functions for reading the backlog and tracking brief status. No agent logic here.

**Files:**
- Create: `src/content-engine/queue.ts` (in claudeclaw)
- Create: `src/content-engine/queue.test.ts` (in claudeclaw)

- [ ] **Step 1: Write the failing test**

Create `src/content-engine/queue.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { pickNextBrief, markPublished, pendingCount, type Brief } from './queue.js';

function sample(): Brief[] {
  return [
    { slug: 'a', title: 'A', keyword: 'a', audienceAngle: '', image: '/x.webp', imageAlt: '', internalLinks: [], status: 'published' },
    { slug: 'b', title: 'B', keyword: 'b', audienceAngle: '', image: '/y.webp', imageAlt: '', internalLinks: [], status: 'pending' },
    { slug: 'c', title: 'C', keyword: 'c', audienceAngle: '', image: '/z.webp', imageAlt: '', internalLinks: [], status: 'pending' },
  ];
}

describe('pickNextBrief', () => {
  it('returns the first pending brief', () => {
    expect(pickNextBrief(sample())?.slug).toBe('b');
  });
  it('returns null when nothing is pending', () => {
    const all = sample().map((b) => ({ ...b, status: 'published' as const }));
    expect(pickNextBrief(all)).toBeNull();
  });
});

describe('markPublished', () => {
  it('flips the matching brief to published without mutating input', () => {
    const briefs = sample();
    const next = markPublished(briefs, 'b');
    expect(next.find((x) => x.slug === 'b')?.status).toBe('published');
    expect(briefs.find((x) => x.slug === 'b')?.status).toBe('pending'); // immutable
  });
});

describe('pendingCount', () => {
  it('counts pending briefs', () => {
    expect(pendingCount(sample())).toBe(2);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run (in claudeclaw): `npm test src/content-engine/queue.test.ts`
Expected: FAIL — module `./queue.js` does not exist.

- [ ] **Step 3: Implement the queue helpers**

Create `src/content-engine/queue.ts`:
```ts
import { readFileSync, writeFileSync } from 'node:fs';

export interface Brief {
  slug: string;
  title: string;
  keyword: string;
  audienceAngle: string;
  image: string;
  imageAlt: string;
  internalLinks: string[];
  status: 'pending' | 'published';
}

export interface Queue {
  briefs: Brief[];
}

export function readQueue(path: string): Queue {
  const raw = readFileSync(path, 'utf-8');
  const parsed = JSON.parse(raw) as Queue;
  if (!parsed || !Array.isArray(parsed.briefs)) {
    throw new Error(`Invalid topic queue at ${path}`);
  }
  return parsed;
}

export function writeQueue(path: string, queue: Queue): void {
  writeFileSync(path, JSON.stringify(queue, null, 2) + '\n', 'utf-8');
}

/** First pending brief, or null if none remain. */
export function pickNextBrief(briefs: readonly Brief[]): Brief | null {
  return briefs.find((b) => b.status === 'pending') ?? null;
}

/** Return a new array with the matching brief flipped to published (immutable). */
export function markPublished(briefs: readonly Brief[], slug: string): Brief[] {
  return briefs.map((b) => (b.slug === slug ? { ...b, status: 'published' } : b));
}

export function pendingCount(briefs: readonly Brief[]): number {
  return briefs.filter((b) => b.status === 'pending').length;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run (in claudeclaw): `npm test src/content-engine/queue.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit (claudeclaw)**

```bash
cd "c:/Users/95san/Documents/AI & Business/builder/claudeclaw"
git add src/content-engine/queue.ts src/content-engine/queue.test.ts
git commit -m "feat(content-engine): topic queue helpers"
```

---

## Task 3: The trigger script (claudeclaw)

The orchestrator. Modeled on `src/rex-trigger.ts`. Two scoped agent calls; the script enforces the QA gate via git.

**Files:**
- Create: `src/content-engine-trigger.ts` (in claudeclaw)

- [ ] **Step 1: Create the trigger script**

Create `src/content-engine-trigger.ts`:
```ts
// src/content-engine-trigger.ts -- PM2 cron runner for the Crown & Canvas content engine.
//
// CONTENT_MODE=publish  -> write a NEW article from the next pending brief
// CONTENT_MODE=refresh  -> update the OLDEST existing post (freshness)
//
// Flow per run:
//   1. marketer (Catalyst) agent writes/updates an MDX file in the crown-and-canvas working tree
//   2. qa (Sentinel) agent reviews the changed file -> APPROVE / REJECT
//   3. script enforces the gate: APPROVE -> commit + push (Vercel auto-deploys); REJECT -> discard
//   4. queue Telegram digest summary; exit 0

import { stripClaudeCodeSessionVars } from './env.js';
stripClaudeCodeSessionVars();

import { query } from '@anthropic-ai/claude-agent-sdk';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import pino from 'pino';
import { writeToDigest } from './digest.js';
import { readQueue, writeQueue, pickNextBrief, markPublished, pendingCount, type Brief } from './content-engine/queue.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLAUDECLAW_ROOT = resolve(__dirname, '..');
const AGENTS_DIR = resolve(CLAUDECLAW_ROOT, 'hq', 'agents');

const CONTENT_REPO = process.env.CONTENT_REPO_PATH
  ?? 'c:\\Users\\95san\\Documents\\AI & Business\\AI Agency\\Pet portait\\crown-and-canvas';
const QUEUE_PATH = resolve(CONTENT_REPO, 'content', 'topic-queue.json');
const BLOG_DIR = resolve(CONTENT_REPO, 'content', 'blog');

const WRITER_MODEL = 'claude-sonnet-4-6';
const QA_MODEL = 'claude-sonnet-4-6';
const TIMEOUT_MS = 15 * 60 * 1000;

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
});

type ContentMode = 'publish' | 'refresh';

function resolveMode(): ContentMode {
  const raw = process.env.CONTENT_MODE ?? process.argv[2];
  if (raw !== 'publish' && raw !== 'refresh') {
    logger.error({ provided: raw }, "Invalid CONTENT_MODE. Expected 'publish' or 'refresh'.");
    process.exit(1);
  }
  return raw;
}

function readEnvFile(): Record<string, string> {
  try {
    const raw = readFileSync(resolve(CLAUDECLAW_ROOT, '.env'), 'utf-8');
    const out: Record<string, string> = {};
    for (const line of raw.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i === -1) continue;
      let v = t.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      out[t.slice(0, i).trim()] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function loadAgentContext(role: string, files: string[]): string {
  const parts: string[] = [];
  for (const f of files) {
    const p = resolve(AGENTS_DIR, role, f);
    if (existsSync(p)) parts.push(`--- ${f} ---\n${readFileSync(p, 'utf-8')}`);
  }
  return parts.join('\n\n');
}

function oldestPostSlug(): string | null {
  if (!existsSync(BLOG_DIR)) return null;
  const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'));
  if (files.length === 0) return null;
  let oldest = files[0];
  let oldestTime = statSync(resolve(BLOG_DIR, oldest)).mtimeMs;
  for (const f of files) {
    const t = statSync(resolve(BLOG_DIR, f)).mtimeMs;
    if (t < oldestTime) { oldest = f; oldestTime = t; }
  }
  return oldest.replace(/\.mdx$/, '');
}

function git(args: string[]): string {
  return execFileSync('git', args, { cwd: CONTENT_REPO, encoding: 'utf-8' });
}

// --- Run one agent session, return its final text -------------------------
async function runAgent(prompt: string, model: string): Promise<string> {
  const envVars: Record<string, string | undefined> = { ...process.env };
  delete envVars['CLAUDECODE'];
  const abort = new AbortController();
  let resultText: string | null = null;
  let lastText: string | null = null;

  const work = async () => {
    const conversation = query({
      prompt,
      options: {
        cwd: CONTENT_REPO,
        model,
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        settingSources: ['project', 'user'],
        env: envVars,
        abortController: abort,
      },
    });
    for await (const event of conversation) {
      const e = event as Record<string, unknown>;
      if (event.type === 'assistant' && 'message' in e) {
        const msg = e.message as Record<string, unknown> | undefined;
        const content = msg && typeof msg === 'object' ? (msg.content as unknown) : null;
        if (Array.isArray(content)) {
          for (const block of content) {
            if (block && typeof block === 'object' && 'text' in block) {
              const text = (block as { text: string }).text;
              if (text && text.trim()) lastText = text;
            }
          }
        }
      }
      if (event.type === 'result' && 'result' in e) resultText = (e.result as string) ?? null;
    }
  };

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => { abort.abort(); reject(new Error('agent timed out')); }, TIMEOUT_MS)
  );

  try {
    await Promise.race([work(), timeout]);
  } catch (err) {
    logger.error({ err }, 'agent run error');
  }
  return (resultText && resultText.trim()) ? resultText : (lastText ?? '');
}

// --- Prompts --------------------------------------------------------------
function buildWritePrompt(mode: ContentMode, marketerCtx: string, brief: Brief | null, refreshSlug: string | null): string {
  const today = new Date().toISOString().split('T')[0];
  const schemaRules = `
Frontmatter MUST be valid YAML with EXACTLY these keys:
title: string
description: string (150-160 chars, includes the target keyword)
date: "${today}"
image: string (use the provided image path)
imageAlt: string
author: "Crown & Canvas"
tags: [array of 3-5 lowercase strings]
published: true

Body rules (SEO + GEO):
- Open with ONE definitional sentence that directly answers the title (AI engines quote these).
- 900-1400 words, warm and clear for an OLDER reader: short sentences, plain words, large emotional payoff.
- Include a "Frequently Asked Questions" H2 with 3 Q&A pairs (GEO answer-shape).
- Include at least one concrete statistic (e.g. "about 65% of our orders are gifts").
- Add internal markdown links to each provided internal link path.
- End with a clear call to action linking to /order/upload.
- BANNED: em-dashes (use periods/commas), internal product or bot names, "as you know", hedging.`;

  if (mode === 'publish' && brief) {
    return `[You are Catalyst, the Crown & Canvas content/marketing agent. Use your seo-content-writer skill.]

${marketerCtx}

---
TASK: Write ONE new blog article as an MDX file at content/blog/${brief.slug}.mdx

Brief:
- Title: ${brief.title}
- Target keyword: ${brief.keyword}
- Audience angle: ${brief.audienceAngle}
- Hero image (use verbatim in frontmatter image field): ${brief.image}
- Image alt: ${brief.imageAlt}
- Internal links to include: ${brief.internalLinks.join(', ')}
${schemaRules}

Write the file with the Write tool. Do NOT commit. Do NOT touch any other file. When done, output exactly: WROTE content/blog/${brief.slug}.mdx`;
  }

  return `[You are Catalyst, the Crown & Canvas content/marketing agent.]

${marketerCtx}

---
TASK: REFRESH the existing post content/blog/${refreshSlug}.mdx so it ranks fresher.
- Update the frontmatter date to "${today}".
- Improve/expand the body by adding one new section (a new H2 with 150-250 words) relevant to the topic.
- Update or add one current statistic.
- Keep the same slug, image, and overall structure. Keep frontmatter keys valid (${'see rules below'}).
${schemaRules}

Edit the file with the Edit tool. Do NOT commit. Do NOT touch any other file. When done, output exactly: REFRESHED content/blog/${refreshSlug}.mdx`;
}

function buildReviewPrompt(qaCtx: string, targetSlug: string, diff: string): string {
  return `[You are Sentinel, the Crown & Canvas QA agent. You are the mandatory quality gate.]

${qaCtx}

---
TASK: Review this proposed blog article change (git diff of content/blog/${targetSlug}.mdx).

QA checklist (ALL must pass):
1. Frontmatter has valid keys (title, description, date, image, imageAlt, author, tags, published) with sane values.
2. No em-dashes anywhere. No internal product/bot/agent names. No placeholder text.
3. Body is on-brand (premium, warm, older-audience friendly), 800+ words, includes an FAQ H2 with Q&A.
4. Includes internal links and a call to action to /order/upload.
5. No hallucinated guarantees beyond the real ones (24-48h digital proof, 5-7 day prints, 30-day money-back).

DIFF:
${diff}

Respond with your reasoning, then a FINAL line that is EXACTLY one of:
VERDICT: APPROVE
VERDICT: REJECT`;
}

// --- Main -----------------------------------------------------------------
async function main(): Promise<void> {
  const mode = resolveMode();
  const env = readEnvFile();
  logger.info({ mode }, 'content engine starting');

  // Ensure a clean working tree to start (don't ship someone else's edits)
  const dirty = git(['status', '--porcelain']).trim();
  if (dirty) {
    logger.error({ dirty }, 'crown-and-canvas working tree not clean; aborting');
    process.exit(1);
  }
  git(['pull', '--ff-only', 'origin', 'master']);

  // Resolve target
  let targetSlug: string;
  let queue = readQueue(QUEUE_PATH);
  let publishedBrief: Brief | null = null;

  if (mode === 'publish') {
    const brief = pickNextBrief(queue.briefs);
    if (!brief) {
      logger.warn('no pending briefs; nothing to publish');
      writeToDigest('content-engine', 'Content engine: backlog empty, no new article published. Add briefs to topic-queue.json.', 'evening-brief');
      process.exit(0);
    }
    publishedBrief = brief;
    targetSlug = brief.slug;
  } else {
    const slug = oldestPostSlug();
    if (!slug) { logger.warn('no posts to refresh'); process.exit(0); }
    targetSlug = slug;
  }

  const marketerCtx = loadAgentContext('marketer', ['SOUL.md', 'KNOWLEDGE.md', 'PLAYBOOK.md', 'SKILLS.md']);
  const qaCtx = loadAgentContext('qa', ['SOUL.md', 'PLAYBOOK.md', 'SKILLS.md']);

  // 1. Writer pass
  await runAgent(buildWritePrompt(mode, marketerCtx, publishedBrief, mode === 'refresh' ? targetSlug : null), WRITER_MODEL);

  const changed = git(['status', '--porcelain']).trim();
  if (!changed) {
    logger.error('writer produced no file change; aborting');
    writeToDigest('content-engine', `Content engine (${mode}): writer produced no changes. Skipped.`, 'evening-brief');
    process.exit(0);
  }

  // 2. QA gate
  const diff = git(['diff', '--', `content/blog/${targetSlug}.mdx`]) || git(['diff', '--cached', '--', `content/blog/${targetSlug}.mdx`]) || git(['status', '--porcelain']);
  const review = await runAgent(buildReviewPrompt(qaCtx, targetSlug, diff.slice(0, 12000)), QA_MODEL);
  const approved = /VERDICT:\s*APPROVE/i.test(review) && !/VERDICT:\s*REJECT/i.test(review);

  if (!approved) {
    logger.warn('QA rejected; discarding changes');
    git(['checkout', '--', '.']);
    git(['clean', '-fd', 'content/blog']);
    writeToDigest('content-engine', `Content engine (${mode}): Sentinel REJECTED the draft for "${targetSlug}". Discarded, backlog untouched.`, 'evening-brief');
    process.exit(0);
  }

  // 3. Update queue (publish mode) then commit + push
  if (mode === 'publish' && publishedBrief) {
    queue = { briefs: markPublished(queue.briefs, publishedBrief.slug) };
    writeQueue(QUEUE_PATH, queue);
  }
  git(['add', '-A']);
  git(['commit', '-m', `feat(content): ${mode} ${targetSlug}`]);
  git(['push', 'origin', 'master']);

  const liveUrl = `https://crownandcanvas.us/blog/${targetSlug}`;
  const low = pendingCount(queue.briefs) < 3 ? '\n\nNote: topic backlog is running low (<3). Add briefs to topic-queue.json.' : '';
  writeToDigest('content-engine', `Content engine (${mode}): Sentinel APPROVED. Live shortly at ${liveUrl}${low}`, 'evening-brief');

  logger.info({ mode, targetSlug }, 'content engine complete');
  process.exit(0);
}

main().catch((err) => { logger.error({ err }, 'content engine fatal'); process.exit(1); });
```

- [ ] **Step 2: Typecheck the new script**

Run (in claudeclaw): `npm run typecheck`
Expected: no errors referencing `content-engine-trigger.ts`. (If `query()` event typings differ from this code, mirror the exact casts used in `src/rex-trigger.ts` — they are the source of truth.)

- [ ] **Step 3: Commit (claudeclaw)**

```bash
cd "c:/Users/95san/Documents/AI & Business/builder/claudeclaw"
git add src/content-engine-trigger.ts
git commit -m "feat(content-engine): cron trigger with Catalyst write + Sentinel gate"
```

---

## Task 4: Register PM2 cron entries (claudeclaw)

3×/week: Mon 10:00 publish, Wed 10:00 publish, Fri 10:00 refresh. (Times chosen to not collide with rex 9:00/12:00 jobs.)

**Files:**
- Modify: `ecosystem.config.cjs` (in claudeclaw)

- [ ] **Step 1: Add three apps to the `apps` array**

In `ecosystem.config.cjs`, copy the structure of an existing `rex-*` entry and add these three objects to the `apps` array (use the same `cwd`, `interpreter`, `env` block with `CLAUDECODE: ""` and `TZ` as the rex entries; only `name`, `args`/`env CONTENT_MODE`, and `cron_restart` differ):
```js
    {
      name: "crown-content-mon",
      script: "node_modules/tsx/dist/cli.mjs",
      args: "src/content-engine-trigger.ts publish",
      cwd: __dirname,
      autorestart: false,
      stop_exit_codes: [0],
      cron_restart: "0 10 * * 1",
      env: { NODE_ENV: "production", TZ: "America/Chicago", CONTENT_MODE: "publish", CLAUDECODE: "" },
    },
    {
      name: "crown-content-wed",
      script: "node_modules/tsx/dist/cli.mjs",
      args: "src/content-engine-trigger.ts publish",
      cwd: __dirname,
      autorestart: false,
      stop_exit_codes: [0],
      cron_restart: "0 10 * * 3",
      env: { NODE_ENV: "production", TZ: "America/Chicago", CONTENT_MODE: "publish", CLAUDECODE: "" },
    },
    {
      name: "crown-content-fri",
      script: "node_modules/tsx/dist/cli.mjs",
      args: "src/content-engine-trigger.ts refresh",
      cwd: __dirname,
      autorestart: false,
      stop_exit_codes: [0],
      cron_restart: "0 10 * * 5",
      env: { NODE_ENV: "production", TZ: "America/Chicago", CONTENT_MODE: "refresh", CLAUDECODE: "" },
    },
```
(Match the exact key set the `rex-*` entries use in THIS file; if they include extra keys like `interpreter` or `out_file`, include them identically.)

- [ ] **Step 2: Commit (claudeclaw)** — do NOT start the cron yet (that happens after the supervised dry-run in Task 5)

```bash
cd "c:/Users/95san/Documents/AI & Business/builder/claudeclaw"
git add ecosystem.config.cjs
git commit -m "feat(content-engine): register 3x/week PM2 cron entries"
```

---

## Task 5: Supervised dry-run + go-live

Produce ONE real article under supervision and let Boss see it BEFORE the cron runs unattended.

**Files:** none (operational)

- [ ] **Step 1: Manual publish dry-run**

Run (in claudeclaw):
```bash
cd "c:/Users/95san/Documents/AI & Business/builder/claudeclaw"
node_modules/.bin/tsx src/content-engine-trigger.ts publish
```
Expected: the script loads the queue, the marketer writes `content/blog/pet-memorial-portrait-honoring-a-late-dog-or-cat.mdx`, Sentinel reviews, and on APPROVE it commits + pushes. Watch the log for the APPROVE/REJECT verdict.

- [ ] **Step 2: Verify the artifact (quote the proof, do not trust the log)**

```bash
cd "c:/Users/95san/Documents/AI & Business/AI Agency/Pet portait/crown-and-canvas"
git log --oneline -1
ls content/blog/pet-memorial-portrait-honoring-a-late-dog-or-cat.mdx
head -20 content/blog/pet-memorial-portrait-honoring-a-late-dog-or-cat.mdx
```
Expected: the commit exists, the MDX file exists, frontmatter is valid. Confirm `topic-queue.json` shows that brief now `"status": "published"`.

- [ ] **Step 3: Verify it renders live (after Vercel deploys, ~1-2 min)**

```bash
curl -s https://crownandcanvas.us/blog/pet-memorial-portrait-honoring-a-late-dog-or-cat | grep -o '"@type":"Article"' | head -1
```
Expected: `"@type":"Article"` (the Phase 1 Article schema applied to the new post). If empty, check the Vercel deployment status.

- [ ] **Step 4: BOSS REVIEW GATE**

Show Boss the live article URL. Get explicit approval that the quality is acceptable. Do NOT proceed to Step 5 until Boss approves the output quality.

- [ ] **Step 5: Enable the cron (go live)**

Run (in claudeclaw):
```bash
cd "c:/Users/95san/Documents/AI & Business/builder/claudeclaw"
pm2 start ecosystem.config.cjs --only crown-content-mon,crown-content-wed,crown-content-fri
pm2 save
```
Expected: `pm2 list` shows the three entries. They are cron-triggered (`autorestart: false`), so they sit idle until their scheduled time.

- [ ] **Step 6: Write the project sync file**

Create `c:\Users\95san\Documents\AI & Business\builder\claudeclaw\hq\sync\incoming\crown-and-canvas-<timestamp>.json` summarizing Phase 2 (files created, the engine going live, next step = monitor first unattended runs + Phase 3 readability).

---

## Self-Review

**Spec coverage (Phase 2 of the design doc):**
- 2.1 Catalyst writer + Sentinel gate → Task 3 (two agent calls, script-enforced git gate). ✅
- 2.2 PM2 cron, never schtasks, `CLAUDECODE: ""` → Task 4. ✅
- 2.3 Self-replenishing backlog → Task 1 seed + low-backlog Telegram warning (Step main) ; auto-append deferred to a prompt instruction/manual top-up for v1 (flagged). ✅ (manual top-up acceptable for v1; warning fires at <3)
- 2.4 Run flow (mode → write → qa → commit → push → telegram → sync) → Task 3 + Task 5 Step 6. ✅
- 2.5 Reversibility (git commit), brand blocklist (qa checklist), clean-tree guard → Task 3. ✅
- Rotation new + refresh → Task 4 (Mon/Wed publish, Fri refresh). ✅

**Placeholder scan:** No TODO/TBD in code. The two "match the rex entry exactly" notes (Task 4) are deliberate fidelity instructions, not placeholders — the full object is given.

**Type consistency:** `Brief` shape identical across queue.ts, queue.test.ts, and trigger. `readQueue`/`writeQueue`/`pickNextBrief`/`markPublished`/`pendingCount` names match definition and usage. `writeToDigest(source, content, slot)` matches the digest.ts signature. `runAgent`/`buildWritePrompt`/`buildReviewPrompt` consistent.

**Risk notes:**
- The SDK `query()` event-handling casts mirror `rex-trigger.ts`; if SDK version differs, rex is the source of truth (noted in Task 3 Step 2).
- Vercel auto-deploy on push to master is assumed (GitHub integration). Task 5 Step 3 verifies live render; if it doesn't deploy, add `vercel --prod --yes` after the push in `main()`.
- v1 backlog replenish is a Telegram warning + manual top-up, not auto-generation. Intentional scope guard; revisit once the engine is proven.

**Out of scope:** Phase 3 readability/accessibility pass and keyword-map doc (separate plan).
