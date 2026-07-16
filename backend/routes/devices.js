'use strict';

const crypto = require('crypto');
const router = require('express').Router();
const { query, insert } = require('../db');

// GET /api/devices — listar todos los dispositivos
router.get('/', async (req, res) => {
  try {
    const devices = await query(
      `SELECT id, ext_id, name, hostname, owner_user_id, status, last_seen_at, created_at
       FROM devices ORDER BY created_at DESC`
    );
    res.json(devices);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error consultando dispositivos' });
  }
});

// GET /api/devices/:id — detalle + últimas 50 métricas
router.get('/:id', async (req, res) => {
  try {
    const devices = await query(
      `SELECT id, ext_id, name, hostname, owner_user_id, status, last_seen_at, created_at
       FROM devices WHERE id = ?`,
      [req.params.id]
    );
    if (!devices.length) return res.status(404).json({ success: false, error: 'Dispositivo no encontrado' });

    const metrics = await query(
      `SELECT cpu_pct, disk_pct, uptime_s, recorded_at
       FROM device_metrics WHERE device_id = ?
       ORDER BY recorded_at DESC LIMIT 50`,
      [req.params.id]
    );
    res.json({ ...devices[0], metrics: metrics.reverse() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error consultando dispositivo' });
  }
});

// POST /api/devices — registrar dispositivo nuevo, devuelve api_key (solo se muestra una vez)
router.post('/', async (req, res) => {
  const { name, hostname } = req.body || {};
  if (!name) return res.status(400).json({ success: false, error: 'Nombre es obligatorio' });

  const extId = `DEV-${Date.now()}`;
  const apiKey = crypto.randomBytes(32).toString('hex');

  try {
    const id = await insert(
      `INSERT INTO devices (ext_id, name, hostname, api_key) VALUES (?, ?, ?, ?)`,
      [extId, name, hostname || null, apiKey]
    );
    res.status(201).json({ success: true, id, ext_id: extId, api_key: apiKey });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error registrando dispositivo' });
  }
});

module.exports = router;
