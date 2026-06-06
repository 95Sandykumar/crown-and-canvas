#!/usr/bin/env node
/**
 * Crown & Canvas — one-time backfill of existing Stripe orders into Supabase.
 *
 * Mirrors the logic in src/lib/orders-db.ts (recordOrder) for historical paid
 * checkout sessions. Idempotent: orders.stripe_session_id is unique, so re-runs
 * skip already-imported orders. Stripe stays the source of truth for payments.
 *
 * Usage:
 *   node scripts/backfill-orders.mjs --dry-run   # show what would be imported
 *   node scripts/backfill-orders.mjs             # import into Supabase
 */

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const DRY = process.argv.includes("--dry-run");

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
const SUPABASE_URL = E.SUPABASE_URL;
const SERVICE_KEY = E.SUPABASE_SERVICE_ROLE_KEY;
if (!STRIPE_KEY) { console.error("Missing STRIPE_SECRET_KEY in .env.local"); process.exit(1); }
if (!SUPABASE_URL || !SERVICE_KEY) { console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const log = (...a) => console.log("[backfill]", ...a);

// ---- stripe ----
async function stripeGet(url) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${STRIPE_KEY}` } });
  if (!res.ok) throw new Error(`Stripe ${res.status}: ${await res.text()}`);
  return res.json();
}
async function allPaidSessions() {
  const out = [];
  let url = "https://api.stripe.com/v1/checkout/sessions?limit=100&expand[]=data.collected_information";
  for (;;) {
    const page = await stripeGet(url);
    out.push(...(page.data || []));
    if (!page.has_more || !page.data?.length) break;
    const last = page.data[page.data.length - 1].id;
    url = `https://api.stripe.com/v1/checkout/sessions?limit=100&starting_after=${last}&expand[]=data.collected_information`;
  }
  return out.filter((s) => s.status === "complete" && s.payment_status === "paid");
}

function reassembleOrderData(md) {
  let s = md.orderData || "";
  for (let i = 2; ; i++) { const c = md[`orderData${i}`]; if (!c) break; s += c; }
  try { return s ? JSON.parse(s) : []; } catch { return []; }
}

async function importSession(s) {
  const md = s.metadata || {};
  const email = (s.customer_details?.email || s.customer_email || "").toLowerCase().trim();
  if (!email) { log(`SKIP ${s.id}: no email`); return "skip"; }

  // dedupe
  const { data: existing } = await supabase.from("orders").select("id").eq("stripe_session_id", s.id).maybeSingle();
  if (existing) return "dup";

  const photos = reassembleOrderData(md);
  let summary = [];
  try { summary = JSON.parse(md.orderItems || "[]"); } catch { summary = []; }

  const name = md.customerName || s.customer_details?.name || null;
  const phone = s.customer_details?.phone || null;
  const amountCents = s.amount_total ?? 0;
  const shipping = s.collected_information?.shipping_details;
  const addr = shipping?.address;
  const created = new Date((s.created || 0) * 1000).toISOString();

  if (DRY) { log(`would import ${s.id} — ${email} — $${(amountCents / 100).toFixed(2)} — ${photos.length} item(s)`); return "dry"; }

  // upsert customer
  let customerId = null;
  const { data: cust } = await supabase.from("customers").select("id, total_orders, total_spent_cents").eq("email", email).maybeSingle();
  if (cust) {
    customerId = cust.id;
    await supabase.from("customers").update({
      ...(name ? { name } : {}), ...(phone ? { phone } : {}),
      last_order_at: created,
      total_orders: (cust.total_orders ?? 0) + 1,
      total_spent_cents: (cust.total_spent_cents ?? 0) + amountCents,
    }).eq("id", customerId);
  } else {
    const { data: c } = await supabase.from("customers").insert({
      email, name, phone, first_order_at: created, last_order_at: created,
      total_orders: 1, total_spent_cents: amountCents,
    }).select("id").single();
    customerId = c?.id ?? null;
  }

  // insert order
  const { data: order, error: oErr } = await supabase.from("orders").insert({
    stripe_session_id: s.id,
    stripe_payment_intent: typeof s.payment_intent === "string" ? s.payment_intent : null,
    customer_id: customerId, email, customer_name: name,
    status: "delivered", // historical orders are assumed already handled
    amount_total_cents: amountCents, currency: s.currency || "usd",
    gift_wrapping: md.giftWrapping === "yes", rush_processing: md.rushProcessing === "yes",
    donation_cents: parseInt(md.donationCents || "0", 10) || 0,
    is_physical: !!addr,
    shipping_name: shipping?.name || null, shipping_line1: addr?.line1 || null, shipping_line2: addr?.line2 || null,
    shipping_city: addr?.city || null, shipping_state: addr?.state || null, shipping_postal: addr?.postal_code || null, shipping_country: addr?.country || null,
    utm_source: md.utmSource || null, utm_medium: md.utmMedium || null, utm_campaign: md.utmCampaign || null,
    utm_content: md.utmContent || null, utm_term: md.utmTerm || null, referrer: md.referrer || null, landing_path: md.landingPath || null,
    raw_order_data: photos.length ? photos : null,
    created_at: created,
  }).select("id").maybeSingle();
  if (oErr) { if (oErr.code === "23505") return "dup"; throw oErr; }
  if (!order) return "skip";

  // items
  const rows = photos.map((ph, i) => {
    const sm = summary[i];
    return {
      order_id: order.id, style_id: ph.s, style_title: sm?.style || ph.s,
      tier: sm?.tier || null, size: sm?.size || null, pet_name: ph.n,
      quantity: sm?.qty || 1, photo_url: ph.p,
    };
  });
  if (rows.length) await supabase.from("order_items").insert(rows);

  log(`imported ${s.id} -> ${order.id} (${rows.length} item(s))`);
  return "ok";
}

async function main() {
  log(DRY ? "DRY-RUN" : "IMPORT");
  const sessions = await allPaidSessions();
  log(`found ${sessions.length} paid session(s)`);
  const tally = { ok: 0, dup: 0, skip: 0, dry: 0 };
  for (const s of sessions) {
    try { tally[await importSession(s)]++; }
    catch (e) { log(`FAILED ${s.id}: ${e.message}`); }
  }
  log(`done. imported=${tally.ok} already=${tally.dup} skipped=${tally.skip} dry=${tally.dry}`);
}
main().catch((e) => { console.error("[backfill] FATAL:", e); process.exit(1); });
