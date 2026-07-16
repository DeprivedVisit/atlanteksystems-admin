/* ── Apex Cloud Work — Portal JS ── */

const API_BASE   = window.APEX_API_BASE || '';
const PORTAL_API = `${API_BASE}/api/portal`;

const _nativeFetch = window.fetch.bind(window);
window.fetch = (input, init = {}) => _nativeFetch(input, { ...init, credentials: 'include' });

// ─────────────────────────────────────────────
//  AUTH HELPERS
// ─────────────────────────────────────────────

async function portalLogin(email, password) {
  try {
    const res = await fetch(`${PORTAL_API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Error de conexión. Intentá de nuevo.' };
  }
}

function portalLogout() {
  fetch(`${PORTAL_API}/logout`, { method: 'POST' }).finally(() => {
    window.location.href = 'index.html';
  });
}

// ─────────────────────────────────────────────
//  DASHBOARD INIT
// ─────────────────────────────────────────────

// Preview local sin backend — solo aplica en hosts de desarrollo (localhost o IP privada
// de Live Server), en producción nunca entra.
const PORTAL_DEV_PREVIEW = /^(localhost|127\.0\.0\.1|\[::1\]|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})$/.test(location.hostname);

async function initDashboard() {
  let me;
  try {
    const r = await fetch(`${PORTAL_API}/me`);
    if (r.status === 401) { window.location.href = 'index.html'; return; }
    me = await r.json();
  } catch (err) {
    if (PORTAL_DEV_PREVIEW) { renderDevPreview(); return; }
    window.location.href = 'index.html';
    return;
  }

  // Greeting en header
  const greetEl = document.getElementById('dh-greeting');
  if (greetEl) greetEl.innerHTML = `Hola, <span>${me.nombre.split(' ')[0]}</span>`;

  const main = document.getElementById('dash-main');

  try {
    const res  = await fetch(`${PORTAL_API}/gs?accion=portal`);
    const data = await res.json();

    if (!data.success) {
      if (data.error && data.error.includes('inválida')) { portalLogout(); return; }
      main.innerHTML = renderError(data.error);
      return;
    }

    switch (data.user.tipo) {
      case 'landing': main.innerHTML = renderLandingView(data); break;
      case 'plan':    main.innerHTML = renderPlanView(data);    break;
      case 'lead':    main.innerHTML = renderLeadView(data);    break;
      default:        main.innerHTML = renderError('Tipo de cuenta desconocido.');
    }

    // Título de página con nombre del proyecto
    if (data.proyecto) document.title = `${data.proyecto.nombre_proyecto} — Apex`;

  } catch (err) {
    main.innerHTML = renderError('Error de conexión. Intentá recargar la página.');
  }
}

// Vista demo con datos de ejemplo para trabajar el diseño sin backend.
// Cambiar de vista con ?vista=landing | plan | lead en la URL.
function renderDevPreview() {
  const greetEl = document.getElementById('dh-greeting');
  if (greetEl) greetEl.innerHTML = 'Hola, <span>Garett</span>';

  const demo = {
    user: { tipo: 'landing' },
    proyecto: { nombre_proyecto: 'Demo — Skindoctors CR', etapa_actual: 'Desarrollo', preview_url: '' },
    etapas: [
      { etapa: 'Brief y paleta',            estado: 'completado',  fecha_completado: '01 jul 2026' },
      { etapa: 'Diseño y estructura',       estado: 'completado',  fecha_completado: '03 jul 2026' },
      { etapa: 'Desarrollo HTML/CSS/JS',    estado: 'en_progreso' },
      { etapa: 'Preview en S3 + revisiones', estado: 'pendiente' },
      { etapa: 'Deploy final',              estado: 'pendiente' },
    ],
    tickets: [{
      asunto: 'Ejemplo de consulta', estado: 'respondido', fecha: '05 jul 2026',
      mensaje: '¿Se puede cambiar la foto del hero?',
      respuestas: [{ autor: 'Garett — Apex', mensaje: 'Claro, mandámela por WhatsApp y la subo hoy.', fecha: '05 jul 2026' }],
    }],
  };

  const vista  = new URLSearchParams(location.search).get('vista') || 'landing';
  const main   = document.getElementById('dash-main');
  const banner = '<div class="notice notice-info" style="margin-bottom:16px;">Vista DEMO local — backend apagado, datos de ejemplo. Probá ?vista=plan y ?vista=lead. En producción esto nunca aparece.</div>';

  switch (vista) {
    case 'plan': main.innerHTML = banner + renderPlanView(demo); break;
    case 'lead': main.innerHTML = banner + renderLeadView(demo); break;
    default:     main.innerHTML = banner + renderLandingView(demo);
  }
  document.title = 'Portal (demo local) — Apex';
}

// ─────────────────────────────────────────────
//  RENDER: LANDING VIEW
// ─────────────────────────────────────────────

function renderLandingView(data) {
  const { proyecto, etapas, tickets } = data;
  if (!proyecto) {
    return `<div class="empty-state"><div class="empty-icon">🏗️</div><p class="empty-text">Tu proyecto está siendo configurado. En breve aparecerá aquí.</p></div>`;
  }

  const etapaActual = proyecto.etapa_actual || (etapas.length > 0 ? etapas[0].etapa : '—');
  const completadas = etapas.filter(e => e.estado === 'completado').length;
  const total       = etapas.length;
  const pct         = total > 0 ? Math.round((completadas / total) * 100) : 0;

  return `
    <!-- Proyecto Header -->
    <div class="proyecto-header">
      <div class="ph-row">
        <div>
          <div class="ph-name">${proyecto.nombre_proyecto}</div>
          <div class="ph-tipo">Landing Page · Apex Cloud Work</div>
        </div>
        <div>${estadoBadge(proyecto.etapa_actual)}</div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;font-size:12px;color:var(--text3);">
        <div style="flex:1;height:4px;background:var(--raised);border-radius:2px;overflow:hidden;">
          <div style="height:100%;width:${pct}%;background:var(--gold);border-radius:2px;transition:width 0.5s;"></div>
        </div>
        <span style="flex-shrink:0;color:var(--gold);font-weight:700;">${pct}%</span>
        <span>${completadas}/${total} etapas</span>
      </div>
    </div>

    <!-- Etapas -->
    <div class="section-block">
      <div class="section-label">Progreso del proyecto</div>
      ${renderEtapas(etapas)}
    </div>

    ${proyecto.preview_url ? renderPreview(proyecto.preview_url) : ''}

    <!-- Consultas -->
    <div class="section-block">
      <div class="section-label">Consultas y solicitudes</div>
      <button class="btn-new-ticket" onclick="openTicketModal()">
        + Nueva consulta
      </button>
      ${renderTickets(tickets)}
    </div>
  `;
}

// ─────────────────────────────────────────────
//  RENDER: PLAN VIEW
// ─────────────────────────────────────────────

function renderPlanView(data) {
  const { proyecto, etapas, tickets } = data;

  const servicios = [
    { icon: '🌐', name: 'Landing Page activa',    desc: 'Tu sitio live en dominio propio' },
    { icon: '🔧', name: 'Mantenimiento mensual',   desc: 'Cambios de texto, imágenes y ajustes' },
    { icon: '📊', name: 'Leads por WhatsApp',      desc: 'Formularios conectados a tu WhatsApp' },
    { icon: '☁️',  name: 'Hosting en AWS',          desc: 'S3 + CloudFront · 99.9% uptime' },
    { icon: '🚀', name: '2 revisiones incluidas',  desc: 'Cambios a pedido por trimestre' }
  ];

  return `
    ${proyecto ? `
    <div class="proyecto-header">
      <div class="ph-row">
        <div>
          <div class="ph-name">${proyecto.nombre_proyecto}</div>
          <div class="ph-tipo">Plan Trimestral · Apex Cloud Work</div>
        </div>
        <div><span class="badge badge-live">● Activo</span></div>
      </div>
    </div>` : ''}

    <!-- Etapas si existen -->
    ${etapas.length > 0 ? `
    <div class="section-block">
      <div class="section-label">Estado del setup</div>
      ${renderEtapas(etapas)}
    </div>` : ''}

    <!-- Servicios incluidos -->
    <div class="section-block">
      <div class="section-label">Servicios incluidos en tu plan</div>
      <div class="services-grid">
        ${servicios.map(s => `
          <div class="service-card">
            <div class="sc-icon">${s.icon}</div>
            <div class="sc-name">${s.name}</div>
            <div class="sc-desc">${s.desc}</div>
            <span class="badge badge-live" style="font-size:10px;">Activo</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Consultas -->
    <div class="section-block">
      <div class="section-label">Consultas y solicitudes</div>
      <button class="btn-new-ticket" onclick="openTicketModal()">
        + Nueva consulta
      </button>
      ${renderTickets(tickets)}
    </div>
  `;
}

// ─────────────────────────────────────────────
//  RENDER: LEAD VIEW
// ─────────────────────────────────────────────

function renderLeadView(data) {
  const servicios = [
    { icon: '🌐', name: 'Landing Page', price: '$350 USD', desc: 'Setup único · Pago una vez' },
    { icon: '📦', name: 'Plan Trimestral', price: '$900 USD', desc: '3 meses · Mantenimiento incluido' },
    { icon: '🔧', name: 'Mantenimiento', price: '$75 USD/mes', desc: 'Cambios ilimitados · Soporte' },
    { icon: '⚡', name: 'Landing Extra', price: '$150 USD', desc: 'Segunda landing para tu negocio' }
  ];

  return `
    <div class="lead-hero">
      <div class="lead-hero-title">Tu propuesta de Apex Cloud Work</div>
      <p class="lead-hero-sub">
        Hemos preparado una propuesta personalizada para tu proyecto.
        Revisá los servicios abajo y escribinos para arrancar.
      </p>
      <a href="https://wa.me/50663144171?text=Hola%20Garett%2C%20vi%20mi%20propuesta%20en%20el%20portal%20y%20quiero%20arrancar" target="_blank" class="btn-wa">
        💬 Hablar con Garett
      </a>
    </div>

    <div class="section-block">
      <div class="section-label">Servicios disponibles</div>
      <div class="services-list">
        ${servicios.map(s => `
          <div class="sl-item">
            <div class="sl-icon">${s.icon}</div>
            <div class="sl-name">${s.name}</div>
            <div class="sl-price">${s.price}</div>
            <div class="sl-desc">${s.desc}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="section-block">
      <div class="section-label">¿Tenés alguna pregunta?</div>
      <div class="notice notice-info">
        Escribinos por WhatsApp o envianos una consulta desde acá y te respondemos en menos de 24h.
      </div>
      <button class="btn-new-ticket" onclick="openTicketModal()">
        + Enviar consulta
      </button>
      ${renderTickets(data.tickets || [])}
    </div>
  `;
}

// ─────────────────────────────────────────────
//  RENDER: SUB-COMPONENTES
// ─────────────────────────────────────────────

function renderEtapas(etapas) {
  if (!etapas || etapas.length === 0) {
    return '<div class="notice notice-info">Las etapas del proyecto serán visibles pronto.</div>';
  }

  const items = etapas.map(e => {
    const estado    = e.estado || 'pendiente';
    const icono     = estado === 'completado' ? '✓' : estado === 'en_progreso' ? '◉' : '○';
    const notaHtml  = e.nota ? `<div class="etapa-nota">💬 ${e.nota}</div>` : '';

    return `
      <div class="etapa-item">
        <div class="etapa-dot ${estado}">${icono}</div>
        <div class="etapa-info">
          <div class="etapa-nombre ${estado}">${e.etapa}</div>
          ${e.fecha_completado ? `<div class="etapa-fecha">${e.fecha_completado}</div>` : ''}
        </div>
        ${notaHtml}
      </div>
    `;
  }).join('');

  return `<div class="etapas-track">${items}</div>`;
}

function renderPreview(url) {
  return `
    <div class="section-block">
      <div class="section-label">Preview en vivo</div>
      <div class="preview-frame-wrap">
        <div class="preview-label">
          <div class="preview-dot"></div>
          Vista previa de tu landing
          <span style="margin-left:auto;">
            <a href="${url}" target="_blank" style="color:var(--gold);font-size:11px;text-decoration:none;">Abrir en nueva pestaña ↗</a>
          </span>
        </div>
        <div class="preview-iframe-container">
          <iframe src="${url}" title="Preview" loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>
        </div>
      </div>
    </div>
  `;
}

function renderTickets(tickets) {
  if (!tickets || tickets.length === 0) {
    return `
      <div class="ticket-empty">
        <div class="empty-icon">📭</div>
        <p>No tenés consultas enviadas todavía.</p>
        <p style="margin-top:6px;font-size:12px;">Usá el botón de arriba para enviar tu primera consulta.</p>
      </div>
    `;
  }

  return `
    <div class="ticket-list">
      ${tickets.map(t => {
        const respuestas = t.respuestas || [];
        return `
          <div class="ticket-card">
            <div class="ticket-header">
              <div class="ticket-asunto">${t.asunto}</div>
              <span class="badge ${t.estado === 'respondido' ? 'badge-resp' : 'badge-open'}">
                ${t.estado === 'respondido' ? '✓ Respondido' : '● Abierto'}
              </span>
            </div>
            <div class="ticket-meta">${t.fecha}</div>
            <div class="ticket-msg">${t.mensaje}</div>
            ${respuestas.length > 0 ? `
              <div class="respuestas-list">
                ${respuestas.map(r => `
                  <div class="respuesta-item">
                    <div class="resp-autor">${r.autor}</div>
                    <div class="resp-msg">${r.mensaje}</div>
                    <div class="resp-fecha">${r.fecha}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function estadoBadge(etapa) {
  if (!etapa) return '<span class="badge badge-pending">● En proceso</span>';
  if (etapa === 'Live') return '<span class="badge badge-live">● Live</span>';
  return `<span class="badge badge-dev">● ${etapa}</span>`;
}

function renderError(msg) {
  return `
    <div class="empty-state">
      <div class="empty-icon">⚠️</div>
      <p class="empty-text">${msg || 'Ocurrió un error inesperado.'}</p>
      <button onclick="window.location.reload()" style="margin-top:16px;padding:8px 18px;background:var(--gold);color:#0a0704;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-family:inherit;">
        Reintentar
      </button>
    </div>
  `;
}

function renderNotConfigured() {
  return `
    <div class="empty-state">
      <div class="empty-icon">🔧</div>
      <p class="empty-text">Portal en configuración.<br>Contactá a Apex para más información.</p>
      <a href="https://wa.me/50663144171" target="_blank" style="display:inline-flex;align-items:center;gap:8px;margin-top:16px;padding:10px 20px;background:#25d366;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;">
        💬 Escribir por WhatsApp
      </a>
    </div>
  `;
}

// ─────────────────────────────────────────────
//  TICKET MODAL
// ─────────────────────────────────────────────

function openTicketModal() {
  document.getElementById('t-asunto').value = '';
  document.getElementById('t-msg').value    = '';
  document.getElementById('ticket-error').style.display = 'none';
  document.getElementById('modal-ticket').classList.add('open');
}

function closeTicketModal() {
  document.getElementById('modal-ticket').classList.remove('open');
}

async function submitTicket() {
  const asunto = document.getElementById('t-asunto').value.trim();
  const msg    = document.getElementById('t-msg').value.trim();
  const errEl  = document.getElementById('ticket-error');
  const btn    = document.getElementById('btn-send-ticket');

  errEl.style.display = 'none';

  if (!asunto || !msg) {
    errEl.textContent = 'Completá el asunto y la descripción.';
    errEl.style.display = 'block';
    return;
  }

  btn.disabled    = true;
  btn.textContent = 'Enviando…';

  try {
    const res  = await fetch(`${PORTAL_API}/gs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'addTicket', asunto, mensaje: msg })
    });
    const data = await res.json();

    if (res.status === 401) { portalLogout(); return; }

    if (data.success) {
      closeTicketModal();
      // Mostrar confirmación y recargar datos
      const main = document.getElementById('dash-main');
      if (main) {
        const notice = document.createElement('div');
        notice.className = 'notice notice-success';
        notice.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;max-width:320px;';
        notice.textContent = '✓ Consulta enviada. Te respondemos pronto.';
        document.body.appendChild(notice);
        setTimeout(() => { notice.remove(); initDashboard(); }, 2500);
      }
    } else {
      errEl.textContent = data.error || 'Error al enviar.';
      errEl.style.display = 'block';
    }
  } catch (err) {
    errEl.textContent = 'Error de conexión. Intentá de nuevo.';
    errEl.style.display = 'block';
  }

  btn.disabled    = false;
  btn.textContent = 'Enviar consulta';
}

// Cerrar modal al click fuera
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});
