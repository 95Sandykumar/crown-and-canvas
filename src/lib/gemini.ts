import { GoogleGenAI } from "@google/genai";
import { getStyleById } from "@/data/styles";

let _ai: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!_ai) {
    _ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });
  }
  return _ai;
}

function buildPrompt(
  style: { description: string; characterTitle: string; prompt?: string },
  petName: string
): string {
  const title = style.characterTitle.replace("{name}", petName);

  if (style.prompt) {
    return style.prompt
      .replace(/{name}/g, petName)
      .replace(/{title}/g, title);
  }

  return [
    `Create a high-quality portrait painting of a pet as "${title}".`,
    style.description,
    "The pet's face and features should be clearly recognizable from the reference photo.",
    "Style: Classic oil painting with rich colors, dramatic lighting, and fine details.",
    "The portrait should look like a professional museum-quality painting.",
    "Output a single portrait image with no text or watermarks.",
  ].join(" ");
}

export async function generatePortrait(
  petPhotoUrl: string,
  styleId: string,
  petName: string
): Promise<{ base64: string; mimeType: string }> {
  const style = getStyleById(styleId);
  if (!style) {
    throw new Error(`Unknown style: ${styleId}`);
  }

  const prompt = buildPrompt(style, petName);

  // Fetch pet photo and convert to base64
  const photoResponse = await fetch(petPhotoUrl);
  if (!photoResponse.ok) {
    throw new Error(`Failed to fetch pet photo: ${photoResponse.status}`);
  }
  const photoBuffer = await photoResponse.arrayBuffer();
  const photoBase64 = Buffer.from(photoBuffer).toString("base64");
  const photoMime = photoResponse.headers.get("content-type") || "image/jpeg";

  // 50-second timeout to stay within Vercel's 60s limit
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 50_000);

  try {
    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash-preview-05-20",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: photoMime,
                data: photoBase64,
              },
            },
            { text: prompt },
          ],
        },
      ],
      config: {
        responseModalities: ["IMAGE"],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts?.length) {
      throw new Error("Gemini returned no content");
    }

    const imagePart = parts.find((p) => p.inlineData);
    if (!imagePart?.inlineData) {
      throw new Error("Gemini returned no image data");
    }

    return {
      base64: imagePart.inlineData.data!,
      mimeType: imagePart.inlineData.mimeType || "image/png",
    };
  } finally {
    clearTimeout(timeout);
  }
}
