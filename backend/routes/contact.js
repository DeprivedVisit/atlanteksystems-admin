'use strict';

const router = require('express').Router();

router.post('/', async (req, res) => {
  const { nombre, contacto, servicio, mensaje } = req.body || {};

  if (!nombre || !contacto) {
    return res.status(400).json({ success: false, error: 'Nombre y contacto son obligatorios' });
  }
  const esEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto);
  const esTelefono = String(contacto).replace(/\D/g, '').length >= 8;
  if (!esEmail && !esTelefono) {
    return res.status(400).json({ success: false, error: 'Contacto inválido' });
  }

  const url = process.env.CONTACT_APPS_SCRIPT_URL;
  if (!url) return res.status(500).json({ success: false, error: 'Formulario no configurado' });

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, contacto, servicio, mensaje }),
    });
    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, error: 'Respuesta inválida de Apps Script' };
    }
    res.json(data);
  } catch (err) {
    res.status(502).json({ success: false, error: 'Error contactando el formulario' });
  }
});

module.exports = router;
