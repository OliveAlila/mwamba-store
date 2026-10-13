import mysql from 'mysql2/promise';

let pool;

export function getPool() {
  if (!pool) {
    const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length) {
      const error = new Error(`Database configuration missing: ${missing.join(', ')}`);
      error.code = 'DB_CONFIG_MISSING';
      throw error;
    }
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
      queueLimit: 0,
      enableKeepAlive: true,
      charset: 'utf8mb4',
      timezone: 'Z',
    });
  }
  return pool;
}

export async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

export async function pingDatabase() {
  const rows = await query('SELECT 1 AS ok');
  return rows[0]?.ok === 1;
}