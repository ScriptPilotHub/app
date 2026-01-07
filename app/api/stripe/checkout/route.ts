import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseServer } from "../../../lib/supabase";

const stripeSecret = process.env.STRIPE_SECRET_KEY ?? "";
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" }) : null;

export async function POST(request: Request) {
  const body = await request.json();
  const bookingId = String(body.booking_id ?? "");

  if (!bookingId) {
    return NextResponse.json({ error: "Missing booking." }, { status: 400 });
  }

  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured." }, { status: 500 });
  }

  const supabase = supabaseServer();
  const { data: booking } = await supabase
    .from("bookings")
    .select("id,business_id,service_id")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const { data: service } = await supabase
    .from("services")
    .select("name,deposit_cents")
    .eq("id", booking.service_id)
    .single();

  const { data: business } = await supabase
    .from("businesses")
    .select("slug,currency")
    .eq("id", booking.business_id)
    .single();

  if (!service || !business) {
    return NextResponse.json({ error: "Missing service data." }, { status: 404 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: business.currency?.toLowerCase() ?? "usd",
          unit_amount: service.deposit_cents ?? 0,
          product_data: { name: `${service.name} deposit` }
        }
      }
    ],
    metadata: {
      booking_id: booking.id,
      business_id: booking.business_id
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${business.slug}/confirm?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${business.slug}?service=${booking.service_id}`
  });

  await supabase
    .from("bookings")
    .update({ stripe_session_id: session.id })
    .eq("id", booking.id);

  return NextResponse.json({ url: session.url });
}
