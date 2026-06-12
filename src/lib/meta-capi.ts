// Meta Conversions API (server-side Purchase events).
// Browser pixels are blocked for ~30% of iOS users; sending the same
// Purchase from the Stripe webhook with event_id = checkout session id
// lets Meta dedupe against the browser event and recovers that signal.
// Dormant until NEXT_PUBLIC_META_PIXEL_ID and META_CAPI_ACCESS_TOKEN are set.

import { createHash } from "crypto";

const GRAPH_API_VERSION = "v21.0";

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export async function sendMetaPurchaseEvent(input: {
  sessionId: string;
  email: string | null;
  amountTotalCents: number;
  currency: string;
  eventSourceUrl: string;
}): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return;

  const userData: Record<string, string[]> = {};
  if (input.email) {
    userData.em = [sha256(input.email)];
  }

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.sessionId,
        action_source: "website",
        event_source_url: input.eventSourceUrl,
        user_data: userData,
        custom_data: {
          value: input.amountTotalCents / 100,
          currency: input.currency.toUpperCase(),
        },
      },
    ],
  };

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${accessToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Meta CAPI ${res.status}: ${body.slice(0, 300)}`);
  }
}
