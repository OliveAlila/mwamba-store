# Hostinger deployment and backend verification

## Recommended deployment shape

For customer accounts and checkout, serve the Vite build and Express API from the same HTTPS origin. In production, Express serves the `dist/` folder when `NODE_ENV=production`; session cookies and auth/payment same-origin checks are designed for this arrangement.

If the frontend is hosted on a different origin, the public product catalogue can use `VITE_API_BASE_URL` and `CORS_ALLOWED_ORIGINS`. Account and payment routes still enforce same-origin requests, so separate-origin auth/checkout is not yet a complete supported deployment.

## 1. Configure Hostinger Node.js

In hPanel, open the Node.js application for the domain/subdomain that should run Mwamba Store. Use the repository root as the application root, Node.js 20 or newer, and `server.js` as the startup file if hPanel asks for one. The package start script is `npm start`.

From the repository root, install dependencies and build the frontend:

```bash
npm install
npm run build
```

Set these values in Hostinger's private Node.js environment settings:

- `NODE_ENV=production`
- `DB_HOST`: exact MySQL host shown in hPanel
- `DB_PORT=3306` unless hPanel specifies otherwise
- `DB_NAME`: exact database name shown in hPanel
- `DB_USER`: exact database username shown in hPanel
- `DB_PASSWORD`: database user's password
- `JWT_SECRET`: random secret of at least 32 characters
- `STORE_CURRENCY=KES`

Do not guess the DB host/name. Copy the values from hPanel. The app uses Hostinger's `PORT` if supplied.

For a separate frontend origin, set `CORS_ALLOWED_ORIGINS` to the exact origin (scheme + hostname, no path or trailing slash). Multiple origins may be comma-separated. Do not use `*`. Set `VITE_API_BASE_URL` to the backend origin in the frontend build environment before running `npm run build`. Leave it blank when frontend and API share an origin. Restart/redeploy after changing environment values.

## 2. Import the database schema

1. Open phpMyAdmin from hPanel and select the intended Mwamba Store database.
2. Import `database/schema.sql` from this repository.
3. Confirm the import completed without errors.

The schema seeds categories but does not create demo products. An empty product array can mean the API works but no active products have been added yet.

## 3. Verify the backend

Use the actual deployed HTTPS origin in place of `https://YOUR-DEPLOYED-ORIGIN`.

1. Visit `https://YOUR-DEPLOYED-ORIGIN/api/health`. Expected when configuration is correct:

   ```json
   {"status":"ok","service":"mwamba-store-api","database":"connected"}
   ```

2. Visit `/api/categories` and `/api/products` on that same origin. Both should return JSON arrays named `categories` and `products`.
3. If the frontend is separate, rebuild it after setting `VITE_API_BASE_URL` and confirm its exact origin is in `CORS_ALLOWED_ORIGINS`.
4. If health returns 503, inspect the Node.js application logs in hPanel. The endpoint intentionally does not expose private database error details.

## 4. Administrator setup and launch limits

Run `npm run create-admin` only in a private environment with `ADMIN_NAME`, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` (14–72 characters) set, targeting the same database. Remove `ADMIN_PASSWORD` afterward. Public registration creates customer accounts only.

The storefront product grid now reads from `GET /api/products`. However, cart state is still in browser memory; the account drawer, checkout flow, orders, and admin dashboard are not yet integrated end-to-end. The admin dashboard still displays demo figures. Paystack routes exist, but checkout and a payment-return page are not wired. Do not accept live payments until the full payment/order flow, webhooks, failure handling, and test transactions have been implemented and verified.

Never commit `.env`, database passwords, JWT secrets, or Paystack secret keys. Store them only in private environment settings.
