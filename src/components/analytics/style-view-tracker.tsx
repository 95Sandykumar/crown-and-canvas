"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/analytics";

// Fires a Meta Pixel ViewContent + GA4 view_item once per mount.
// Rendered inside server-component style pages; emits no DOM.
export function StyleViewTracker({
  styleId,
  styleName,
}: {
  styleId: string;
  styleName: string;
}) {
  useEffect(() => {
    trackViewContent({ styleId, styleName });
  }, [styleId, styleName]);

  return null;
}
