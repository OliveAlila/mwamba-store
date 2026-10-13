import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './auth.js';
import productRoutes from './products.js';
import paymentRoutes from './payments.js';
import { pingDatabase } from './db.js';
import { requireAdmin, requireAuth, requireSameOrigin } from './security.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const here = path.dirname(fileURLToPath(import.meta.url));

app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === '1' ? 1 : false);
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Try again later.' },
});

app.use('/api', apiLimiter);
app.get('/api/health', async (_req, res) => {
  try {
    await pingDatabase();
    return res.json({ status: 'ok', service: 'mwamba-store-api', database: 'connected' });
  } catch {
    return res.status(503).json({ status: 'degraded', service: 'mwamba-store-api', database: 'unavailable' });
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
app.use('/api/payments', requireSameOrigin, paymentRoutes);

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
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((error, _req, res, _next) => {
  if (process.env.NODE_ENV !== 'production') console.error(error);
  if (error.code === 'DB_CONFIG_MISSING') return res.status(503).json({ error: 'Database is not configured yet.' });
  if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_FIELD_ERROR') return res.status(503).json({ error: 'Database schema is not installed or is out of date.' });
  if (error.code === 'ER_ACCESS_DENIED_ERROR' || error.code === 'ECONNREFUSED') return res.status(503).json({ error: 'Database connection failed. Check hosting database settings.' });
  return res.status(error.status || 500).json({ error: error.status ? error.message : 'An unexpected server error occurred.' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Mwamba Store API listening on port ${port}`);
});