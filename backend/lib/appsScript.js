'use strict';

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

async function callAppsScript({ method = 'GET', params = {}, body = null }) {
  const url = new URL(APPS_SCRIPT_URL);
  if (method === 'GET') {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }
  const res = await fetch(url.toString(), {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { success: false, error: 'Respuesta inválida de Apps Script' };
  }
}

module.exports = { callAppsScript };
