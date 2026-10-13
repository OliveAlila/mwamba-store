# Mwamba Store

A responsive general-goods marketplace starter for Kenya, built with React, Vite and Express. The visual direction uses warm charcoal, cream and muted gold, with a mobile-first storefront and a starter admin workspace.

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

The Vite development server prints the local URL. To build the frontend:

```bash
npm run build
```

The Express health endpoint is available after `npm start` at `/api/health`. In production, set `NODE_ENV=production` and serve the built frontend through Express.

## Current starter features

- Responsive storefront and category navigation
- Product cards, search, sorting, wishlist and cart quantity controls
- Checkout UI scaffold with delivery details
- Admin workspace navigation and dashboard sample metrics
- Express API health/config endpoints
- Environment-variable template and Git ignore rules

## Important implementation status

The current catalogue and dashboard metrics are demonstration data in the frontend. Authentication, persistent products/inventory, real order history, delivery pricing, and admin authorization still need a database-backed implementation before launch. Checkout does **not** charge a payment yet.

## Planned production integrations

1. PostgreSQL/Supabase or another selected database for users, products, categories, inventory, orders and discounts.
2. Server-side authentication with role-based admin access.
3. Paystack transaction initialization and server-side verification. Keep `PAYSTACK_SECRET_KEY` on the server only; never expose it in browser code.
4. Product image uploads via the selected media provider.
5. Order lifecycle, customer order history, stock validation, and transactional emails.
6. Deployment configuration for Hostinger Business hosting, including Node.js application startup and environment variables.

## Environment variables

See `.env.example`. Do not commit real credentials or payment keys.

## Repository

https://github.com/OliveAlila/mwamba-store