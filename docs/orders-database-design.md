# Orders Database Design — Crown & Canvas

> Status: DESIGN (not yet applied). Author: session 2026-06-06.
> Goal: give Crown & Canvas a single queryable store for orders + customers, so we can
> power an order-status lookup, a support agent, a dashboard, and real customer analytics
> without scattering state across Stripe metadata + local JSON files + Resend.

---

## 1. Principles

1. **Stripe stays the source of truth for money.** The DB is the operational mirror, not the
   payment ledger. We never trust the DB over Stripe for "was this paid."
2. **The DB is the source of truth for fulfillment + customer state** (status, who, what, where,
   delivered yet, LTV). This replaces the local `orders/.fulfilled.json` and `.pending.json`.
3. **Write from the webhook, update from the worker.** Webhook inserts the order on payment;
   the fulfillment worker advances its status.
4. **Server-only access.** Row Level Security ON, zero public policies. Only the service role
   (server webhook, worker, support agent) can read/write. No client-side access ever.
5. **Scope the support agent at the app layer**, never with raw DB access. The agent queries
   by the verified customer's email/IG handle and only ever sees that customer's rows.

---

## 2. Stack

- **Supabase Postgres** (already have the MCP connected, fits the Next.js + Vercel stack).
- Access via `@supabase/supabase-js` with the **service role key** server-side only.
- Env vars to add: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (Vercel + `.env.local` + the
  always-on machine that runs the worker).

---

## 3. Schema

Three core tables + one enum + an optional audit table.

### Enum: order_status
```
received        -- paid, captured by webhook, not yet generated
generating      -- worker is generating the portrait(s)
pending_review  -- generated, waiting for Boss approval
approved        -- Boss approved (transient, becomes delivered)
delivered       -- portrait emailed to customer
failed          -- generation or delivery failed, needs attention
refunded        -- refunded in Stripe
cancelled       -- cancelled before fulfillment
```

### Table: customers
One row per buyer (keyed by lowercased email). Powers LTV, repeat orders, and the agent.

| column | type | notes |
|---|---|---|
| id | uuid PK | `gen_random_uuid()` |
| email | text UNIQUE NOT NULL | always stored lowercased |
| name | text | latest known name |
| phone | text | NEW — capture at checkout for SMS/support |
| instagram_handle | text | NEW — link DMs to a customer for the agent |
| first_order_at | timestamptz | |
| last_order_at | timestamptz | |
| total_orders | int default 0 | |
| total_spent_cents | bigint default 0 | LTV |
| marketing_opt_in | boolean default true | |
| resend_synced | boolean default false | already in Resend audience? |
| created_at | timestamptz default now() | |
| updated_at | timestamptz default now() | trigger-maintained |

### Table: orders
One row per Stripe checkout session.

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| stripe_session_id | text UNIQUE NOT NULL | natural key, dedupes webhook retries |
| stripe_payment_intent | text | for dashboard deep-link |
| customer_id | uuid FK -> customers(id) | |
| email | text NOT NULL | denormalized for fast lookup |
| customer_name | text | |
| status | order_status NOT NULL default 'received' | |
| amount_total_cents | bigint | |
| currency | text default 'usd' | |
| gift_wrapping | boolean default false | |
| rush_processing | boolean default false | |
| donation_cents | int default 0 | |
| is_physical | boolean default false | true if shipping address present |
| shipping_name | text | |
| shipping_line1 | text | |
| shipping_line2 | text | |
| shipping_city | text | |
| shipping_state | text | |
| shipping_postal | text | |
| shipping_country | text | |
| utm_source | text | |
| utm_medium | text | |
| utm_campaign | text | |
| utm_content | text | |
| utm_term | text | |
| referrer | text | |
| landing_path | text | |
| raw_order_data | jsonb | full {p,s,n} photo snapshot for fidelity/debugging |
| pending_at | timestamptz | when it entered pending_review |
| delivered_at | timestamptz | |
| last_reminded_at | timestamptz | replaces the JSON reminder bookkeeping |
| created_at | timestamptz default now() | |
| updated_at | timestamptz default now() | trigger-maintained |

### Table: order_items
Normalized line items so we can answer "how many King portraits sold this month."

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| order_id | uuid FK -> orders(id) ON DELETE CASCADE | |
| style_id | text | e.g. `renaissance-king` |
| style_title | text | display name |
| tier | text | digital / canvas / framed |
| size | text | |
| pet_name | text | |
| quantity | int default 1 | |
| photo_url | text | source pet photo (Blob URL) |
| generated_url | text | final portrait URL, filled after generation |
| unit_price_cents | int | |
| created_at | timestamptz default now() | |

### Optional table: order_status_events (audit trail)
Lets the agent and dashboard show a timeline ("paid 2pm, generated 2:05, delivered 4pm").
```
id uuid PK, order_id uuid FK, from_status order_status, to_status order_status,
note text, created_at timestamptz default now()
```

---

## 4. Migration SQL

```sql
-- 0. extensions
create extension if not exists "pgcrypto"; -- gen_random_uuid

-- 1. enum
create type order_status as enum (
  'received','generating','pending_review','approved',
  'delivered','failed','refunded','cancelled'
);

-- 2. customers
create table customers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  phone text,
  instagram_handle text,
  first_order_at timestamptz,
  last_order_at timestamptz,
  total_orders int not null default 0,
  total_spent_cents bigint not null default 0,
  marketing_opt_in boolean not null default true,
  resend_synced boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index customers_instagram_idx on customers (lower(instagram_handle));

-- 3. orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  stripe_payment_intent text,
  customer_id uuid references customers(id),
  email text not null,
  customer_name text,
  status order_status not null default 'received',
  amount_total_cents bigint,
  currency text not null default 'usd',
  gift_wrapping boolean not null default false,
  rush_processing boolean not null default false,
  donation_cents int not null default 0,
  is_physical boolean not null default false,
  shipping_name text, shipping_line1 text, shipping_line2 text,
  shipping_city text, shipping_state text, shipping_postal text, shipping_country text,
  utm_source text, utm_medium text, utm_campaign text, utm_content text, utm_term text,
  referrer text, landing_path text,
  raw_order_data jsonb,
  pending_at timestamptz,
  delivered_at timestamptz,
  last_reminded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_email_idx on orders (email);
create index orders_status_idx on orders (status);
create index orders_created_idx on orders (created_at desc);

-- 4. order_items
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  style_id text,
  style_title text,
  tier text,
  size text,
  pet_name text,
  quantity int not null default 1,
  photo_url text,
  generated_url text,
  unit_price_cents int,
  created_at timestamptz not null default now()
);
create index order_items_order_idx on order_items (order_id);
create index order_items_style_idx on order_items (style_id);

-- 5. status audit (optional)
create table order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  from_status order_status,
  to_status order_status,
  note text,
  created_at timestamptz not null default now()
);
create index order_status_events_order_idx on order_status_events (order_id);

-- 6. updated_at trigger
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;
create trigger customers_updated before update on customers
  for each row execute function set_updated_at();
create trigger orders_updated before update on orders
  for each row execute function set_updated_at();

-- 7. lock it down: RLS on, no public policies (service role bypasses RLS)
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_status_events enable row level security;
-- intentionally NO policies created -> only service_role can touch these tables.
```

---

## 5. How the Stripe webhook writes (integration plan)

In `src/app/api/webhooks/stripe/route.ts`, inside `handleOrderCompleted`, AFTER the existing
parse (we already extract everything we need), add a DB write BEFORE sending emails:

```
1. upsert customer by email (lowercased):
   - insert if new; on conflict update name, phone, last_order_at,
     total_orders = total_orders + 1, total_spent_cents = total_spent_cents + amount
   - capture customer_id
2. insert order (stripe_session_id unique guards against webhook retries -> on conflict do nothing)
3. insert order_items (one row per line item, photo_url from raw_order_data)
4. (optional) insert status_event received
```

Keep the existing email sends exactly as they are. The DB write is **additive** and wrapped in
try/catch so a DB hiccup never fails the webhook (same pattern as the email block today).

## 6. How the fulfillment worker uses it

Replace the local JSON files (`.fulfilled.json`, `.pending.json`) with DB queries, in phases:

- **Find work:** `select * from orders where status = 'received'`
- **On generate start:** status -> `generating`
- **After generation:** save `order_items.generated_url`, status -> `pending_review`, set `pending_at`
- **On approve:** status -> `delivered`, set `delivered_at`; then email customer + add to Resend audience
- **Reminders:** query `pending_review` rows where `pending_at` is old, update `last_reminded_at`
- **Failures:** status -> `failed`

Phase it: **dual-write first** (keep JSON + write DB in parallel for a week), confirm the DB
matches, then cut the JSON out.

## 7. Backfilling existing orders

The worker already lists Stripe sessions (`recentPaidSessions`). A one-time
`scripts/backfill-orders.mjs` iterates Stripe checkout sessions and upserts each into the DB
using the same mapping as the webhook. Idempotent via `stripe_session_id` unique constraint.

---

## 8. What this unlocks immediately

- **Order-status lookup**: `select status, delivered_at from orders where email = ?` — for the
  success page, a "track my order" page, and the support agent.
- **Support agent (scoped)**: agent verifies the DM sender's email/IG handle, then reads ONLY
  that customer's orders. Never raw table access.
- **Dashboard**: revenue, AOV, orders by tier/style, orders by UTM source, pending queue.
- **Customer analytics**: LTV, repeat rate, top campaigns — straight SQL.
- **Resilience**: fulfillment state survives the always-on machine dying.

## 9. Decisions (resolved 2026-06-06)

1. **Phone capture — YES.** Enable `phone_number_collection` on Stripe Checkout and store it on
   `customers.phone`. Enables SMS support + abandoned-cart + backup contact.
2. **Audit table — YES.** Keep `order_status_events` for full order timelines (agent + dashboard).
3. **Supabase project — CREATE FRESH.** A dedicated Crown & Canvas Supabase project for clean
   isolation.

## 10. Build order (when greenlit)

1. Create fresh Supabase project `crown-and-canvas`.
2. Apply the section-4 migration.
3. Add `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`, Vercel, and the worker machine.
4. Add a tiny `src/lib/supabase.ts` service-role client (server-only).
5. Wire the additive DB write into the Stripe webhook (section 5).
6. Enable `phone_number_collection` in `src/app/api/checkout/route.ts`.
7. Backfill existing Stripe orders (`scripts/backfill-orders.mjs`).
8. Dual-write the worker, verify a week, then retire the JSON ledgers.
```
