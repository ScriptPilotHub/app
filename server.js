import express from "express";
import dotenv from "dotenv";
import Stripe from "stripe";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16"
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(cors({ origin: process.env.APP_URL, credentials: true }));
app.use(express.json());

app.get("/api/public/business/:slug", async (req, res) => {
  const { slug } = req.params;
  const { data, error } = await supabase
    .from("businesses")
    .select("id,name,slug,timezone,currency")
    .eq("slug", slug)
    .single();

  if (error) {
    return res.status(404).json({ error: "Business not found" });
  }

  return res.json(data);
});

app.get("/api/public/slots", async (req, res) => {
  const { business_id, service_id, date } = req.query;
  if (!business_id || !service_id || !date) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  return res.json({ slots: ["10:00", "10:30", "11:00", "13:00"] });
});

app.post("/api/public/bookings", async (req, res) => {
  const { business_id, service_id, client, start_at, end_at } = req.body;
  if (!business_id || !service_id || !client || !start_at || !end_at) {
    return res.status(400).json({ error: "Missing booking data" });
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      business_id,
      service_id,
      client_id: client.id,
      start_at,
      end_at,
      status: "pending"
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: "Unable to create booking" });
  }

  return res.json({ booking: data });
});

app.post("/api/stripe/checkout/create-session", async (req, res) => {
  const { business_id, service_id, amount_cents, currency, success_url, cancel_url } = req.body;

  const { data: business } = await supabase
    .from("businesses")
    .select("stripe_account_id,connect_status")
    .eq("id", business_id)
    .single();

  if (!business || !business.stripe_account_id) {
    return res.status(400).json({ error: "Stripe account not connected" });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency,
          unit_amount: amount_cents,
          product_data: { name: "Service booking" }
        },
        quantity: 1
      }
    ],
    success_url,
    cancel_url,
    payment_intent_data: {
      application_fee_amount: Math.round(amount_cents * 0.1),
      transfer_data: { destination: business.stripe_account_id }
    }
  });

  return res.json({ id: session.id, url: session.url });
});

app.get("/api/owner/dashboard", async (req, res) => {
  return res.json({
    gross_revenue: 324000,
    deposits_collected: 84000,
    outstanding: 42000,
    avg_booking_value: 16200,
    no_show_rate: 0.02,
    payouts: []
  });
});

app.get("/api/owner/bookings", async (req, res) => {
  const { data } = await supabase.from("bookings").select("*");
  return res.json({ bookings: data ?? [] });
});

app.patch("/api/owner/bookings/:id", async (req, res) => {
  const { id } = req.params;
  const { status, start_at, end_at } = req.body;
  const { data, error } = await supabase
    .from("bookings")
    .update({ status, start_at, end_at })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: "Unable to update booking" });
  }

  return res.json({ booking: data });
});

app.get("/api/owner/services", async (req, res) => {
  const { data } = await supabase.from("services").select("*");
  return res.json({ services: data ?? [] });
});

app.post("/api/owner/services", async (req, res) => {
  const { data, error } = await supabase.from("services").insert(req.body).select().single();
  if (error) {
    return res.status(400).json({ error: "Unable to create service" });
  }
  return res.json({ service: data });
});

app.patch("/api/owner/services/:id", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("services")
    .update(req.body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: "Unable to update service" });
  }

  return res.json({ service: data });
});

app.delete("/api/owner/services/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) {
    return res.status(400).json({ error: "Unable to delete service" });
  }
  return res.status(204).send();
});

app.get("/api/owner/availability", async (req, res) => {
  const { data } = await supabase.from("availability_rules").select("*");
  return res.json({ rules: data ?? [] });
});

app.post("/api/owner/availability", async (req, res) => {
  const { data, error } = await supabase
    .from("availability_rules")
    .insert(req.body)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: "Unable to save availability" });
  }

  return res.json({ rule: data });
});

app.post("/api/stripe/connect/create-account", async (req, res) => {
  const { business_id, email } = req.body;
  const account = await stripe.accounts.create({
    type: "express",
    email
  });

  await supabase
    .from("businesses")
    .update({ stripe_account_id: account.id, connect_status: "Onboarding incomplete" })
    .eq("id", business_id);

  return res.json({ account_id: account.id });
});

app.post("/api/stripe/connect/create-account-link", async (req, res) => {
  const { account_id } = req.body;
  const accountLink = await stripe.accountLinks.create({
    account: account_id,
    refresh_url: `${process.env.APP_URL}/#/payments?refresh=1`,
    return_url: `${process.env.APP_URL}/#/payments?return=1`,
    type: "account_onboarding"
  });

  return res.json({ url: accountLink.url });
});

app.post("/api/stripe/connect/create-login-link", async (req, res) => {
  const { account_id } = req.body;
  const loginLink = await stripe.accounts.createLoginLink(account_id);
  return res.json({ url: loginLink.url });
});

app.get("/api/stripe/connect/status", async (req, res) => {
  const { account_id } = req.query;
  if (!account_id) {
    return res.status(400).json({ error: "Missing account_id" });
  }

  const account = await stripe.accounts.retrieve(account_id);
  return res.json({
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
    requirements: account.requirements
  });
});

app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    // Update booking + payment records
  }

  if (event.type === "account.updated") {
    // Update connect status
  }

  if (event.type.startsWith("payout")) {
    // Sync payout status
  }

  return res.json({ received: true });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Booklingio API running on ${port}`);
});
