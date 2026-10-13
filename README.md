# Mwamba Store

Responsive general-goods marketplace starter for Kenya, built with React, Vite, Express and Hostinger-compatible MySQL.

## Run locally

Requirements: Node.js 20+ and MySQL 8.0+ (or a compatible Hostinger MySQL server).

```bash
npm install
cp .env.example .env
npm run dev
```

Set your private database credentials and a random `JWT_SECRET` in `.env`. Run the schema in `database/schema.sql` against the intended database before starting the API:

```bash
npm start
```

Vite proxies `/api` requests to Express on `localhost:3000`. The `/api/health` endpoint checks the database connection.

## Hostinger MySQL setup

1. In hPanel, create a MySQL database and a dedicated database user with a strong password.
2. Grant that user privileges only on the Mwamba Store database.
3. Open phpMyAdmin from hPanel, select the new database, and import `database/schema.sql`.
4. In the Node.js application environment settings, add `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, and `NODE_ENV=production`.
5. Never commit the real environment values or put database credentials in browser code.

## Create the first administrator

Set these variables temporarily in the private environment where the command will run: `ADMIN_NAME`, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` of at least 14 characters. Then run:

```bash
npm run create-admin
```

The script creates a bcrypt-hashed administrator and refuses to silently promote an existing customer. Remove `ADMIN_PASSWORD` from the environment after use. Do not expose a public registration option for admin roles.

## Backend implemented in this starter

- Pooled MySQL connection using environment variables
- MySQL schema for users, categories, products, inventory movements, orders, order items, promotions and payment audit events
- Customer registration and login with bcrypt password hashing, HTTP-only session cookie, JWT expiry and logout/current-user endpoints
- Role middleware protecting admin-only APIs
- Public product catalogue and protected admin product list/create/update endpoints
- Admin summary API for revenue, orders, products, customers and low stock
- Server-side Paystack transaction initialization and verification, with amount/currency/reference checks and transactional stock decrement
- Rate limits for API and authentication routes, security headers, same-origin checks for state-changing authentication/payment requests

## API routes

- `POST /api/auth/register` — customer account creation only
- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/products?search=&category=`
- `GET /api/products/admin/all`, `POST /api/products`, `PATCH /api/products/:id` — admin only
- `GET /api/admin/summary` — admin only
- `POST /api/payments/initialize`, `GET /api/payments/verify/:reference` — signed-in users only

## Paystack configuration and safety

Use Paystack test credentials during development. Configure `PAYSTACK_SECRET_KEY` only in the server environment and set `PAYSTACK_CALLBACK_URL` to a public HTTPS return URL. The server calculates prices from database product records; it does not trust client-submitted prices. The verify endpoint checks the provider's reference, KES currency, exact amount and success status before marking an order paid and decrementing stock within a transaction.

**Do not launch payments yet:** the checkout screen and return/callback page still need to be wired to these API endpoints and exercised with Paystack test transactions. Production launch also requires a verified webhook handler, HTTPS, tested database backups, monitoring, and a review of delivery, refunds and order lifecycle policies. Configure the callback URL to a real page on your deployed domain.

## Current frontend status

The responsive storefront, cart, wishlist and admin workspace screens are currently a prototype using in-memory demonstration catalogue and sample dashboard metrics. Backend APIs and schema are committed, but the frontend is not yet fully connected to the live APIs. Treat admin metrics shown in the prototype as examples, not real business data.

## Repository

https://github.com/OliveAlila/mwamba-store