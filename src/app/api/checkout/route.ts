import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { uploadPetPhoto } from "@/lib/blob";

interface CheckoutItem {
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

interface CheckoutRequest {
  items: CheckoutItem[];
  email: string;
  name: string;
  donationCents: number;
  giftWrapping: boolean;
  rushProcessing: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body: CheckoutRequest = await req.json();
    const { items, email, name, donationCents, giftWrapping, rushProcessing } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }
    if (!email?.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Build line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: `${item.styleName} Pet Portrait`,
            description: `${item.tierName} — ${item.sizeLabel} | Pet: ${item.petName}`,
          },
          unit_amount: item.priceInCents,
        },
        quantity: item.quantity,
      })
    );

    // Add gift wrapping if selected
    if (giftWrapping) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Premium Gift Wrapping",
          },
          unit_amount: 999,
        },
        quantity: 1,
      });
    }

    // Add rush processing if selected
    if (rushProcessing) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Rush Processing (3-5 business days)",
          },
          unit_amount: 1499,
        },
        quantity: 1,
      });
    }

    // Add donation if present
    if (donationCents > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shelter Pet Donation",
            description: "100% goes to partner animal shelters",
          },
          unit_amount: donationCents,
        },
        quantity: 1,
      });
    }

    // Upload pet photos to Vercel Blob and build compact order data
    const orderId = crypto.randomUUID();
    const orderDataItems: { p: string; s: string; n: string }[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let photoUrl = item.petPhotoUrl;

      // Upload base64 photos to Vercel Blob
      if (item.petPhotoUrl.startsWith("data:")) {
        photoUrl = await uploadPetPhoto(item.petPhotoUrl, orderId, i);
      }

      orderDataItems.push({
        p: photoUrl,
        s: item.styleId,
        n: item.petName,
      });
    }

    // Chunk orderData into 500-char metadata values
    const metadata: Record<string, string> = {
      customerName: name,
      giftWrapping: giftWrapping ? "yes" : "no",
      rushProcessing: rushProcessing ? "yes" : "no",
      donationCents: String(donationCents),
    };

    // Also keep orderItems for notification email compatibility
    const orderSummary = items.map((item) => ({
      style: item.styleName,
      tier: item.tierName,
      size: item.sizeLabel,
      pet: item.petName,
      qty: item.quantity,
    }));
    metadata.orderItems = JSON.stringify(orderSummary).slice(0, 500);

    // Split order data across metadata keys if needed (500-char limit per value)
    const fullOrderData = JSON.stringify(orderDataItems);
    const chunkSize = 500;
    for (let i = 0; i < fullOrderData.length; i += chunkSize) {
      const key = i === 0 ? "orderData" : `orderData${Math.floor(i / chunkSize) + 1}`;
      metadata[key] = fullOrderData.slice(i, i + chunkSize);
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
      customer_email: email,
      metadata,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    const message = err instanceof Error ? err.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
