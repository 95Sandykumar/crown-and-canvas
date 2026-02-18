import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleOrderCompleted(session);
  }

  return NextResponse.json({ received: true });
}

async function handleOrderCompleted(session: Stripe.Checkout.Session) {
  const customerEmail = session.customer_details?.email || session.customer_email;
  const customerName = session.metadata?.customerName || "Customer";
  const orderItems = session.metadata?.orderItems || "[]";
  const giftWrapping = session.metadata?.giftWrapping === "yes";
  const rushProcessing = session.metadata?.rushProcessing === "yes";
  const donationCents = parseInt(session.metadata?.donationCents || "0", 10);
  const amountTotal = session.amount_total ? (session.amount_total / 100).toFixed(2) : "0.00";

  console.log("=== NEW ORDER RECEIVED ===");
  console.log(`Customer: ${customerName} (${customerEmail})`);
  console.log(`Amount: $${amountTotal}`);
  console.log(`Items: ${orderItems}`);
  console.log(`Gift Wrapping: ${giftWrapping}`);
  console.log(`Rush Processing: ${rushProcessing}`);
  console.log(`Donation: $${(donationCents / 100).toFixed(2)}`);
  console.log(`Stripe Payment ID: ${session.payment_intent}`);
  console.log("==========================");

  // Trigger AI portrait generation for each item
  const internalSecret = process.env.INTERNAL_API_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (internalSecret && customerEmail) {
    try {
      // Reassemble orderData from chunked metadata
      let orderDataStr = session.metadata?.orderData || "";
      for (let i = 2; ; i++) {
        const chunk = session.metadata?.[`orderData${i}`];
        if (!chunk) break;
        orderDataStr += chunk;
      }

      if (orderDataStr) {
        const orderDataItems: { p: string; s: string; n: string }[] =
          JSON.parse(orderDataStr);
        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.toString() || "unknown";

        for (let i = 0; i < orderDataItems.length; i++) {
          const item = orderDataItems[i];
          // Fire-and-forget: each runs in its own serverless invocation
          fetch(`${baseUrl}/api/generate`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${internalSecret}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              petPhotoUrl: item.p,
              styleId: item.s,
              petName: item.n,
              paymentIntentId,
              itemIndex: i,
              customerEmail,
              customerName,
            }),
          }).catch((err) =>
            console.error(`[webhook] Failed to trigger generation for item ${i}:`, err)
          );
        }

        console.log(
          `[webhook] Triggered ${orderDataItems.length} portrait generation(s)`
        );
      }
    } catch (genErr) {
      console.error("[webhook] Failed to parse orderData:", genErr);
    }
  }

  // Send notification email via Resend (if API key is configured)
  const resendKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.ORDER_NOTIFICATION_EMAIL;

  if (resendKey && notifyEmail) {
    try {
      const items = JSON.parse(orderItems);
      const itemsList = items
        .map(
          (item: { style: string; tier: string; size: string; pet: string; qty: number }) =>
            `<li><strong>${item.style}</strong> — ${item.tier} (${item.size}) | Pet: ${item.pet} x${item.qty}</li>`
        )
        .join("");

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || "Crown & Canvas <orders@resend.dev>",
          to: notifyEmail,
          subject: `New Order: $${amountTotal} from ${customerName}`,
          html: `
            <h2>New Order Received!</h2>
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            <p><strong>Total:</strong> $${amountTotal}</p>
            <p><strong>Stripe Payment:</strong> ${session.payment_intent}</p>
            <h3>Items:</h3>
            <ul>${itemsList}</ul>
            ${giftWrapping ? "<p>Gift Wrapping: Yes</p>" : ""}
            ${rushProcessing ? "<p>Rush Processing: Yes</p>" : ""}
            ${donationCents > 0 ? `<p>Shelter Donation: $${(donationCents / 100).toFixed(2)}</p>` : ""}
            <hr />
            <p><a href="https://dashboard.stripe.com/payments/${session.payment_intent}">View in Stripe Dashboard</a></p>
          `,
        }),
      });

      // Send confirmation email to customer
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || "Crown & Canvas <orders@resend.dev>",
          to: customerEmail,
          subject: "Your Crown & Canvas Order is Confirmed!",
          html: `
            <h2>Thank you for your order, ${customerName}!</h2>
            <p>We've received your order and are excited to start creating your royal pet portrait.</p>
            <h3>What Happens Next:</h3>
            <ol>
              <li><strong>Portrait Creation</strong> — Our artists are working on your royal portrait. You'll receive it by email within 24-48 hours.</li>
              <li><strong>Review & Download</strong> — Download your high-resolution portrait from the email link.</li>
              <li><strong>Delivery</strong> — Digital files sent via email. Canvas & framed prints ship within 5-7 business days.</li>
            </ol>
            <p><strong>Order Total:</strong> $${amountTotal}</p>
            <h3>Your Items:</h3>
            <ul>${itemsList}</ul>
            ${rushProcessing ? "<p>Rush Processing: Your order will be prioritized!</p>" : ""}
            <hr />
            <p>Questions? Reply to this email and we'll help you out.</p>
            <p>— The Crown & Canvas Team</p>
          `,
        }),
      });
    } catch (emailErr) {
      console.error("Failed to send notification email:", emailErr);
      // Don't fail the webhook — order is still processed
    }
  }
}
