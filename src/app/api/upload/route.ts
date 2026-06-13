import { NextRequest, NextResponse } from "next/server";
import { uploadPetPhoto } from "@/lib/blob";

// Uploads a pet photo (base64 data URL) to Vercel Blob and returns its public
// URL. Called at add-to-cart time so the cart stores a small URL instead of a
// multi-MB base64 string (which would blow the localStorage quota). uploadPetPhoto
// validates MIME type, magic bytes, and size, so this endpoint trusts it for that.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dataUrl = body?.dataUrl;

    if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image." }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const url = await uploadPetPhoto(dataUrl, id, 0);

    return NextResponse.json({ url });
  } catch (err) {
    console.error("Photo upload error:", err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
