import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  // Basic format validation — Stripe session IDs start with cs_
  if (!/^cs_(test|live)_[a-zA-Z0-9]+$/.test(sessionId)) {
    return NextResponse.json({ error: "Invalid session_id" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    // Only return data for completed payments (prevents probing unpaid sessions)
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Intentionally omit customerEmail to minimize PII exposure
    return NextResponse.json({
      customerName: session.metadata?.customerName || null,
      amountTotal: session.amount_total,
      currency: session.currency,
      paymentStatus: session.payment_status,
      items: session.line_items?.data.map((item) => ({
        name: item.description,
        quantity: item.quantity,
        amountTotal: item.amount_total,
      })),
    });
  } catch (err) {
    console.error("Failed to retrieve session:", err);
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
}
