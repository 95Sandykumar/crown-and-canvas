export interface CustomerPhoto {
  image: string;
  petType: string;
  styleName: string;
}

// Real delivered portraits photographed in customers' homes — social proof of fulfilled orders.
export const CUSTOMER_PHOTOS: CustomerPhoto[] = [
  {
    image: "/testimonials/corgi-admiral.webp",
    petType: "Corgi",
    styleName: "The Admiral",
  },
  {
    image: "/testimonials/maine-coon-empress-1.webp",
    petType: "Maine Coon",
    styleName: "The Empress",
  },
  {
    image: "/testimonials/golden-chef-1.webp",
    petType: "Golden Retriever",
    styleName: "The Chef",
  },
  {
    image: "/testimonials/samoyed-admiral-1.webp",
    petType: "Samoyed",
    styleName: "The General",
  },
  {
    image: "/testimonials/calico-princess-1.webp",
    petType: "Calico Cat",
    styleName: "The Princess",
  },
];
