import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT || 3000);
const here = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mwamba-store-api', timestamp: new Date().toISOString() });
});

app.get('/api/config/public', (_req, res) => {
  res.json({
    currency: process.env.STORE_CURRENCY || 'KES',
    paymentsConfigured: Boolean(process.env.PAYSTACK_SECRET_KEY),
    environment: process.env.NODE_ENV || 'development',
  });
});

if (process.env.NODE_ENV === 'production') {
  const dist = path.resolve(here, '../dist');
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Mwamba Store server listening on port ${port}`);
});