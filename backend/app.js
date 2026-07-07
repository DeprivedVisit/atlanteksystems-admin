'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { query } = require('./db');
const sessionMiddleware = require('./lib/session');
const { requireAdminSession } = require('./middleware/auth');
const adminRoutes = require('./routes/admin');
const portalRoutes = require('./routes/portal');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS: origen no permitido'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(sessionMiddleware);

app.use('/api/admin', adminRoutes);
app.use('/api/portal', portalRoutes);

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
