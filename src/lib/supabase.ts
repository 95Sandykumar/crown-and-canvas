import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the SERVICE ROLE key.
 *
 * This key bypasses Row Level Security. NEVER import this into a client
 * component or expose it to the browser. The orders/customers tables have RLS
 * enabled with no public policies, so this is the only way to read/write them.
 *
 * Returns null if env vars are missing, so callers can no-op gracefully
 * (DB writes are additive and must never break checkout or the webhook).
 */
let cached: SupabaseClient | null | undefined;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.warn("[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set; DB writes disabled");
    cached = null;
    return cached;
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
