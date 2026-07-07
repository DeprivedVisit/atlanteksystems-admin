'use strict';

const router = require('express').Router();
const crypto = require('crypto');
const { requirePortalSession } = require('../middleware/auth');
const { callAppsScript } = require('../lib/appsScript');

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ success: false, error: 'Credenciales incompletas' });

  const hash = crypto.createHash('sha256')
    .update(`${email.toLowerCase().trim()}:${password}`)
    .digest('hex');

  const data = await callAppsScript({
    method: 'GET',
    params: { accion: 'login', email: email.trim(), hash },
  });

  if (!data.success) return res.status(401).json(data);

  req.session.portalUser = { token: data.token, nombre: data.nombre, tipo: data.tipo, email: data.email };
  res.json({ success: true, nombre: data.nombre, tipo: data.tipo, email: data.email });
});

router.post('/logout', (req, res) => {
  req.session.portalUser = null;
  res.json({ success: true });
});

router.get('/me', (req, res) => {
  if (!req.session.portalUser) return res.status(401).json({ success: false });
  const { nombre, tipo, email } = req.session.portalUser;
  res.json({ success: true, nombre, tipo, email });
});

router.all('/gs', requirePortalSession, async (req, res) => {
  const method = req.method === 'POST' ? 'POST' : 'GET';

  const params = { ...req.query };
  delete params.token;
  params.token = req.session.portalUser.token;

  let body = null;
  if (method === 'POST') {
    body = { ...(req.body || {}) };
    delete body.token;
    body.token = req.session.portalUser.token;
  }

  const data = await callAppsScript({ method, params, body });
  if (data && data.error && /inv[aá]lida/i.test(data.error)) req.session.portalUser = null;
  res.json(data);
});

module.exports = router;
