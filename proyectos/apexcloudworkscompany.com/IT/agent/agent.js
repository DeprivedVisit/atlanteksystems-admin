'use strict';
require('dotenv').config();

const si = require('systeminformation');

const API_URL = process.env.API_URL;
const DEVICE_API_KEY = process.env.DEVICE_API_KEY;
const INTERVAL_MS = parseInt(process.env.REPORT_INTERVAL_MS || '20000');

if (!API_URL || !DEVICE_API_KEY) {
  console.error('Falta API_URL o DEVICE_API_KEY en .env');
  process.exit(1);
}

async function collectAndReport() {
  try {
    const [cpu, disks, time] = await Promise.all([
      si.currentLoad(),
      si.fsSize(),
      si.time(),
    ]);

    const cpu_pct = Math.round(cpu.currentLoad * 100) / 100;
    const disk_pct = disks.length
      ? Math.round((disks.reduce((sum, d) => sum + d.use, 0) / disks.length) * 100) / 100
      : 0;
    const uptime_s = Math.round(time.uptime);

    const res = await fetch(`${API_URL}/api/telemetry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Key': DEVICE_API_KEY,
      },
      body: JSON.stringify({ cpu_pct, disk_pct, uptime_s }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[telemetry] ${res.status}:`, body);
    } else {
      console.log(`[telemetry] cpu=${cpu_pct}% disk=${disk_pct}% uptime=${uptime_s}s`);
    }
  } catch (err) {
    console.error('[telemetry] error:', err.message);
  }
}

collectAndReport();
setInterval(collectAndReport, INTERVAL_MS);
