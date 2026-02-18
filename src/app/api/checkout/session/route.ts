import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    return NextResponse.json({
      customerName: session.metadata?.customerName || null,
      customerEmail: session.customer_details?.email || session.customer_email,
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
