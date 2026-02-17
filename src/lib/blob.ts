import { put } from "@vercel/blob";

function extractMimeAndExt(base64DataUrl: string): { buffer: Buffer; ext: string; mime: string } {
  const match = base64DataUrl.match(/^data:(image\/(\w+));base64,/);
  if (!match) {
    throw new Error("Invalid base64 data URL");
  }
  const mime = match[1];
  const ext = match[2] === "jpeg" ? "jpg" : match[2];
  const raw = base64DataUrl.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(raw, "base64");
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
