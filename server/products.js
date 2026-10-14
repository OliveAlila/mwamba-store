import { Router } from 'express';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { query } from './db.js';
import { requireAdmin, requireAuth } from './security.js';

const router = Router();
const here = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(here, '../uploads');

router.post('/upload-image', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const image = typeof req.body?.image === 'string' ? req.body.image : '';
    const match = image.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/);
    if (!match) return res.status(400).json({ error: 'Upload a JPG, PNG, WEBP or GIF image.' });
    const mime = match[1];
    const buffer = Buffer.from(match[2], 'base64');
    if (!buffer.length || buffer.length > 5 * 1024 * 1024) return res.status(413).json({ error: 'Image must be smaller than 5 MB.' });
    const extension = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' })[mime];
    await mkdir(uploadDir, { recursive: true });
    const filename = randomUUID() + '.' + extension;
    await writeFile(path.join(uploadDir, filename), buffer, { flag: 'wx' });
    return res.status(201).json({ url: '/uploads/' + filename });
  } catch (error) { return next(error); }
});

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
    const {
      name, description = '', category_id = null, price, compare_at_price = null,
      stock_quantity = 0, sku = null, image_url = null,
    } = req.body || {};
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const numericPrice = Number(price);
    const compareAt = compare_at_price == null || compare_at_price === '' ? null : Number(compare_at_price);
    const stock = Number(stock_quantity);
    const categoryId = category_id == null || category_id === '' ? null : Number(category_id);
    const cleanSku = typeof sku === 'string' ? sku.trim() : sku;
    const cleanImage = typeof image_url === 'string' ? image_url.trim() : image_url;

    if (cleanName.length < 2 || cleanName.length > 180 || !Number.isFinite(numericPrice) || numericPrice <= 0 ||
        !Number.isInteger(stock) || stock < 0 || stock > 100000000) {
      return res.status(400).json({ error: 'Product name, positive price and valid non-negative stock are required.' });
    }
    if (!cleanImage || cleanImage === '') {
      return res.status(400).json({ error: 'Add an image URL or upload a product photo before saving.' });
    }
    if (compareAt !== null && (!Number.isFinite(compareAt) || compareAt < numericPrice)) {
      return res.status(400).json({ error: 'Compare-at price must be blank or at least the selling price.' });
    }
    if (categoryId !== null && (!Number.isSafeInteger(categoryId) || categoryId < 1)) {
      return res.status(400).json({ error: 'Choose a valid product category.' });
    }
    if (categoryId !== null) {
      const categories = await query('SELECT id FROM categories WHERE id = ? AND is_active = 1 LIMIT 1', [categoryId]);
      if (!categories.length) return res.status(400).json({ error: 'The selected category is unavailable.' });
    }
    if (description && (typeof description !== 'string' || description.length > 10000)) {
      return res.status(400).json({ error: 'Description must be 10,000 characters or fewer.' });
    }
    if (cleanSku != null && (typeof cleanSku !== 'string' || cleanSku.length > 100)) {
      return res.status(400).json({ error: 'SKU must be 100 characters or fewer.' });
    }
    if (cleanImage != null && cleanImage !== '' && (typeof cleanImage !== 'string' || (!( /^https:\/\//i.test(cleanImage)) && !/^\/uploads\/[a-f0-9-]+\.(?:jpg|png|webp|gif)$/i.test(cleanImage)) || cleanImage.length > 2048)) {
      return res.status(400).json({ error: 'Use a valid HTTPS image URL or upload an image from your device.' });
    }
    const slug = cleanName.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 160) + '-' + Date.now().toString(36);
    const result = await query(
      `INSERT INTO products (name, slug, description, category_id, price, compare_at_price, stock_quantity, sku, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [cleanName, slug, description, categoryId, numericPrice, compareAt, stock, cleanSku || null, cleanImage || null]
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
    const existingRows = await query('SELECT * FROM products WHERE id = ? LIMIT 1', [id]);
    if (!existingRows.length) return res.status(404).json({ error: 'Product not found.' });
    const existing = existingRows[0];
    const allowed = ['name', 'description', 'category_id', 'price', 'compare_at_price', 'stock_quantity', 'sku', 'image_url', 'status'];
    const entries = Object.entries(req.body || {}).filter(([key]) => allowed.includes(key));
    if (!entries.length) return res.status(400).json({ error: 'No editable product fields supplied.' });

    const updates = {};
    for (const [key, value] of entries) {
      if (key === 'price' && (!Number.isFinite(Number(value)) || Number(value) <= 0)) {
        return res.status(400).json({ error: 'Price must be positive.' });
      }
      if (key === 'compare_at_price' && value != null && value !== '' && (!Number.isFinite(Number(value)) || Number(value) <= 0)) {
        return res.status(400).json({ error: 'Compare-at price must be blank or positive.' });
      }
      if (key === 'stock_quantity' && (!Number.isInteger(Number(value)) || Number(value) < 0)) {
        return res.status(400).json({ error: 'Stock must be a non-negative whole number.' });
      }
      if (key === 'status' && !['active', 'draft', 'archived'].includes(value)) {
        return res.status(400).json({ error: 'Invalid product status.' });
      }
      if (key === 'name' && (typeof value !== 'string' || value.trim().length < 2 || value.trim().length > 180)) {
        return res.status(400).json({ error: 'Invalid product name.' });
      }
      if (key === 'description' && value != null && (typeof value !== 'string' || value.length > 10000)) {
        return res.status(400).json({ error: 'Description must be 10,000 characters or fewer.' });
      }
      if (key === 'sku' && value != null && (typeof value !== 'string' || value.trim().length > 100)) {
        return res.status(400).json({ error: 'SKU must be 100 characters or fewer.' });
      }
      if (key === 'image_url' && value != null && value !== '' && (typeof value !== 'string' || (!( /^https:\/\//i.test(value)) && !/^\/uploads\/[a-f0-9-]+\.(?:jpg|png|webp|gif)$/i.test(value)) || value.length > 2048)) {
        return res.status(400).json({ error: 'Use a valid HTTPS image URL or uploaded image path.' });
      }
      if (key === 'category_id' && value != null && value !== '' && (!Number.isSafeInteger(Number(value)) || Number(value) < 1)) {
        return res.status(400).json({ error: 'Choose a valid product category.' });
      }
      updates[key] = key === 'name' && typeof value === 'string' ? value.trim()
        : key === 'category_id' && (value == null || value === '') ? null
        : key === 'compare_at_price' && (value == null || value === '') ? null
        : key === 'sku' && typeof value === 'string' ? value.trim() || null
        : key === 'image_url' && typeof value === 'string' ? value.trim() || null
        : value;
    }

    const finalPrice = Number(Object.hasOwn(updates, 'price') ? updates.price : existing.price);
    const rawCompare = Object.hasOwn(updates, 'compare_at_price') ? updates.compare_at_price : existing.compare_at_price;
    if (rawCompare != null && Number(rawCompare) < finalPrice) {
      return res.status(400).json({ error: 'Compare-at price must be blank or at least the selling price.' });
    }
    if (Object.hasOwn(updates, 'category_id') && updates.category_id !== null) {
      const categories = await query('SELECT id FROM categories WHERE id = ? AND is_active = 1 LIMIT 1', [Number(updates.category_id)]);
      if (!categories.length) return res.status(400).json({ error: 'The selected category is unavailable.' });
      updates.category_id = Number(updates.category_id);
    }
    if (Object.hasOwn(updates, 'price')) updates.price = Number(updates.price);
    if (Object.hasOwn(updates, 'compare_at_price') && updates.compare_at_price !== null) updates.compare_at_price = Number(updates.compare_at_price);
    if (Object.hasOwn(updates, 'stock_quantity')) updates.stock_quantity = Number(updates.stock_quantity);

    const sets = Object.keys(updates).map(key => `${key} = ?`);
    const values = Object.values(updates);
    sets.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    await query(`UPDATE products SET ${sets.join(', ')} WHERE id = ?`, values);
    const rows = await query('SELECT * FROM products WHERE id = ? LIMIT 1', [id]);
    return res.json({ product: rows[0] });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'That SKU is already in use.' });
    return next(error);
  }
});

export default router;

