// Google Ads daily performance report for Crown & Canvas.
// Pulls campaign stats, search terms, and conversion data via the
// Google Ads REST API and prints a digest (and optionally appends CSV).
//
// STATUS: written 2026-06-12, NOT yet run against a live account —
// requires GOOGLE_ADS_* values in .env.local (developer token needs
// Google "Basic access" approval before live data flows).
//
// Usage: node scripts/google-ads-report.mjs [--days 7] [--csv orders/ads-report.csv]

import { readFileSync, appendFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const API_VERSION = "v18";

function loadEnv() {
  const env = {};
  const raw = readFileSync(resolve(ROOT, ".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^"|"$/g, "");
  }
  return env;
}

function requireKeys(env) {
  const needed = [
    "GOOGLE_ADS_DEVELOPER_TOKEN",
    "GOOGLE_ADS_CLIENT_ID",
    "GOOGLE_ADS_CLIENT_SECRET",
    "GOOGLE_ADS_REFRESH_TOKEN",
    "GOOGLE_ADS_CUSTOMER_ID",
  ];
  const missing = needed.filter((k) => !env[k]);
  if (missing.length) {
    console.error(`Missing in .env.local: ${missing.join(", ")}`);
    console.error("Fill them in per the Google Ads API setup steps (MARKETING-ANALYSIS.md).");
    process.exit(1);
  }
}

async function getAccessToken(env) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_ADS_CLIENT_ID,
      client_secret: env.GOOGLE_ADS_CLIENT_SECRET,
      refresh_token: env.GOOGLE_ADS_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`OAuth token refresh failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

async function gaqlSearch(env, accessToken, query) {
  const cid = env.GOOGLE_ADS_CUSTOMER_ID.replace(/-/g, "");
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "developer-token": env.GOOGLE_ADS_DEVELOPER_TOKEN,
    "Content-Type": "application/json",
  };
  const loginCid = (env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || "").replace(/-/g, "");
  if (loginCid) headers["login-customer-id"] = loginCid;

  const res = await fetch(
    `https://googleads.googleapis.com/${API_VERSION}/customers/${cid}/googleAds:search`,
    { method: "POST", headers, body: JSON.stringify({ query }) }
  );
  if (!res.ok) throw new Error(`Ads API ${res.status}: ${(await res.text()).slice(0, 500)}`);
  const data = await res.json();
  return data.results || [];
}

const micros = (v) => (Number(v || 0) / 1_000_000).toFixed(2);

async function main() {
  const args = process.argv.slice(2);
  const days = Number(args[args.indexOf("--days") + 1]) || 7;
  const csvIdx = args.indexOf("--csv");
  const csvPath = csvIdx >= 0 ? resolve(ROOT, args[csvIdx + 1]) : null;

  const env = loadEnv();
  requireKeys(env);
  const token = await getAccessToken(env);

  // 1. Campaign performance
  const campaigns = await gaqlSearch(env, token, `
    SELECT campaign.name, campaign.status,
           metrics.cost_micros, metrics.impressions, metrics.clicks,
           metrics.conversions, metrics.conversions_value,
           metrics.average_cpc
    FROM campaign
    WHERE segments.date DURING LAST_${days}_DAYS
      AND campaign.status != 'REMOVED'
    ORDER BY metrics.cost_micros DESC`);

  console.log(`\n=== Campaigns (last ${days} days) ===`);
  for (const r of campaigns) {
    const m = r.metrics, c = r.campaign;
    const cost = micros(m.costMicros);
    const conv = Number(m.conversions || 0);
    const cpa = conv > 0 ? (cost / conv).toFixed(2) : "n/a";
    const roas = cost > 0 ? (Number(m.conversionsValue || 0) / cost).toFixed(2) : "n/a";
    console.log(
      `${c.name} [${c.status}] spend $${cost} | ${m.impressions} impr | ${m.clicks} clicks | ` +
      `avg CPC $${micros(m.averageCpc)} | ${conv} conv | CPA $${cpa} | ROAS ${roas}x`
    );
    if (csvPath) {
      const header = "date,campaign,status,spend,impressions,clicks,conversions,conv_value\n";
      if (!existsSync(csvPath)) appendFileSync(csvPath, header);
      appendFileSync(csvPath, [
        new Date().toISOString().slice(0, 10), JSON.stringify(c.name), c.status,
        cost, m.impressions || 0, m.clicks || 0, conv, micros(m.conversionsValue),
      ].join(",") + "\n");
    }
  }
  if (campaigns.length === 0) console.log("No campaigns found (or no data yet).");

  // 2. Search terms actually triggering ads (PMax: campaign search term insights)
  try {
    const terms = await gaqlSearch(env, token, `
      SELECT campaign_search_term_insight.category_label,
             metrics.impressions, metrics.clicks, metrics.conversions
      FROM campaign_search_term_insight
      WHERE segments.date DURING LAST_${days}_DAYS
      ORDER BY metrics.impressions DESC
      LIMIT 25`);
    console.log(`\n=== Top search categories (last ${days} days) ===`);
    for (const r of terms) {
      const m = r.metrics;
      console.log(
        `${r.campaignSearchTermInsight.categoryLabel || "(unknown)"}: ` +
        `${m.impressions} impr, ${m.clicks} clicks, ${m.conversions || 0} conv`
      );
    }
    if (terms.length === 0) console.log("No search term insights yet (needs ~1 week of data).");
  } catch (e) {
    console.log(`Search term insights unavailable: ${String(e).slice(0, 160)}`);
  }

  // 3. Conversion actions health check
  const actions = await gaqlSearch(env, token, `
    SELECT conversion_action.name, conversion_action.status,
           conversion_action.primary_for_goal, conversion_action.type
    FROM conversion_action
    WHERE conversion_action.status = 'ENABLED'`);
  console.log("\n=== Conversion actions ===");
  for (const r of actions) {
    const a = r.conversionAction;
    console.log(`${a.name} [${a.type}] primary=${a.primaryForGoal}`);
  }
  const hasPurchase = actions.some(
    (r) => /purchase/i.test(r.conversionAction.name) && r.conversionAction.primaryForGoal
  );
  if (!hasPurchase) {
    console.log("\nWARNING: no Primary 'purchase' conversion action found.");
    console.log("PMax is optimizing for the wrong goal. Import GA4 purchase as Primary.");
  }
}

main().catch((err) => {
  console.error("Report failed:", err.message || err);
  process.exit(1);
});
