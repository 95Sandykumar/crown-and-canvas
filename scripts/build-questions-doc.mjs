#!/usr/bin/env node
// Crown & Canvas — regenerate INSTAGRAM-QUESTIONS.md from the JSON backlog.
//
// content/instagram-queue.json is the single source of truth; this writes a
// human-readable, category-grouped view to the repo root so the team can scan
// the backlog and posting status at a glance. Run after editing the queue:
//   node scripts/build-questions-doc.mjs

import path from "node:path";
import { readQueue, pendingCount } from "./lib/instagram-queue.mjs";

const ROOT = process.cwd();
const QUEUE_PATH = path.join(ROOT, "content", "instagram-queue.json");
const DOC_PATH = path.join(ROOT, "INSTAGRAM-QUESTIONS.md");

const { posts } = readQueue(QUEUE_PATH);

const byCategory = new Map();
for (const p of posts) {
  if (!byCategory.has(p.category)) byCategory.set(p.category, []);
  byCategory.get(p.category).push(p);
}

const postedCount = posts.length - pendingCount(posts);
const lines = [];

lines.push("# Instagram Question Backlog — Crown & Canvas");
lines.push("");
lines.push(
  "> Auto-generated from `content/instagram-queue.json`. **Do not edit by hand** —"
);
lines.push(
  "> edit the JSON and run `node scripts/build-questions-doc.mjs` to regenerate."
);
lines.push("");
lines.push(
  `**Objective:** Convert real pet-parent questions into 2 daily Instagram reels that grow our follower base. ${posts.length} questions total — ${pendingCount(posts)} pending, ${postedCount} posted.`
);
lines.push("");
lines.push("---");
lines.push("");

for (const [category, items] of byCategory) {
  lines.push(`## ${category}`);
  lines.push("");
  for (const p of items) {
    const badge = p.status === "posted" ? "✅ posted" : "⏳ pending";
    lines.push(`### ${p.question}  \n_${badge}_`);
    lines.push("");
    lines.push(`- **On-screen answer:** ${p.answer}`);
    lines.push(`- **Hook:** ${p.hook}`);
    lines.push(`- **Background:** \`${p.image}\``);
    lines.push(`- **id:** \`${p.id}\``);
    lines.push("");
  }
}

lines.push("---");
lines.push("");
lines.push("## How the daily pipeline works");
lines.push("");
lines.push(
  "1. Questions are gathered from Reddit (r/dogs, r/cats, r/puppy101), Quora, Google 'People Also Ask', and X, then added as `pending` posts to `content/instagram-queue.json`."
);
lines.push(
  "2. A GitHub Actions cron runs twice daily: it picks the next `pending` post, renders a ~10s vertical reel with Remotion (`remotion/DailyPost.tsx`), uploads it to Vercel Blob, and publishes it to Instagram via the Graph API."
);
lines.push(
  "3. The post is flipped to `posted` and the queue change is committed back, so the next run picks the following question."
);
lines.push("");
lines.push("## Go-live checklist (one-time manual steps)");
lines.push("");
lines.push(
  "- [ ] Instagram set to a **Business/Creator** account, linked to a Facebook Page."
);
lines.push(
  "- [ ] Meta app with `instagram_basic` + `instagram_content_publish` + `pages_show_list`; set `IG_USER_ID` and a long-lived `IG_ACCESS_TOKEN`."
);
lines.push("- [ ] `BLOB_READ_WRITE_TOKEN` set (hosts the public video URL).");
lines.push(
  "- [ ] `public/audio/hook.mp3` added — a short, commercial-use royalty-free track."
);
lines.push("- [ ] Confirm Remotion license tier for the business.");
lines.push("");
lines.push("## Sources");
lines.push("");
lines.push(
  "Questions curated from public pet-owner discussions and 'People Also Ask' results, including Reddit r/dogs, r/cats and r/puppy101, Quora, PetMD, VCA Animal Hospitals, and Scientific American. Answers are kept short and vet-informed; anything health-specific defers to 'ask your vet.'"
);
lines.push("");

const { writeFileSync } = await import("node:fs");
writeFileSync(DOC_PATH, lines.join("\n"), "utf-8");
console.log(
  `[questions-doc] wrote ${DOC_PATH} (${posts.length} questions, ${pendingCount(posts)} pending)`
);
