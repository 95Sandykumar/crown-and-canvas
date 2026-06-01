#!/usr/bin/env node
/**
 * Crown & Canvas — customer database / audience sync.
 *
 * Pulls all paid orders from Stripe, compiles a per-customer record
 * (deduped by email), and:
 *   1. Pushes contacts into a Resend Audience ("Crown & Canvas Customers")
 *      for email campaigns / broadcasts.
 *   2. Writes a richer CSV (orders/customers.csv) with pet, style, spend,
 *      order count, dates, and traffic source — for Meta Custom Audience
 *      uploads / retargeting and general reference (Resend contacts can't
 *      store custom fields).
 *
 * Usage: node scripts/sync-audience.mjs [--dry-run]
 */

import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const DRY = process.argv.includes("--dry-run");
const AUDIENCE_NAME = "Crown & Canvas Customers";

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
const OWNER_EMAIL = (E.ORDER_NOTIFICATION_EMAIL || "").toLowerCase(); // exclude owner/test orders
if (!STRIPE_KEY || !RESEND_KEY) { console.error("Missing STRIPE_SECRET_KEY or RESEND_API_KEY"); process.exit(1); }

const log = (...a) => console.log("[audience]", ...a);

async function stripeGet(url) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${STRIPE_KEY}` } });
  if (!res.ok) throw new Error(`Stripe ${res.status}: ${await res.text()}`);
  return res.json();
}
async function resend(method, pathname, body) {
  const res = await fetch(`https://api.resend.com${pathname}`, {
    method,
    headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { ok: res.ok, status: res.status, json };
}

function reassembleOrderData(metadata) {
  let s = metadata.orderData || "";
  for (let i = 2; ; i++) { const c = metadata[`orderData${i}`]; if (!c) break; s += c; }
  try { return s ? JSON.parse(s) : []; } catch { return []; }
}
function splitName(full) {
  const parts = (full || "").trim().split(/\s+/);
  return { first: parts[0] || "", last: parts.slice(1).join(" ") || "" };
}
function csvCell(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function main() {
  log(DRY ? "DRY-RUN" : "LIVE");

  // 1. Pull all paid sessions (paginate)
  const sessions = [];
  let url = "https://api.stripe.com/v1/checkout/sessions?limit=100";
  for (let page = 0; page < 20; page++) {
    const data = await stripeGet(url);
    sessions.push(...(data.data || []).filter((s) => s.status === "complete" && s.payment_status === "paid"));
    if (!data.has_more) break;
    const last = data.data[data.data.length - 1]?.id;
    url = `https://api.stripe.com/v1/checkout/sessions?limit=100&starting_after=${last}`;
  }
  log(`pulled ${sessions.length} paid session(s)`);

  // 2. Aggregate per email
  const byEmail = new Map();
  for (const s of sessions) {
    const email = (s.customer_details?.email || s.customer_email || "").toLowerCase();
    if (!email || email === OWNER_EMAIL) continue; // skip empty + owner/test orders
    const name = s.metadata?.customerName || s.customer_details?.name || "";
    const items = reassembleOrderData(s.metadata || {});
    const created = new Date((s.created || 0) * 1000).toISOString().slice(0, 10);
    const amount = (s.amount_total || 0) / 100;
    const rec = byEmail.get(email) || { email, name, pets: new Set(), styles: new Set(), orders: 0, spend: 0, first: created, last: created, source: "" };
    rec.name = rec.name || name;
    for (const it of items) { if (it.n) rec.pets.add(it.n); if (it.s) rec.styles.add(it.s); }
    rec.orders += 1;
    rec.spend += amount;
    if (created < rec.first) rec.first = created;
    if (created > rec.last) rec.last = created;
    rec.source = rec.source || [s.metadata?.utmSource, s.metadata?.utmMedium, s.metadata?.utmCampaign].filter(Boolean).join(" / ") || s.metadata?.referrer || "direct";
    byEmail.set(email, rec);
  }
  const customers = [...byEmail.values()];
  log(`compiled ${customers.length} unique customer(s)`);

  // 3. Ensure Resend audience
  let audienceId;
  const list = await resend("GET", "/audiences");
  const found = (list.json?.data || []).find((a) => a.name === AUDIENCE_NAME);
  if (found) { audienceId = found.id; log(`audience exists: ${audienceId}`); }
  else if (!DRY) {
    const created = await resend("POST", "/audiences", { name: AUDIENCE_NAME });
    audienceId = created.json?.id;
    log(`created audience: ${audienceId}`);
  } else { log("would create audience"); }

  // 4. Add contacts
  let added = 0, skipped = 0;
  if (audienceId && !DRY) {
    for (const c of customers) {
      const { first, last } = splitName(c.name);
      const r = await resend("POST", `/audiences/${audienceId}/contacts`, {
        email: c.email, first_name: first, last_name: last, unsubscribed: false,
      });
      if (r.ok) added++;
      else { skipped++; log(`  contact ${c.email}: ${r.status} ${JSON.stringify(r.json).slice(0, 80)}`); }
    }
    log(`contacts: ${added} added/updated, ${skipped} skipped`);
  }

  // 5. Rich CSV for Meta / reference
  const header = ["email", "name", "pets", "styles", "orders", "total_spent_usd", "first_order", "last_order", "traffic_source"];
  const rows = customers.map((c) => [
    c.email, c.name, [...c.pets].join("; "), [...c.styles].join("; "),
    c.orders, c.spend.toFixed(2), c.first, c.last, c.source,
  ].map(csvCell).join(","));
  const csv = [header.join(","), ...rows].join("\n");
  if (!DRY) {
    fs.mkdirSync(path.join(ROOT, "orders"), { recursive: true });
    fs.writeFileSync(path.join(ROOT, "orders", "customers.csv"), csv);
    log(`wrote orders/customers.csv (${customers.length} rows)`);
  } else {
    log("CSV preview:\n" + csv);
  }
  log("done.");
}

main().catch((e) => { console.error("[audience] FATAL:", e); process.exit(1); });
