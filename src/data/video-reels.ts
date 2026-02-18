export interface VideoReel {
  id: string;
  platform: "tiktok" | "instagram";
  videoId: string;
  embedUrl: string;
  caption: string;
  creator: string;
}

export const VIDEO_REELS: VideoReel[] = [
  {
    id: "1",
    platform: "tiktok",
    videoId: "7406767822090669345",
    embedUrl: "https://www.tiktok.com/embed/v2/7406767822090669345",
    caption: "The most heartfelt pet memorial portrait",
    creator: "@crownandpawofficial",
  },
  {
    id: "2",
    platform: "tiktok",
    videoId: "7038684365697649926",
    embedUrl: "https://www.tiktok.com/embed/v2/7038684365697649926",
    caption: "UGC unboxing that started it all",
    creator: "@koreythekanine",
  },
  {
    id: "3",
    platform: "tiktok",
    videoId: "7262100927539105066",
    embedUrl: "https://www.tiktok.com/embed/v2/7262100927539105066",
    caption: "Golden Retriever royalty unboxing",
    creator: "@tate_and_ellie",
  },
  {
    id: "4",
    platform: "tiktok",
    videoId: "7341375103332093227",
    embedUrl: "https://www.tiktok.com/embed/v2/7341375103332093227",
    caption: "Honest review from a real pet parent",
    creator: "@susanmileski",
  },
  {
    id: "5",
    platform: "instagram",
    videoId: "DICEGasThxT",
    embedUrl: "https://www.instagram.com/reel/DICEGasThxT/embed",
    caption: "brb bawling at this reaction",
    creator: "@crownandpaw",
  },
  {
    id: "6",
    platform: "instagram",
    videoId: "DPOshk3jSJT",
    embedUrl: "https://www.instagram.com/reel/DPOshk3jSJT/embed",
    caption: "Watch the creation process",
    creator: "@crownandpaw",
  },
  {
    id: "7",
    platform: "tiktok",
    videoId: "7576353934772555040",
    embedUrl: "https://www.tiktok.com/embed/v2/7576353934772555040",
    caption: "Losing a pet is never easy — this helps",
    creator: "@crownandpawofficial",
  },
  {
    id: "8",
    platform: "instagram",
    videoId: "C-u91S_gzcc",
    embedUrl: "https://www.instagram.com/reel/C-u91S_gzcc/embed",
    caption: "This is your sign to get one",
    creator: "@thewestwillow",
  },
  {
    id: "9",
    platform: "tiktok",
    videoId: "7300652897304366369",
    embedUrl: "https://www.tiktok.com/embed/v2/7300652897304366369",
    caption: "30% OFF — best gift ever",
    creator: "@crownandpawofficial",
  },
  {
    id: "10",
    platform: "instagram",
    videoId: "DCrjY36xsuT",
    embedUrl: "https://www.instagram.com/reel/DCrjY36xsuT/embed",
    caption: "Then & Now — the perfect gift",
    creator: "@thewestwillow",
  },
];
