import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseServer } from "../../../lib/supabase";

const stripeSecret = process.env.STRIPE_SECRET_KEY ?? "";
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" }) : null;

export async function POST(request: Request) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured." }, { status: 500 });
  }

  const body = await request.text();
  const signature = headers().get("stripe-signature") ?? "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const supabase = supabaseServer();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;
    const businessId = session.metadata?.business_id;

    if (bookingId) {
      await supabase
        .from("bookings")
        .update({
          status: "confirmed",
          paid_cents: session.amount_total ?? 0
        })
        .eq("id", bookingId);
    }

    if (session.mode === "subscription" && businessId) {
      await supabase.from("subscriptions").upsert({
        business_id: businessId,
        stripe_subscription_id: session.subscription as string,
        plan: "pro",
        status: "active"
      });
    }
  }

  if (event.type === "invoice.payment_failed") {
    const subscription = event.data.object as Stripe.Invoice;
    const businessId = subscription.metadata?.business_id;

    if (businessId) {
      await supabase
        .from("subscriptions")
        .update({ status: "past_due" })
        .eq("business_id", businessId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const businessId = subscription.metadata?.business_id;

    if (businessId) {
      await supabase
        .from("subscriptions")
        .update({ plan: "free", status: "cancelled" })
        .eq("business_id", businessId);
    }
  }

  return NextResponse.json({ received: true });
}
