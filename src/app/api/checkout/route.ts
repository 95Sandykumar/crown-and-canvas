import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { uploadPetPhoto } from "@/lib/blob";
import { PRODUCT_TIERS, ADD_ONS } from "@/data/products";
import { getStyleById } from "@/data/styles";

// --- Zod schema: runtime validation for every field ---
const CheckoutItemSchema = z.object({
  id: z.string().min(1).max(100),
  styleId: z.string().min(1).max(50),
  styleName: z.string().min(1).max(200),
  stylePreview: z.string().max(500),
  tierId: z.string().min(1).max(50),
  tierName: z.string().min(1).max(100),
  sizeId: z.string().min(1).max(50),
  sizeLabel: z.string().min(1).max(50),
  petName: z.string().min(1).max(100),
  petPhotoUrl: z.string().min(1).max(15_000_000), // ~10MB base64
  priceInCents: z.number(), // Ignored — we look up server-side
  quantity: z.number().int().min(1).max(10),
});

const CheckoutRequestSchema = z.object({
  items: z.array(CheckoutItemSchema).min(1).max(20),
  email: z.string().email().max(320),
  name: z.string().min(1).max(200),
  donationCents: z.number().int().min(0).max(100_000), // Max $1000 donation
  giftWrapping: z.boolean(),
  rushProcessing: z.boolean(),
});

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // Runtime validation
    const parsed = CheckoutRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data." },
        { status: 400 }
      );
    }

    const { items, email, name, donationCents, giftWrapping, rushProcessing } = parsed.data;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Build line items — SERVER-SIDE PRICE LOOKUP (never trust client prices)
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of items) {
      // Validate style exists
      const style = getStyleById(item.styleId);
      if (!style) {
        return NextResponse.json(
          { error: "Invalid portrait style." },
          { status: 400 }
        );
      }

      // Validate tier and size exist, get authoritative price
      const tier = PRODUCT_TIERS.find((t) => t.id === item.tierId);
      const size = tier?.sizes.find((s) => s.id === item.sizeId);
      if (!tier || !size) {
        return NextResponse.json(
          { error: "Invalid product tier or size." },
          { status: 400 }
        );
      }

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: `${style.name} Pet Portrait`,
            description: `${tier.name} — ${size.label} | Pet: ${item.petName}`,
          },
          unit_amount: size.priceInCents, // SERVER-AUTHORITATIVE PRICE
        },
        quantity: item.quantity,
      });
    }

    // Add gift wrapping if selected (server-side price)
    if (giftWrapping) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Premium Gift Wrapping" },
          unit_amount: ADD_ONS.giftWrapping.priceInCents,
        },
        quantity: 1,
      });
    }

    // Add rush processing if selected (server-side price)
    if (rushProcessing) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Rush Processing (3-5 business days)" },
          unit_amount: ADD_ONS.rushProcessing.priceInCents,
        },
        quantity: 1,
      });
    }

    // Add donation if present (already validated 0-100000 by Zod)
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
    const orderSummary = items.map((item) => {
      const tier = PRODUCT_TIERS.find((t) => t.id === item.tierId);
      const size = tier?.sizes.find((s) => s.id === item.sizeId);
      return {
        style: item.styleName,
        tier: tier?.name || item.tierName,
        size: size?.label || item.sizeLabel,
        pet: item.petName,
        qty: item.quantity,
      };
    });
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
    return NextResponse.json(
      { error: "Failed to create checkout session. Please try again." },
      { status: 500 }
    );
  }
}
