import 'dotenv/config';
import bcrypt from 'bcryptjs';
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { query, getPool } from '../server/db.js';

async function readHidden(prompt) {
  if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
    throw new Error('This terminal cannot securely hide password input. Run from an interactive terminal.');
  }

  return new Promise((resolve, reject) => {
    let value = '';
    stdout.write(prompt);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    const finish = (error) => {
      stdin.off('data', onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write('\n');
      if (error) reject(error);
      else resolve(value);
    };

    const onData = (chunk) => {
      for (const character of chunk) {
        if (character === '\u0003') return finish(new Error('Cancelled.'));
        if (character === '\r' || character === '\n') return finish();
        if (character === '\u007f' || character === '\b') {
          value = value.slice(0, -1);
          continue;
        }
        if (character >= ' ') value += character;
      }
    };

    stdin.on('data', onData);
  });
}

async function main() {
  const email = 'contact@mwamba.store';
  const password = await readHidden('Enter the original admin password (input hidden): ');

  if (!password) {
    console.log('EMPTY INPUT — no database changes made.');
    process.exitCode = 1;
    return;
  }

  const rows = await query(
    'SELECT password_hash, role, status FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  if (!rows.length) {
    console.log('ADMIN ACCOUNT NOT FOUND in the database configured by this environment.');
    process.exitCode = 1;
    return;
  }

  const user = rows[0];
  const matches = await bcrypt.compare(password, user.password_hash);

  console.log(matches ? 'PASSWORD RESULT: MATCH' : 'PASSWORD RESULT: NO MATCH');
  console.log(`ROLE: ${user.role}`);
  console.log(`STATUS: ${user.status}`);
  console.log('No database records were changed.');
}

try {
  await main();
} catch (error) {
  // Show safe connection/configuration diagnostics, never the entered password or hash.
  const code = typeof error?.code === 'string' ? error.code : 'NO_ERROR_CODE';
  const message = typeof error?.message === 'string' && error.message.trim()
    ? error.message
    : String(error);
  console.error(`DIAGNOSTIC FAILED [${code}]: ${message || 'Unknown error'}`);
  process.exitCode = 1;
} finally {
  try {
    await getPool().end();
  } catch {
    // A database pool may not have been initialized if configuration is missing.
  }
}
