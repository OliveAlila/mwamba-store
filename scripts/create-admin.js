import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { query } from '../server/db.js';

const name = process.env.ADMIN_NAME?.trim();
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!name || name.length < 2 || name.length > 120 || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 14 || password.length > 72) {
  console.error('Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD (14–72 characters) in your private environment before running this script.');
  process.exit(1);
}

try {
  const existing = await query('SELECT id, role FROM users WHERE email = ? LIMIT 1', [email]);
  if (existing.length) {
    if (existing[0].role === 'admin') {
      console.error('An administrator with this email already exists. No changes made.');
      process.exitCode = 1;
    } else {
      console.error('That email belongs to an existing customer. Choose a separate admin email; this script will not silently promote an account.');
      process.exitCode = 1;
    }
  } else {
    const hash = await bcrypt.hash(password, 12);
    await query("INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, 'admin', 'active')", [name, email, hash]);
    console.log('Administrator created. Remove ADMIN_PASSWORD from the environment after use.');
  }
} catch (error) {
  console.error(error.code === 'DB_CONFIG_MISSING' ? error.message : 'Could not create administrator. Confirm database schema and connection settings.');
  process.exitCode = 1;
} finally {
  process.exit();
}