import { NextRequest, NextResponse } from "next/server";
import { generatePortrait } from "@/lib/gemini";
import { uploadPortrait } from "@/lib/blob";

interface GenerateRequest {
  petPhotoUrl: string;
  styleId: string;
  petName: string;
  paymentIntentId: string;
  itemIndex: number;
  customerEmail: string;
  customerName: string;
}

export async function POST(req: NextRequest) {
  // Verify internal secret
  const authHeader = req.headers.get("authorization");
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: GenerateRequest = await req.json();
  const {
    petPhotoUrl,
    styleId,
    petName,
    paymentIntentId,
    itemIndex,
    customerEmail,
    customerName,
  } = body;

  let portraitUrl: string | null = null;
  let lastError: string = "";
  const aiEnabled = !!process.env.GOOGLE_AI_API_KEY;

  if (aiEnabled) {
    // Try up to 2 times
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(
          `[generate] Attempt ${attempt + 1} for ${petName} (style: ${styleId})`
        );

        const result = await generatePortrait(petPhotoUrl, styleId, petName);
        portraitUrl = await uploadPortrait(
          result.base64,
          result.mimeType,
          paymentIntentId,
          itemIndex
        );

        console.log(`[generate] Success: ${portraitUrl}`);
        break;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        console.error(`[generate] Attempt ${attempt + 1} failed:`, lastError);
      }
    }
  } else {
    console.log(`[generate] AI not configured — queuing for manual processing: ${petName} (${styleId})`);
    lastError = "AI generation not configured — manual processing required";
  }

  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "Crown & Canvas <orders@resend.dev>";

  if (portraitUrl && resendKey) {
    // Email portrait to customer
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: customerEmail,
          subject: `Your Royal Portrait of ${petName} is Ready!`,
          html: `
            <h2>Your portrait is ready, ${customerName}!</h2>
            <p>We've finished creating the royal portrait of <strong>${petName}</strong>.</p>
            <p><a href="${portraitUrl}" style="display:inline-block;padding:12px 24px;background:#1a365d;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">View & Download Your Portrait</a></p>
            <p style="margin-top:16px;"><img src="${portraitUrl}" alt="Portrait of ${petName}" style="max-width:400px;border-radius:8px;" /></p>
            <hr />
            <p>Love your portrait? Share it with friends and family!</p>
            <p>Questions? Reply to this email and we'll help you out.</p>
            <p>— The Crown & Canvas Team</p>
          `,
        }),
      });
    } catch (emailErr) {
      console.error("[generate] Failed to email customer:", emailErr);
    }

    return NextResponse.json({ success: true, portraitUrl });
  }

  // Generation failed — notify business owner
  if (!portraitUrl && resendKey) {
    const notifyEmail = process.env.ORDER_NOTIFICATION_EMAIL;
    if (notifyEmail) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: notifyEmail,
            subject: `[ACTION REQUIRED] Portrait generation failed for ${petName}`,
            html: `
              <h2>Portrait Generation Failed</h2>
              <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
              <p><strong>Pet:</strong> ${petName}</p>
              <p><strong>Style:</strong> ${styleId}</p>
              <p><strong>Payment:</strong> ${paymentIntentId}</p>
              <p><strong>Error:</strong> ${lastError}</p>
              <p><strong>Pet Photo:</strong> <a href="${petPhotoUrl}">${petPhotoUrl}</a></p>
              <hr />
              <p>This order needs manual portrait creation and delivery.</p>
            `,
          }),
        });
      } catch (notifyErr) {
        console.error("[generate] Failed to notify business:", notifyErr);
      }
    }

    return NextResponse.json(
      { error: "Generation failed", details: lastError },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: !!portraitUrl, portraitUrl });
}
