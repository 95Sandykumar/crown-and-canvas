import { put } from "@vercel/blob";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

const MAGIC_BYTES: Record<string, number[]> = {
  jpg: [0xFF, 0xD8, 0xFF],
  jpeg: [0xFF, 0xD8, 0xFF],
  png: [0x89, 0x50, 0x4E, 0x47],
  webp: [0x52, 0x49, 0x46, 0x46], // "RIFF"
};

function extractMimeAndExt(base64DataUrl: string): { buffer: Buffer; ext: string; mime: string } {
  const match = base64DataUrl.match(/^data:(image\/(jpeg|png|webp|jpg));base64,/);
  if (!match) {
    throw new Error("Invalid image format. Allowed: JPEG, PNG, WebP.");
  }
  const mime = match[1];
  if (!ALLOWED_MIME_TYPES.has(mime)) {
    throw new Error("Invalid image format. Allowed: JPEG, PNG, WebP.");
  }
  const ext = match[2] === "jpeg" ? "jpg" : match[2];
  const raw = base64DataUrl.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(raw, "base64");

  // Enforce size limit
  if (buffer.length > MAX_IMAGE_SIZE) {
    throw new Error("Image too large. Maximum size is 10MB.");
  }

  // Validate magic bytes to prevent fake MIME types
  const expectedMagic = MAGIC_BYTES[ext];
  if (expectedMagic) {
    for (let i = 0; i < expectedMagic.length; i++) {
      if (buffer[i] !== expectedMagic[i]) {
        throw new Error("File content does not match declared image type.");
      }
    }
  }

  return { buffer, ext, mime };
}

export async function uploadPetPhoto(
  base64DataUrl: string,
  orderId: string,
  itemIndex: number
): Promise<string> {
  const { buffer, ext, mime } = extractMimeAndExt(base64DataUrl);
  const pathname = `pet-photos/${orderId}/${itemIndex}.${ext}`;

  const blob = await put(pathname, buffer, {
    access: "public",
    contentType: mime,
  });

  return blob.url;
}

export async function uploadPortrait(
  base64: string,
  mimeType: string,
  paymentIntentId: string,
  itemIndex: number
): Promise<string> {
  const ext = mimeType.includes("png") ? "png" : "jpg";
  const buffer = Buffer.from(base64, "base64");
  const pathname = `portraits/${paymentIntentId}/${itemIndex}.${ext}`;

  const blob = await put(pathname, buffer, {
    access: "public",
    contentType: mimeType,
  });

  return blob.url;
}
