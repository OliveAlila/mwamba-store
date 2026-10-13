import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from './db.js';
import { clearSessionCookie, requireAuth, setSessionCookie, signSession } from './security.js';

const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/register', async (req, res, next) => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (name.length < 2 || name.length > 120 || !emailPattern.test(email) || email.length > 190 || password.length < 10 || password.length > 72) {
      return res.status(400).json({ error: 'Provide a name, valid email, and password of 10–72 characters.' });
    }
    const existing = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length) return res.status(409).json({ error: 'An account with this email already exists.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await query(
      'INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, \'customer\', \'active\')',
      [name, email, passwordHash]
    );
    const user = { id: result.insertId, name, email, role: 'customer' };
    setSessionCookie(res, signSession(user));
    return res.status(201).json({ user });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'An account with this email already exists.' });
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!emailPattern.test(email) || password.length < 1 || password.length > 72) {
      return res.status(400).json({ error: 'Enter a valid email and password.' });
    }
    const rows = await query(
      'SELECT id, name, email, password_hash, role, status FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    const user = rows[0];
    const matches = user ? await bcrypt.compare(password, user.password_hash) : false;
    if (!user || !matches || user.status !== 'active') {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }
    const publicUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    setSessionCookie(res, signSession(publicUser));
    return res.json({ user: publicUser });
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', (_req, res) => {
  clearSessionCookie(res);
  return res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const rows = await query(
      'SELECT id, name, email, role, status, created_at FROM users WHERE id = ? LIMIT 1',
      [req.auth.id]
    );
    if (!rows.length || rows[0].status !== 'active') {
      clearSessionCookie(res);
      return res.status(401).json({ error: 'Account is unavailable.' });
    }
    return res.json({ user: rows[0] });
  } catch (error) {
    return next(error);
  }
});

export default router;