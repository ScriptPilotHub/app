import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseServer } from "../../lib/supabase";

const stripeSecret = process.env.STRIPE_SECRET_KEY ?? "";
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" }) : null;

export async function POST(request: Request) {
  const formData = await request.formData();
  const businessId = String(formData.get("business_id") ?? "");
  const serviceId = String(formData.get("service_id") ?? "");
  const slotValue = String(formData.get("slot") ?? "");
  const customerName = String(formData.get("customer_name") ?? "");
  const customerEmail = String(formData.get("customer_email") ?? "");

  const [startTime, endTime] = slotValue.split("|");

  if (!businessId || !serviceId || !startTime || !endTime) {
    return NextResponse.json({ error: "Missing booking details." }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data: service } = await supabase
    .from("services")
    .select("id,name,requires_deposit,deposit_cents,price_cents,business_id")
    .eq("id", serviceId)
    .single();

  const { data: business } = await supabase
    .from("businesses")
    .select("id,slug,currency")
    .eq("id", businessId)
    .single();

  if (!service || !business || service.business_id !== businessId) {
    return NextResponse.json({ error: "Service not found." }, { status: 404 });
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan,status")
    .eq("business_id", businessId)
    .single();

  if (service.requires_deposit && subscription?.plan !== "pro") {
    return NextResponse.json({ error: "Upgrade to Pro to accept deposits." }, { status: 402 });
  }

  const { data: conflict } = await supabase
    .from("bookings")
    .select("id")
    .eq("business_id", businessId)
    .lt("start_time", endTime)
    .gt("end_time", startTime)
    .in("status", ["pending", "confirmed", "completed"])
    .maybeSingle();

  if (conflict) {
    return NextResponse.json({ error: "Time slot already booked." }, { status: 409 });
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      business_id: businessId,
      service_id: serviceId,
      customer_name: customerName,
      customer_email: customerEmail,
      start_time: startTime,
      end_time: endTime,
      status: service.requires_deposit ? "pending" : "confirmed",
      paid_cents: service.requires_deposit ? 0 : service.price_cents
    })
    .select("id")
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Unable to create booking." }, { status: 500 });
  }

  if (service.requires_deposit) {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured." }, { status: 500 });
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
        business_id: businessId
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${business.slug}/confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${business.slug}?service=${serviceId}`
    });

    await supabase
      .from("bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", booking.id);

    return NextResponse.redirect(session.url ?? "/");
  }

  return NextResponse.redirect(`/book/${business.slug}/confirm`);
}
