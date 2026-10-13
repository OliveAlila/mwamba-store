import { Router } from 'express';
import { query, getPool } from './db.js';
import { requireAuth } from './security.js';
import crypto from 'node:crypto';

const router = Router();
const paystackBase = 'https://api.paystack.co';

function paystackSecret() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key || !key.startsWith('sk_')) {
    const error = new Error('Paystack is not configured on the server.');
    error.status = 503;
    throw error;
  }
  return key;
}

async function paystackRequest(path, options = {}) {
  const response = await fetch(`${paystackBase}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${paystackSecret()}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.status !== true) {
    const error = new Error(data.message || 'Payment provider request failed.');
    error.status = 502;
    throw error;
  }
  return data.data;
}

router.post('/initialize', requireAuth, async (req, res, next) => {
  const connection = null;
  try {
    const { items, phone, delivery_address } = req.body || {};
    if (!Array.isArray(items) || items.length < 1 || items.length > 50) return res.status(400).json({ error: 'Provide items for checkout.' });
    if (typeof phone !== 'string' || phone.trim().length < 7 || phone.trim().length > 30) return res.status(400).json({ error: 'Provide a valid phone number.' });
    if (typeof delivery_address !== 'string' || delivery_address.trim().length < 5 || delivery_address.trim().length > 500) return res.status(400).json({ error: 'Provide a delivery address.' });

    const requested = new Map();
    for (const item of items) {
      const id = Number(item?.product_id);
      const quantity = Number(item?.quantity);
      if (!Number.isSafeInteger(id) || id < 1 || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) return res.status(400).json({ error: 'One or more cart items are invalid.' });
      requested.set(id, (requested.get(id) || 0) + quantity);
    }
    const ids = [...requested.keys()];
    const placeholders = ids.map(() => '?').join(',');
    const products = await query(
      `SELECT id, name, price, stock_quantity, status FROM products WHERE id IN (${placeholders})`,
      ids
    );
    if (products.length !== ids.length) return res.status(400).json({ error: 'One or more products are unavailable.' });
    let total = 0;
    for (const product of products) {
      const quantity = requested.get(product.id);
      if (product.status !== 'active' || product.stock_quantity < quantity) return res.status(409).json({ error: `Insufficient stock for ${product.name}.` });
      total += Math.round(Number(product.price) * 100) * quantity;
    }
    if (!Number.isSafeInteger(total) || total < 100) return res.status(400).json({ error: 'Order total is invalid or below the payment provider minimum.' });

    const reference = `MW${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
    const pool = getPool();
    const result = await pool.execute(
      `INSERT INTO orders (user_id, order_number, status, payment_status, subtotal, total, currency, delivery_phone, delivery_address, payment_reference)
       VALUES (?, ?, 'pending_payment', 'pending', ?, ?, 'KES', ?, ?, ?)`,
      [req.auth.id, reference, (total / 100).toFixed(2), (total / 100).toFixed(2), phone.trim(), delivery_address.trim(), reference]
    );
    const orderId = result[0].insertId;
    for (const product of products) {
      await pool.execute(
        'INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity) VALUES (?, ?, ?, ?, ?)',
        [orderId, product.id, product.name, Number(product.price).toFixed(2), requested.get(product.id)]
      );
    }
    const emailRows = await query('SELECT email FROM users WHERE id = ? LIMIT 1', [req.auth.id]);
    const callbackUrl = process.env.PAYSTACK_CALLBACK_URL;
    if (!callbackUrl || !callbackUrl.startsWith('https://')) {
      await query("UPDATE orders SET status = 'payment_initialization_failed' WHERE id = ?", [orderId]);
      return res.status(503).json({ error: 'PAYSTACK_CALLBACK_URL must be configured as your public HTTPS checkout return URL.' });
    }
    const payment = await paystackRequest('/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify({
        email: emailRows[0].email,
        amount: String(total),
        currency: 'KES',
        reference,
        callback_url: callbackUrl,
        metadata: { order_id: orderId, user_id: req.auth.id, phone: phone.trim() },
      }),
    });
    await query('UPDATE orders SET payment_access_code = ? WHERE id = ?', [payment.access_code, orderId]);
    return res.status(201).json({ authorization_url: payment.authorization_url, reference, order_id: orderId });
  } catch (error) {
    return next(error);
  }
});

router.get('/verify/:reference', requireAuth, async (req, res, next) => {
  try {
    const reference = String(req.params.reference || '');
    if (!/^[A-Za-z0-9_-]{8,100}$/.test(reference)) return res.status(400).json({ error: 'Invalid payment reference.' });
    const orders = await query('SELECT id, user_id, total, currency, payment_status, status FROM orders WHERE payment_reference = ? AND user_id = ? LIMIT 1', [reference, req.auth.id]);
    const order = orders[0];
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    const payment = await paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`);
    const expectedKobo = Math.round(Number(order.total) * 100);
    if (payment.reference !== reference || payment.currency !== 'KES' || Number(payment.amount) !== expectedKobo) {
      return res.status(409).json({ error: 'Payment details did not match this order.' });
    }
    if (payment.status !== 'success') {
      return res.status(409).json({ error: 'Payment is not yet confirmed.', payment_status: payment.status });
    }
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [lockedOrders] = await conn.execute('SELECT id, payment_status FROM orders WHERE id = ? FOR UPDATE', [order.id]);
      if (!lockedOrders.length) throw new Error('Order not found during payment verification.');
      if (lockedOrders[0].payment_status !== 'paid') {
        const [items] = await conn.execute('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [order.id]);
        for (const item of items) {
          const [updated] = await conn.execute(
            'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ? AND status = \'active\'',
            [item.quantity, item.product_id, item.quantity]
          );
          if (updated.affectedRows !== 1) throw new Error('Stock changed before payment confirmation; manual review required.');
        }
        await conn.execute("UPDATE orders SET payment_status = 'paid', status = 'processing', paid_at = CURRENT_TIMESTAMP WHERE id = ?", [order.id]);
        await conn.execute(
          "INSERT INTO payment_events (order_id, provider, provider_reference, event_type, payload_json) VALUES (?, 'paystack', ?, 'verify_success', ?)",
          [order.id, reference, JSON.stringify({ status: payment.status, amount: payment.amount, currency: payment.currency })]
        );
      }
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
    return res.json({ ok: true, order_id: order.id, payment_status: 'paid', order_status: 'processing' });
  } catch (error) {
    return next(error);
  }
});

export default router;