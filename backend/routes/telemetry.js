'use strict';

const router = require('express').Router();
const { query, insert } = require('../db');

// POST /api/telemetry — el agente reporta métricas (auth por X-Device-Key, ver requireDeviceKey)
router.post('/', async (req, res) => {
  const { cpu_pct, disk_pct, uptime_s } = req.body || {};

  if (
    typeof cpu_pct !== 'number' || cpu_pct < 0 || cpu_pct > 100 ||
    typeof disk_pct !== 'number' || disk_pct < 0 || disk_pct > 100 ||
    typeof uptime_s !== 'number' || uptime_s < 0
  ) {
    return res.status(400).json({ success: false, error: 'Métricas inválidas' });
  }

  try {
    await insert(
      `INSERT INTO device_metrics (device_id, cpu_pct, disk_pct, uptime_s) VALUES (?, ?, ?, ?)`,
      [req.deviceId, cpu_pct, disk_pct, uptime_s]
    );
    await query(
      `UPDATE devices SET status = 'online', last_seen_at = NOW() WHERE id = ?`,
      [req.deviceId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error guardando telemetría' });
  }
});

module.exports = router;
