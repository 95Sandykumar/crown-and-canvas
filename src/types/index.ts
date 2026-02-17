export type StyleCategory =
  | "Renaissance"
  | "Military"
  | "Royalty"
  | "Fantasy"
  | "Modern";

export type PetType = "dog" | "cat" | "any";

export interface PortraitStyle {
  id: string;
  name: string;
  slug: string;
  category: StyleCategory;
  description: string;
  beforeImage: string;
  previewImage: string;
  petTypes: PetType[];
  popular: boolean;
  characterTitle: string;
  prompt: string;
}

export interface ProductTier {
  id: string;
  name: string;
  slug: string;
  type: "digital" | "canvas" | "framed";
  description: string;
  features: string[];
  sizes: ProductSize[];
}

export interface ProductSize {
  id: string;
  label: string;
  dimensions: string | null;
  priceInCents: number;
}

export interface CartItem {
  id: string;
  styleId: string;
  styleName: string;
  stylePreview: string;
  tierId: string;
  tierName: string;
  sizeId: string;
  sizeLabel: string;
  petName: string;
  petPhotoUrl: string;
  priceInCents: number;
  quantity: number;
}

export type OrderStep = "upload" | "select-style" | "customize" | "review";

export interface OrderFlowState {
  petName: string;
  petPhotoUrl: string | null;
  selectedStyleId: string | null;
  selectedTierId: string | null;
  selectedSizeId: string | null;
  giftWrapping: boolean;
  giftNote: string;
  rushProcessing: boolean;
  currentStep: OrderStep;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Testimonial {
  name: string;
  petName: string;
  petType: string;
  quote: string;
  rating: number;
  petImage?: string;
  styleName?: string;
}
