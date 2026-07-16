'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { query } = require('./db');
const sessionMiddleware = require('./lib/session');
const { requireAdminSession, requireDeviceKey } = require('./middleware/auth');
const adminRoutes = require('./routes/admin');
const portalRoutes = require('./routes/portal');
const contactRoutes = require('./routes/contact');
const devicesRoutes = require('./routes/devices');
const telemetryRoutes = require('./routes/telemetry');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',').map(s => s.trim()).filter(Boolean);

// ── Security headers ──
app.use(helmet());

// ── Rate limiting global ──
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones. Intentá de nuevo en 15 minutos.' }
});
app.use(globalLimiter);

// ── Rate limiting login (más estricto) ──
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5, // 5 intentos por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Esperá 15 minutos.' }
});

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS: origen no permitido'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(sessionMiddleware);

// Rate limiting formulario de contacto público (sin sesión — expuesto a internet)
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Demasiados envíos. Probá de nuevo más tarde.' }
});

// Rate limiting telemetría del agente — alto volumen, sin sesión, auth por API key
const telemetryLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 4, // un agente reporta cada ~15-30s
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Demasiados reportes de telemetría.' }
});

app.use('/api/admin', (req, res, next) => {
  if (req.path === '/login' && req.method === 'POST') return loginLimiter(req, res, next);
  next();
}, adminRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/contact', contactLimiter, contactRoutes);
app.use('/api/devices', requireAdminSession, devicesRoutes);
app.use('/api/telemetry', telemetryLimiter, requireDeviceKey, telemetryRoutes);

app.get('/api/leads', requireAdminSession, async (req, res) => {
  try {
    const leads = await query('SELECT * FROM leads ORDER BY created_at DESC');
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: 'Error consultando leads' });
  }
});

app.get('/api/leads/:id', requireAdminSession, async (req, res) => {
  try {
    const leads = await query('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    if (!leads.length) return res.status(404).json({ error: 'Lead no encontrado' });
    res.json(leads[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error consultando lead' });
  }
});

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
