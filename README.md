# Booklingio

Booklingio is a single-page booking SaaS for solo service professionals. It combines client booking links, deposits via Stripe Checkout, and automatic payouts with Stripe Connect Express.

## File tree

```
.
├── app.js
├── index.html
├── netlify.toml
├── schema.sql
├── server.js
└── style.css
```

## Frontend

- **index.html + style.css + app.js** implement the SPA with hash routing.
- Routes: `#/login`, `#/onboarding`, `#/dashboard`, `#/calendar`, `#/services`, `#/availability`, `#/clients`, `#/payments`, `#/settings`, public `#/book/:slug`, and `#/confirm`.

## Backend (Node/Express)

`server.js` provides the API surface for public booking, owner management, Stripe Checkout, and Stripe Connect.

### Environment variables

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
APP_URL=https://booklingio.app
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Install & run

```
npm install express stripe dotenv cors @supabase/supabase-js
node server.js
```

## Stripe Connect flow

1. `POST /api/stripe/connect/create-account` creates an Express account and stores it on the business.
2. `POST /api/stripe/connect/create-account-link` returns an onboarding URL.
3. `POST /api/stripe/connect/create-login-link` opens Stripe Express for payout management.
4. Webhooks update booking status, payment records, and payout status.

## Supabase

Run `schema.sql` inside Supabase SQL editor to create tables and policies.

## How to test

- Open `index.html` on a static server (`python -m http.server`).
- Navigate through routes using hash URLs.
- Use the Payments tab to trigger the Stripe Connect CTA.
- Call `/api/stripe/connect/status` with a test account id to verify status response.
- Use Stripe CLI to send webhook events to `/api/stripe/webhook`.

## Deployment

- Frontend: deploy `index.html`, `style.css`, `app.js` to Netlify/Vercel. `netlify.toml` already includes SPA redirects.
- Backend: deploy `server.js` separately (Render/Fly/Heroku). Set environment variables in the host.
