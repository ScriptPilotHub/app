# TempoBook

A modern booking + deposit scheduling app for solo service professionals (barbers, stylists, nail techs, tattoo artists, cleaners). Built with Next.js App Router, Supabase, and Stripe.

## Features
- Public booking pages per business (`/book/[business_slug]`)
- Services, availability, and booking management for owners
- Stripe Checkout for deposits
- Stripe subscriptions for the Pro plan
- Webhook automation to confirm bookings + manage subscription status

## Tech stack
- **Frontend:** Next.js (App Router, TypeScript)
- **Backend:** Supabase (Auth, Postgres, RLS)
- **Payments:** Stripe (Checkout + Subscriptions + Webhooks)

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a Supabase project and apply the schema:
   ```bash
   supabase db reset
   # or copy sql/schema.sql into Supabase SQL editor
   ```
3. Configure environment variables (see below).
4. Run the dev server:
   ```bash
   npm run dev
   ```

## Environment variables

Create a `.env.local` file with:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
```

## Stripe setup

### Deposits
Deposits are created when a service has `requires_deposit = true`. When a booking is created, a Stripe Checkout session is created with booking metadata. The webhook finalizes the booking on `checkout.session.completed`.

### Subscriptions
The Pro plan is sold via Stripe subscriptions. Use `/api/subscription` to create a checkout session.

### Local webhook testing
Use the Stripe CLI:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Then trigger events:

```bash
stripe trigger checkout.session.completed
stripe trigger invoice.payment_failed
stripe trigger customer.subscription.deleted
```

## Project structure
- `app/` — Next.js App Router pages and API routes
- `app/lib` — Supabase + booking logic
- `sql/schema.sql` — Database schema + RLS policies

## Notes
- Business owners authenticate via Supabase (email/password).
- Customers do not need accounts to book.
- Booking availability is calculated from weekly availability + existing bookings.
- `businesses.slug` is used for public booking URLs (`/book/[business_slug]`).
