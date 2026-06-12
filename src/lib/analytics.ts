// Client-side conversion tracking for Meta Pixel (fbq) and GA4 (gtag).
// Every call is a safe no-op when the underlying script isn't loaded,
// so this stays dormant until NEXT_PUBLIC_META_PIXEL_ID /
// NEXT_PUBLIC_GA_MEASUREMENT_ID are set (scripts injected in layout.tsx).

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

function fbqTrack(
  event: string,
  params: Record<string, unknown>,
  options?: { eventID: string }
) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  if (options) {
    window.fbq("track", event, params, options);
  } else {
    window.fbq("track", event, params);
  }
}

function gtagEvent(name: string, params: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

export function trackViewContent(input: { styleId: string; styleName: string }) {
  fbqTrack("ViewContent", {
    content_ids: [input.styleId],
    content_name: input.styleName,
    content_type: "product",
    content_category: "pet-portrait-style",
  });
  gtagEvent("view_item", {
    items: [{ item_id: input.styleId, item_name: input.styleName }],
  });
}

export function trackAddToCart(input: {
  styleId: string;
  styleName: string;
  tierName: string;
  valueCents: number;
}) {
  const value = input.valueCents / 100;
  fbqTrack("AddToCart", {
    content_ids: [input.styleId],
    content_name: `${input.styleName} — ${input.tierName}`,
    content_type: "product",
    value,
    currency: "USD",
  });
  gtagEvent("add_to_cart", {
    currency: "USD",
    value,
    items: [{ item_id: input.styleId, item_name: input.styleName, item_variant: input.tierName }],
  });
}

export function trackInitiateCheckout(input: {
  styleIds: string[];
  numItems: number;
  valueCents: number;
}) {
  const value = input.valueCents / 100;
  fbqTrack("InitiateCheckout", {
    content_ids: input.styleIds,
    content_type: "product",
    num_items: input.numItems,
    value,
    currency: "USD",
  });
  gtagEvent("begin_checkout", { currency: "USD", value });
}

// eventId must be the Stripe checkout session id: the server-side
// Conversions API event (webhook) uses the same id so Meta dedupes
// the browser and server copies of the same purchase.
export function trackPurchase(input: {
  valueCents: number;
  currency: string;
  eventId: string;
}) {
  const value = input.valueCents / 100;
  fbqTrack(
    "Purchase",
    { value, currency: input.currency.toUpperCase(), content_type: "product" },
    { eventID: input.eventId }
  );
  gtagEvent("purchase", {
    transaction_id: input.eventId,
    value,
    currency: input.currency.toUpperCase(),
  });
}
