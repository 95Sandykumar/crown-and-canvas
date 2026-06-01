// Lightweight first-touch attribution capture.
//
// On a visitor's first landing we record where they came from (UTM tags,
// referrer, landing path) into localStorage. Because it's first-touch, we
// never overwrite it: the original source (e.g. an Instagram ad click) is
// preserved even if they browse around or return days later before ordering.
// At checkout this gets read back and written into Stripe order metadata, so
// every order is self-attributing in the Stripe Dashboard.

const STORAGE_KEY = "crown-canvas-attribution";
const MAX_LEN = 480; // Stay under Stripe's 500-char metadata value limit

export interface Attribution {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  referrer: string;
  landingPath: string;
  capturedAt: string;
}

function clip(value: string): string {
  return value.slice(0, MAX_LEN);
}

/**
 * Capture first-touch attribution. Safe to call on every page load — it only
 * writes the first time a visitor arrives and is a no-op thereafter.
 * Client-side only.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;

  try {
    // First-touch: never overwrite an existing capture.
    if (window.localStorage.getItem(STORAGE_KEY)) return;

    const params = new URLSearchParams(window.location.search);

    const attribution: Attribution = {
      utmSource: clip(params.get("utm_source") || ""),
      utmMedium: clip(params.get("utm_medium") || ""),
      utmCampaign: clip(params.get("utm_campaign") || ""),
      utmContent: clip(params.get("utm_content") || ""),
      utmTerm: clip(params.get("utm_term") || ""),
      referrer: clip(document.referrer || ""),
      landingPath: clip(window.location.pathname + window.location.search),
      capturedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // localStorage can throw (private mode, quota). Attribution is best-effort.
  }
}

/** Read back the stored first-touch attribution, or null if none/unreadable. */
export function getAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Attribution;
  } catch {
    return null;
  }
}
