import { Router } from 'express';
import { query } from './db.js';
import { requireAdmin, requireAuth } from './security.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
    const category = typeof req.query.category === 'string' ? req.query.category.trim().slice(0, 80) : '';
    const params = [];
    let where = "p.status = 'active'";
    if (search) {
      where += ' AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    if (category && category !== 'All products') {
      where += ' AND c.name = ?';
      params.push(category);
    }
    const products = await query(
      `SELECT p.id, p.name, p.slug, p.description, p.price, p.compare_at_price, p.stock_quantity,
              p.sku, p.image_url, c.name AS category, p.created_at
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
       WHERE ${where} ORDER BY p.created_at DESC LIMIT 100`,
      params
    );
    return res.json({ products });
  } catch (error) {
    return next(error);
  }
});

router.get('/admin/all', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const products = await query(
      `SELECT p.id, p.name, p.slug, p.description, p.price, p.compare_at_price, p.stock_quantity,
              p.sku, p.image_url, p.status, p.category_id, c.name AS category, p.created_at, p.updated_at
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
       ORDER BY p.updated_at DESC LIMIT 500`
    );
    return res.json({ products });
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { name, description = '', category_id = null, price, compare_at_price = null, stock_quantity = 0, sku = null, image_url = null } = req.body || {};
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const numericPrice = Number(price);
    const stock = Number(stock_quantity);
    if (cleanName.length < 2 || cleanName.length > 180 || !Number.isFinite(numericPrice) || numericPrice <= 0 || !Number.isInteger(stock) || stock < 0 || stock > 100000000) {
      return res.status(400).json({ error: 'Product name, positive price and valid non-negative stock are required.' });
    }
    if (description && (typeof description !== 'string' || description.length > 10000)) return res.status(400).json({ error: 'Description is too long.' });
    if (image_url && (typeof image_url !== 'string' || !/^https:\/\//i.test(image_url) || image_url.length > 2048)) return res.status(400).json({ error: 'Image URL must be a valid HTTPS URL.' });
    const slug = cleanName.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 160) + '-' + Date.now().toString(36);
    const result = await query(
      `INSERT INTO products (name, slug, description, category_id, price, compare_at_price, stock_quantity, sku, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [cleanName, slug, description, category_id || null, numericPrice, compare_at_price == null ? null : Number(compare_at_price), stock, sku || null, image_url || null]
    );
    const rows = await query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    return res.status(201).json({ product: rows[0] });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'That SKU is already in use.' });
    return next(error);
  }
});

router.patch('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid product ID.' });
    const allowed = ['name', 'description', 'category_id', 'price', 'compare_at_price', 'stock_quantity', 'sku', 'image_url', 'status'];
    const entries = Object.entries(req.body || {}).filter(([key]) => allowed.includes(key));
    if (!entries.length) return res.status(400).json({ error: 'No editable product fields supplied.' });
    const values = [];
    const sets = [];
    for (const [key, value] of entries) {
      if (key === 'price' && (!Number.isFinite(Number(value)) || Number(value) <= 0)) return res.status(400).json({ error: 'Price must be positive.' });
      if (key === 'stock_quantity' && (!Number.isInteger(Number(value)) || Number(value) < 0)) return res.status(400).json({ error: 'Stock must be a non-negative whole number.' });
      if (key === 'status' && !['active', 'draft', 'archived'].includes(value)) return res.status(400).json({ error: 'Invalid product status.' });
      if (key === 'name' && (typeof value !== 'string' || value.trim().length < 2 || value.trim().length > 180)) return res.status(400).json({ error: 'Invalid product name.' });
      sets.push(`${key} = ?`);
      values.push(key === 'name' && typeof value === 'string' ? value.trim() : value);
    }
    sets.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    const result = await query(`UPDATE products SET ${sets.join(', ')} WHERE id = ?`, values);
    if (!result.affectedRows) return res.status(404).json({ error: 'Product not found.' });
    const rows = await query('SELECT * FROM products WHERE id = ?', [id]);
    return res.json({ product: rows[0] });
  } catch (error) {
    return next(error);
  }
});

export default router;