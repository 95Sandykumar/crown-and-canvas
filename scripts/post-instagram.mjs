#!/usr/bin/env node
// Crown & Canvas — autonomous Instagram reel poster.
//
// Picks the next pending post from content/instagram-queue.json, renders a
// ~10s vertical reel with Remotion, uploads it to Vercel Blob (public URL),
// publishes it to Instagram via the Graph API, then flips the post to "posted"
// and commits the queue so the next run picks the following question.
//
// Usage:
//   node scripts/post-instagram.mjs                # full pipeline (1 post)
//   node scripts/post-instagram.mjs --render-only  # render to out/, no posting
//   node scripts/post-instagram.mjs --no-commit    # post but don't commit queue
//
// Env (process.env first, falls back to .env.local for local runs):
//   IG_USER_ID, IG_ACCESS_TOKEN, BLOB_READ_WRITE_TOKEN

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  readQueue,
  writeQueue,
  pickNextPending,
  markPosted,
  pendingCount,
} from "./lib/instagram-queue.mjs";

const ROOT = process.cwd();
const QUEUE_PATH = path.join(ROOT, "content", "instagram-queue.json");
const OUT_DIR = path.join(ROOT, "out");
const ENTRY = path.join(ROOT, "remotion", "index.ts");
const PUBLIC_DIR = path.join(ROOT, "public");
const AUDIO_REL = "audio/hook.mp3";
const GRAPH = "https://graph.facebook.com/v21.0";

const RENDER_ONLY = process.argv.includes("--render-only");
const NO_COMMIT = process.argv.includes("--no-commit");

const log = (...a) => console.log("[instagram]", ...a);

// --- env resolution --------------------------------------------------------
function loadEnvLocal() {
  try {
    const raw = fs.readFileSync(path.join(ROOT, ".env.local"), "utf8");
    const out = {};
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) out[m[1]] = m[2].trim();
    }
    return out;
  } catch {
    return {};
  }
}
const FILE_ENV = loadEnvLocal();
const env = (k) => process.env[k] || FILE_ENV[k];

// --- caption ---------------------------------------------------------------
const HASHTAGS = [
  "#dogsofinstagram",
  "#catsofinstagram",
  "#petsofinstagram",
  "#petparents",
  "#dogmom",
  "#dogdad",
  "#catlover",
  "#doglover",
  "#petcare",
  "#furbaby",
  "#crownandcanvas",
  "#petportrait",
].join(" ");

function buildCaption(post) {
  return `${post.question}\n\n${post.answer}\n\n${post.cta}\n\n${HASHTAGS}`;
}

// --- render ----------------------------------------------------------------
async function renderReel(post) {
  const { bundle } = await import("@remotion/bundler");
  const { selectComposition, renderMedia, ensureBrowser } = await import(
    "@remotion/renderer"
  );

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, `${post.id}.mp4`);

  const audioSrc = fs.existsSync(path.join(PUBLIC_DIR, AUDIO_REL))
    ? AUDIO_REL
    : "";
  if (!audioSrc) log(`no ${AUDIO_REL} found — rendering silent`);

  const inputProps = {
    question: post.question,
    answer: post.answer,
    hook: post.hook,
    cta: post.cta,
    category: post.category,
    image: post.image,
    audioSrc,
  };

  log("ensuring headless browser…");
  await ensureBrowser();

  log("bundling remotion project…");
  const serveUrl = await bundle({ entryPoint: ENTRY, publicDir: PUBLIC_DIR });

  const composition = await selectComposition({
    serveUrl,
    id: "DailyPost",
    inputProps,
  });

  log(`rendering ${post.id}.mp4…`);
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation: outPath,
    inputProps,
  });

  log(`rendered ${outPath}`);
  return outPath;
}

// --- upload ----------------------------------------------------------------
async function uploadToBlob(outPath, post) {
  const token = env("BLOB_READ_WRITE_TOKEN");
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not set");
  const { put } = await import("@vercel/blob");
  const buffer = fs.readFileSync(outPath);
  const blob = await put(`reels/${post.id}.mp4`, buffer, {
    access: "public",
    token,
    contentType: "video/mp4",
    allowOverwrite: true,
  });
  log(`uploaded → ${blob.url}`);
  return blob.url;
}

// --- instagram graph api ---------------------------------------------------
async function graphPost(pathname, params) {
  const res = await fetch(`${GRAPH}/${pathname}`, {
    method: "POST",
    body: new URLSearchParams(params),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Graph POST ${pathname}: ${JSON.stringify(json)}`);
  return json;
}

async function waitForContainer(containerId, token) {
  // Reels are transcoded async; poll until FINISHED (or fail/timeout).
  for (let i = 0; i < 30; i++) {
    const res = await fetch(
      `${GRAPH}/${containerId}?fields=status_code,status&access_token=${encodeURIComponent(token)}`
    );
    const json = await res.json();
    const code = json.status_code;
    log(`container status: ${code ?? JSON.stringify(json)}`);
    if (code === "FINISHED") return;
    if (code === "ERROR" || code === "EXPIRED") {
      throw new Error(`container ${containerId} failed: ${JSON.stringify(json)}`);
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error(`container ${containerId} not ready after timeout`);
}

async function publishReel(videoUrl, caption) {
  const igUserId = env("IG_USER_ID");
  const token = env("IG_ACCESS_TOKEN");
  if (!igUserId || !token) {
    throw new Error("IG_USER_ID and IG_ACCESS_TOKEN must be set");
  }

  log("creating reel container…");
  const container = await graphPost(`${igUserId}/media`, {
    media_type: "REELS",
    video_url: videoUrl,
    caption,
    share_to_feed: "true",
    access_token: token,
  });

  await waitForContainer(container.id, token);

  log("publishing…");
  const published = await graphPost(`${igUserId}/media_publish`, {
    creation_id: container.id,
    access_token: token,
  });
  log(`published media id: ${published.id}`);
  return published.id;
}

// --- git state -------------------------------------------------------------
function commitQueue(post) {
  if (NO_COMMIT) {
    log("--no-commit set; skipping queue commit");
    return;
  }
  try {
    execFileSync("git", ["add", "content/instagram-queue.json"], { cwd: ROOT });
    execFileSync(
      "git",
      ["commit", "-m", `chore(instagram): posted ${post.id}`],
      { cwd: ROOT }
    );
    execFileSync("git", ["push"], { cwd: ROOT });
    log("queue change committed + pushed");
  } catch (e) {
    log(`warning: could not commit/push queue (${e.message})`);
  }
}

// --- main ------------------------------------------------------------------
async function main() {
  const queue = readQueue(QUEUE_PATH);
  const post = pickNextPending(queue.posts);
  if (!post) {
    log("backlog empty — nothing to post. Add pending posts to the queue.");
    return;
  }
  const remaining = pendingCount(queue.posts);
  log(`next post: ${post.id} (${remaining} pending in backlog)`);
  if (remaining < 3) {
    log("⚠ backlog running low (<3). Re-run research and append questions.");
  }

  const outPath = await renderReel(post);
  if (RENDER_ONLY) {
    log("--render-only: done. Skipping upload + publish.");
    return;
  }

  const videoUrl = await uploadToBlob(outPath, post);
  const caption = buildCaption(post);
  await publishReel(videoUrl, caption);

  const updated = { posts: markPosted(queue.posts, post.id) };
  writeQueue(QUEUE_PATH, updated);
  log(`marked ${post.id} as posted`);
  commitQueue(post);
}

main().catch((err) => {
  console.error("[instagram] fatal:", err.message);
  process.exit(1);
});
