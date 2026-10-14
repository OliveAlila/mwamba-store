import { Router } from 'express';
import { timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { getPool } from './db.js';

const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function tokenMatches(provided, expected) {
  if (typeof provided !== 'string' || typeof expected !== 'string') return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Temporary password recovery for an existing administrator. Requires the same
// strong hosting-only bootstrap token and is disabled when that token is removed.
router.post('/reset-password', async (req, res, next) => {
  const expectedToken = process.env.ADMIN_BOOTSTRAP_TOKEN;
  if (!expectedToken || expectedToken.length < 32) {
    return res.status(404).json({ error: 'Not found.' });
  }
  if (!tokenMatches(req.get('x-admin-bootstrap-token'), expectedToken)) {
    return res.status(401).json({ error: 'Invalid recovery token.' });
  }

  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!emailPattern.test(email) || email.length > 190 || password.length < 14 || password.length > 72) {
    return res.status(400).json({ error: 'Provide a valid admin email and a new password of 14–72 characters.' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await getPool().execute(
      "UPDATE users SET password_hash = ? WHERE email = ? AND role = 'admin' AND status = 'active'",
      [passwordHash, email]
    );
    if (result.affectedRows !== 1) {
      return res.status(404).json({ error: 'No active administrator matches that email.' });
    }
    return res.json({ ok: true, message: 'Administrator password reset. Remove ADMIN_BOOTSTRAP_TOKEN from hosting now, then sign in with the new password.' });
  } catch (error) {
    return next(error);
  }
});

// Temporary, token-protected first-admin bootstrap. It is disabled unless
// ADMIN_BOOTSTRAP_TOKEN is configured in the hosting environment.
router.post('/', async (req, res, next) => {
  const expectedToken = process.env.ADMIN_BOOTSTRAP_TOKEN;
  if (!expectedToken || expectedToken.length < 32) {
    return res.status(404).json({ error: 'Not found.' });
  }
  if (!tokenMatches(req.get('x-admin-bootstrap-token'), expectedToken)) {
    return res.status(401).json({ error: 'Invalid bootstrap token.' });
  }

  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (name.length < 2 || name.length > 120 || !emailPattern.test(email) ||
      email.length > 190 || password.length < 14 || password.length > 72) {
    return res.status(400).json({
      error: 'Provide a valid name, email, and password of 14–72 characters.'
    });
  }

  let connection;
  let lockAcquired = false;
  try {
    connection = await getPool().getConnection();
    const [lockRows] = await connection.query("SELECT GET_LOCK('mwamba_store_first_admin_bootstrap', 10) AS acquired");
    lockAcquired = Number(lockRows?.[0]?.acquired) === 1;
    if (!lockAcquired) {
      return res.status(503).json({ error: 'Admin setup is busy. Please retry once.' });
    }

    const [admins] = await connection.execute("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (admins.length) {
      return res.status(409).json({ error: 'An administrator already exists. Bootstrap is no longer available.' });
    }

    const [existing] = await connection.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length) {
      return res.status(409).json({ error: 'That email already belongs to an account. Use a new admin email.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await connection.beginTransaction();
    await connection.execute(
      "INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, 'admin', 'active')",
      [name, email, passwordHash]
    );
    await connection.commit();
    return res.status(201).json({
      ok: true,
      message: 'Administrator created. Remove ADMIN_BOOTSTRAP_TOKEN from hosting environment now, then sign in at /login.'
    });
  } catch (error) {
    if (connection) {
      try { await connection.rollback(); } catch {}
    }
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }
    return next(error);
  } finally {
    if (connection) {
      if (lockAcquired) {
        try { await connection.query("SELECT RELEASE_LOCK('mwamba_store_first_admin_bootstrap')"); } catch {}
      }
      connection.release();
    }
  }
});

export default router;
