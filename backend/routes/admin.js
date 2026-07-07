'use strict';

const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { requireAdminSession } = require('../middleware/auth');
const { callAppsScript } = require('../lib/appsScript');
const { query } = require('../db');

router.post('/login', async (req, res) => {
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ success: false, error: 'Falta contraseña' });

  const ok = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH || '');
  if (!ok) return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });

  req.session.isAdmin = true;
  res.json({ success: true });
});

router.post('/logout', (req, res) => {
  req.session.isAdmin = false;
  res.json({ success: true });
});

router.get('/me', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// Proxy genérico — cubre todas las acciones de admin.js sin mapear una por una
router.all('/gs', requireAdminSession, async (req, res) => {
  const method = req.method === 'POST' ? 'POST' : 'GET';

  const params = { ...req.query };
  delete params.adminToken;
  params.adminToken = process.env.APPS_SCRIPT_ADMIN_TOKEN;

  let body = null;
  if (method === 'POST') {
    body = { ...(req.body || {}) };
    delete body.adminToken;
    body.adminToken = process.env.APPS_SCRIPT_ADMIN_TOKEN;
  }

  const data = await callAppsScript({ method, params, body });
  res.json(data);
});

// ── Testimonios — moderación (pendientes primero) ──
router.get('/testimonios', requireAdminSession, async (req, res) => {
  try {
    const rows = await query(`
      SELECT t.id, t.rating, t.text, t.company, t.approved, t.created_at,
             u.name AS user_name, u.email AS user_email
      FROM testimonios t
      JOIN users u ON u.id = t.user_id
      ORDER BY t.approved ASC, t.created_at DESC
    `);
    res.json({ success: true, testimonios: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error consultando testimonios' });
  }
});

router.patch('/testimonios/:id', requireAdminSession, async (req, res) => {
  const { approved } = req.body || {};
  if (typeof approved !== 'boolean') {
    return res.status(400).json({ success: false, error: 'Falta approved (boolean)' });
  }
  try {
    await query('UPDATE testimonios SET approved = ? WHERE id = ?', [approved ? 1 : 0, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error actualizando testimonio' });
  }
});

// ── Métricas reales (MySQL) — reemplaza el cálculo client-side sobre Sheets ──
router.get('/metrics', requireAdminSession, async (req, res) => {
  try {
    const [leadsResumen, ingresosMensuales, clientesActivos, horasUltimos7Dias] = await Promise.all([
      query('SELECT * FROM v_leads_resumen ORDER BY created_at DESC LIMIT 200'),
      query('SELECT * FROM v_ingresos_mensuales'),
      query('SELECT * FROM v_clientes_activos'),
      query(`
        SELECT DATE_FORMAT(work_date, '%Y-%m-%d') AS work_date, SUM(hours) AS hours
        FROM horas
        WHERE work_date >= (CURDATE() - INTERVAL 6 DAY)
        GROUP BY work_date
        ORDER BY work_date ASC
      `),
    ]);
    res.json({ success: true, leadsResumen, ingresosMensuales, clientesActivos, horasUltimos7Dias });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error consultando métricas' });
  }
});

// ── Tablero financiero (Plan Maestro v2, Sección 6) ──
// Solo cubre lo que hoy es calculable desde MySQL: MRR (heurística sobre
// pagos.service, no hay columna "recurrente" todavía), facturado del mes,
// concentración de cliente y cuentas por cobrar vencidas. "Utilidad real"
// necesita una tabla de gastos que no existe, y "Fondo de emergencia" depende
// del saldo bancario real — ninguno de los dos se inventa acá, quedan como
// campos manuales del lado del frontend.
router.get('/tablero', requireAdminSession, async (req, res) => {
  try {
    const [mrrRows, facturadoRows, concentracionRows, porCobrarRows] = await Promise.all([
      query(`
        SELECT SUM(amount) AS total
        FROM pagos
        WHERE status = 'Confirmado'
          AND (service LIKE '%mantenimiento%' OR service LIKE '%trimestral%')
          AND paid_at >= (CURDATE() - INTERVAL 3 MONTH)
      `),
      query(`
        SELECT SUM(amount) AS total
        FROM pagos
        WHERE paid_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
      `),
      query(`
        SELECT name, email, SUM(amount) AS total
        FROM pagos
        WHERE status = 'Confirmado'
        GROUP BY name, email
        ORDER BY total DESC
        LIMIT 1
      `),
      query(`
        SELECT name, email, amount, DATEDIFF(CURDATE(), paid_at) AS dias_atraso
        FROM pagos
        WHERE status = 'Registrado'
        ORDER BY paid_at ASC
      `),
    ]);

    const mrr = (Number(mrrRows[0]?.total) || 0) / 3;
    const facturadoMes = Number(facturadoRows[0]?.total) || 0;

    const totalConfirmado = await query(`SELECT SUM(amount) AS total FROM pagos WHERE status = 'Confirmado'`);
    const totalGeneral = Number(totalConfirmado[0]?.total) || 0;
    const topCliente = concentracionRows[0] || null;
    const concentracionPct = topCliente && totalGeneral > 0
      ? Math.round((Number(topCliente.total) / totalGeneral) * 100)
      : 0;

    const cuentasPorCobrar = {
      total: porCobrarRows.reduce((a, r) => a + (Number(r.amount) || 0), 0),
      maxDiasAtraso: porCobrarRows.length ? Math.max(...porCobrarRows.map(r => r.dias_atraso)) : 0,
      items: porCobrarRows,
    };

    res.json({
      success: true,
      mrr,
      facturadoMes,
      concentracion: { cliente: topCliente?.name || null, porcentaje: concentracionPct },
      cuentasPorCobrar,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error consultando tablero financiero' });
  }
});

// ── Contratos firmados — trazabilidad legal básica ──
router.get('/contratos', requireAdminSession, async (req, res) => {
  try {
    const rows = await query(`
      SELECT c.id, c.ip, c.signed_at,
             u.name AS user_name, u.email AS user_email,
             l.name AS lead_name, l.service AS lead_service
      FROM contratos c
      JOIN users u ON u.id = c.user_id
      JOIN leads l ON l.id = c.lead_id
      ORDER BY c.signed_at DESC
    `);
    res.json({ success: true, contratos: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error consultando contratos' });
  }
});

module.exports = router;
