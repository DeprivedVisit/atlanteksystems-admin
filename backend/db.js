// ══════════════════════════════════════════════════════════════
//  db.js — MySQL connection pool
//  Apex Cloud Work · Garett Barrantes Benavides
//  Compatible: mysql2, EC2 Ubuntu 22.04, RDS MySQL 8.0
// ══════════════════════════════════════════════════════════════
'use strict';

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || '127.0.0.1',
  port:               parseInt(process.env.DB_PORT || '3306'),
  user:               process.env.DB_USER     || 'apex_user',
  password:           process.env.DB_PASS     || '',
  database:           process.env.DB_NAME     || 'apex_cloudworks',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  enableKeepAlive:    true,
  keepAliveInitialDelay: 0,
  timezone:           '-06:00', // Costa Rica (CST, no DST)
});

// ── Test connection on startup ────────────────────────────────
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL conectado:', process.env.DB_HOST || '127.0.0.1');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection error:', err.message);
    process.exit(1);
  });

// ── Helper: query con log de errores ─────────────────────────
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (err) {
    console.error('[DB ERROR]', err.message, '\nSQL:', sql);
    throw err;
  }
}

// ── Helper: insert y devuelve insertId ────────────────────────
async function insert(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result.insertId;
}

// ── Helper: transacción ───────────────────────────────────────
async function transaction(fn) {
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  try {
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { pool, query, insert, transaction };
