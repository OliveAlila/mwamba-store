# Hostinger deployment checklist

This repository contains a Vite frontend and an Express API. For the current cookie-based authentication, deploy them behind the **same public origin** (for example, the same domain and HTTPS scheme). The frontend calls relative `/api/...` URLs, and the API checks the request Origin for sign-in and payment initialization. A frontend on one domain and API on another will not work without a deliberate CORS/cookie architecture change.

## 1. Confirm the Node.js application

In hPanel, open the Node.js application for the domain and confirm that it points to this repository/project root (the folder containing `package.json`). Use a supported Node.js 20+ runtime. Install dependencies with `npm install`, build the frontend with `npm run build`, and start the app with `npm start` (or use `server.js` as the startup file if hPanel asks for a file rather than a command). The Express app binds to `0.0.0.0` and uses Hostinger's supplied `PORT` when available.

Do not deploy only the generated `dist` folder if you expect the API to run. In production the Express process serves `dist` and the `/api` endpoints together.

## 2. Configure private environment variables

In the Node.js application's **server-side environment variables** in hPanel, set these values. Use the exact database host, database name, and database username displayed in Hostinger; do not assume the host is `localhost`.

- `NODE_ENV=production`
- `STORE_CURRENCY=KES`
- `DB_HOST=<database host shown by Hostinger>`
- `DB_PORT=3306` (change only if hPanel specifies another port)
- `DB_NAME=<full database name from hPanel>`
- `DB_USER=<database username from hPanel>`
- `DB_PASSWORD=<database user's password>`
- `JWT_SECRET=<a unique random secret of at least 32 characters>`

Generate a secret locally rather than in chat. For example, on PowerShell: `[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))`. Paste the generated value into the private Hostinger environment settings. Never put production secrets in GitHub, frontend `VITE_*` variables, screenshots, or client-side code.

Save the environment settings and **restart/redeploy the Node.js application**. Environment changes generally do not affect an already-running process until it restarts.

## 3. Install the schema

1. Open phpMyAdmin from hPanel and select the intended Mwamba Store database.
2. Back up the database first if it contains existing data.
3. Import this repository's `database/schema.sql`.
4. Confirm that tables including `users`, `categories`, `products`, `orders`, and `order_items` exist.

The schema seeds category rows, not a product catalogue. Add real products through an authenticated admin workflow or an approved database import before expecting product cards to appear.

## 4. Check the API before testing the storefront

Open `https://YOUR-DOMAIN/api/health` after restart.

- JSON with `status: "ok"` and `database: "connected"`: the API can reach MySQL.
- HTTP 503 with database unavailable: inspect the Node.js application logs and recheck `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, and schema import.
- A hosting 404, frontend HTML, or the storefront's normal page instead of health JSON: the domain is likely not routed to the running Node.js app, the app did not start, or another frontend-only deployment is serving the domain.
- A server startup error mentioning `JWT_SECRET`: set a random secret of at least 32 characters and restart.

Then open `https://YOUR-DOMAIN/api/categories` and `https://YOUR-DOMAIN/api/products`. Both should return JSON. An empty `products` array is valid if you have not created any products yet.

## 5. First administrator

Create the first admin only from a trusted terminal where the app's private DB environment variables are available. Set `ADMIN_NAME`, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` (14+ characters), then run `npm run create-admin`. Remove the temporary admin password from the shell/environment afterward. Do not expose the admin bootstrap command as a public endpoint.

The storefront now calls the backend for products and account sign-in/registration. The admin overview uses the live summary endpoint and is role-gated. Order-list, full product-management UI, customer management, and order-history UI are not yet complete; do not treat those screens as implemented.

## 6. Payments — keep disabled until configured and tested

Do not take live payments until all of the following are true:

1. The site uses HTTPS and the database/API health checks pass.
2. `PAYSTACK_SECRET_KEY` is set only in the Node.js server environment (use a Paystack test secret first).
3. `PAYSTACK_CALLBACK_URL` is set to a real public HTTPS return page on the same site.
4. You have verified a test payment end to end and implemented/validated the payment-return UX and provider webhook/reconciliation process.

The current frontend starts Paystack initialization, but the dedicated return page and webhook/reconciliation flow still need implementation and testing. Do not use a live Paystack secret or advertise checkout as production-ready until then.

## 7. If the frontend is hosted separately

The current app deliberately uses same-origin relative API requests and an Origin check. If your current deployed frontend is on a different domain or is hosted as static-only output, it will not reach this API correctly just by setting database credentials. Prefer configuring Hostinger to serve the frontend and API on one origin. A separate API-domain deployment requires a deliberate change to CORS, cookie `SameSite`/secure settings, CSRF protections, and allowed origins; do not simply remove the Origin check.
