'use strict';

function requireAdminSession(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ success: false, error: 'No autenticado' });
}

function requirePortalSession(req, res, next) {
  if (req.session && req.session.portalUser) return next();
  return res.status(401).json({ success: false, error: 'No autenticado' });
}

module.exports = { requireAdminSession, requirePortalSession };
