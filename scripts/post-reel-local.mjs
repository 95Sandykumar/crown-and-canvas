#!/usr/bin/env node
// Crown & Canvas — LOCAL daily reel poster (runs under PM2 cron, no human).
//
// Why this exists: the GitHub Actions path (instagram-post.yml) needs Graph API
// secrets (IG Business account + Meta app) that do not exist. The only working
// posting mechanism is browser automation against the saved IG login at
// ~/.playwright-mcp-profile (claudeclaw scripts/post-reel-v3.mjs). That profile
// lives on this machine, so the daily cadence runs here, not on GitHub.
//
// Pipeline (one post per local day, idempotent):
//   1. Skip if a reel was already posted today (local time) — safe for
//      multiple catch-up cron firings.
//   2. Render the next pending queue item via post-instagram.mjs --render-only
//      (Remotion, no secrets needed, queue untouched).
//   3. Post via claudeclaw post-reel-v3.mjs (puppeteer, saved session,
//      self-verifies and prints the live URL).
//   4. Only after verified success: mark posted, commit + push the queue.
//
// Usage: node scripts/post-reel-local.mjs
// Exit codes: 0 = posted or already posted today; 1 = failure (PM2 shows errored).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  readQueue,
  writeQueue,
  pickNextPending,
  markPosted,
  pendingCount,
} from "./lib/instagram-queue.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUEUE_PATH = path.join(ROOT, "content", "instagram-queue.json");
const OUT_DIR = path.join(ROOT, "out");
const CLAWDIR = "C:\\Users\\95san\\Documents\\AI & Business\\builder\\claudeclaw";
const POSTER = path.join(CLAWDIR, "scripts", "post-reel-v3.mjs");
const ACCOUNT_GUARD = path.join(CLAWDIR, "scripts", "ig-active-account.mjs");
// HARD GUARD: never post unless the saved browser profile is logged into THIS
// account. On 2026-06-10 the profile's session had silently become a personal
// account and a brand reel went out on it.
const EXPECTED_ACCOUNT = "crownandcanvas.us";

const log = (...a) => console.log("[reel-local]", ...a);
const fail = (msg) => {
  console.error("[reel-local] FATAL:", msg);
  process.exit(1);
};

// Same caption format as scripts/post-instagram.mjs (keep in sync).
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

const buildCaption = (post) =>
  `${post.question}\n\n${post.answer}\n\n${post.cta}\n\n${HASHTAGS}`;

// Distinctive word from the question — post-reel-v3 verifies the live reel's
// og:title contains this needle.
function buildNeedle(post) {
  const words = post.question
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !["your", "their", "does", "what", "when", "why"].includes(w));
  words.sort((a, b) => b.length - a.length);
  return words[0] || post.id.split("-")[1] || post.id;
}

const localDay = (d) =>
  new Date(d).toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

// The IG profile is single-instance: stale automation Chromes (playwright-mcp
// leftovers) hold a lock on it and make puppeteer.launch fail with code 33.
// Boss's personal Chrome uses a different user-data-dir and is never touched.
function killStaleProfileChromes() {
  const ps = spawnSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { $_.CommandLine -like '*.playwright-mcp-profile*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue; $_.ProcessId }",
    ],
    { encoding: "utf8", timeout: 60_000 }
  );
  const pids = (ps.stdout || "").trim();
  if (pids) {
    log(`killed stale profile Chrome pids: ${pids.replace(/\s+/g, " ")}`);
    // Let the profile settle — the next launch does crash-recovery and the IG
    // UI loads slowly right after a force-kill (caused a composer timeout once).
    spawnSync(process.execPath, ["-e", "setTimeout(()=>{}, 10000)"], { timeout: 20_000 });
  }
}

// Launch v3 with the NEWEST cached Chrome so we never downgrade the profile
// (a newer automation Chrome may have bumped the profile's "Last Version",
// and Chrome's downgrade migration is what crashed launches before).
function newestCachedChrome() {
  const base = path.join(process.env.USERPROFILE || "", ".cache", "puppeteer", "chrome");
  try {
    const dirs = fs.readdirSync(base).filter((d) => d.startsWith("win64-"));
    dirs.sort((a, b) =>
      b.replace("win64-", "").localeCompare(a.replace("win64-", ""), undefined, { numeric: true })
    );
    for (const d of dirs) {
      const exe = path.join(base, d, "chrome-win64", "chrome.exe");
      if (fs.existsSync(exe)) return exe;
    }
  } catch {
    /* fall through — puppeteer resolves its own default */
  }
  return null;
}

function main() {
  if (!fs.existsSync(POSTER)) fail(`poster not found: ${POSTER}`);

  const queue = readQueue(QUEUE_PATH);
  const today = localDay(Date.now());
  const postedToday = queue.posts.find(
    (p) => p.status === "posted" && p.postedAt && localDay(p.postedAt) === today
  );
  if (postedToday) {
    log(`already posted today (${postedToday.id}) — nothing to do`);
    return;
  }

  const post = pickNextPending(queue.posts);
  if (!post) fail("backlog empty — add pending posts to content/instagram-queue.json");
  const remaining = pendingCount(queue.posts);
  log(`next post: ${post.id} (${remaining} pending)`);
  if (remaining < 3) log("WARNING: backlog running low (<3) — refill the queue");

  // 0. Account guard — fail fast BEFORE rendering or posting anything.
  killStaleProfileChromes();
  const chromeExe = newestCachedChrome();
  if (chromeExe) log(`using chrome: ${chromeExe}`);
  log(`verifying the profile is logged into @${EXPECTED_ACCOUNT} ...`);
  const guard = spawnSync(process.execPath, [ACCOUNT_GUARD, EXPECTED_ACCOUNT], {
    cwd: CLAWDIR,
    encoding: "utf8",
    timeout: 3 * 60_000,
    env: chromeExe
      ? { ...process.env, PUPPETEER_EXECUTABLE_PATH: chromeExe }
      : process.env,
  });
  process.stdout.write(guard.stdout || "");
  if (guard.status !== 0) {
    fail(
      `profile is NOT logged into @${EXPECTED_ACCOUNT} (${(guard.stdout || "").trim() || "guard errored"}) — ` +
        "refusing to post. Log the automation profile into the brand account, then this resumes automatically."
    );
  }

  // 1. Render (no secrets needed; leaves the queue untouched).
  log("rendering via post-instagram.mjs --render-only ...");
  const render = spawnSync(
    process.execPath,
    [path.join(ROOT, "scripts", "post-instagram.mjs"), "--render-only"],
    { cwd: ROOT, stdio: "inherit", timeout: 15 * 60_000 }
  );
  if (render.status !== 0) fail(`render failed (exit ${render.status})`);

  const videoPath = path.join(OUT_DIR, `${post.id}.mp4`);
  if (!fs.existsSync(videoPath)) fail(`rendered file missing: ${videoPath}`);
  const size = fs.statSync(videoPath).size;
  if (size < 100_000) fail(`rendered file suspiciously small (${size} bytes)`);
  log(`rendered ${videoPath} (${(size / 1e6).toFixed(1)} MB)`);

  // 2. Post via the proven browser poster (run from claudeclaw so puppeteer
  //    resolves and store/ screenshots land there).
  const caption = buildCaption(post);
  const needle = buildNeedle(post);
  const runPoster = () => {
    const r = spawnSync(process.execPath, [POSTER, videoPath, caption, needle], {
      cwd: CLAWDIR,
      encoding: "utf8",
      timeout: 15 * 60_000,
      env: chromeExe
        ? { ...process.env, PUPPETEER_EXECUTABLE_PATH: chromeExe }
        : process.env,
    });
    process.stdout.write(r.stdout || "");
    process.stderr.write(r.stderr || "");
    return r.stdout || "";
  };

  log(`posting (verify needle: "${needle}") ...`);
  let out = runPoster();
  // Retry once ONLY if the publish button was never clicked (transient UI
  // slowness, e.g. right after a profile crash-recovery). If the click DID
  // happen, never retry — the reel may be live and a retry would double-post.
  if (!/POSTED ✅|confirmed: shared/.test(out) && !/Publish click: clicked/.test(out)) {
    log("poster failed before the publish click — retrying once in 30s ...");
    spawnSync(process.execPath, ["-e", "setTimeout(()=>{}, 30000)"], { timeout: 40_000 });
    out = runPoster();
  }

  const urlMatch = out.match(/POSTED ✅ (\S+)/);
  const sharedConfirmed = /confirmed: shared/.test(out);
  if (!urlMatch && !sharedConfirmed) {
    fail(
      /Publish click: clicked/.test(out)
        ? "publish was clicked but the share was not confirmed — CHECK THE PROFILE MANUALLY before assuming it failed; queue NOT marked"
        : "poster did not confirm the share — queue left untouched (NOT marked posted)"
    );
  }
  const liveUrl = urlMatch ? urlMatch[1] : "(shared; URL not confirmed yet)";
  log(`posted: ${liveUrl}`);

  // 3. Mark posted + commit + push. Only reached after verified success.
  const updated = { posts: markPosted(queue.posts, post.id) };
  writeQueue(QUEUE_PATH, updated);
  log(`marked ${post.id} as posted`);
  try {
    const git = (args) => {
      const r = spawnSync("git", args, { cwd: ROOT, encoding: "utf8" });
      if (r.status !== 0) throw new Error(`git ${args[0]}: ${r.stderr || r.stdout}`);
    };
    git(["add", "content/instagram-queue.json"]);
    git(["commit", "-m", `chore(instagram): posted ${post.id}`]);
    git(["push"]);
    log("queue change committed + pushed");
  } catch (e) {
    log(`warning: could not commit/push queue (${e.message}) — reel IS live`);
  }
}

main();
