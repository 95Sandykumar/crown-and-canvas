export const SITE_NAME = "Crown & Canvas";
export const SITE_DESCRIPTION = "Transform your beloved pet into a majestic royal portrait. Custom pet portraits on premium canvas, framed prints, and digital downloads.";
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Styles", href: "/styles" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
] as const;

export const ORDER_STEPS = [
  { id: "upload" as const, label: "Upload Photo", step: 1 },
  { id: "select-style" as const, label: "Choose Style", step: 2 },
  { id: "customize" as const, label: "Customize", step: 3 },
  { id: "review" as const, label: "Review", step: 4 },
] as const;
