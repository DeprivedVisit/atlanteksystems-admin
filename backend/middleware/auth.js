'use strict';

const { query } = require('../db');

function requireAdminSession(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ success: false, error: 'No autenticado' });
}

function requirePortalSession(req, res, next) {
  if (req.session && req.session.portalUser) return next();
  return res.status(401).json({ success: false, error: 'No autenticado' });
}

async function requireDeviceKey(req, res, next) {
  const apiKey = req.get('X-Device-Key');
  if (!apiKey) return res.status(401).json({ success: false, error: 'Falta X-Device-Key' });

  try {
    const rows = await query('SELECT id FROM devices WHERE api_key = ?', [apiKey]);
    if (!rows.length) return res.status(401).json({ success: false, error: 'API key inválida' });
    req.deviceId = rows[0].id;
    next();
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error validando dispositivo' });
  }
}

module.exports = { requireAdminSession, requirePortalSession, requireDeviceKey };
