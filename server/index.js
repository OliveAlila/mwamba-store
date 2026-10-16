import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './auth.js';
import productRoutes from './products.js';
import categoryRoutes from './categories.js';
import paymentRoutes from './payments.js';
import adminRoutes from './admin.js';
import bootstrapAdminRoutes from './bootstrap-admin.js';
import { pingDatabase, query } from './db.js';
import { requireAdmin, requireAuth, requireSameOrigin } from './security.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const here = path.dirname(fileURLToPath(import.meta.url));

app.disable('x-powered-by');
const trustProxySetting = (() => {
  if (process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true') return 1;
  if (process.env.TRUST_PROXY === '0' || process.env.TRUST_PROXY === 'false') return false;
  if (process.env.TRUST_PROXY) {
    const num = Number(process.env.TRUST_PROXY);
    return Number.isInteger(num) ? num : process.env.TRUST_PROXY;
  }
  return process.env.NODE_ENV === 'production' ? 1 : false;
})();
app.set('trust proxy', trustProxySetting);
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      imgSrc: ["'self'", 'data:', 'https://images.unsplash.com'],
    },
  } : false,
  crossOriginEmbedderPolicy: false,
}));
app.use(express.json({ limit: '7mb' }));
app.use(cookieParser());

// Allow explicitly configured frontends to read the public catalogue API.
// Keep the origin allowlist exact; do not use wildcard origins with cookies.
const allowedOrigins = new Set(
  (process.env.CORS_ALLOWED_ORIGINS || '').split(',').map(origin => origin.trim()).filter(Boolean)
);
app.use((req, res, next) => {
  const origin = req.get('Origin');
  if (!origin) return next();

  try {
    if (new URL(origin).host === req.get('host')) return next();
  } catch {
    return res.status(403).json({ error: 'Invalid request origin.' });
  }

  if (!allowedOrigins.has(origin)) {
    return res.status(403).json({ error: 'Origin is not allowed by this API.' });
  }

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.vary('Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  return next();
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { error: 'Too many authentication attempts. Try again later.' },
});

app.use('/api', apiLimiter);
app.use('/api/bootstrap-admin', bootstrapAdminRoutes);
app.get('/api/health', async (_req, res) => {
  try {
    await pingDatabase();
    return res.json({ status: 'ok', service: 'mwamba-store-api', database: 'connected' });
  } catch (error) {
    // Keep credentials out of logs; record only the database error code and safe message
    // so production diagnostics can distinguish missing env vars, denied access, and schema issues.
    console.error('[health] database check failed', {
      code: error?.code || 'UNKNOWN_DB_ERROR',
      message: String(error?.message || 'Database health check failed').slice(0, 240),
    });
    return res.status(503).json({ status: 'degraded', service: 'mwamba-store-api', database: 'unavailable' });
  }
});
app.get('/api/deals/timer', async (_req, res) => {
  try {
    const rows = await query(
      `SELECT ends_at FROM promotions
       WHERE is_active = 1
         AND ends_at IS NOT NULL
         AND ends_at > UTC_TIMESTAMP()
         AND (starts_at IS NULL OR starts_at <= UTC_TIMESTAMP())
       ORDER BY ends_at ASC LIMIT 1`
    );
    return res.json({ ends_at: rows[0]?.ends_at || null });
  } catch (error) {
    console.error('[deals/timer] lookup failed:', error?.code || error?.name || 'UNKNOWN_DATABASE_ERROR');
    return res.json({ ends_at: null });
  }
});

app.get('/api/config/public', (_req, res) => {
  res.json({
    currency: process.env.STORE_CURRENCY || 'KES',
    paymentsConfigured: Boolean(process.env.PAYSTACK_SECRET_KEY && process.env.PAYSTACK_CALLBACK_URL),
  });
});

app.use('/api/auth', requireSameOrigin, authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments', requireSameOrigin, paymentRoutes);
app.use('/api/admin', requireAuth, requireAdmin, adminRoutes);

app.get('/api/admin/summary', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const { query } = await import('./db.js');
    const [revenue, orders, products, customers, lowStock] = await Promise.all([
      query("SELECT COALESCE(SUM(total), 0) AS value FROM orders WHERE payment_status = 'paid' AND created_at >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')"),
      query('SELECT COUNT(*) AS value FROM orders'),
      query("SELECT COUNT(*) AS value FROM products WHERE status != 'archived'"),
      query("SELECT COUNT(*) AS value FROM users WHERE role = 'customer' AND status = 'active'"),
      query("SELECT COUNT(*) AS value FROM products WHERE status = 'active' AND stock_quantity <= 5"),
    ]);
    return res.json({
      revenue: Number(revenue[0].value),
      orders: Number(orders[0].value),
      products: Number(products[0].value),
      customers: Number(customers[0].value),
      low_stock: Number(lowStock[0].value),
    });
  } catch (error) {
    return next(error);
  }
});

if (process.env.NODE_ENV === 'production') {
  const dist = path.resolve(here, '../dist');
  app.use('/uploads', express.static(path.resolve(here, '../uploads'), { maxAge: '7d', immutable: true }));
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((error, req, res, _next) => {
  // Log safe diagnostics in production so failed sign-in/API requests can be traced
  // without exposing SQL parameters, passwords, cookies, or secret environment values.
  console.error('[api-error]', {
    method: req.method,
    path: req.path,
    status: error.status || 500,
    code: error.code || error.name || 'UNKNOWN_ERROR',
    message: String(error.message || 'Unexpected server error').slice(0, 240),
  });
  if (error.code === 'DB_CONFIG_MISSING') return res.status(503).json({ error: 'Database is not configured yet.' });
  if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_FIELD_ERROR') return res.status(503).json({ error: 'Database schema is not installed or is out of date.' });
  if (error.code === 'ER_ACCESS_DENIED_ERROR' || error.code === 'ECONNREFUSED') return res.status(503).json({ error: 'Database connection failed. Check hosting database settings.' });
  return res.status(error.status || 500).json({ error: error.status ? error.message : 'An unexpected server error occurred.' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Mwamba Store API listening on port ${port}`);
});