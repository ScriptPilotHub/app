import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseServer } from "../../lib/supabase";

const stripeSecret = process.env.STRIPE_SECRET_KEY ?? "";
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" }) : null;

export async function POST(request: Request) {
  const body = await request.json();
  const businessId = String(body.business_id ?? "");

  if (!businessId) {
    return NextResponse.json({ error: "Missing business." }, { status: 400 });
  }

  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured." }, { status: 500 });
  }

  const supabase = supabaseServer();
  const { data: business } = await supabase
    .from("businesses")
    .select("id,slug,business_name")
    .eq("id", businessId)
    .single();

  if (!business) {
    return NextResponse.json({ error: "Business not found." }, { status: 404 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: process.env.STRIPE_PRO_PRICE_ID ?? "",
        quantity: 1
      }
    ],
    subscription_data: {
      metadata: {
        business_id: business.id,
        plan: "pro"
      }
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=cancelled`,
    metadata: {
      business_id: business.id,
      plan: "pro"
    }
  });

  return NextResponse.json({ url: session.url });
}
