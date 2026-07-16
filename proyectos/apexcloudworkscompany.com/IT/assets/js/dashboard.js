'use strict';

const API_BASE = window.APEX_API_BASE || '';

// mismo helper de escape que assets/js/admin.js
const h = str => String(str ?? '')
  .replace(/&/g,'&amp;')
  .replace(/</g,'&lt;')
  .replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;')
  .replace(/'/g,'&#39;');

// misma función que assets/js/admin.js — sparkline mini SVG
function sparklineSVG(points, color) {
  if (!points.length) return '';
  const w = 80, h2 = 32;
  const max = Math.max(...points, 1);
  const n   = points.length;
  const xs  = points.map((_, i) => ((i / Math.max(n - 1, 1)) * (w - 4) + 2).toFixed(1));
  const ys  = points.map(p => (h2 - 4 - (p / max) * (h2 - 8) + 2).toFixed(1));
  const pts = xs.map((x, i) => `${x},${ys[i]}`).join(' ');
  const last = { x: xs[n - 1], y: ys[n - 1] };
  return `<svg viewBox="0 0 ${w} ${h2}" width="${w}" height="${h2}">
    <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
    <circle cx="${last.x}" cy="${last.y}" r="2.5" fill="${color}"/>
  </svg>`;
}

async function apiFetchDirect(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include', ...options });
  if (res.status === 401) {
    window.location.href = '../admin.html';
    throw new Error('No autenticado');
  }
  return res.json();
}

function isOnline(device) {
  if (!device.last_seen_at) return false;
  const last = new Date(device.last_seen_at).getTime();
  return Date.now() - last < 90 * 1000; // sin reporte en 90s = offline
}

function renderDevice(device, metrics) {
  const online = isOnline(device);
  const cpuPoints = metrics.map(m => Number(m.cpu_pct));
  const diskPoints = metrics.map(m => Number(m.disk_pct));

  return `
    <div class="rmm-card">
      <div class="rmm-card-head">
        <span class="rmm-card-name">${h(device.name)}</span>
        <span class="rmm-dot ${online ? 'online' : 'offline'}" title="${online ? 'Online' : 'Offline'}"></span>
      </div>
      <p class="rmm-card-host">${h(device.hostname || 'sin hostname')}</p>
      <div class="rmm-metrics">
        <div class="rmm-metric">
          <div class="rmm-metric-label">CPU ${cpuPoints.length ? cpuPoints[cpuPoints.length - 1] + '%' : '—'}</div>
          ${sparklineSVG(cpuPoints, '#C4956A')}
        </div>
        <div class="rmm-metric">
          <div class="rmm-metric-label">Disco ${diskPoints.length ? diskPoints[diskPoints.length - 1] + '%' : '—'}</div>
          ${sparklineSVG(diskPoints, '#60A5FA')}
        </div>
      </div>
    </div>
  `;
}

async function loadDevices() {
  const grid = document.getElementById('rmm-devices');
  const alertBox = document.getElementById('rmm-alert-box');
  try {
    const devices = await apiFetchDirect('/api/devices');
    if (!devices.length) {
      grid.innerHTML = '<p class="rmm-empty">Sin dispositivos registrados todavía.</p>';
      return;
    }

    const details = await Promise.all(
      devices.map(d => apiFetchDirect(`/api/devices/${d.id}`))
    );

    grid.innerHTML = details.map(d => renderDevice(d, d.metrics || [])).join('');
  } catch (err) {
    alertBox.innerHTML = `<div class="rmm-alert">Error cargando dispositivos: ${h(err.message)}</div>`;
  }
}

async function registrarDispositivo() {
  const name = prompt('Nombre del dispositivo:');
  if (!name) return;
  const hostname = prompt('Hostname (opcional):') || '';

  const res = await apiFetchDirect('/api/devices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, hostname }),
  });

  if (res.success) {
    alert(`Dispositivo registrado.\n\nAPI Key (guardala, no se vuelve a mostrar):\n${res.api_key}`);
    loadDevices();
  } else {
    alert(`Error: ${res.error}`);
  }
}

document.getElementById('btn-nuevo').addEventListener('click', registrarDispositivo);
document.getElementById('btn-refrescar').addEventListener('click', loadDevices);

loadDevices();
setInterval(loadDevices, 15000);
