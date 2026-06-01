#!/usr/bin/env node
/**
 * Crown & Canvas — automated order fulfillment worker.
 *
 * Polls Stripe for paid checkout sessions, generates each portrait with
 * Higgsfield Nano Banana Pro (`nano_banana_2`) using the EXACT prompt from
 * src/data/styles.ts, emails the finished art to the customer, and notifies
 * the owner. Idempotent via a local ledger (orders/.fulfilled.json).
 *
 * Runs on the always-on machine (has hf.exe + auth). NOT on Vercel
 * (serverless 60s limit can't wait for ~2min generation).
 *
 * Usage:
 *   node scripts/fulfill-orders.mjs --dry-run     # show what would happen, no side effects
 *   node scripts/fulfill-orders.mjs --test-to me@x.com  # generate + send to test addr (not customer), no ledger write
 *   node scripts/fulfill-orders.mjs               # real run: generate + email customers + record ledger
 */

import fs from "fs";
import path from "path";
import os from "os";
import { execFileSync } from "child_process";

const ROOT = process.cwd();
const HF = path.join(os.homedir(), "higgsfield-bin", "hf.exe");
const LEDGER = path.join(ROOT, "orders", ".fulfilled.json");
const ARGV = process.argv.slice(2);
const DRY = ARGV.includes("--dry-run");
const APPROVE = (ARGV.find((a) => a.startsWith("--approve=")) || "").split("=")[1] || null;
const APPROVE_ALL = ARGV.includes("--approve-all");
const LIST_PENDING = ARGV.includes("--list-pending");
const REPLY_TO = "95sandeepkumar95@gmail.com";
const MODEL = "nano_banana_2";

function log(...a) { console.log("[fulfill]", ...a); }

// ---- env ----
function loadEnv() {
  const raw = fs.readFileSync(path.join(ROOT, ".env.local"), "utf8");
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}
const E = loadEnv();
const STRIPE_KEY = E.STRIPE_SECRET_KEY;
const RESEND_KEY = E.RESEND_API_KEY;
const FROM = E.RESEND_FROM_EMAIL || "Crown & Canvas <orders@crownandcanvas.us>";
const NOTIFY = E.ORDER_NOTIFICATION_EMAIL;
const AUDIENCE = E.RESEND_AUDIENCE_ID; // Resend customer audience (auto-add on delivery)
if (!STRIPE_KEY || !RESEND_KEY) { console.error("Missing STRIPE_SECRET_KEY or RESEND_API_KEY"); process.exit(1); }

// ---- styles (single source of truth) ----
function loadStyles() {
  const src = fs.readFileSync(path.join(ROOT, "src", "data", "styles.ts"), "utf8");
  const styles = {};
  const re = /\bid:\s*"([^"]+)"[\s\S]*?\bcharacterTitle:\s*"([^"]+)"\s*,\s*prompt:\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    styles[m[1]] = { characterTitle: m[2], prompt: m[3] };
  }
  return styles;
}
const STYLES = loadStyles();

function buildPrompt(styleId, petName) {
  const s = STYLES[styleId];
  if (!s) throw new Error(`Unknown style: ${styleId}`);
  const title = s.characterTitle.replace(/{name}/g, petName);
  return s.prompt.replace(/{name}/g, petName).replace(/{title}/g, title);
}

function slug(str) {
  return String(str).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

// ---- ledger ----
function readLedger() {
  try { return new Set(JSON.parse(fs.readFileSync(LEDGER, "utf8"))); }
  catch { return new Set(); }
}
function writeLedger(set) {
  fs.mkdirSync(path.dirname(LEDGER), { recursive: true });
  fs.writeFileSync(LEDGER, JSON.stringify([...set], null, 2));
}

// ---- pending review queue (generated, awaiting Boss approval) ----
const PENDING = path.join(ROOT, "orders", ".pending.json");
function readPending() { try { return JSON.parse(fs.readFileSync(PENDING, "utf8")); } catch { return {}; } }
function writePending(obj) { fs.mkdirSync(path.dirname(PENDING), { recursive: true }); fs.writeFileSync(PENDING, JSON.stringify(obj, null, 2)); }

// ---- stripe ----
async function stripeGet(url) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${STRIPE_KEY}` } });
  if (!res.ok) throw new Error(`Stripe ${res.status}: ${await res.text()}`);
  return res.json();
}
async function recentPaidSessions() {
  const data = await stripeGet("https://api.stripe.com/v1/checkout/sessions?limit=50");
  return (data.data || []).filter((s) => s.status === "complete" && s.payment_status === "paid");
}
function reassembleOrderData(metadata) {
  let s = metadata.orderData || "";
  for (let i = 2; ; i++) { const c = metadata[`orderData${i}`]; if (!c) break; s += c; }
  return s ? JSON.parse(s) : [];
}

// ---- generation ----
async function downloadTo(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status} for ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}
function generate(prompt, photoPath) {
  const out = execFileSync(
    HF,
    ["generate", "create", MODEL, "--prompt", prompt, "--image", photoPath, "--wait"],
    { encoding: "utf8", timeout: 8 * 60 * 1000 }
  );
  const url = (out.match(/https:\/\/\S+\.png/) || [])[0];
  if (!url) throw new Error(`No result URL from hf. Output: ${out.slice(0, 500)}`);
  return url;
}

// ---- email ----
async function sendEmail({ to, subject, html, attachments }) {
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: FROM, to: [to], reply_to: REPLY_TO, subject, html, attachments }),
      });
      const body = await res.text();
      if (res.status >= 500) throw new Error(`Resend ${res.status}: ${body}`); // transient -> retry
      if (!res.ok) throw Object.assign(new Error(`Resend ${res.status}: ${body}`), { fatal: true }); // 4xx -> do not retry
      return JSON.parse(body).id;
    } catch (e) {
      if (e.fatal) throw e;
      lastErr = e;
      log(`  email attempt ${attempt} failed (${e.message?.slice(0, 80)}), retrying...`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  throw lastErr;
}
function deliveryHtml(name, petNames) {
  const pets = petNames.join(" and ");
  return `
<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#1a1a1a;max-width:600px;margin:0 auto;">
  <p>Hi ${name},</p>
  <p>It is ready. Here is your royal portrait of <strong>${pets}</strong>, attached in full high resolution and ready to print, frame, or share.</p>
  <p>We genuinely loved making this one. If it puts a smile on your face, the best thing you could do is reply with a photo of it on your wall, or leave us a quick review. It means the world to a small team like ours.</p>
  <p>Any questions at all, just reply to this email.</p>
  <p style="margin-top:24px;">With gratitude,<br>The Crown &amp; Canvas Team</p>
</div>`;
}
function reviewHtml(sessionId, name, email, petNames) {
  return `
<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;max-width:600px;margin:0 auto;">
  <p><strong>New order generated and ready for your review.</strong></p>
  <p><strong>Customer:</strong> ${name} &lt;${email}&gt;<br>
     <strong>Pet(s) / style:</strong> ${petNames.join(", ")}<br>
     <strong>Order:</strong> ${sessionId}</p>
  <p>The generated portrait(s) are attached. If they look good, approve to deliver to the customer:</p>
  <ul>
    <li>Tell your agent: <strong>approve ${sessionId}</strong></li>
    <li>Or run: <code>node scripts/fulfill-orders.mjs --approve=${sessionId}</code></li>
    <li>Approve everything pending: <code>node scripts/fulfill-orders.mjs --approve-all</code></li>
  </ul>
  <p>Needs a redo? Delete the file in <code>orders/&lt;pet&gt;-&lt;style&gt;/output/</code> and it regenerates on the next run.</p>
</div>`;
}

// ---- remind owner about orders pending approval too long ----
const REMIND_AFTER_MS = 3 * 3600 * 1000;   // first nudge after 3h pending
const REMIND_EVERY_MS = 6 * 3600 * 1000;   // then at most every 6h
async function remindPending(pending) {
  if (!NOTIFY) return;
  const now = Date.now();
  let changed = false;
  for (const [sid, rec] of Object.entries(pending)) {
    // stamp legacy entries so they start aging from now (no instant spam)
    if (!rec.pendingAt) { rec.pendingAt = new Date().toISOString(); changed = true; continue; }
    const age = now - new Date(rec.pendingAt).getTime();
    if (age < REMIND_AFTER_MS) continue;
    const lastRem = rec.lastRemindedAt ? new Date(rec.lastRemindedAt).getTime() : 0;
    if (now - lastRem < REMIND_EVERY_MS) continue;
    const hours = Math.floor(age / 3600000);
    await sendEmail({
      to: NOTIFY,
      subject: `⏰ Still awaiting approval (${hours}h): ${rec.name} — ${rec.petNames.join(", ")}`,
      html: `<p>Order <strong>${sid}</strong> for ${rec.name} &lt;${rec.email}&gt; has been waiting <strong>${hours}h</strong> for your approval. The customer has NOT received their portrait yet.</p>
             <p>Approve to deliver: <code>node scripts/fulfill-orders.mjs --approve=${sid}</code> or tell your agent "approve ${sid}".</p>`,
      attachments: [],
    }).catch(() => {});
    rec.lastRemindedAt = new Date().toISOString();
    changed = true;
    log(`reminded owner: ${sid} pending ${hours}h`);
  }
  if (changed) writePending(pending);
}

// ---- add a delivered customer to the Resend audience (best-effort) ----
async function addToAudience(email, name) {
  if (!AUDIENCE) return;
  const parts = (name || "").trim().split(/\s+/);
  try {
    await fetch(`https://api.resend.com/audiences/${AUDIENCE}/contacts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email, first_name: parts[0] || "", last_name: parts.slice(1).join(" "), unsubscribed: false }),
    });
  } catch (e) { log(`  audience add failed for ${email}: ${e.message}`); }
}

// ---- deliver a generated (cached) order to the customer ----
async function deliverToCustomer(sessionId, rec, ledger) {
  const attachments = rec.items.map((it) => ({
    filename: it.filename,
    content: fs.readFileSync(it.outFile).toString("base64"),
  }));
  const id = await sendEmail({
    to: rec.email,
    subject: "Your royal portrait has arrived 🐾",
    html: deliveryHtml(rec.name, rec.petNames),
    attachments,
  });
  log(`delivered ${sessionId} -> ${rec.email} (Resend ${id})`);
  await addToAudience(rec.email, rec.name);
  ledger.add(sessionId);
  return id;
}

// ---- main ----
async function main() {
  const ledger = readLedger();
  const pending = readPending();

  // --- list pending ---
  if (LIST_PENDING) {
    const keys = Object.keys(pending);
    log(`${keys.length} order(s) awaiting your approval:`);
    for (const k of keys) log(`  ${k} — ${pending[k].name} <${pending[k].email}> — ${pending[k].petNames.join(", ")}`);
    return;
  }

  // --- approve + deliver ---
  if (APPROVE || APPROVE_ALL) {
    const targets = APPROVE_ALL ? Object.keys(pending) : [APPROVE];
    if (!targets.length) { log("nothing pending to approve."); return; }
    for (const sid of targets) {
      const rec = pending[sid];
      if (!rec) { log(`no pending order: ${sid}`); continue; }
      try {
        await deliverToCustomer(sid, rec, ledger);
        writeLedger(ledger);
        delete pending[sid]; writePending(pending);
        if (NOTIFY) await sendEmail({ to: NOTIFY, subject: `✅ Approved & delivered: ${rec.name} (${rec.petNames.join(", ")})`, html: `<p>Order ${sid} delivered to ${rec.email}.</p>`, attachments: [] }).catch(() => {});
      } catch (e) { log(`approve/deliver FAILED ${sid}: ${e.message} (left pending, retry)`); }
    }
    log("done (approve).");
    return;
  }

  // --- generate mode (review-gate): generate new orders, email Boss for review ---
  log(`mode: ${DRY ? "DRY-RUN" : "GENERATE (review-gate)"}`);
  log(`loaded ${Object.keys(STYLES).length} styles`);
  const sessions = await recentPaidSessions();
  log(`found ${sessions.length} paid session(s)`);

  for (const s of sessions) {
    if (ledger.has(s.id) || pending[s.id]) continue; // delivered or already awaiting approval
    const email = s.customer_details?.email || s.customer_email;
    const name = s.metadata?.customerName || "there";
    let items;
    try { items = reassembleOrderData(s.metadata || {}); }
    catch (e) { log(`SKIP ${s.id}: bad orderData (${e.message})`); continue; }
    if (!items.length || !email) { log(`SKIP ${s.id}: no items/email`); continue; }

    log(`NEW ORDER ${s.id} — ${email} — ${items.length} item(s)`);
    if (DRY) { for (const it of items) log(`  would generate pet="${it.n}" style=${it.s}`); continue; }

    const rec = { email, name, petNames: [], items: [] };
    try {
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const prompt = buildPrompt(it.s, it.n);
        const dir = path.join(ROOT, "orders", `${slug(it.n)}-${slug(it.s)}`);
        fs.mkdirSync(path.join(dir, "input"), { recursive: true });
        fs.mkdirSync(path.join(dir, "output"), { recursive: true });
        const outFile = path.join(dir, "output", `${slug(it.n)}-${slug(it.s)}-final.png`);
        if (fs.existsSync(outFile)) {
          log(`  reusing existing output for item ${i} (skip regen, saves credits)`);
        } else {
          const photo = path.join(dir, "input", `original-${i}.png`);
          await downloadTo(it.p, photo);
          log(`  generating item ${i} ...`);
          const resultUrl = generate(prompt, photo);
          await downloadTo(resultUrl, outFile);
          log(`  done item ${i} -> ${outFile}`);
        }
        rec.items.push({ petName: it.n, styleId: it.s, outFile, filename: `${slug(it.n)}-${slug(it.s)}-CrownAndCanvas.png` });
        rec.petNames.push(it.n);
      }
    } catch (e) {
      log(`  GENERATION FAILED for ${s.id}: ${e.message}`);
      if (NOTIFY) await sendEmail({ to: NOTIFY, subject: `[ACTION] Generation failed: ${s.id}`, html: `<p>${email}</p><p>${e.message}</p>`, attachments: [] }).catch(() => {});
      continue; // not ledgered, not pending — retry next run
    }

    // Email Boss for review (NOT the customer)
    const reviewAttachments = rec.items.map((it) => ({ filename: it.filename, content: fs.readFileSync(it.outFile).toString("base64") }));
    try {
      const id = await sendEmail({ to: NOTIFY, subject: `🔎 REVIEW: ${name} — ${rec.petNames.join(", ")}`, html: reviewHtml(s.id, name, email, rec.petNames), attachments: reviewAttachments });
      rec.pendingAt = new Date().toISOString();
      pending[s.id] = rec; writePending(pending);
      log(`  sent to you for review (Resend ${id}); added to pending queue`);
    } catch (e) {
      log(`  REVIEW EMAIL FAILED for ${s.id}: ${e.message} (portrait saved; will retry next run)`);
    }
  }

  // Nudge owner about anything sitting in the approval queue too long
  if (!DRY) await remindPending(pending);
  log("done (generate).");
}

main().catch((e) => { console.error("[fulfill] FATAL:", e); process.exit(1); });
