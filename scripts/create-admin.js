import 'dotenv/config';
import bcrypt from 'bcryptjs';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { query } from '../server/db.js';

async function readHidden(prompt) {
  if (!input.isTTY || typeof input.setRawMode !== 'function') {
    throw new Error('ADMIN_PASSWORD is not set and this terminal cannot securely prompt for a hidden password. Run this command in an interactive SSH terminal or set ADMIN_PASSWORD in a private environment variable.');
  }

  return new Promise((resolve, reject) => {
    let value = '';
    output.write(prompt);
    input.setRawMode(true);
    input.resume();
    input.setEncoding('utf8');

    const finish = (error) => {
      input.off('data', onData);
      input.setRawMode(false);
      input.pause();
      output.write('\n');
      if (error) reject(error);
      else resolve(value);
    };

    const onData = (chunk) => {
      for (const character of chunk) {
        if (character === '\u0003') return finish(new Error('Administrator setup cancelled.'));
        if (character === '\r' || character === '\n') return finish();
        if (character === '\u007f' || character === '\b') {
          value = value.slice(0, -1);
          continue;
        }
        if (character >= ' ') value += character;
      }
    };

    input.on('data', onData);
  });
}

async function main() {
  let name = process.env.ADMIN_NAME?.trim() || '';
  let email = process.env.ADMIN_EMAIL?.trim().toLowerCase() || '';
  let password = process.env.ADMIN_PASSWORD || '';

  if (!name || !email || !password) {
    const rl = readline.createInterface({ input, output });
    try {
      if (!name) name = (await rl.question('Administrator full name: ')).trim();
      if (!email) email = (await rl.question('Administrator email (use a separate admin email): ')).trim().toLowerCase();
    } finally {
      rl.close();
    }
    if (!password) password = await readHidden('Administrator password (14–72 characters; input hidden): ');
  }

  if (!name || name.length < 2 || name.length > 120 || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 14 || password.length > 72) {
    throw new Error('Enter a valid name, email and password (14–72 characters).');
  }

  const existing = await query('SELECT id, role FROM users WHERE email = ? LIMIT 1', [email]);
  if (existing.length) {
    if (existing[0].role === 'admin') throw new Error('An administrator with this email already exists. No changes made.');
    throw new Error('That email belongs to an existing customer. Choose a separate admin email; this script will not silently promote an account.');
  }

  const hash = await bcrypt.hash(password, 12);
  await query("INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, 'admin', 'active')", [name, email, hash]);
  console.log('Administrator created successfully. Sign in at /login, then open /admin.');
}

try {
  await main();
} catch (error) {
  console.error(error.code === 'DB_CONFIG_MISSING'
    ? error.message
    : error.message || 'Could not create administrator. Confirm database schema and connection settings.');
  process.exitCode = 1;
}
