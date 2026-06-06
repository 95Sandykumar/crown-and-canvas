import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://crownandcanvas.us";

// Bots that power AI answer engines + search. We explicitly allow them so
// Crown & Canvas can be crawled, indexed, and cited in AI-generated answers.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "ClaudeBot",
  "Claude-Web",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
];

const DISALLOW = ["/api/", "/cart", "/checkout/", "/order/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
