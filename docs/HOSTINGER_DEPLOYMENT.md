# Hostinger deployment and backend verification

## Recommended deployment shape

For customer accounts and checkout, serve the Vite build and Express API from the same HTTPS origin. In production, Express serves the `dist/` folder; the package start script is `npm start`.

## 1. Configure Hostinger Node.js

1. In hPanel, open the Node.js application for the domain/subdomain running Mwamba Store.
2. Use the repository root as the application root, Node.js 20 or newer, and `server.js` as the startup file if hPanel asks for one. The repository's current package start script is `npm start` (which starts `server/index.js`).
3. Configure these private environment values in hPanel:
   - `NODE_ENV=production`
   - `DB_HOST`: exact MySQL host shown in hPanel
   - `DB_PORT=3306` unless hPanel specifies otherwise
   - `DB_NAME`: exact database name shown in hPanel
   - `DB_USER`: exact database username shown in hPanel
   - `DB_PASSWORD`: database user's password
   - `JWT_SECRET`: random secret of at least 32 characters
   - `STORE_CURRENCY=KES`
4. Set `PAYSTACK_SECRET_KEY` and `PAYSTACK_CALLBACK_URL` only if you are testing Paystack; use test credentials first. Never expose the secret key in browser code or commit it.
5. Redeploy/restart the Node.js application after changing environment values.

Do not guess the DB host/name. Copy the exact values from hPanel. The app uses Hostinger's `PORT` if supplied.

## 2. Install the database schema

1. Open phpMyAdmin from hPanel and select the correct Mwamba Store database.
2. Before making changes to an existing database, export a backup using phpMyAdmin's **Export** tab.
3. If this is a new/empty database, import `database/schema.sql` from this repository. It creates the tables, seeds categories, and includes eight demo fashion products.
4. If the tables already exist but the storefront has no products, import **only** `database/demo-products.sql`. This standalone seed adds the categories if missing and inserts eight demo fashion products with sample prices, stock, SKUs, and Unsplash image URLs. It is safe to import more than once; it uses `INSERT IGNORE` and does not delete existing products.
5. After import, the results panel at the bottom of the SQL file should list the eight demo products. You can also run:
   ```sql
   SELECT id, name, sku, price, stock_quantity, status
   FROM products
   WHERE slug LIKE '%tee%' OR slug LIKE '%sneakers%' OR slug LIKE '%handbag%'
      OR slug LIKE '%summer-dress%' OR slug LIKE '%denim-jacket%'
      OR slug LIKE '%sunglasses%' OR slug LIKE '%backpack%' OR slug LIKE '%wristwatch%';
   ```
   If you see the products in phpMyAdmin but not the site, check `/api/products` on the deployed domain and confirm the frontend and API are using the same database.

Demo products are placeholders for testing the storefront, not confirmed inventory. Replace their names, images, prices, and stock with your actual catalogue before accepting orders.

## 3. Verify the backend and storefront

Use your deployed HTTPS origin in place of `https://YOUR-DOMAIN`.

1. Visit `https://YOUR-DOMAIN/api/health`. Expected response when configured:
   ```json
   { "status": "ok", "service": "mwamba-store-api", "database": "connected" }
   ```
2. Visit `https://YOUR-DOMAIN/api/categories` and `https://YOUR-DOMAIN/api/products`. Both should return JSON with `categories` and `products` arrays.
3. If `/api/products` returns an empty array, import `database/demo-products.sql` into the exact database configured for the Node application.
4. If health returns 503, inspect the Node.js application logs in hPanel. The health endpoint intentionally does not expose private database error details.
5. After deployment, open the site in a private/incognito tab or hard-refresh to avoid a cached frontend bundle.

## 4. Create administrator access (one-time setup)

Public registration intentionally creates **customer** accounts only. Creating a customer account does not grant access to `/admin`. I cannot create the live admin account directly because I do not have your private Hostinger database credentials, and those credentials should not be shared in chat.

Use Hostinger's SSH/terminal access to run the repository's one-time setup script:

1. In hPanel, enable/open **SSH Access** (or the terminal provided for your hosting plan) and connect to the account that owns the Node application.
2. Change directory to the deployed repository/application root—the folder containing `package.json`. If you are unsure of the path, use `pwd` and `ls` to locate it.
3. Confirm the script is present:
   ```bash
   ls scripts/create-admin.js
   ```
4. Make sure the command-line environment can access the same `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` as the live Node application. The script loads a root `.env` file if present and also reads environment variables. If hPanel's application variables are not inherited by SSH, use a private, permission-restricted `.env` file temporarily or configure the variables in that shell. Never paste credentials into chat, commit them, or print them in logs.
5. Run:
   ```bash
   npm install
   npm run create-admin
   ```
   The current script prompts for administrator name and email and prompts for the password without displaying it. Use an email address that is **not already registered as a customer** and a unique password of 14–72 characters. It hashes the password with bcrypt and refuses to promote an existing customer account.
6. If the script says the database configuration is missing, stop and fix the private DB environment before retrying. Do not attempt to insert a plaintext password into MySQL.
7. If you created a temporary `.env` solely for this task, delete it securely when finished; do not remove any file that the live application needs. If you set temporary `ADMIN_NAME`, `ADMIN_EMAIL`, or `ADMIN_PASSWORD` variables, unset them afterward.
8. Open `https://YOUR-DOMAIN/login`, sign in with the new administrator credentials, and then open `https://YOUR-DOMAIN/admin`. The admin workspace should show Overview and tabs for Products, Categories, Orders, Customers, Promotions and Settings.

If your hosting plan does not provide SSH/terminal access, ask Hostinger support how to run a one-time Node.js script in the application's environment. Do not create a public admin-registration endpoint or share your database password.

## 5. Current implementation limits

- The storefront reads live products from MySQL. Cart and wishlist contents remain in browser memory and are lost on refresh.
- Customer order history, refunds, applying promotion discounts at checkout, and automated Paystack webhooks are not implemented.
- Paystack routes exist, but end-to-end checkout must be tested with test credentials before any live payments. Do not advertise payments as production-ready until success/failure paths, webhook verification, inventory/order handling and refunds have been reviewed.
- Demo product image URLs are hosted by Unsplash; if an image does not load, replace its URL with a reliable image you have permission to use.

Never commit `.env`, database passwords, JWT secrets, or Paystack secret keys.
