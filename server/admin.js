import { Router } from 'express';
import { query } from './db.js';

const router = Router();

router.get('/orders', async (_req, res, next) => {
  try {
    const orders = await query(
      `SELECT o.id, o.order_number, o.status, o.payment_status, o.subtotal, o.delivery_fee,
              o.total, o.currency, o.delivery_phone, o.delivery_address, o.created_at,
              u.name AS customer_name, u.email AS customer_email,
              (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
       FROM orders o
       INNER JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC LIMIT 200`
    );
    return res.json({ orders });
  } catch (error) {
    return next(error);
  }
});

router.patch('/orders/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  const status = req.body?.status;
  const allowed = ['processing', 'packed', 'shipped', 'delivered', 'review_required'];
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid order ID.' });
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Choose a supported fulfillment status.' });
  try {
    const orders = await query('SELECT id, payment_status FROM orders WHERE id = ? LIMIT 1', [id]);
    if (!orders.length) return res.status(404).json({ error: 'Order not found.' });
    if (status !== 'review_required' && orders[0].payment_status !== 'paid') {
      return res.status(409).json({ error: 'Only paid orders can move through fulfillment.' });
    }
    await query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    const updated = await query('SELECT id, order_number, status, payment_status FROM orders WHERE id = ? LIMIT 1', [id]);
    return res.json({ order: updated[0] });
  } catch (error) {
    return next(error);
  }
});

router.get('/customers', async (_req, res, next) => {
  try {
    const customers = await query(
      `SELECT u.id, u.name, u.email, u.status, u.created_at,
              COUNT(o.id) AS order_count,
              COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN o.total ELSE 0 END), 0) AS paid_total
       FROM users u
       LEFT JOIN orders o ON o.user_id = u.id
       WHERE u.role = 'customer'
       GROUP BY u.id, u.name, u.email, u.status, u.created_at
       ORDER BY u.created_at DESC LIMIT 500`
    );
    return res.json({ customers });
  } catch (error) {
    return next(error);
  }
});

router.get('/promotions', async (_req, res, next) => {
  try {
    const promotions = await query(
      'SELECT id, name, code, discount_type, discount_value, starts_at, ends_at, is_active, created_at FROM promotions ORDER BY created_at DESC LIMIT 200'
    );
    return res.json({ promotions });
  } catch (error) {
    return next(error);
  }
});

router.post('/promotions', async (req, res, next) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const discountType = req.body?.discount_type;
  const discountValue = Number(req.body?.discount_value);
  const rawCode = typeof req.body?.code === 'string' ? req.body.code.trim().toUpperCase() : '';
  const code = rawCode || null;
  const startsAt = req.body?.starts_at || null;
  const endsAt = req.body?.ends_at || null;
  if (name.length < 2 || name.length > 160) return res.status(400).json({ error: 'Promotion name must be between 2 and 160 characters.' });
  if (!['percentage', 'fixed'].includes(discountType) || !Number.isFinite(discountValue) || discountValue <= 0 || (discountType === 'percentage' && discountValue > 100)) {
    return res.status(400).json({ error: 'Enter a valid percentage (up to 100) or fixed discount amount.' });
  }
  if (code && !/^[A-Z0-9_-]{3,60}$/.test(code)) return res.status(400).json({ error: 'Promotion code must be 3–60 letters, numbers, hyphens or underscores.' });
  if (startsAt && Number.isNaN(Date.parse(startsAt))) return res.status(400).json({ error: 'Start date is invalid.' });
  if (endsAt && Number.isNaN(Date.parse(endsAt))) return res.status(400).json({ error: 'End date is invalid.' });
  if (startsAt && endsAt && Date.parse(endsAt) < Date.parse(startsAt)) return res.status(400).json({ error: 'End date must be after the start date.' });
  try {
    const result = await query(
      'INSERT INTO promotions (name, code, discount_type, discount_value, starts_at, ends_at, is_active) VALUES (?, ?, ?, ?, ?, ?, 0)',
      [name, code, discountType, discountValue, startsAt, endsAt]
    );
    const rows = await query(
      'SELECT id, name, code, discount_type, discount_value, starts_at, ends_at, is_active, created_at FROM promotions WHERE id = ? LIMIT 1',
      [result.insertId]
    );
    return res.status(201).json({ promotion: rows[0] });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'That promotion code is already in use.' });
    return next(error);
  }
});

router.patch('/promotions/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid promotion ID.' });
  const hasActiveOnly = Object.keys(req.body || {}).length === 1 && Object.hasOwn(req.body, 'is_active');
  try {
    if (hasActiveOnly) {
      const isActive = req.body.is_active;
      if (![true, false, 0, 1].includes(isActive)) return res.status(400).json({ error: 'is_active must be true or false.' });
      const result = await query('UPDATE promotions SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
      if (!result.affectedRows) {
        const rows = await query('SELECT id FROM promotions WHERE id = ? LIMIT 1', [id]);
        if (!rows.length) return res.status(404).json({ error: 'Promotion not found.' });
      }
    } else {
      const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
      const discountType = req.body?.discount_type;
      const discountValue = Number(req.body?.discount_value);
      const rawCode = typeof req.body?.code === 'string' ? req.body.code.trim().toUpperCase() : '';
      const code = rawCode || null;
      const startsAt = req.body?.starts_at || null;
      const endsAt = req.body?.ends_at || null;
      if (name.length < 2 || name.length > 160) return res.status(400).json({ error: 'Promotion name must be between 2 and 160 characters.' });
      if (!['percentage', 'fixed'].includes(discountType) || !Number.isFinite(discountValue) || discountValue <= 0 || (discountType === 'percentage' && discountValue > 100)) return res.status(400).json({ error: 'Enter a valid percentage (up to 100) or fixed discount amount.' });
      if (code && !/^[A-Z0-9_-]{3,60}$/.test(code)) return res.status(400).json({ error: 'Promotion code must be 3–60 letters, numbers, hyphens or underscores.' });
      if (startsAt && Number.isNaN(Date.parse(startsAt))) return res.status(400).json({ error: 'Start date is invalid.' });
      if (endsAt && Number.isNaN(Date.parse(endsAt))) return res.status(400).json({ error: 'End date is invalid.' });
      if (startsAt && endsAt && Date.parse(endsAt) < Date.parse(startsAt)) return res.status(400).json({ error: 'End date must be after the start date.' });
      const existing = await query('SELECT id FROM promotions WHERE id = ? LIMIT 1', [id]);
      if (!existing.length) return res.status(404).json({ error: 'Promotion not found.' });
      await query('UPDATE promotions SET name = ?, code = ?, discount_type = ?, discount_value = ?, starts_at = ?, ends_at = ? WHERE id = ?', [name, code, discountType, discountValue, startsAt, endsAt, id]);
    }
    const rows = await query('SELECT id, name, code, discount_type, discount_value, starts_at, ends_at, is_active, created_at FROM promotions WHERE id = ? LIMIT 1', [id]);
    return res.json({ promotion: rows[0] });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'That promotion code is already in use.' });
    return next(error);
  }
});

router.delete('/promotions/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid promotion ID.' });
  try {
    const result = await query('DELETE FROM promotions WHERE id = ?', [id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Promotion not found.' });
    return res.json({ ok: true, deleted_id: id });
  } catch (error) {
    return next(error);
  }
});

export default router;
