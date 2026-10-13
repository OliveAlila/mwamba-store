import { Router } from 'express';
import { query } from './db.js';
import { requireAdmin, requireAuth } from './security.js';

const router = Router();

function makeSlug(name) {
  return name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 110);
}

function validateCategory(body = {}) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const description = body.description == null ? null : body.description;
  if (name.length < 2 || name.length > 100) {
    return { error: 'Category name must be between 2 and 100 characters.' };
  }
  if (description !== null && (typeof description !== 'string' || description.length > 500)) {
    return { error: 'Description must be 500 characters or fewer.' };
  }
  return { name, description };
}

// Public storefront: only active categories.
router.get('/', async (_req, res, next) => {
  try {
    const categories = await query(
      'SELECT id, name, slug, description FROM categories WHERE is_active = 1 ORDER BY name ASC'
    );
    return res.json({ categories });
  } catch (error) {
    return next(error);
  }
});

// Admin workspace: includes inactive categories.
router.get('/admin/all', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const categories = await query(
      'SELECT id, name, slug, description, is_active, created_at FROM categories ORDER BY name ASC'
    );
    return res.json({ categories });
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  const input = validateCategory(req.body);
  if (input.error) return res.status(400).json({ error: input.error });
  const slug = makeSlug(input.name);
  if (!slug) return res.status(400).json({ error: 'Category name must contain letters or numbers.' });

  try {
    const result = await query(
      'INSERT INTO categories (name, slug, description, is_active) VALUES (?, ?, ?, 1)',
      [input.name, slug, input.description]
    );
    const rows = await query(
      'SELECT id, name, slug, description, is_active, created_at FROM categories WHERE id = ?',
      [result.insertId]
    );
    return res.status(201).json({ category: rows[0] });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A category with this name or slug already exists.' });
    }
    return next(error);
  }
});

router.patch('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid category ID.' });

  const updates = {};
  if (Object.hasOwn(req.body || {}, 'name')) {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ error: 'Category name must be between 2 and 100 characters.' });
    }
    updates.name = name;
    updates.slug = makeSlug(name);
    if (!updates.slug) return res.status(400).json({ error: 'Category name must contain letters or numbers.' });
  }
  if (Object.hasOwn(req.body || {}, 'description')) {
    const description = req.body.description;
    if (description !== null && (typeof description !== 'string' || description.length > 500)) {
      return res.status(400).json({ error: 'Description must be 500 characters or fewer.' });
    }
    updates.description = description;
  }
  if (Object.hasOwn(req.body || {}, 'is_active')) {
    if (![true, false, 0, 1].includes(req.body.is_active)) {
      return res.status(400).json({ error: 'is_active must be true or false.' });
    }
    updates.is_active = req.body.is_active ? 1 : 0;
  }
  const entries = Object.entries(updates);
  if (!entries.length) return res.status(400).json({ error: 'Provide a category name, description or active status.' });

  try {
    const sets = entries.map(([key]) => `${key} = ?`);
    const values = entries.map(([, value]) => value);
    values.push(id);
    const result = await query(`UPDATE categories SET ${sets.join(', ')} WHERE id = ?`, values);
    if (!result.affectedRows) {
      const exists = await query('SELECT id FROM categories WHERE id = ? LIMIT 1', [id]);
      if (!exists.length) return res.status(404).json({ error: 'Category not found.' });
    }
    const rows = await query(
      'SELECT id, name, slug, description, is_active, created_at FROM categories WHERE id = ?',
      [id]
    );
    return res.json({ category: rows[0] });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A category with this name or slug already exists.' });
    }
    return next(error);
  }
});

// Soft-delete so existing products and historical orders keep their references.
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid category ID.' });
  try {
    const result = await query('UPDATE categories SET is_active = 0 WHERE id = ?', [id]);
    if (!result.affectedRows) {
      const exists = await query('SELECT id FROM categories WHERE id = ? LIMIT 1', [id]);
      if (!exists.length) return res.status(404).json({ error: 'Category not found.' });
    }
    return res.json({ ok: true, message: 'Category deactivated.' });
  } catch (error) {
    return next(error);
  }
});

export default router;
