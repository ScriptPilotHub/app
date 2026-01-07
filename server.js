import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is required to start the server.");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-06-20"
});

const BASE_PRICE_CENTS = 1499;
const PROCESSING_FEE_RATE = 0.029;
const PROCESSING_FEE_FLAT_CENTS = 30;

app.use(express.json());
app.use(express.static(path.join(__dirname, "client")));

function calculateProcessingFeeCents(amountCents) {
  return Math.round(amountCents * PROCESSING_FEE_RATE + PROCESSING_FEE_FLAT_CENTS);
}

app.post("/api/create-checkout-session", async (req, res) => {
  const { customerEmail } = req.body ?? {};

  try {
    const processingFeeCents = calculateProcessingFeeCents(BASE_PRICE_CENTS);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: customerEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Mini invoice & booking subscription"
            },
            recurring: {
              interval: "month"
            },
            unit_amount: BASE_PRICE_CENTS
          },
          quantity: 1
        },
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Processing fee"
            },
            unit_amount: processingFeeCents
          },
          quantity: 1
        }
      ],
      success_url: `${req.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cancel.html`
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({
      error: "Unable to create checkout session.",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.get("/api/price", (req, res) => {
  const processingFeeCents = calculateProcessingFeeCents(BASE_PRICE_CENTS);

  res.json({
    basePriceCents: BASE_PRICE_CENTS,
    processingFeeCents,
    totalCents: BASE_PRICE_CENTS + processingFeeCents
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
