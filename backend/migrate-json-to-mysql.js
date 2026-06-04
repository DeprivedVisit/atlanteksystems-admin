#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════
//  migrate-json-to-mysql.js
//  Apex Cloud Works.com · Garett Barrantes Benavides
//  Migra TODOS los JSON locales a MySQL sin perder datos
//  Uso: node migrate-json-to-mysql.js
//       node migrate-json-to-mysql.js --dry-run  (solo muestra conteo)
// ══════════════════════════════════════════════════════════════
'use strict';

const mysql   = require('mysql2/promise');
const fs      = require('fs');
const path    = require('path');
const bcrypt  = require('bcryptjs');
require('dotenv').config();

const DRY_RUN = process.argv.includes('--dry-run');
const VIEWS   = path.join(__dirname, '..', 'views');

// ── Leer JSON ─────────────────────────────────────────────────
function readJSON(name) {
  const p = path.join(VIEWS, name);
  try {
    if (!fs.existsSync(p)) return [];
    const data = fs.readFileSync(p, 'utf-8').trim();
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) {
    console.warn(`⚠️  No se pudo leer ${name}:`, e.message);
    return [];
  }
}

function toDatetime(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 19).replace('T', ' ');
}

function toDate(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

// ── Conexión ─────────────────────────────────────────────────
async function getConn() {
  return mysql.createConnection({
    host:     process.env.DB_HOST || '127.0.0.1',
    port:     parseInt(process.env.DB_PORT || '3306'),
    user:     process.env.DB_USER || 'apex_user',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'apex_cloudworks',
    multipleStatements: true,
  });
}

// ── Migración principal ───────────────────────────────────────
async function migrate() {
  console.log('\n🚀 Apex Cloud Works.com — Migración JSON → MySQL');
  console.log('━'.repeat(50));
  if (DRY_RUN) console.log('📋 MODO DRY-RUN — no se escribirá nada\n');

  const conn = await getConn();
  let ok = 0, skip = 0, errors = 0;

  async function run(sql, params) {
    if (DRY_RUN) return { insertId: 0 };
    const [res] = await conn.execute(sql, params);
    return res;
  }

  // ── 1. USERS ─────────────────────────────────────────────
  const users = readJSON('users.json');
  console.log(`👤 Users: ${users.length} registros`);
  const emailToId = {};
  for (const u of users) {
    try {
      const hash = u.password || await bcrypt.hash('ChangeMe2026!', 10);
      const res = await run(
        `INSERT IGNORE INTO users (name, email, password_hash, role, company, project_type, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [u.name || 'Sin nombre', u.email, hash,
         u.role || 'client', u.company || null, u.projectType || null,
         toDatetime(u.createdAt) || new Date().toISOString().slice(0,19).replace('T',' ')]
      );
      if (!DRY_RUN) {
        const [row] = await conn.execute('SELECT id FROM users WHERE email=?', [u.email]);
        if (row[0]) emailToId[u.email] = row[0].id;
      }
      ok++;
    } catch (e) { console.error('  ✗ user', u.email, e.message); errors++; }
  }

  // ── 2. LEADS ─────────────────────────────────────────────
  const leads = readJSON('leads.json');
  console.log(`🔥 Leads: ${leads.length} registros`);
  const leadExtToId = {};
  for (const l of leads) {
    try {
      const res = await run(
        `INSERT IGNORE INTO leads (ext_id, name, email, whatsapp, service, budget, deadline,
          description, status, admin_notes, user_id, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [l.id || null, l.name, l.email, l.whatsapp || null,
         l.service || null, l.budget || null, l.deadline || null,
         l.description || null,
         l.status || 'Nuevo', l.adminNotes || null,
         emailToId[l.email] || null,
         toDatetime(l.date) || new Date().toISOString().slice(0,19).replace('T',' ')]
      );
      if (!DRY_RUN && l.id) {
        const [row] = await conn.execute('SELECT id FROM leads WHERE ext_id=?', [l.id]);
        if (row[0]) leadExtToId[l.id] = row[0].id;
      }
      ok++;
    } catch (e) { console.error('  ✗ lead', l.name, e.message); errors++; }
  }

  // ── 3. TICKETS ───────────────────────────────────────────
  const tickets = readJSON('tickets.json');
  console.log(`🎫 Tickets: ${tickets.length} registros`);
  const ticketExtToId = {};
  for (const t of tickets) {
    const uid = emailToId[t.email] || null;
    if (!uid && !DRY_RUN) { skip++; continue; }
    try {
      await run(
        `INSERT IGNORE INTO tickets (ext_id, user_id, subject, status, created_at)
         VALUES (?,?,?,?,?)`,
        [t.id || null, uid || 1, t.subject || 'Sin asunto',
         t.status || 'Abierto',
         toDatetime(t.date) || new Date().toISOString().slice(0,19).replace('T',' ')]
      );
      if (!DRY_RUN && t.id) {
        const [row] = await conn.execute('SELECT id FROM tickets WHERE ext_id=?', [t.id]);
        if (row[0]) {
          ticketExtToId[t.id] = row[0].id;
          // Migrar mensajes del ticket
          for (const m of (t.messages || [])) {
            await run(
              `INSERT INTO ticket_messages (ticket_id, from_admin, text, seen_by_user, created_at)
               VALUES (?,?,?,?,?)`,
              [row[0].id, m.from === 'admin' ? 1 : 0,
               m.text || '', m.seenByUser ? 1 : 0,
               toDatetime(m.time) || new Date().toISOString().slice(0,19).replace('T',' ')]
            );
          }
        }
      }
      ok++;
    } catch (e) { console.error('  ✗ ticket', t.subject, e.message); errors++; }
  }

  // ── 4. PAGOS ─────────────────────────────────────────────
  const pagos = readJSON('pagos.json').concat(readJSON('views/pagos.json').filter(Boolean));
  const uniquePagos = [...new Map(pagos.map(p => [p.id, p])).values()];
  console.log(`💳 Pagos: ${uniquePagos.length} registros`);
  for (const p of uniquePagos) {
    try {
      await run(
        `INSERT IGNORE INTO pagos (ext_id, user_id, name, email, amount, service, method,
          stripe_session, notes, status, paid_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [p.id || null, emailToId[p.email] || null,
         p.name || 'Desconocido', p.email || '',
         parseFloat(p.amount) || 0, p.service || null,
         p.method || 'Otro', p.stripeSession || null,
         p.notes || null, 'Confirmado',
         toDatetime(p.date) || new Date().toISOString().slice(0,19).replace('T',' ')]
      );
      ok++;
    } catch (e) { console.error('  ✗ pago', p.id, e.message); errors++; }
  }

  // ── 5. CONTRATOS ─────────────────────────────────────────
  const contratos = readJSON('contratos.json');
  console.log(`📄 Contratos: ${contratos.length} registros`);
  for (const c of contratos) {
    const lid = leadExtToId[c.leadId];
    const uid = emailToId[c.email];
    if (!lid || !uid) { skip++; continue; }
    try {
      await run(
        `INSERT IGNORE INTO contratos (ext_id, lead_id, user_id, ip, signed_at)
         VALUES (?,?,?,?,?)`,
        [c.id || null, lid, uid, c.ip || null,
         toDatetime(c.date) || new Date().toISOString().slice(0,19).replace('T',' ')]
      );
      ok++;
    } catch (e) { skip++; }
  }

  // ── 6. HORAS ─────────────────────────────────────────────
  const horas = readJSON('horas.json');
  console.log(`⏱  Horas: ${horas.length} registros`);
  for (const h of horas) {
    const uid = emailToId[h.email];
    if (!uid && !DRY_RUN) { skip++; continue; }
    try {
      await run(
        `INSERT IGNORE INTO horas (ext_id, user_id, hours, description, work_date)
         VALUES (?,?,?,?,?)`,
        [h.id || null, uid || 1, parseFloat(h.hours) || 0,
         h.description || null, toDate(h.date) || new Date().toISOString().slice(0,10)]
      );
      ok++;
    } catch (e) { console.error('  ✗ hora', h.id, e.message); errors++; }
  }

  // ── 7. TESTIMONIOS ───────────────────────────────────────
  const testimonios = readJSON('testimonios.json');
  console.log(`⭐ Testimonios: ${testimonios.length} registros`);
  for (const t of testimonios) {
    const uid = emailToId[t.email];
    if (!uid && !DRY_RUN) { skip++; continue; }
    try {
      await run(
        `INSERT IGNORE INTO testimonios (ext_id, user_id, rating, text, company, approved, created_at)
         VALUES (?,?,?,?,?,?,?)`,
        [t.id || null, uid || 1,
         Math.min(5, Math.max(1, parseInt(t.rating) || 5)),
         t.text || '', t.company || null,
         t.approved ? 1 : 0,
         toDatetime(t.date) || new Date().toISOString().slice(0,19).replace('T',' ')]
      );
      ok++;
    } catch (e) { skip++; }
  }

  // ── 8. BLOG ──────────────────────────────────────────────
  const posts = readJSON('blog.json');
  console.log(`📝 Blog posts: ${posts.length} registros`);
  for (const p of posts) {
    try {
      await run(
        `INSERT IGNORE INTO blog_posts (ext_id, slug, title, excerpt, content, tags_json, published, created_at)
         VALUES (?,?,?,?,?,?,?,?)`,
        [p.id || null, p.slug || p.title?.toLowerCase().replace(/\s+/g,'-') || `post-${Date.now()}`,
         p.title || 'Sin título', p.excerpt || null, p.content || null,
         JSON.stringify(p.tags || []), p.published ? 1 : 0,
         toDatetime(p.date) || new Date().toISOString().slice(0,19).replace('T',' ')]
      );
      ok++;
    } catch (e) { skip++; }
  }

  // ── 9. NEWSLETTER SUBS ───────────────────────────────────
  const subs = readJSON('newsletter-subs.json');
  console.log(`📨 Newsletter subs: ${subs.length} registros`);
  for (const s of subs) {
    try {
      await run(
        `INSERT IGNORE INTO newsletter_subs (email, name, created_at) VALUES (?,?,?)`,
        [s.email, s.name || null,
         toDatetime(s.date) || new Date().toISOString().slice(0,19).replace('T',' ')]
      );
      ok++;
    } catch (e) { skip++; }
  }

  // ── 10. CHATS ────────────────────────────────────────────
  const chats = readJSON('chats.json');
  let chatMsgs = 0;
  for (const chat of chats) {
    for (const m of (chat.messages || [])) {
      try {
        await run(
          `INSERT INTO chat_messages (room_email, from_admin, text, read_by_admin, created_at)
           VALUES (?,?,?,?,?)`,
          [chat.email, m.from === 'admin' ? 1 : 0,
           m.text || '', m.readByAdmin ? 1 : 0,
           new Date().toISOString().slice(0,19).replace('T',' ')]
        );
        chatMsgs++; ok++;
      } catch (e) { skip++; }
    }
  }
  console.log(`💬 Chat messages: ${chatMsgs} registros`);

  // ── RESULTADO ────────────────────────────────────────────
  await conn.end();
  console.log('\n' + '━'.repeat(50));
  console.log(`✅ Migrados:  ${ok}`);
  console.log(`⏭  Saltados:  ${skip}`);
  console.log(`❌ Errores:   ${errors}`);
  console.log('━'.repeat(50));
  if (!DRY_RUN) {
    console.log('\n✨ Migración completada. Verificá en phpMyAdmin o MySQL Workbench.');
    console.log('   Los JSON originales permanecen intactos como backup.\n');
  }
}

migrate().catch(err => {
  console.error('\n❌ Error fatal en migración:', err.message);
  process.exit(1);
});
