/* ── Apex Admin — UI Logic · Secured ── */

// ── SECURITY: HTML escape ──
const h = str => String(str ?? '')
  .replace(/&/g,'&amp;')
  .replace(/</g,'&lt;')
  .replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;')
  .replace(/'/g,'&#39;');

// ── CONFIG ──
const API_BASE = window.APEX_API_BASE || '';
const PORTAL_AS_URL = `${API_BASE}/api/admin/gs`;
// _t eliminado — el backend sobrescribe adminToken via session. Los call sites que lo mandan son ignorados.
const _t = null;

const _nativeFetch = window.fetch.bind(window);
window.fetch = (input, init = {}) => _nativeFetch(input, { ...init, credentials: 'include' });

// ── LIVE DATA CACHE ──
const LIVE = { proyectos: [], leads: [], tickets: [], finanzas: [], testimonios: [], loaded: false };

// ── VIEW STATE ──
let leadsFilter   = 'all';
let proyectosView = 'tabla';

// ── SIDEBAR ──
function toggleSidebar() {
  const collapsed = document.body.classList.toggle('sb-collapsed');
  localStorage.setItem('apex_sb', collapsed ? '1' : '0');
  const btn = document.getElementById('sb-toggle');
  if (btn) btn.setAttribute('aria-expanded', String(!collapsed));
}
if (localStorage.getItem('apex_sb') === '1') {
  document.body.classList.add('sb-collapsed');
  const btn = document.getElementById('sb-toggle');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

/* ── API HELPERS ── */
async function apiFetch(params) {
  const url = new URL(PORTAL_AS_URL, window.location.origin);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { credentials: 'include' });
  return res.json();
}

async function apiPost(body) {
  const res = await fetch(PORTAL_AS_URL, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(body),
  });
  return res.json();
}

/* Fetch directo a endpoints nuevos que NO pasan por el proxy /gs (testimonios, metrics) */
async function apiFetchDirect(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include', ...options });
  return res.json();
}

/* ── LOAD ALL ADMIN DATA ── */
async function fetchAdminData() {
  setLoadingState(true);
  try {
    const [rp, rl, rt, rf] = await Promise.all([
      apiFetch({ accion: 'adminProyectos',  adminToken: _t }),
      apiFetch({ accion: 'adminLeads',      adminToken: _t }),
      apiFetch({ accion: 'adminTicketsInt', adminToken: _t }),
      apiFetch({ accion: 'adminFinanzas',   adminToken: _t }),
    ]);
    if (rp.success) LIVE.proyectos = rp.proyectos || [];
    if (rl.success) LIVE.leads     = rl.leads     || [];
    if (rt.success) LIVE.tickets   = rt.tickets   || [];
    if (rf.success) LIVE.finanzas  = rf.finanzas  || [];
    LIVE.loaded = true;
    _lastSync = new Date();
  } catch (err) {
  }
  setLoadingState(false);
}

function setLoadingState(loading) {
  const tabs = document.querySelectorAll('.tb-tab');
  tabs.forEach(t => { t.style.opacity = loading ? '0.5' : '1'; });
}

/* ── HELPERS ── */
function estadoBadge(estado) {
  const map = {
    live:      '<span class="badge badge-live">Live</span>',
    dev:       '<span class="badge badge-dev">Desarrollo</span>',
    pending:   '<span class="badge badge-pending">Pendiente</span>',
    paused:    '<span class="badge badge-pending">Pausado</span>',
    open:      '<span class="badge badge-open">Abierto</span>',
    closed:    '<span class="badge badge-closed">Cerrado</span>',
    new:       '<span class="badge badge-new">Nuevo</span>',
    contacted: '<span class="badge badge-dev">Contactado</span>',
    abierto:   '<span class="badge badge-open">Abierto</span>',
    respondido:'<span class="badge badge-closed">Respondido</span>',
  };
  return map[estado] || `<span class="badge">${h(estado)}</span>`;
}

function prioridadBadge(p) {
  if (p === 'alta' || p === 'urgente') return '<span class="badge badge-hot">Alta</span>';
  return '<span class="badge badge-closed">Normal</span>';
}

function formatDate(d) {
  if (!d || d === 'TBD') return '—';
  const str = String(d);
  if (str.includes('/')) return str;
  return new Date(str + 'T00:00:00').toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* Para DATETIME de MySQL — mysql2 los devuelve como Date real, no como string de Sheets */
function formatDateSQL(d) {
  if (!d) return '—';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function emptyState(icon, text) {
  return `<div class="empty-state"><div class="empty-icon">${icon}</div><p class="empty-text">${text}</p></div>`;
}

/* ── DASHBOARD ── */

let _autoRefreshTimer = null;
let _metaMensual = Number(localStorage.getItem('apex_meta_mensual')) || 500;
let _lastSync = null;

function renderDashboard() {
  const activos     = LIVE.proyectos.filter(p => p.estado === 'live' || p.estado === 'dev').length;
  const openTickets = LIVE.tickets.filter(t => t.estado === 'open').length;
  const urgentes    = LIVE.tickets.filter(t => t.estado === 'open' && (t.prioridad === 'alta' || t.prioridad === 'urgente')).length;
  const newLeads    = LIVE.leads.filter(l => l.estado === 'new').length;
  const totalLeads  = LIVE.leads.length;
  const cobrado     = LIVE.finanzas.filter(f => f.estado === 'pagado').reduce((a, f) => a + (Number(f.monto) || 0), 0);
  const pendiente   = LIVE.finanzas.filter(f => f.estado === 'pendiente').reduce((a, f) => a + (Number(f.monto) || 0), 0);

  // Métricas
  document.getElementById('m-proyectos').textContent    = activos;
  document.getElementById('m-proyectos-sub').textContent = `${LIVE.proyectos.filter(p => p.estado === 'pending').length} pendientes`;
  document.getElementById('m-tickets').textContent      = openTickets;
  document.getElementById('m-tickets-sub').innerHTML    = urgentes > 0
    ? `<span class="urgent-pill">⚠ ${urgentes} urgente${urgentes > 1 ? 's' : ''}</span>`
    : 'Sin urgentes';
  document.getElementById('m-leads').textContent        = newLeads;
  document.getElementById('m-leads-sub').textContent    = `${totalLeads} total`;
  document.getElementById('m-ingresos').textContent     = `$${cobrado.toLocaleString()}`;
  document.getElementById('m-ingresos-sub').innerHTML   = pendiente > 0
    ? `<span style="color:var(--yellow)">$${pendiente.toLocaleString()} pendiente</span>`
    : 'Al día ✓';

  // Badges en tabs
  updateTabBadge('leads', newLeads);
  updateTabBadge('tickets', openTickets);

  // Revenue ring
  document.getElementById('dash-ring-body').innerHTML = buildRevenueRing(cobrado, pendiente);

  // Lead funnel
  document.getElementById('dash-funnel-body').innerHTML = buildLeadFunnel();

  // Próximas entregas
  document.getElementById('dash-entregas-body').innerHTML = buildProximasEntregas();

  // Progress groups (ingresos por mes)
  document.getElementById('dash-progress-groups').innerHTML = buildProgressGroups();

  // Sparklines — todos con datos reales (nada decorativo/inventado)
  document.getElementById('sp-proyectos').innerHTML = proyectosDistribucion();
  document.getElementById('sp-tickets').innerHTML   = sparklineSVG(ticketsLast7Days(), '#fbbf24');
  document.getElementById('sp-leads').innerHTML     = sparklineSVG(leadsLast7Days(),   '#C4956A');
  document.getElementById('sp-ingresos').innerHTML  = sparklineSVG(finanzas6Months(),  '#34d399');

  // Proyectos activos
  const actList = LIVE.proyectos.filter(p => p.estado === 'live' || p.estado === 'dev');
  document.getElementById('dash-proyectos').innerHTML = actList.length
    ? actList.slice(0, 5).map(p => `
      <div class="project-row">
        <span class="pr-emoji">${h(p.emoji || '📁')}</span>
        <div class="pr-info">
          <div class="pr-name">${h(p.nombre)}</div>
          <div class="pr-client">${h(p.cliente)}</div>
          <div class="progress-wrap">
            <div class="progress-bar"><div class="progress-fill" style="width:${h(p.progreso || 0)}%"></div></div>
            <div class="progress-label"><span>${h(p.progreso || 0)}%</span><span>${h(formatDate(p.entrega))}</span></div>
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          ${estadoBadge(p.estado)}
          ${Number(p.valor) > 0 ? `<div class="pr-value" style="margin-top:6px">$${h(p.valor)}</div>` : ''}
        </div>
      </div>
    `).join('')
    : emptyState('📁', 'No hay proyectos activos');

  // Activity feed
  document.getElementById('dash-activity').innerHTML = buildActivityFeed();

  // Panel piloto — datos reales de MySQL, independiente de las tarjetas de arriba (Sheets)
  cargarMetricasMySQL();
  cargarTablero();
}

/* ── MÉTRICAS MYSQL — panel piloto, no reemplaza las tarjetas de Sheets ──
   Falla en silencio (deja "—") si el backend todavía no está deployado. */
async function cargarMetricasMySQL() {
  const elLeads = document.getElementById('mm-leads');
  const elIngresos = document.getElementById('mm-ingresos');
  const elClientes = document.getElementById('mm-clientes');
  const elHoras = document.getElementById('mm-horas');
  const elHorasSpark = document.getElementById('mm-horas-spark');
  if (!elLeads) return;

  try {
    const data = await apiFetchDirect('/api/admin/metrics');
    if (!data.success) return;
    elLeads.textContent = data.leadsResumen.length;
    const totalIngresos = data.ingresosMensuales.reduce((a, m) => a + (Number(m.total) || 0), 0);
    elIngresos.textContent = `$${totalIngresos.toLocaleString()}`;
    elClientes.textContent = data.clientesActivos.length;

    // Horas — completar los 7 días aunque el backend solo devuelva los días con registro
    const porDia = {};
    (data.horasUltimos7Dias || []).forEach(r => { porDia[String(r.work_date).slice(0, 10)] = Number(r.hours) || 0; });
    const hoy = new Date();
    const serie = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(hoy);
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      return porDia[key] || 0;
    });
    elHoras.textContent = serie.reduce((a, v) => a + v, 0).toFixed(1);
    if (elHorasSpark) elHorasSpark.innerHTML = sparklineSVG(serie, '#60A5FA');
  } catch (err) {
    // backend MySQL no disponible todavía — se queda en "—", no es un error visible
  }
}

/* ── TABLERO FINANCIERO — Plan Maestro v2 Sección 6 ──
   4 indicadores reales (MySQL) + 2 manuales guardados en localStorage
   (utilidad real y fondo de emergencia no tienen tabla que los respalde). */
async function cargarTablero() {
  const elMrr = document.getElementById('tb-mrr');
  if (!elMrr) return;

  // Campos manuales — cargar de localStorage y guardar al editar (listener una sola vez)
  const utilidadInput = document.getElementById('tb-utilidad-input');
  const fondoInput = document.getElementById('tb-fondo-input');
  utilidadInput.value = localStorage.getItem('apex_tablero_utilidad') || '';
  fondoInput.value = localStorage.getItem('apex_tablero_fondo') || '';
  if (!utilidadInput.dataset.bound) {
    utilidadInput.dataset.bound = '1';
    utilidadInput.addEventListener('change', () => localStorage.setItem('apex_tablero_utilidad', utilidadInput.value));
    fondoInput.dataset.bound = '1';
    fondoInput.addEventListener('change', () => localStorage.setItem('apex_tablero_fondo', fondoInput.value));
  }

  try {
    const data = await apiFetchDirect('/api/admin/tablero');
    if (!data.success) return;

    const setSemaforo = (id, isGreen) => {
      const el = document.getElementById(id);
      el.classList.remove('is-green', 'is-red');
      el.classList.add(isGreen ? 'is-green' : 'is-red');
    };

    document.getElementById('tb-mrr').textContent = `$${Math.round(data.mrr).toLocaleString()}`;

    const facturado = data.facturadoMes;
    document.getElementById('tb-facturado').textContent = `$${facturado.toLocaleString()}`;
    setSemaforo('tb-facturado-tile', facturado >= 700);

    const pct = data.concentracion.porcentaje;
    document.getElementById('tb-concentracion').textContent = data.concentracion.cliente ? `${pct}%` : '—';
    document.getElementById('tb-concentracion-sub').textContent = data.concentracion.cliente
      ? `${h(data.concentracion.cliente)} · rojo si > 40%`
      : 'rojo si un cliente > 40%';
    setSemaforo('tb-concentracion-tile', pct <= 40);

    const cxc = data.cuentasPorCobrar;
    document.getElementById('tb-cobrar').textContent = `$${cxc.total.toLocaleString()}`;
    document.getElementById('tb-cobrar-sub').textContent = cxc.items.length
      ? `${cxc.items.length} pendiente${cxc.items.length > 1 ? 's' : ''} · máx ${cxc.maxDiasAtraso}d`
      : 'sin pendientes';
    setSemaforo('tb-cobrar-tile', cxc.maxDiasAtraso <= 15);
  } catch (err) {
    // backend MySQL no disponible todavía — se queda en "—"
  }
}

/* ── REVENUE RING (SVG donut) ── */
function buildRevenueRing(cobrado, pendiente) {
  const meta  = _metaMensual;
  const pct   = meta > 0 ? Math.min(cobrado / meta, 1) : 0;
  const r     = 56;
  const circ  = 2 * Math.PI * r;
  const dash  = pct * circ;
  const color = pct >= 1 ? '#34d399' : pct >= 0.6 ? '#C4956A' : pct >= 0.3 ? '#fbbf24' : '#f87171';
  const pctLabel = meta > 0 ? Math.round(pct * 100) + '%' : '—';

  return `
    <div class="ring-wrap">
      <svg viewBox="0 0 130 130" class="ring-svg">
        <circle cx="65" cy="65" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="14"/>
        <circle cx="65" cy="65" r="${r}" fill="none" stroke="${color}" stroke-width="14"
          stroke-dasharray="${dash.toFixed(1)} ${circ.toFixed(1)}"
          stroke-dashoffset="${(circ / 4).toFixed(1)}"
          stroke-linecap="round" class="ring-arc"/>
        <text x="65" y="58" text-anchor="middle" fill="${color}" font-size="18" font-weight="400" font-family="Anton,sans-serif">${pctLabel}</text>
        <text x="65" y="74" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="9" font-family="JetBrains Mono,monospace">$${cobrado} / $${meta}</text>
        <text x="65" y="86" text-anchor="middle" fill="rgba(255,255,255,0.25)" font-size="8" font-family="JetBrains Mono,monospace">meta mensual</text>
      </svg>
      <div class="ring-stats">
        <div class="ring-stat"><span class="rs-dot" style="background:#34d399"></span><span class="rs-label">Cobrado</span><span class="rs-val" style="color:#34d399">$${cobrado.toLocaleString()}</span></div>
        <div class="ring-stat"><span class="rs-dot" style="background:#fbbf24"></span><span class="rs-label">Pendiente</span><span class="rs-val" style="color:#fbbf24">$${pendiente.toLocaleString()}</span></div>
        <div class="ring-stat"><span class="rs-dot" style="background:rgba(255,255,255,0.2)"></span><span class="rs-label">Falta</span><span class="rs-val">$${Math.max(0, meta - cobrado).toLocaleString()}</span></div>
      </div>
    </div>
  `;
}

function editMetaMensual() {
  const val = prompt('Meta mensual en USD (actual: $' + _metaMensual + '):', _metaMensual);
  if (val !== null && !isNaN(Number(val)) && Number(val) > 0) {
    _metaMensual = Number(val);
    localStorage.setItem('apex_meta_mensual', _metaMensual);
    renderDashboard();
  }
}

/* ── LEAD FUNNEL ── */
function buildLeadFunnel() {
  const total     = LIVE.leads.length;
  const newC      = LIVE.leads.filter(l => l.estado === 'new').length;
  const contacted = LIVE.leads.filter(l => l.estado === 'contacted').length;
  const closed    = LIVE.leads.filter(l => l.estado === 'closed').length;

  const stages = [
    { key: 'new',       label: 'Nuevos',      count: newC,      color: '#60a5fa', width: 100 },
    { key: 'contacted', label: 'Contactados', count: contacted, color: '#C4956A', width: 72  },
    { key: 'closed',    label: 'Cerrados',    count: closed,    color: '#34d399', width: 48  },
  ];

  const conv = newC > 0 ? ((closed / newC) * 100).toFixed(0) : 0;

  return `
    <div class="funnel-wrap">
      ${stages.map((s, i) => `
        <div class="funnel-stage" style="width:${s.width}%;border-color:${s.color}20;background:${s.color}08;"
          onclick="setLeadsFilter('${s.key}')">
          <span class="funnel-count" style="color:${s.color}">${s.count}</span>
          <span class="funnel-label">${s.label}</span>
          ${i < stages.length - 1 ? `<span class="funnel-arrow">↓</span>` : ''}
        </div>
      `).join('')}
      <div class="funnel-conversion">
        Conversión total: <strong style="color:#34d399">${conv}%</strong>
        <span style="color:var(--text3);margin-left:6px">${total} leads totales</span>
      </div>
    </div>
  `;
}

function setLeadsFilter(filter) {
  leadsFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === filter);
  });
  switchTab('leads');
}

/* ── PRÓXIMAS ENTREGAS ── */
function buildProximasEntregas() {
  const hoy = new Date();
  const conFecha = LIVE.proyectos
    .filter(p => p.entrega && p.entrega !== 'TBD' && p.entrega !== '' && p.estado !== 'live')
    .map(p => {
      const fecha = new Date(String(p.entrega).includes('/')
        ? p.entrega.split('/').reverse().join('-')
        : p.entrega + 'T00:00:00');
      const dias = Math.ceil((fecha - hoy) / 86400000);
      return { ...p, dias };
    })
    .sort((a, b) => a.dias - b.dias)
    .slice(0, 5);

  if (!conFecha.length) return `<div style="padding:20px;text-align:center;color:var(--text3);font-size:13px">Sin fechas de entrega definidas</div>`;

  return conFecha.map(p => {
    const color = p.dias < 0 ? '#f87171' : p.dias < 7 ? '#f87171' : p.dias < 30 ? '#fbbf24' : '#34d399';
    const label = p.dias < 0 ? `${Math.abs(p.dias)}d vencido` : p.dias === 0 ? '¡Hoy!' : `en ${p.dias}d`;
    return `
      <div class="entrega-row">
        <span class="entrega-emoji">${h(p.emoji || '📁')}</span>
        <div class="entrega-info">
          <div class="entrega-nombre">${h(p.nombre)}</div>
          <div class="entrega-cliente">${h(p.cliente)}</div>
        </div>
        <div class="entrega-badge" style="color:${color};border-color:${color}55">${label}</div>
      </div>
    `;
  }).join('');
}

/* ── SPARKLINES ── */
function sparklineSVG(points, color) {
  const w = 80, h = 32;
  const max = Math.max(...points, 1);
  const n   = points.length;
  const xs  = points.map((_, i) => ((i / (n - 1)) * (w - 4) + 2).toFixed(1));
  const ys  = points.map(p => (h - 4 - (p / max) * (h - 8) + 2).toFixed(1));
  const pts = xs.map((x, i) => `${x},${ys[i]}`).join(' ');
  const last = { x: xs[n - 1], y: ys[n - 1] };
  return `<svg viewBox="0 0 ${w} ${h}" class="sparkline-svg" width="${w}" height="${h}">
    <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
    <circle cx="${last.x}" cy="${last.y}" r="2.5" fill="${color}"/>
  </svg>`;
}

function ticketsLast7Days() {
  const hoy = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(d.getDate() - (6 - i));
    const key = d.toLocaleDateString('es-CR');
    return LIVE.tickets.filter(t => t.fecha === key).length;
  });
}

/* Proyectos no tiene fecha de creación en el sheet — no hay forma honesta de
   armar un histórico de 7 días. En vez de inventar una tendencia, mostramos
   la distribución real de estados actuales (live/dev/pendiente-pausado). */
function proyectosDistribucion() {
  const live    = LIVE.proyectos.filter(p => p.estado === 'live').length;
  const dev     = LIVE.proyectos.filter(p => p.estado === 'dev').length;
  const otros   = LIVE.proyectos.filter(p => p.estado !== 'live' && p.estado !== 'dev').length;
  const total   = Math.max(live + dev + otros, 1);
  const seg = (n, color) => `<span style="flex:${n || 0.001};background:${color}"></span>`;
  return `<div class="mc-dist" title="Live ${live} · Desarrollo ${dev} · Otros ${otros}">
    ${seg(live, '#4ADE80')}${seg(dev, '#60A5FA')}${seg(otros, 'var(--text3)')}
  </div>`;
}

function leadsLast7Days() {
  const hoy = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(d.getDate() - (6 - i));
    const key = d.toLocaleDateString('es-CR');
    return LIVE.leads.filter(l => l.fecha === key).length;
  });
}

function finanzas6Months() {
  const ahora = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d   = new Date(ahora.getFullYear(), ahora.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return LIVE.finanzas
      .filter(f => f.estado === 'pagado' && String(f.fecha_pago || f.fecha_factura || '').substring(0, 7) === key)
      .reduce((a, f) => a + (Number(f.monto) || 0), 0);
  });
}

/* ── PROGRESS GROUPS (reemplaza income chart SVG) ── */
function buildProgressGroups() {
  const ahora = new Date();
  const meses = Array.from({ length: 6 }, (_, i) => {
    const d   = new Date(ahora.getFullYear(), ahora.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('es-CR', { month: 'short', year: '2-digit' }).toUpperCase();
    const cob = LIVE.finanzas
      .filter(f => f.estado === 'pagado' && String(f.fecha_pago || f.fecha_factura || '').substring(0, 7) === key)
      .reduce((a, f) => a + (Number(f.monto) || 0), 0);
    const pen = LIVE.finanzas
      .filter(f => f.estado !== 'pagado' && String(f.fecha_factura || '').substring(0, 7) === key)
      .reduce((a, f) => a + (Number(f.monto) || 0), 0);
    return { label, cob, pen, total: cob + pen };
  });

  const maxTotal = Math.max(...meses.map(m => m.total), _metaMensual, 1);

  return meses.map(m => `
    <div class="pg-group">
      <div class="pg-header">
        <span class="pg-month">${m.label}</span>
        <span class="pg-total">${m.total > 0 ? '$' + m.total.toLocaleString() : '—'}</span>
      </div>
      <div class="pg-bar">
        <div class="pg-bar-fill" style="width:${((m.cob / maxTotal) * 100).toFixed(1)}%;background:#34d399"></div>
      </div>
      <div class="pg-bar">
        <div class="pg-bar-fill" style="width:${((m.pen / maxTotal) * 100).toFixed(1)}%;background:#C4956A"></div>
      </div>
    </div>
  `).join('');
}

/* ── INCOME CHART (SVG) — mantenido, ahora reemplazado por Progress Groups ── */
function buildIncomeChart() {
  const meses = [];
  const ahora = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    meses.push({
      key:    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label:  d.toLocaleDateString('es-CR', { month: 'short' }).toUpperCase(),
      cob:    0,
      pen:    0,
    });
  }

  LIVE.finanzas.forEach(f => {
    const raw = String(f.fecha_factura || f.fecha_pago || '');
    let key = '';
    if (raw.includes('/') && raw.length >= 8) {
      const p = raw.split('/');
      key = `${p[2]}-${(p[1] || '').padStart(2, '0')}`;
    } else if (raw.includes('-') && raw.length >= 7) {
      key = raw.substring(0, 7);
    }
    const m = meses.find(x => x.key === key);
    if (m) {
      if (f.estado === 'pagado') m.cob += Number(f.monto) || 0;
      else m.pen += Number(f.monto) || 0;
    }
  });

  const maxVal = Math.max(...meses.map(m => m.cob + m.pen), _metaMensual, 1);
  const H = 100, bW = 22, gap = 14;
  const colW = bW * 2 + 6 + gap;
  const svgW = meses.length * colW + gap;

  const bars = meses.map((m, i) => {
    const x    = i * colW + gap;
    const cobH = (m.cob / maxVal) * H;
    const penH = (m.pen / maxVal) * H;
    const hasData = m.cob + m.pen > 0;
    return `
      <g>
        <rect x="${x}" y="${(H - cobH + 8).toFixed(1)}" width="${bW}" height="${cobH.toFixed(1)}" fill="#34d399" rx="3" opacity="0.85">
          <title>$${m.cob} cobrado — ${m.label}</title></rect>
        <rect x="${x + bW + 4}" y="${(H - penH + 8).toFixed(1)}" width="${bW}" height="${penH.toFixed(1)}" fill="#C4956A" rx="3" opacity="0.75">
          <title>$${m.pen} pendiente — ${m.label}</title></rect>
        ${hasData ? `<text x="${x + bW + 2}" y="${(H - Math.max(cobH, penH) + 4).toFixed(1)}" text-anchor="middle" fill="rgba(255,255,255,0.35)" font-size="7.5" font-family="JetBrains Mono">$${m.cob + m.pen}</text>` : ''}
        <text x="${x + bW + 2}" y="${H + 22}" text-anchor="middle" fill="rgba(255,255,255,0.35)" font-size="9" font-family="JetBrains Mono">${m.label}</text>
      </g>`;
  }).join('');

  // Meta line
  const metaY = (H - (_metaMensual / maxVal) * H + 8).toFixed(1);
  const metaLine = `
    <line x1="${gap}" y1="${metaY}" x2="${svgW - gap / 2}" y2="${metaY}" stroke="#C4956A" stroke-width="1" stroke-dasharray="4 3" opacity="0.4"/>
    <text x="${svgW - gap}" y="${Number(metaY) - 3}" text-anchor="end" fill="rgba(196,149,106,0.55)" font-size="8" font-family="JetBrains Mono">meta $${_metaMensual}</text>
  `;

  return `<svg viewBox="0 0 ${svgW} ${H + 32}" style="width:100%;height:${H + 32}px">${bars}${metaLine}</svg>`;
}

/* ── ACTIVITY FEED ── */
function buildActivityFeed() {
  const items = [];

  // Separar prefijo de nombre para poder escapar correctamente
  LIVE.leads.slice(0, 6).forEach(l => items.push({
    icon: '📬', color: 'var(--blue)',
    prefix: 'Lead', name: l.nombre || '?',
    sub:  l.servicio || '',
    fecha: l.fecha || '',
  }));

  LIVE.tickets.filter(t => t.estado === 'open').slice(0, 4).forEach(t => items.push({
    icon: '🎫', color: 'var(--yellow)',
    prefix: 'Ticket', name: t.proyecto || '?',
    sub:  (t.descripcion || '').slice(0, 48) + ((t.descripcion || '').length > 48 ? '…' : ''),
    fecha: t.fecha || '',
  }));

  LIVE.finanzas.slice(0, 3).forEach(f => items.push({
    icon: f.estado === 'pagado' ? '✅' : '⏳',
    color: f.estado === 'pagado' ? 'var(--green)' : 'var(--yellow)',
    prefix: `Cobro ${h(f.estado)}`, name: f.cliente || '?',
    sub:  f.proyecto || '',
    fecha: f.fecha_factura || f.fecha_pago || '',
  }));

  items.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));

  if (!items.length) return emptyState('📋', 'Sin actividad reciente');

  return items.slice(0, 10).map(item => `
    <div class="activity-item">
      <div class="activity-dot" style="background:${item.color}"></div>
      <div class="activity-content">
        <div class="activity-text">${h(item.prefix)} — <strong>${h(item.name)}</strong></div>
        <div class="activity-sub">${h(item.sub)}${item.fecha ? ' · ' + h(item.fecha) : ''}</div>
      </div>
    </div>
  `).join('');
}

/* ── AUTO-REFRESH + CLOCK ── */
function relativeSyncLabel() {
  if (!_lastSync) return 'sin datos aún';
  const secs = Math.floor((Date.now() - _lastSync.getTime()) / 1000);
  if (secs < 10)  return 'hace instantes';
  if (secs < 60)  return `hace ${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60)  return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  return `hace ${hrs}h`;
}

function startClock() {
  const el = document.getElementById('dash-clock');
  const syncEl = document.getElementById('dash-last-sync');
  if (!el) return;
  const tick = () => {
    el.textContent = new Date().toLocaleTimeString('es-CR', { timeZone: 'America/Costa_Rica', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (syncEl) syncEl.textContent = `Sync: ${relativeSyncLabel()}`;
  };
  tick();
  setInterval(tick, 1000);
}

function startAutoRefresh() {
  if (_autoRefreshTimer) clearInterval(_autoRefreshTimer);
  _autoRefreshTimer = setInterval(refreshDashboard, 5 * 60 * 1000);
}

async function refreshDashboard() {
  const badge = document.getElementById('dash-live');
  if (badge) { badge.textContent = '↻ Actualizando…'; badge.style.color = 'var(--yellow)'; }
  await fetchAdminData();
  renderDashboard();
  renderProyectos();
  renderTickets();
  renderLeads();
  renderFinanzas();
  if (badge) { badge.textContent = '● En vivo'; badge.style.color = ''; }
}

function updateTabBadge(tabName, count) {
  const badge = document.getElementById(`sb-badge-${tabName}`);
  if (!badge) return;
  if (count > 0) { badge.textContent = count; badge.style.display = 'flex'; }
  else           { badge.style.display = 'none'; }
  if (false) { // dead code kept for shape
  const btn = null;
  } // end dead code
}

/* ── RENDER PROYECTOS ── */
function renderProyectos() {
  document.getElementById('tbody-proyectos').innerHTML = LIVE.proyectos.length
    ? LIVE.proyectos.map(p => `
      <tr>
        <td><span style="font-size:18px;margin-right:8px">${h(p.emoji || '📁')}</span><strong>${h(p.nombre)}</strong></td>
        <td style="color:var(--text2)">${h(p.cliente)}</td>
        <td>${estadoBadge(p.estado)}</td>
        <td style="color:var(--gold2);font-family:'Inter',sans-serif;font-weight:700">${Number(p.valor) > 0 ? '$' + h(p.valor) : '—'}</td>
        <td style="color:var(--text2)">${h(formatDate(p.entrega))}</td>
        <td style="min-width:140px">
          <div class="progress-bar"><div class="progress-fill" style="width:${h(p.progreso || 0)}%"></div></div>
          <div style="font-size:9px;color:var(--text2);margin-top:3px">${h(p.progreso || 0)}%</div>
        </td>
        <td><button class="action-btn btn-editar-proyecto" data-id="${h(p.id)}">Editar</button></td>
      </tr>
    `).join('')
    : `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text3)">No hay proyectos. Creá el primero →</td></tr>`;
}

/* ── RENDER TICKETS ── */
function renderTickets() {
  document.getElementById('tbody-tickets').innerHTML = LIVE.tickets.length
    ? LIVE.tickets.map(t => `
      <tr>
        <td><code style="color:var(--blue-lite)">${h(t.id)}</code></td>
        <td>${h(t.proyecto)}</td>
        <td style="max-width:260px;color:var(--text2)">${h(t.descripcion)}</td>
        <td>${prioridadBadge(t.prioridad)}</td>
        <td>${estadoBadge(t.estado)}</td>
        <td style="color:var(--text2)">${h(formatDate(t.fecha))}</td>
        <td>
          ${t.estado === 'open'
            ? `<button class="action-btn btn-toggle-ticket" style="color:var(--green);border-color:rgba(52,211,153,0.4)"
                data-id="${h(t.id)}" data-next="closed">✓ Cerrar</button>`
            : `<button class="action-btn btn-toggle-ticket"
                data-id="${h(t.id)}" data-next="open">Reabrir</button>`}
        </td>
      </tr>
    `).join('')
    : `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text3)">Sin tickets abiertos</td></tr>`;
}

/* ── RENDER LEADS ── */
function renderLeads() {
  const filtered = leadsFilter === 'all'
    ? LIVE.leads
    : LIVE.leads.filter(l => l.estado === leadsFilter);

  document.getElementById('tbody-leads').innerHTML = filtered.length
    ? filtered.map(l => `
      <tr>
        <td><strong>${h(l.nombre)}</strong></td>
        <td style="color:var(--text2)">${h(l.contacto)}</td>
        <td>${h(l.servicio)}</td>
        <td style="max-width:220px;color:var(--text2);font-size:11px">${h((l.mensaje || '').slice(0,60))}${(l.mensaje || '').length > 60 ? '…' : ''}</td>
        <td>${estadoBadge(l.estado)}</td>
        <td style="color:var(--text2)">${h(formatDate(l.fecha))}</td>
        <td style="display:flex;gap:6px;flex-wrap:wrap">
          ${l.contacto && l.contacto.startsWith('+')
            ? `<a href="https://wa.me/${h(l.contacto.replace(/\D/g,''))}" target="_blank" rel="noopener"
                class="action-btn" style="color:#25d366;border-color:rgba(37,211,102,0.4);text-decoration:none">WA</a>`
            : ''}
          <button class="action-btn btn-gestionar-lead"
            data-id="${h(l.id)}" data-nombre="${h(l.nombre)}" data-estado="${h(l.estado)}">Gestionar</button>
        </td>
      </tr>
    `).join('')
    : `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text3)">No hay leads${leadsFilter !== 'all' ? ' con ese estado' : ' aún'}</td></tr>`;
}

/* ── TAB SWITCHING ── */
const IDE_FILE_META = {
  dashboard: { file: 'dashboard.html', lang: 'JSON' },
  proyectos: { file: 'proyectos.js',   lang: 'JavaScript' },
  leads:     { file: 'leads.json',     lang: 'JSON' },
  finanzas:  { file: 'finanzas.js',    lang: 'JavaScript' },
  tickets:   { file: 'tickets.js',     lang: 'JavaScript' },
  clientes:  { file: 'clientes.js',    lang: 'JavaScript' },
  testimonios: { file: 'testimonios.sql', lang: 'SQL' },
  contratos: { file: 'contratos.sql', lang: 'SQL' },
};

function switchTab(name) {
  document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
  document.getElementById('tab-' + name)?.classList.add('active');
  document.querySelectorAll('.sb-item').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === name);
  });
  document.querySelectorAll('.ide-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === name);
  });
  const meta = IDE_FILE_META[name];
  if (meta) {
    const titlebar = document.getElementById('ide-titlebar-name');
    const lang = document.getElementById('ide-status-lang');
    if (titlebar) titlebar.textContent = `${meta.file} — apex-admin — Visual Studio Code`;
    if (lang) lang.textContent = meta.lang;
  }
  if (name === 'clientes') cargarClientes();
  if (name === 'testimonios') cargarTestimonios();
  if (name === 'contratos') cargarContratos();
}

/* ── MODALES ── */
const FOCUSABLE = 'input,textarea,select,button:not([disabled]),a[href]';

function openModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.add('open');
  // Focus al primer campo interactivo
  const first = m.querySelector(FOCUSABLE);
  if (first) setTimeout(() => first.focus(), 50);
  // Evitar scroll del body
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.remove('open');
  document.body.style.overflow = '';
}

// Focus trap: Tab dentro del modal no escapa
document.addEventListener('keydown', e => {
  const open = document.querySelector('.modal-overlay.open');
  if (!open) return;
  if (e.key === 'Escape') { closeModal(open.id); return; }
  if (e.key !== 'Tab') return;
  const focusables = [...open.querySelectorAll(FOCUSABLE)];
  if (!focusables.length) return;
  const first = focusables[0], last = focusables[focusables.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
  } else {
    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); });
});

function bindAdminEvents() {
  document.getElementById('sb-toggle').addEventListener('click', toggleSidebar);

  document.querySelectorAll('.sb-item[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.querySelectorAll('.ide-tab[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.getElementById('qa-btn-proyecto').addEventListener('click', () => openModalProyecto(null));
  document.getElementById('qa-btn-lead').addEventListener('click', () => openModal('modal-lead'));
  document.getElementById('qa-btn-ticket').addEventListener('click', openModalTicket);
  document.getElementById('qa-btn-finanza').addEventListener('click', () => openModalFinanza(null));
  document.querySelector('.qa-btn-refresh').addEventListener('click', refreshDashboard);

  document.getElementById('btn-edit-meta').addEventListener('click', editMetaMensual);
  document.getElementById('btn-ver-entregas').addEventListener('click', () => switchTab('proyectos'));
  document.getElementById('btn-ver-proyectos-activos').addEventListener('click', () => switchTab('proyectos'));
  document.getElementById('btn-toggle-view').addEventListener('click', toggleProyectosView);
  document.getElementById('btn-nuevo-proyecto').addEventListener('click', () => openModalProyecto(null));
  document.getElementById('btn-nuevo-ticket').addEventListener('click', openModalTicket);
  document.getElementById('btn-agregar-lead-manual').addEventListener('click', () => openModal('modal-lead'));
  document.getElementById('btn-nuevo-cliente-tab').addEventListener('click', () => openModal('modal-cliente'));
  document.getElementById('btn-reload-tickets').addEventListener('click', cargarAdminTickets);
  document.getElementById('btn-nuevo-cobro').addEventListener('click', () => openModalFinanza(null));

  document.getElementById('btn-cancelar-proyecto').addEventListener('click', () => closeModal('modal-proyecto'));
  document.getElementById('btn-guardar-proyecto').addEventListener('click', guardarProyecto);
  document.getElementById('btn-cancelar-ticket').addEventListener('click', () => closeModal('modal-ticket'));
  document.getElementById('btn-guardar-ticket').addEventListener('click', guardarTicket);
  document.getElementById('btn-cancelar-lead').addEventListener('click', () => closeModal('modal-lead'));
  document.getElementById('btn-guardar-lead').addEventListener('click', guardarLead);
  document.getElementById('btn-cancelar-gl').addEventListener('click', () => closeModal('modal-gestionar-lead'));
  document.getElementById('btn-guardar-gl').addEventListener('click', guardarEstadoLead);
  document.getElementById('btn-cancelar-cliente').addEventListener('click', () => closeModal('modal-cliente'));
  document.getElementById('btn-crear-cliente').addEventListener('click', crearCliente);
  document.getElementById('btn-cancelar-responder').addEventListener('click', () => closeModal('modal-responder'));
  document.getElementById('btn-enviar-resp').addEventListener('click', enviarRespuesta);
  document.getElementById('btn-cerrar-etapas').addEventListener('click', () => closeModal('modal-etapas'));
  document.getElementById('btn-cancelar-finanza').addEventListener('click', () => closeModal('modal-finanza'));
  document.getElementById('btn-guardar-finanza').addEventListener('click', guardarFinanza);
}
bindAdminEvents();

/* ── CREAR / EDITAR PROYECTO ── */
function openModalProyecto(proyecto) {
  const modal = document.getElementById('modal-proyecto');
  modal.querySelector('h3').textContent = proyecto ? 'Editar proyecto' : 'Nuevo proyecto';
  document.getElementById('np-id').value      = proyecto ? h(proyecto.id)       : '';
  document.getElementById('np-emoji').value   = proyecto ? proyecto.emoji  || '' : '';
  document.getElementById('np-nombre').value  = proyecto ? proyecto.nombre || '' : '';
  document.getElementById('np-cliente').value = proyecto ? proyecto.cliente|| '' : '';
  document.getElementById('np-valor').value   = proyecto ? proyecto.valor  || '' : '';
  document.getElementById('np-estado').value  = proyecto ? proyecto.estado || 'pending' : 'pending';
  document.getElementById('np-entrega').value = proyecto ? proyecto.entrega|| '' : '';
  document.getElementById('np-tech').value    = proyecto ? proyecto.tech   || '' : '';
  document.getElementById('np-progreso').value= proyecto ? proyecto.progreso||0 : 0;
  document.getElementById('np-error').style.display = 'none';
  openModal('modal-proyecto');
}

async function guardarProyecto() {
  const id       = document.getElementById('np-id').value;
  const nombre   = document.getElementById('np-nombre').value.trim();
  const cliente  = document.getElementById('np-cliente').value.trim();
  const errEl    = document.getElementById('np-error');
  const btn      = document.getElementById('btn-guardar-proyecto');

  if (!nombre || !cliente) {
    errEl.textContent = 'Nombre y cliente son obligatorios.';
    errEl.style.display = 'block'; return;
  }
  errEl.style.display = 'none';
  btn.disabled = true; btn.textContent = 'Guardando…';

  const body = {
    adminToken: _t,
    accion:     id ? 'updateProyectoAdmin' : 'addProyectoAdmin',
    id:         id || undefined,
    nombre,
    cliente,
    emoji:    document.getElementById('np-emoji').value.trim()   || '📁',
    estado:   document.getElementById('np-estado').value,
    valor:    document.getElementById('np-valor').value           || 0,
    entrega:  document.getElementById('np-entrega').value,
    tech:     document.getElementById('np-tech').value.trim(),
    progreso: document.getElementById('np-progreso').value        || 0,
  };

  try {
    const data = await apiPost(body);
    if (data.success) {
      closeModal('modal-proyecto');
      await reloadProyectos();
    } else {
      errEl.textContent = data.error || 'Error al guardar.';
      errEl.style.display = 'block';
    }
  } catch (err) {
    errEl.textContent = 'Error de conexión.'; errEl.style.display = 'block';
  }
  btn.disabled = false; btn.textContent = 'Guardar';
}

async function reloadProyectos() {
  const r = await apiFetch({ accion: 'adminProyectos', adminToken: _t });
  if (r.success) LIVE.proyectos = r.proyectos || [];
  renderProyectos();
  renderDashboard();
}

/* ── CREAR TICKET ── */
function openModalTicket() {
  // Poblar select de proyectos dinámicamente
  const sel = document.getElementById('nt-proyecto');
  sel.innerHTML = LIVE.proyectos.map(p => `<option value="${h(p.nombre)}">${h(p.nombre)}</option>`).join('');
  document.getElementById('nt-descripcion').value = '';
  document.getElementById('nt-prioridad').value   = 'normal';
  document.getElementById('nt-error').style.display = 'none';
  openModal('modal-ticket');
}

async function guardarTicket() {
  const proyecto    = document.getElementById('nt-proyecto').value;
  const descripcion = document.getElementById('nt-descripcion').value.trim();
  const prioridad   = document.getElementById('nt-prioridad').value;
  const errEl       = document.getElementById('nt-error');
  const btn         = document.getElementById('btn-guardar-ticket');

  if (!descripcion) {
    errEl.textContent = 'Describí el ticket.'; errEl.style.display = 'block'; return;
  }
  errEl.style.display = 'none';
  btn.disabled = true; btn.textContent = 'Creando…';

  try {
    const data = await apiPost({ accion: 'addTicketAdmin', adminToken: _t, proyecto, descripcion, prioridad });
    if (data.success) {
      closeModal('modal-ticket');
      await reloadTickets();
    } else {
      errEl.textContent = data.error || 'Error al crear.'; errEl.style.display = 'block';
    }
  } catch (err) {
    errEl.textContent = 'Error de conexión.'; errEl.style.display = 'block';
  }
  btn.disabled = false; btn.textContent = 'Crear ticket';
}

async function toggleTicket(id, nextEstado) {
  try {
    const data = await apiPost({ accion: 'updateTicketAdmin', adminToken: _t, id, estado: nextEstado });
    if (data.success) await reloadTickets();
    else alert('Error: ' + data.error);
  } catch (err) {
    alert('Error de conexión.');
  }
}

async function reloadTickets() {
  const r = await apiFetch({ accion: 'adminTicketsInt', adminToken: _t });
  if (r.success) LIVE.tickets = r.tickets || [];
  renderTickets();
  renderDashboard();
}

/* ── CREAR LEAD ── */
async function guardarLead() {
  const nombre   = document.getElementById('nl-nombre').value.trim();
  const contacto = document.getElementById('nl-contacto').value.trim();
  const servicio = document.getElementById('nl-servicio').value;
  const mensaje  = document.getElementById('nl-mensaje').value.trim();
  const errEl    = document.getElementById('nl-error');
  const btn      = document.getElementById('btn-guardar-lead');

  if (!nombre || !contacto) {
    errEl.textContent = 'Nombre y contacto son obligatorios.'; errEl.style.display = 'block'; return;
  }
  errEl.style.display = 'none';
  btn.disabled = true; btn.textContent = 'Guardando…';

  try {
    const data = await apiPost({ accion: 'addLead', adminToken: _t, nombre, contacto, servicio, mensaje });
    if (data.success) {
      closeModal('modal-lead');
      ['nl-nombre','nl-contacto','nl-mensaje'].forEach(id => { document.getElementById(id).value = ''; });
      await reloadLeads();
    } else {
      errEl.textContent = data.error || 'Error al guardar.'; errEl.style.display = 'block';
    }
  } catch (err) {
    errEl.textContent = 'Error de conexión.'; errEl.style.display = 'block';
  }
  btn.disabled = false; btn.textContent = 'Guardar';
}

async function reloadLeads() {
  const r = await apiFetch({ accion: 'adminLeads', adminToken: _t });
  if (r.success) LIVE.leads = r.leads || [];
  renderLeads();
  renderDashboard();
}

/* ── GESTIONAR LEAD (cambiar estado) ── */
function abrirGestionarLead(id, nombre, estadoActual) {
  document.getElementById('gl-id').value          = id;
  document.getElementById('gl-nombre').textContent = nombre;
  document.getElementById('gl-estado').value       = estadoActual;
  document.getElementById('gl-error').style.display = 'none';
  openModal('modal-gestionar-lead');
}

async function guardarEstadoLead() {
  const id     = document.getElementById('gl-id').value;
  const estado = document.getElementById('gl-estado').value;
  const errEl  = document.getElementById('gl-error');
  const btn    = document.getElementById('btn-guardar-gl');

  btn.disabled = true; btn.textContent = 'Guardando…';
  try {
    const data = await apiPost({ accion: 'updateLead', adminToken: _t, id, estado });
    if (data.success) {
      closeModal('modal-gestionar-lead');
      await reloadLeads();
    } else {
      errEl.textContent = data.error || 'Error.'; errEl.style.display = 'block';
    }
  } catch (err) {
    errEl.textContent = 'Error de conexión.'; errEl.style.display = 'block';
  }
  btn.disabled = false; btn.textContent = 'Guardar';
}

/* ── SHA-256 ── */
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

/* ── CLIENTES: Cargar desde Apps Script ── */
async function cargarClientes() {
  const tbody  = document.getElementById('tbody-clientes');
  const notice = document.getElementById('clientes-config-notice');

  if (!PORTAL_AS_URL) {
    notice.style.display = 'block';
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:24px;font-size:13px">
      Configurá PORTAL_AS_URL en admin.js para ver los clientes del portal.</td></tr>`;
    return;
  }

  notice.style.display = 'none';
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text3)">Cargando…</td></tr>`;

  try {
    const res  = await fetch(`${PORTAL_AS_URL}?accion=clientes&adminToken=${encodeURIComponent(_t)}`);
    const data = await res.json();

    if (!data.success) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#fca5a5;padding:20px">${h(data.error)}</td></tr>`;
      return;
    }
    if (!data.clientes.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:28px">No hay clientes aún.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.clientes.map(c => `
      <tr>
        <td><strong>${h(c.nombre)}</strong></td>
        <td style="color:var(--text2);font-size:12px">${h(c.email)}</td>
        <td>${tipoBadge(c.tipo)}</td>
        <td style="color:var(--text2)">${h(c.proyecto || '—')}</td>
        <td style="color:var(--text2)">${h(c.etapa_actual || '—')}</td>
        <td>
          ${c.open_tickets > 0
            ? `<span class="badge badge-open">${h(c.open_tickets)} abierto${c.open_tickets > 1 ? 's' : ''}</span>`
            : '<span class="badge badge-closed">Sin abrir</span>'}
        </td>
        <td style="display:flex;gap:6px;flex-wrap:wrap">
          ${c.proyecto_id
            ? `<button class="action-btn btn-ver-etapas" data-pid="${h(c.proyecto_id)}">Etapas</button>`
            : ''}
          <button class="action-btn btn-ver-tickets"
            data-email="${h(c.email)}" data-nombre="${h(c.nombre)}">Consultas</button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#fca5a5;padding:20px">Error: ${h(err.message)}</td></tr>`;
  }
}

function tipoBadge(tipo) {
  if (tipo === 'landing') return '<span class="badge badge-dev">Landing</span>';
  if (tipo === 'plan')    return '<span class="badge badge-live">Plan</span>';
  return '<span class="badge badge-pending">Lead</span>';
}

/* ── TESTIMONIOS: moderación (MySQL real, no pasa por Sheets) ── */
async function cargarTestimonios() {
  const tbody = document.getElementById('tbody-testimonios');
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text3)">Cargando…</td></tr>`;

  try {
    const data = await apiFetchDirect('/api/admin/testimonios');
    if (!data.success) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#fca5a5;padding:20px">${h(data.error)}</td></tr>`;
      return;
    }
    LIVE.testimonios = data.testimonios || [];
    renderTestimonios();
    updateTabBadge('testimonios', LIVE.testimonios.filter(t => !t.approved).length);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#fca5a5;padding:20px">Error: ${h(err.message)}</td></tr>`;
  }
}

function renderTestimonios() {
  const tbody = document.getElementById('tbody-testimonios');
  if (!LIVE.testimonios.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:28px">No hay testimonios todavía.</td></tr>`;
    return;
  }
  tbody.innerHTML = LIVE.testimonios.map(t => `
    <tr>
      <td><strong>${h(t.user_name)}</strong><div style="color:var(--text3);font-size:11px">${h(t.user_email)}</div></td>
      <td style="color:var(--text2)">${h(t.company || '—')}</td>
      <td>${'★'.repeat(Number(t.rating) || 0)}${'☆'.repeat(5 - (Number(t.rating) || 0))}</td>
      <td style="color:var(--text2);max-width:340px">${h(t.text)}</td>
      <td>${t.approved ? '<span class="badge badge-live">Aprobado</span>' : '<span class="badge badge-pending">Pendiente</span>'}</td>
      <td style="color:var(--text3);font-size:12px">${formatDateSQL(t.created_at)}</td>
      <td style="display:flex;gap:6px;flex-wrap:wrap">
        ${t.approved
          ? `<button class="action-btn danger btn-rechazar-testimonio" data-id="${h(t.id)}">Ocultar</button>`
          : `<button class="action-btn gold btn-aprobar-testimonio" data-id="${h(t.id)}">Aprobar</button>`}
      </td>
    </tr>
  `).join('');
}

async function setTestimonioAprobado(id, approved) {
  try {
    const data = await apiFetchDirect(`/api/admin/testimonios/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved }),
    });
    if (!data.success) { alert(data.error || 'Error actualizando el testimonio.'); return; }
    const t = LIVE.testimonios.find(x => String(x.id) === String(id));
    if (t) t.approved = approved ? 1 : 0;
    renderTestimonios();
    updateTabBadge('testimonios', LIVE.testimonios.filter(x => !x.approved).length);
  } catch (err) {
    alert('Error de conexión: ' + err.message);
  }
}

/* ── CONTRATOS: trazabilidad legal (MySQL real) ── */
async function cargarContratos() {
  const tbody = document.getElementById('tbody-contratos');
  tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text3)">Cargando…</td></tr>`;

  try {
    const data = await apiFetchDirect('/api/admin/contratos');
    if (!data.success) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#fca5a5;padding:20px">${h(data.error)}</td></tr>`;
      return;
    }
    if (!data.contratos.length) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text3);padding:28px">No hay contratos firmados todavía.</td></tr>`;
      return;
    }
    tbody.innerHTML = data.contratos.map(c => `
      <tr>
        <td><strong>${h(c.user_name)}</strong><div style="color:var(--text3);font-size:11px">${h(c.user_email)}</div></td>
        <td style="color:var(--text2)">${h(c.lead_service || '—')}</td>
        <td style="color:var(--text2)">${h(formatDateSQL(c.signed_at))}</td>
        <td style="color:var(--text3);font-size:12px">${h(c.ip || '—')}</td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#fca5a5;padding:20px">Error: ${h(err.message)}</td></tr>`;
  }
}

/* ── CLIENTES: Ver etapas ── */
async function verEtapas(proyectoId) {
  if (!PORTAL_AS_URL) return;
  const listEl = document.getElementById('etapas-list');
  listEl.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text3)">Cargando etapas…</div>';
  openModal('modal-etapas');

  try {
    const res  = await fetch(`${PORTAL_AS_URL}?accion=adminEtapas&adminToken=${encodeURIComponent(_t)}&proyectoId=${encodeURIComponent(proyectoId)}`);
    const data = await res.json();
    if (!data.success) { listEl.innerHTML = `<div style="color:#fca5a5">${h(data.error)}</div>`; return; }

    listEl.innerHTML = data.etapas.map(e => `
      <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">
        <div style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;
          background:${e.estado==='completado'?'rgba(52,211,153,0.12)':e.estado==='en_progreso'?'rgba(196,149,106,0.12)':'rgba(255,255,255,0.03)'};
          border:2px solid ${e.estado==='completado'?'#34d399':e.estado==='en_progreso'?'#C4956A':'rgba(255,255,255,0.1)'}">
          ${e.estado==='completado'?'✓':e.estado==='en_progreso'?'◉':'○'}
        </div>
        <div style="flex:1">
          <div style="font-size:14px;font-weight:600;color:var(--text)">${h(e.etapa)}</div>
          ${e.fecha_completado ? `<div style="font-size:11px;color:var(--text2)">${h(e.fecha_completado)}</div>` : ''}
          ${e.nota ? `<div style="font-size:11px;color:var(--text2);margin-top:3px">${h(e.nota)}</div>` : ''}
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${e.estado !== 'en_progreso'
            ? `<button class="action-btn btn-mark-etapa" style="color:var(--yellow)"
                data-pid="${h(proyectoId)}" data-etapa="${h(e.etapa)}" data-next="en_progreso">En progreso</button>` : ''}
          ${e.estado !== 'completado'
            ? `<button class="action-btn btn-mark-etapa" style="color:var(--green)"
                data-pid="${h(proyectoId)}" data-etapa="${h(e.etapa)}" data-next="completado">✓ Completar</button>` : ''}
        </div>
      </div>
    `).join('');
  } catch (err) {
    listEl.innerHTML = `<div style="color:#fca5a5">Error: ${h(err.message)}</div>`;
  }
}

async function marcarEtapa(proyectoId, etapa, estado) {
  if (!PORTAL_AS_URL) return;
  const nota = estado === 'completado' ? prompt(`Nota para "${etapa}" (opcional):`) : null;
  try {
    const res  = await fetch(PORTAL_AS_URL, {
      method: 'POST',
      body: JSON.stringify({ accion: 'updateEtapa', adminToken: _t, proyectoId, etapa, estado, nota: nota || '' }),
    });
    const data = await res.json();
    if (data.success) verEtapas(proyectoId);
    else alert('Error: ' + data.error);
  } catch (err) {
    alert('Error de conexión: ' + err.message);
  }
}

/* ── CLIENTES: Tickets ── */
function verTicketsCliente(email, nombre) {
  document.getElementById('tickets-panel-title').textContent = `Consultas de ${nombre}`;
  cargarAdminTickets(email);
}

async function cargarAdminTickets(filtroEmail) {
  if (!PORTAL_AS_URL) return;
  const container = document.getElementById('admin-tickets-container');
  container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text3)">Cargando consultas…</div>';

  try {
    const res  = await fetch(`${PORTAL_AS_URL}?accion=adminTickets&adminToken=${encodeURIComponent(_t)}`);
    const data = await res.json();
    if (!data.success) { container.innerHTML = `<div style="padding:16px;color:#fca5a5">${h(data.error)}</div>`; return; }

    let tickets = data.tickets;
    if (filtroEmail) tickets = tickets.filter(t => t.email === filtroEmail);

    if (!tickets.length) {
      container.innerHTML = '<div style="padding:28px;text-align:center;color:var(--text3);font-size:13px">No hay consultas para mostrar.</div>';
      return;
    }

    container.innerHTML = tickets.map(t => {
      const respuestas = t.respuestas || [];
      return `
        <div style="padding:16px;border-bottom:1px solid var(--border)">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:6px">
            <div>
              <strong style="color:var(--text)">${h(t.asunto)}</strong>
              <span style="margin-left:10px;font-size:11px;color:var(--text3)">${h(t.nombre_cliente)} · ${h(t.fecha)}</span>
            </div>
            <div style="display:flex;gap:6px;align-items:center">
              ${t.estado === 'abierto'
                ? '<span class="badge badge-open">● Abierto</span>'
                : '<span class="badge badge-closed">✓ Respondido</span>'}
              ${t.estado !== 'respondido'
                ? `<button class="action-btn btn-responder" style="color:var(--green)"
                    data-tid="${h(t.id)}" data-asunto="${h(t.asunto)}" data-msg="${h(t.mensaje)}">Responder</button>`
                : ''}
            </div>
          </div>
          <div style="font-size:13px;color:var(--text2);padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:6px;margin-bottom:8px">${h(t.mensaje)}</div>
          ${respuestas.map(r => `
            <div style="margin-left:16px;padding:8px 12px;background:rgba(196,149,106,0.07);border:1px solid rgba(196,149,106,0.18);border-radius:6px;margin-top:6px">
              <div style="font-size:11px;font-weight:700;color:#C4956A;margin-bottom:3px">${h(r.autor)} · ${h(r.fecha)}</div>
              <div style="font-size:13px;color:var(--text2)">${h(r.mensaje)}</div>
            </div>
          `).join('')}
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<div style="padding:16px;color:#fca5a5">Error: ${h(err.message)}</div>`;
  }
}

/* ── CLIENTES: Responder ticket ── */
function abrirModalRespuesta(ticketId, asunto, mensaje) {
  document.getElementById('resp-ticket-id').value = ticketId;
  document.getElementById('resp-ticket-preview').innerHTML =
    `<strong>${h(asunto)}</strong><br><span style="font-size:12px;color:var(--text2)">${h(mensaje)}</span>`;
  document.getElementById('resp-msg').value = '';
  document.getElementById('resp-error').style.display = 'none';
  openModal('modal-responder');
}

async function enviarRespuesta() {
  if (!PORTAL_AS_URL) return;
  const ticketId = document.getElementById('resp-ticket-id').value;
  const mensaje  = document.getElementById('resp-msg').value.trim();
  const errEl    = document.getElementById('resp-error');
  const btn      = document.getElementById('btn-enviar-resp');

  if (!mensaje) { errEl.textContent = 'Escribí una respuesta primero.'; errEl.style.display = 'block'; return; }
  errEl.style.display = 'none';
  btn.disabled = true; btn.textContent = 'Enviando…';

  try {
    const res  = await fetch(PORTAL_AS_URL, {
      method: 'POST',
      body: JSON.stringify({ accion: 'responderTicket', adminToken: _t, ticketId, mensaje }),
    });
    const data = await res.json();
    if (data.success) { closeModal('modal-responder'); cargarAdminTickets(); }
    else { errEl.textContent = data.error || 'Error al enviar.'; errEl.style.display = 'block'; }
  } catch (err) {
    errEl.textContent = 'Error de conexión.'; errEl.style.display = 'block';
  }
  btn.disabled = false; btn.textContent = 'Enviar respuesta';
}

/* ── CLIENTES: Crear nuevo cliente ── */
async function crearCliente() {
  if (!PORTAL_AS_URL) { alert('Configurá PORTAL_AS_URL en admin.js antes de crear clientes.'); return; }

  const nombre   = document.getElementById('nc-nombre').value.trim();
  const email    = document.getElementById('nc-email').value.trim();
  const pass     = document.getElementById('nc-pass').value.trim();
  const tipo     = document.getElementById('nc-tipo').value;
  const proyecto = document.getElementById('nc-proyecto').value.trim();
  const preview  = document.getElementById('nc-preview').value.trim();
  const valor    = document.getElementById('nc-valor').value;
  const errEl    = document.getElementById('nc-error');
  const btn      = document.getElementById('btn-crear-cliente');

  errEl.style.display = 'none';
  if (!nombre || !email || !pass) {
    errEl.textContent = 'Nombre, email y contraseña son obligatorios.';
    errEl.style.display = 'block'; return;
  }
  if ((tipo === 'landing' || tipo === 'plan') && !proyecto) {
    errEl.textContent = 'El nombre del proyecto es obligatorio para este tipo de cliente.';
    errEl.style.display = 'block'; return;
  }

  btn.disabled = true; btn.textContent = 'Creando…';

  try {
    const hash = await sha256(email.toLowerCase().trim() + ':' + pass);
    const res  = await fetch(PORTAL_AS_URL, {
      method: 'POST',
      body: JSON.stringify({
        accion: 'crearCliente', adminToken: _t,
        nombre, email, password_hash: hash, tipo,
        nombre_proyecto: proyecto, preview_url: preview, valor: valor || null,
      }),
    });
    const data = await res.json();
    if (data.success) {
      closeModal('modal-cliente');
      cargarClientes();
      ['nc-nombre','nc-email','nc-pass','nc-proyecto','nc-preview','nc-valor'].forEach(id => {
        document.getElementById(id).value = '';
      });
    } else {
      errEl.textContent = data.error || 'Error al crear el cliente.';
      errEl.style.display = 'block';
    }
  } catch (err) {
    errEl.textContent = 'Error de conexión: ' + err.message;
    errEl.style.display = 'block';
  }
  btn.disabled = false; btn.textContent = 'Crear cliente';
}

/* ── KANBAN ── */
const KANBAN_COLS = [
  { key: 'pending', label: 'Pendiente', color: 'var(--text3)' },
  { key: 'dev',     label: 'Desarrollo', color: 'var(--yellow)' },
  { key: 'paused',  label: 'Pausado',    color: 'var(--red-alert)' },
  { key: 'live',    label: 'Live',       color: 'var(--green)' },
];

function toggleProyectosView() {
  proyectosView = proyectosView === 'tabla' ? 'kanban' : 'tabla';
  const btn = document.getElementById('btn-toggle-view');
  btn.textContent = proyectosView === 'tabla' ? '⊞ Kanban' : '☰ Tabla';
  document.getElementById('panel-tabla-proyectos').style.display = proyectosView === 'tabla' ? '' : 'none';
  document.getElementById('kanban-proyectos').style.display      = proyectosView === 'kanban' ? '' : 'none';
  if (proyectosView === 'kanban') renderKanban();
}

function renderKanban() {
  const board = document.getElementById('kanban-proyectos');
  board.innerHTML = `<div class="kanban-board">${
    KANBAN_COLS.map(col => {
      const cards = LIVE.proyectos.filter(p => p.estado === col.key);
      return `
        <div class="kanban-col" data-col="${h(col.key)}"
          ondragover="event.preventDefault()"
          ondrop="kanbanDrop(event,'${h(col.key)}')">
          <div class="kanban-col-header" style="border-color:${col.color}">
            <span style="color:${col.color}">${h(col.label)}</span>
            <span class="kanban-count">${cards.length}</span>
          </div>
          ${cards.map(p => `
            <div class="kanban-card" draggable="true"
              ondragstart="kanbanDragStart(event,'${h(p.id)}')">
              <div class="kc-header">
                <span class="kc-emoji">${h(p.emoji || '📁')}</span>
                <span class="kc-nombre">${h(p.nombre)}</span>
              </div>
              <div class="kc-cliente">${h(p.cliente)}</div>
              <div class="kc-progress">
                <div class="progress-bar" style="margin:0"><div class="progress-fill" style="width:${h(p.progreso || 0)}%"></div></div>
                <span class="kc-pct">${h(p.progreso || 0)}%</span>
              </div>
              ${Number(p.valor) > 0 ? `<div class="kc-valor">$${h(p.valor)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }).join('')
  }</div>`;
}

let _dragId = null;
function kanbanDragStart(e, id) { _dragId = id; e.dataTransfer.effectAllowed = 'move'; }
async function kanbanDrop(e, newEstado) {
  e.preventDefault();
  if (!_dragId) return;
  const proy = LIVE.proyectos.find(p => String(p.id) === String(_dragId));
  if (!proy || proy.estado === newEstado) { _dragId = null; return; }
  try {
    const data = await apiPost({ accion: 'updateProyectoAdmin', adminToken: _t, id: _dragId, estado: newEstado });
    if (data.success) await reloadProyectos();
    else alert('Error: ' + data.error);
  } catch { alert('Error de conexión.'); }
  _dragId = null;
}

/* ── FINANZAS ── */
function renderFinanzas() {
  const cobrado   = LIVE.finanzas.filter(f => f.estado === 'pagado')   .reduce((a,f) => a + (Number(f.monto)||0), 0);
  const pendiente = LIVE.finanzas.filter(f => f.estado === 'pendiente').reduce((a,f) => a + (Number(f.monto)||0), 0);
  const facturado = LIVE.finanzas.filter(f => f.estado === 'facturado').reduce((a,f) => a + (Number(f.monto)||0), 0);

  document.getElementById('fin-cobrado').textContent   = `$${cobrado.toLocaleString()}`;
  document.getElementById('fin-pendiente').textContent = `$${pendiente.toLocaleString()}`;
  document.getElementById('fin-facturado').textContent = `$${facturado.toLocaleString()}`;

  const finBadge = { pendiente:'badge-pending', facturado:'badge-dev', pagado:'badge-live' };
  document.getElementById('tbody-finanzas').innerHTML = LIVE.finanzas.length
    ? LIVE.finanzas.map(f => `
      <tr>
        <td><strong>${h(f.cliente)}</strong></td>
        <td style="color:var(--text2)">${h(f.proyecto)}</td>
        <td style="color:var(--gold2);font-family:'Inter',sans-serif;font-weight:700">$${h(f.monto)}</td>
        <td><span class="badge ${h(finBadge[f.estado] || 'badge-pending')}">${h(f.estado)}</span></td>
        <td style="color:var(--text2)">${h(f.fecha_factura || '—')}</td>
        <td style="color:var(--text2)">${h(f.fecha_pago || '—')}</td>
        <td style="color:var(--text2);font-size:11px">${h(f.nota || '')}</td>
        <td style="display:flex;gap:6px;flex-wrap:wrap">
          ${f.estado !== 'pagado'
            ? `<button class="action-btn btn-pagar-finanza" style="color:var(--green);border-color:rgba(52,211,153,0.4)"
                data-id="${h(f.id)}">✓ Cobrado</button>`
            : ''}
          <button class="action-btn btn-editar-finanza" data-id="${h(f.id)}">Editar</button>
        </td>
      </tr>
    `).join('')
    : `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text3)">Sin registros. Creá el primero →</td></tr>`;
}

function openModalFinanza(finanza) {
  document.getElementById('fin-modal-title').textContent = finanza ? 'Editar cobro' : 'Nuevo cobro';
  document.getElementById('fin-id').value            = finanza ? h(finanza.id)           : '';
  document.getElementById('fin-cliente').value       = finanza ? finanza.cliente    || '' : '';
  document.getElementById('fin-monto').value         = finanza ? finanza.monto      || '' : '';
  document.getElementById('fin-estado').value        = finanza ? finanza.estado     || 'pendiente' : 'pendiente';
  document.getElementById('fin-fecha-factura').value = finanza ? finanza.fecha_factura || '' : '';
  document.getElementById('fin-fecha-pago').value    = finanza ? finanza.fecha_pago    || '' : '';
  document.getElementById('fin-nota').value          = finanza ? finanza.nota          || '' : '';
  // Poblar select de proyectos
  const sel = document.getElementById('fin-proyecto');
  sel.innerHTML = ['— Sin proyecto —', ...LIVE.proyectos.map(p => p.nombre)]
    .map(n => `<option value="${h(n)}"${finanza && finanza.proyecto === n ? ' selected' : ''}>${h(n)}</option>`)
    .join('');
  document.getElementById('fin-error').style.display = 'none';
  openModal('modal-finanza');
}

async function guardarFinanza() {
  const id      = document.getElementById('fin-id').value;
  const cliente = document.getElementById('fin-cliente').value.trim();
  const monto   = document.getElementById('fin-monto').value;
  const errEl   = document.getElementById('fin-error');
  const btn     = document.getElementById('btn-guardar-finanza');

  if (!cliente || !monto) {
    errEl.textContent = 'Cliente y monto son obligatorios.'; errEl.style.display = 'block'; return;
  }
  errEl.style.display = 'none';
  btn.disabled = true; btn.textContent = 'Guardando…';

  const body = {
    accion:         id ? 'updateFinanza' : 'addFinanza',
    adminToken:     _t,
    id:             id || undefined,
    cliente,
    proyecto:       document.getElementById('fin-proyecto').value,
    monto,
    estado:         document.getElementById('fin-estado').value,
    fecha_factura:  document.getElementById('fin-fecha-factura').value,
    fecha_pago:     document.getElementById('fin-fecha-pago').value,
    nota:           document.getElementById('fin-nota').value.trim(),
  };

  try {
    const data = await apiPost(body);
    if (data.success) {
      closeModal('modal-finanza');
      await reloadFinanzas();
    } else {
      errEl.textContent = data.error || 'Error al guardar.'; errEl.style.display = 'block';
    }
  } catch (err) {
    errEl.textContent = 'Error de conexión.'; errEl.style.display = 'block';
  }
  btn.disabled = false; btn.textContent = 'Guardar';
}

async function marcarPagado(id) {
  const hoy = new Date().toISOString().split('T')[0];
  try {
    const data = await apiPost({ accion: 'updateFinanza', adminToken: _t, id, estado: 'pagado', fecha_pago: hoy });
    if (data.success) await reloadFinanzas();
    else alert('Error: ' + data.error);
  } catch { alert('Error de conexión.'); }
}

async function reloadFinanzas() {
  const r = await apiFetch({ accion: 'adminFinanzas', adminToken: _t });
  if (r.success) LIVE.finanzas = r.finanzas || [];
  renderFinanzas();
}

/* ── EVENT DELEGATION ── */
document.addEventListener('click', e => {
  // Filtros de leads
  const filterBtn = e.target.closest('.filter-btn');
  if (filterBtn) {
    leadsFilter = filterBtn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    filterBtn.classList.add('active');
    renderLeads();
    return;
  }
  // Marcar finanza como pagada
  const pagarBtn = e.target.closest('.btn-pagar-finanza');
  if (pagarBtn) { marcarPagado(pagarBtn.dataset.id); return; }
  // Editar finanza
  const editFinBtn = e.target.closest('.btn-editar-finanza');
  if (editFinBtn) {
    const fin = LIVE.finanzas.find(f => String(f.id) === String(editFinBtn.dataset.id));
    if (fin) openModalFinanza(fin);
    return;
  }
  // Editar proyecto
  const editBtn = e.target.closest('.btn-editar-proyecto');
  if (editBtn) {
    const proy = LIVE.proyectos.find(p => String(p.id) === String(editBtn.dataset.id));
    if (proy) openModalProyecto(proy);
    return;
  }
  // Toggle ticket (cerrar / reabrir)
  const toggleBtn = e.target.closest('.btn-toggle-ticket');
  if (toggleBtn) {
    toggleTicket(toggleBtn.dataset.id, toggleBtn.dataset.next);
    return;
  }
  // Gestionar lead
  const gestionarBtn = e.target.closest('.btn-gestionar-lead');
  if (gestionarBtn) {
    abrirGestionarLead(gestionarBtn.dataset.id, gestionarBtn.dataset.nombre, gestionarBtn.dataset.estado);
    return;
  }
  // Etapas: marcar estado
  const etapaBtn = e.target.closest('.btn-mark-etapa');
  if (etapaBtn) {
    marcarEtapa(etapaBtn.dataset.pid, etapaBtn.dataset.etapa, etapaBtn.dataset.next);
    return;
  }
  // Clientes: ver etapas del proyecto
  const verEtapasBtn = e.target.closest('.btn-ver-etapas');
  if (verEtapasBtn) {
    verEtapas(verEtapasBtn.dataset.pid);
    return;
  }
  // Clientes: ver tickets de un cliente
  const verTicketsBtn = e.target.closest('.btn-ver-tickets');
  if (verTicketsBtn) {
    verTicketsCliente(verTicketsBtn.dataset.email, verTicketsBtn.dataset.nombre);
    return;
  }
  // Testimonios: aprobar / ocultar
  const aprobarTestBtn = e.target.closest('.btn-aprobar-testimonio');
  if (aprobarTestBtn) { setTestimonioAprobado(aprobarTestBtn.dataset.id, true); return; }
  const rechazarTestBtn = e.target.closest('.btn-rechazar-testimonio');
  if (rechazarTestBtn) { setTestimonioAprobado(rechazarTestBtn.dataset.id, false); return; }
  // Responder ticket
  const respBtn = e.target.closest('.btn-responder');
  if (respBtn) {
    abrirModalRespuesta(respBtn.dataset.tid, respBtn.dataset.asunto, respBtn.dataset.msg);
    return;
  }
});

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('current-date').textContent =
    new Date().toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();

  startClock();
  await fetchAdminData();
  renderDashboard();
  renderProyectos();
  renderTickets();
  renderLeads();
  renderFinanzas();
  startAutoRefresh();
});
