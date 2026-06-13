export const SITE_NAME = "Crown & Canvas";
export const SITE_DESCRIPTION = "Transform your beloved pet into a majestic royal portrait. Custom pet portraits on premium canvas, framed prints, and digital downloads.";
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Styles", href: "/styles" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
] as const;

// Style-first flow (matches Crown & Paw / West & Willow): choosing the style is
// the aspirational, commitment-building step, so it comes before the photo-upload
// chore. This lifts completion vs. asking for the upload first.
export const ORDER_STEPS = [
  { id: "select-style" as const, label: "Choose Style", step: 1 },
  { id: "upload" as const, label: "Upload Photo", step: 2 },
  { id: "customize" as const, label: "Customize", step: 3 },
] as const;
