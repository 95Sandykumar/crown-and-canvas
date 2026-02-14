import { ProductTier } from "@/types";

export const PRODUCT_TIERS: ProductTier[] = [
  {
    id: "digital",
    name: "Digital Download",
    slug: "digital",
    type: "digital",
    description: "High-resolution digital file, perfect for printing at home or sharing online.",
    features: [
      "High-resolution JPG + PNG files",
      "Print-ready (300 DPI)",
      "Instant email delivery",
      "Unlimited personal use",
    ],
    sizes: [
      { id: "digital-standard", label: "Standard", dimensions: "3000x4000px", priceInCents: 2999 },
    ],
  },
  {
    id: "canvas",
    name: "Premium Canvas",
    slug: "canvas",
    type: "canvas",
    description: "Museum-quality canvas print, gallery-wrapped and ready to hang.",
    features: [
      "Premium cotton canvas",
      "Gallery-wrapped edges",
      "Ready to hang",
      "Free shipping",
      "Digital file included",
    ],
    sizes: [
      { id: "canvas-8x10", label: "8\" x 10\"", dimensions: "8x10 inches", priceInCents: 5999 },
      { id: "canvas-12x16", label: "12\" x 16\"", dimensions: "12x16 inches", priceInCents: 7499 },
      { id: "canvas-16x20", label: "16\" x 20\"", dimensions: "16x20 inches", priceInCents: 8999 },
    ],
  },
  {
    id: "framed",
    name: "Luxury Framed",
    slug: "framed",
    type: "framed",
    description: "Exquisite framed portrait with UV-protective glass and museum-quality frame.",
    features: [
      "Museum-quality wooden frame",
      "UV-protective glass",
      "Archival matte paper",
      "Hanging hardware included",
      "Free shipping",
      "Digital file included",
    ],
    sizes: [
      { id: "framed-8x10", label: "8\" x 10\"", dimensions: "8x10 inches", priceInCents: 9999 },
      { id: "framed-12x16", label: "12\" x 16\"", dimensions: "12x16 inches", priceInCents: 12999 },
      { id: "framed-18x24", label: "18\" x 24\"", dimensions: "18x24 inches", priceInCents: 14999 },
    ],
  },
];

export const ADD_ONS = {
  giftWrapping: { label: "Premium Gift Wrapping", priceInCents: 999 },
  rushProcessing: { label: "Rush Processing (3-5 business days)", priceInCents: 1499 },
};

export function getTierById(id: string): ProductTier | undefined {
  return PRODUCT_TIERS.find((t) => t.id === id);
}

export function getSizeById(tierId: string, sizeId: string) {
  const tier = getTierById(tierId);
  return tier?.sizes.find((s) => s.id === sizeId);
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
