/* ── Apex Admin — Mock Data + UI Logic ── */

const DATA = {
  proyectos: [
    {
      emoji: '🩺', nombre: 'Skindoctors CR', cliente: 'Andrés (Skindoctors)',
      estado: 'live', valor: 450, entrega: '2026-06-15', progreso: 95,
      tech: 'HTML/CSS/JS · n8n · S3'
    },
    {
      emoji: '🐔', nombre: 'EcoPollo', cliente: 'Tío Michael',
      estado: 'dev', valor: 350, entrega: '2026-07-01', progreso: 55,
      tech: 'HTML/CSS/JS · WhatsApp · S3'
    },
    {
      emoji: '🎬', nombre: 'VisionaryFilm', cliente: 'Fabian',
      estado: 'pending', valor: 0, entrega: 'TBD', progreso: 10,
      tech: 'HTML/CSS/JS · Cognito · S3'
    },
    {
      emoji: '🌿', nombre: 'Arte Verde', cliente: 'Tía Estefany',
      estado: 'pending', valor: 0, entrega: 'TBD', progreso: 0,
      tech: 'Por definir'
    },
    {
      emoji: '⚡', nombre: 'RFLX', cliente: 'Andrés',
      estado: 'pending', valor: 0, entrega: 'TBD', progreso: 0,
      tech: 'Por definir'
    }
  ],

  tickets: [
    {
      id: '#001', proyecto: 'Skindoctors CR', descripcion: 'Nav se rompe en iPhone SE',
      prioridad: 'alta', estado: 'open', fecha: '2026-06-12'
    },
    {
      id: '#002', proyecto: 'EcoPollo', descripcion: 'Agregar foto de productos sección 3',
      prioridad: 'normal', estado: 'open', fecha: '2026-06-11'
    },
    {
      id: '#003', proyecto: 'Skindoctors CR', descripcion: 'Cambiar número de WhatsApp footer',
      prioridad: 'normal', estado: 'closed', fecha: '2026-06-09'
    }
  ],

  leads: [
    {
      nombre: 'María Solano', contacto: '+506 8821-4455', servicio: 'Landing Page',
      mensaje: 'Necesito una landing para mi salón de uñas en Cartago', estado: 'new', fecha: '2026-06-12'
    },
    {
      nombre: 'Carlos Vargas', contacto: 'carlosv@gmail.com', servicio: 'Sistema Web',
      mensaje: 'Quiero un sistema para mi ferretería, con inventario y ventas', estado: 'new', fecha: '2026-06-11'
    },
    {
      nombre: 'Daniela Mora', contacto: '+506 7710-3322', servicio: 'Landing Page',
      mensaje: 'Landing para consultorio médico, necesita formulario de citas', estado: 'new', fecha: '2026-06-10'
    },
    {
      nombre: 'Tienda Tico', contacto: '+506 8899-1234', servicio: 'Automatización + AI',
      mensaje: 'Quiero automatizar mi WhatsApp con respuestas automáticas', estado: 'contacted', fecha: '2026-06-08'
    },
    {
      nombre: 'Barbería Roots', contacto: 'roots@mail.com', servicio: 'Landing Page',
      mensaje: 'Landing básica con fotos y horario, nada muy complejo', estado: 'closed', fecha: '2026-06-05'
    }
  ]
};

/* ── Helpers ── */
function estadoBadge(estado) {
  const map = {
    live:      '<span class="badge badge-live">Live</span>',
    dev:       '<span class="badge badge-dev">Desarrollo</span>',
    pending:   '<span class="badge badge-pending">Pendiente</span>',
    open:      '<span class="badge badge-open">Abierto</span>',
    closed:    '<span class="badge badge-closed">Cerrado</span>',
    new:       '<span class="badge badge-new">Nuevo</span>',
    contacted: '<span class="badge badge-dev">Contactado</span>'
  };
  return map[estado] || `<span class="badge">${estado}</span>`;
}

function prioridadBadge(p) {
  if (p === 'alta')   return '<span class="badge badge-hot">Alta</span>';
  if (p === 'urgente') return '<span class="badge badge-hot">Urgente</span>';
  return '<span class="badge badge-closed">Normal</span>';
}

function formatDate(d) {
  if (!d || d === 'TBD') return '—';
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ── Render Dashboard ── */
function renderDashboard() {
  const activos = DATA.proyectos.filter(p => p.estado === 'live' || p.estado === 'dev').length;
  const openTickets = DATA.tickets.filter(t => t.estado === 'open').length;
  const newLeads = DATA.leads.filter(l => l.estado === 'new').length;
  const ingresos = DATA.proyectos.filter(p => p.valor > 0).reduce((a, b) => a + b.valor, 0);

  document.getElementById('m-proyectos').textContent = activos;
  document.getElementById('m-tickets').textContent = openTickets;
  document.getElementById('m-leads').textContent = newLeads;
  document.getElementById('m-ingresos').textContent = `$${ingresos.toLocaleString()}`;

  // Proyectos en dashboard
  const dpEl = document.getElementById('dash-proyectos');
  dpEl.innerHTML = DATA.proyectos.slice(0, 4).map(p => `
    <div class="project-row">
      <span class="pr-emoji">${p.emoji}</span>
      <div class="pr-info">
        <div class="pr-name">${p.nombre}</div>
        <div class="pr-client">${p.cliente}</div>
        <div class="progress-wrap">
          <div class="progress-bar"><div class="progress-fill" style="width:${p.progreso}%"></div></div>
          <div class="progress-label"><span>${p.progreso}%</span><span>${formatDate(p.entrega)}</span></div>
        </div>
      </div>
      <div style="text-align:right; flex-shrink:0;">
        ${estadoBadge(p.estado)}
        ${p.valor > 0 ? `<div class="pr-value" style="margin-top:6px;">$${p.valor}</div>` : ''}
      </div>
    </div>
  `).join('');

  // Leads en dashboard
  const dlEl = document.getElementById('dash-leads');
  dlEl.innerHTML = DATA.leads.filter(l => l.estado === 'new').slice(0, 4).map(l => `
    <div class="lead-row">
      <div class="lead-avatar">${l.nombre[0]}</div>
      <div class="lead-info">
        <div class="lead-name">${l.nombre}</div>
        <div class="lead-contact">${l.servicio} · ${l.contacto}</div>
      </div>
      <div>
        ${estadoBadge(l.estado)}
        <div class="lead-time" style="margin-top:5px;">${formatDate(l.fecha)}</div>
      </div>
    </div>
  `).join('') || '<div class="empty-state"><div class="empty-icon">📭</div><p class="empty-text">No hay leads nuevos</p></div>';
}

/* ── Render Proyectos ── */
function renderProyectos() {
  document.getElementById('tbody-proyectos').innerHTML = DATA.proyectos.map(p => `
    <tr>
      <td><span style="font-size:20px;margin-right:8px;">${p.emoji}</span><strong>${p.nombre}</strong></td>
      <td style="color:var(--muted2)">${p.cliente}</td>
      <td>${estadoBadge(p.estado)}</td>
      <td style="color:var(--blue-lite);font-family:'Unbounded',sans-serif;font-weight:700;">${p.valor > 0 ? '$' + p.valor : '—'}</td>
      <td style="color:var(--muted)">${formatDate(p.entrega)}</td>
      <td style="min-width:140px;">
        <div class="progress-bar"><div class="progress-fill" style="width:${p.progreso}%"></div></div>
        <div style="font-size:9px;color:var(--muted);margin-top:3px;">${p.progreso}%</div>
      </td>
      <td>
        <button class="action-btn">Editar</button>
      </td>
    </tr>
  `).join('');
}

/* ── Render Tickets ── */
function renderTickets() {
  document.getElementById('tbody-tickets').innerHTML = DATA.tickets.map(t => `
    <tr>
      <td><code style="color:var(--blue-lite)">${t.id}</code></td>
      <td>${t.proyecto}</td>
      <td style="max-width:260px;color:var(--muted2)">${t.descripcion}</td>
      <td>${prioridadBadge(t.prioridad)}</td>
      <td>${estadoBadge(t.estado)}</td>
      <td style="color:var(--muted)">${formatDate(t.fecha)}</td>
      <td>
        ${t.estado === 'open' ? '<button class="action-btn" style="color:var(--green);border-color:rgba(16,185,129,0.4)">✓ Cerrar</button>' : '<button class="action-btn">Reabrir</button>'}
      </td>
    </tr>
  `).join('');
}

/* ── Render Leads ── */
function renderLeads() {
  document.getElementById('tbody-leads').innerHTML = DATA.leads.map(l => `
    <tr>
      <td><strong>${l.nombre}</strong></td>
      <td style="color:var(--muted2)">${l.contacto}</td>
      <td>${l.servicio}</td>
      <td style="max-width:220px;color:var(--muted);font-size:11px;">${l.mensaje.slice(0, 60)}${l.mensaje.length > 60 ? '…' : ''}</td>
      <td>${estadoBadge(l.estado)}</td>
      <td style="color:var(--muted)">${formatDate(l.fecha)}</td>
      <td style="display:flex;gap:6px;flex-wrap:wrap;">
        <a href="https://wa.me/${l.contacto.replace(/\D/g,'')}" target="_blank" class="action-btn" style="color:#25d366;border-color:rgba(37,211,102,0.4);text-decoration:none;">WA</a>
        <button class="action-btn">Gestionar</button>
      </td>
    </tr>
  `).join('');
}

/* ── Tab switching ── */
function switchTab(name) {
  document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tb-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  const tabs = ['dashboard','proyectos','tickets','leads'];
  const idx = tabs.indexOf(name);
  document.querySelectorAll('.tb-tab')[idx].classList.add('active');
}

/* ── Modales ── */
function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => {
    if (e.target === m) m.classList.remove('open');
  });
});

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('current-date').textContent =
    new Date().toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();

  renderDashboard();
  renderProyectos();
  renderTickets();
  renderLeads();
});
