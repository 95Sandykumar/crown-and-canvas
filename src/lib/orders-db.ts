import type Stripe from "stripe";
import { getSupabaseAdmin } from "./supabase";

/** A line-item summary from Stripe metadata.orderItems (may be truncated at 500 chars). */
export interface OrderSummaryItem {
  style: string; // display name, e.g. "The Chef"
  tier: string;
  size: string;
  pet: string;
  qty: number;
}

/** A photo entry from Stripe metadata.orderData (chunked, never truncated). */
export interface OrderPhoto {
  p: string; // photo URL
  s: string; // canonical style id, e.g. "modern-chef"
  n: string; // pet name
}

/**
 * Record a paid order into Supabase: upsert the customer (with LTV), insert the
 * order, its line items, and a status event.
 *
 * Additive and non-fatal: returns silently if env vars are missing or on any
 * error, so it can never break the Stripe webhook. Stripe remains the source of
 * truth for payments; this is the operational mirror.
 *
 * `photos` (orderData) is the reliable spine — one entry per line item, never
 * truncated. `summary` (orderItems) is index-aligned but may be truncated, so we
 * only use it to enrich tier/size/qty when present.
 */
export async function recordOrder(
  session: Stripe.Checkout.Session,
  summary: OrderSummaryItem[],
  photos: OrderPhoto[],
): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  try {
    const email = (session.customer_details?.email || session.customer_email || "").toLowerCase().trim();
    if (!email) {
      console.warn("[orders-db] no email on session, skipping", session.id);
      return;
    }

    const name = session.metadata?.customerName || session.customer_details?.name || null;
    const phone = session.customer_details?.phone || null;
    const amountCents = session.amount_total ?? 0;
    const md = session.metadata || {};
    const shipping = session.collected_information?.shipping_details;
    const addr = shipping?.address;
    const nowIso = new Date().toISOString();

    // 1. Upsert customer (read-then-write to keep LTV counters correct).
    let customerId: string | null = null;
    const { data: existing } = await supabase
      .from("customers")
      .select("id, total_orders, total_spent_cents")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      customerId = existing.id;
      await supabase
        .from("customers")
        .update({
          ...(name ? { name } : {}),
          ...(phone ? { phone } : {}),
          last_order_at: nowIso,
          total_orders: (existing.total_orders ?? 0) + 1,
          total_spent_cents: (existing.total_spent_cents ?? 0) + amountCents,
        })
        .eq("id", customerId);
    } else {
      const { data: created } = await supabase
        .from("customers")
        .insert({
          email,
          name,
          phone,
          first_order_at: nowIso,
          last_order_at: nowIso,
          total_orders: 1,
          total_spent_cents: amountCents,
        })
        .select("id")
        .single();
      customerId = created?.id ?? null;
    }

    // 2. Insert the order. stripe_session_id is unique -> webhook retries dedupe.
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        stripe_session_id: session.id,
        stripe_payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : null,
        customer_id: customerId,
        email,
        customer_name: name,
        status: "received",
        amount_total_cents: amountCents,
        currency: session.currency || "usd",
        gift_wrapping: md.giftWrapping === "yes",
        rush_processing: md.rushProcessing === "yes",
        donation_cents: parseInt(md.donationCents || "0", 10) || 0,
        is_physical: !!addr,
        shipping_name: shipping?.name || null,
        shipping_line1: addr?.line1 || null,
        shipping_line2: addr?.line2 || null,
        shipping_city: addr?.city || null,
        shipping_state: addr?.state || null,
        shipping_postal: addr?.postal_code || null,
        shipping_country: addr?.country || null,
        utm_source: md.utmSource || null,
        utm_medium: md.utmMedium || null,
        utm_campaign: md.utmCampaign || null,
        utm_content: md.utmContent || null,
        utm_term: md.utmTerm || null,
        referrer: md.referrer || null,
        landing_path: md.landingPath || null,
        raw_order_data: photos.length ? photos : null,
      })
      .select("id")
      .maybeSingle();

    if (orderErr) {
      if (orderErr.code === "23505") {
        console.log("[orders-db] order already recorded (webhook retry)", session.id);
        return;
      }
      throw orderErr;
    }
    if (!order) return;

    // 3. Insert line items. Use photos (orderData) as the spine; enrich from the
    //    index-aligned summary (orderItems) when available.
    const rows = photos.map((ph, i) => {
      const s = summary[i];
      return {
        order_id: order.id,
        style_id: ph.s,
        style_title: s?.style || ph.s,
        tier: s?.tier || null,
        size: s?.size || null,
        pet_name: ph.n,
        quantity: s?.qty || 1,
        photo_url: ph.p,
      };
    });
    if (rows.length) await supabase.from("order_items").insert(rows);

    // 4. Status event.
    await supabase.from("order_status_events").insert({
      order_id: order.id,
      from_status: null,
      to_status: "received",
      note: "order created from Stripe webhook",
    });

    console.log("[orders-db] recorded order", session.id, "->", order.id, `(${rows.length} item(s))`);
  } catch (e) {
    console.error("[orders-db] failed to record order (non-fatal):", e);
  }
}
