/* ═══════════════════════════════════════════════════════════════
   Atlantek · app.js — vistas, router y eventos
   ═══════════════════════════════════════════════════════════════ */

(() => {
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const main    = $('#main');
  const docview = $('#docview');
  const sheet   = $('#sheet');
  const modal   = $('#modal');
  const modalPanel = $('#modal-panel');

  /* ── Helpers ── */
  const esc = (s) => String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const fmt = (n) => '₡' + (Number(n) || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  });

  const fmtPlain = (n) => (Number(n) || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  });

  const fmtDate = (iso) => {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    return `${Number(m)}/${Number(d)}/${y}`;
  };

  const numDoc = (n) => String(n).padStart(3, '0');
  const hoy = () => new Date().toISOString().slice(0, 10);

  const ESTADOS = ['borrador', 'enviada', 'pagada'];
  const chipEstado = (e) => `<span class="chip chip--${e}">${e}</span>`;
  const chipTipo   = (t) => `<span class="chip chip--${t}">${t}</span>`;

  /* Días transcurridos desde una fecha ISO (yyyy-mm-dd) */
  const daysSince = (iso) => {
    if (!iso) return 0;
    return Math.max(0, Math.floor((Date.now() - new Date(iso.slice(0, 10) + 'T00:00:00')) / 864e5));
  };

  /* Link de WhatsApp: 8 dígitos → prefijo 506 · sin teléfono → selector */
  const waHref = (tel, text) => {
    const d = String(tel || '').replace(/\D/g, '');
    const phone = d.length === 8 ? '506' + d : d;
    const q = text ? `?text=${encodeURIComponent(text)}` : '';
    return phone ? `https://wa.me/${phone}${q}` : `https://wa.me/${q}`;
  };

  /* Fecha corta de un lead (ISO datetime) */
  const fmtLeadFecha = (iso) => {
    const d = new Date(iso);
    if (isNaN(d)) return '—';
    const dias = Math.floor((Date.now() - d.getTime()) / 864e5);
    const fecha = `${d.getDate()}/${d.getMonth() + 1}`;
    return dias === 0 ? `hoy ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}` : `${fecha} · hace ${dias} d`;
  };

  /* Badge de leads nuevos en el sidebar */
  function updateLeadsBadge() {
    const b = $('#nav-badge-leads');
    if (!b) return;
    const n = Store.leadsNuevos();
    b.hidden = !n;
    b.textContent = n;
  }

  /* ═══════════ ROUTER ═══════════ */

  function route() {
    const hash = location.hash || '#/dashboard';
    const [, view, param] = hash.split('/');

    // Check authentication for protected views
    const protectedViews = ['dashboard', 'clientes', 'catalogo', 'documentos', 'legal', 'leads', 'editor', 'doc'];
    if (protectedViews.includes(view)) {
      const user = Auth.getUser();
      if (!user) {
        // Redirect to login by clearing hash
        location.hash = '#/dashboard';
        return;
      }
    }

    destroyCharts();

    docview.hidden = true;
    closeModal();

    $$('.nav-item').forEach(a => a.classList.toggle('is-active', a.dataset.nav === view));

    if (view === 'clientes')        renderClientes();
    else if (view === 'catalogo')   renderCatalogo();
    else if (view === 'documentos') renderDocumentos();
    else if (view === 'legal')      renderLegal();
    else if (view === 'leads')      renderLeads();
    else if (view === 'editor')     renderEditor(param || null);
    else if (view === 'doc' && param) renderDocView(param);
    else renderDashboard();

    updateLeadsBadge();
  }

  window.addEventListener('hashchange', route);

  /* ═══════════ DASHBOARD ═══════════ */

  function renderDashboard() {
    const docs = Store.getDocs();
    const clients = Store.getClients();

    const totalPagado    = docs.filter(d => d.estado === 'pagada').reduce((s, d) => s + Store.docTotal(d), 0);
    const totalPendiente = docs.filter(d => d.estado === 'enviada').reduce((s, d) => s + Store.docTotal(d), 0);

    const recientes = docs.slice(0, 6);

    main.innerHTML = `
      <div class="view-head">
        <div>
          <span class="view-head__kicker">Atlantek · Gestión</span>
          <h1>Dashboard</h1>
        </div>
        <a href="#/editor" class="btn btn--navy">+ Nueva proforma</a>
      </div>

      <div class="stats">
        <div class="stat stat--red">
          <span class="stat__label">Por cobrar</span>
          <span class="stat__value">${fmt(totalPendiente)}</span>
          <span class="stat__hint">documentos enviados</span>
        </div>
        <div class="stat">
          <span class="stat__label">Cobrado</span>
          <span class="stat__value">${fmt(totalPagado)}</span>
          <span class="stat__hint">documentos pagados</span>
        </div>
        <div class="stat">
          <span class="stat__label">Documentos</span>
          <span class="stat__value">${docs.length}</span>
          <span class="stat__hint">próximo Nº ${numDoc(Store.nextNumber())}</span>
        </div>
        <div class="stat">
          <span class="stat__label">Clientes</span>
          <span class="stat__value">${clients.length}</span>
          <span class="stat__hint">registrados</span>
        </div>
        <a href="#/leads" class="stat stat--link ${Store.leadsNuevos() ? 'stat--red' : ''}">
          <span class="stat__label">Leads nuevos</span>
          <span class="stat__value">${Store.leadsNuevos()}</span>
          <span class="stat__hint">del sitio web · ver →</span>
        </a>
      </div>

      <div class="dashboard-charts">
        <div class="chart-row">
          <div class="chart-wrapper">
            <div class="chart-header">
              <span class="chart-title">Ventas mensuales</span>
              <span class="chart-subtitle">Últimos 6 meses</span>
            </div>
            <canvas id="chart-ventas-mensuales" height="200"></canvas>
          </div>
          <div class="chart-wrapper">
            <div class="chart-header">
              <span class="chart-title">Top 5 clientes</span>
              <span class="chart-subtitle">Por facturación total</span>
            </div>
            <canvas id="chart-top-clientes" height="200"></canvas>
          </div>
        </div>
        <div class="chart-row">
          <div class="chart-wrapper">
            <div class="chart-header">
              <span class="chart-title">Estado de documentos</span>
              <span class="chart-subtitle">Distribución actual</span>
            </div>
            <canvas id="chart-estado-docs" height="200"></canvas>
          </div>
          <div class="chart-wrapper">
            <div class="chart-header">
              <span class="chart-title">Leads por estado</span>
              <span class="chart-subtitle">Embudo de conversión</span>
            </div>
            <canvas id="chart-leads-estado" height="200"></canvas>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel__head">
          <span class="panel__title">Documentos recientes</span>
          <a href="#/documentos" class="btn btn--ghost btn--sm">Ver todos</a>
        </div>
        ${tablaDocs(recientes)}
      </div>
    `;
    bindDocRows();
    renderDashboardCharts(docs, clients);
  }

  /* ═══════════ DASHBOARD CHARTS ═══════════ */

  const chartInstances = {};

  function destroyCharts() {
    Object.values(chartInstances).forEach(chart => chart.destroy());
    Object.keys(chartInstances).forEach(k => delete chartInstances[k]);
  }

  // Expose for debugging
  window.chartInstances = chartInstances;

  function renderDashboardCharts(docs, clients) {
    destroyCharts();

    const { Chart } = window;
    if (!Chart) return;

    /* --- Colores Atlantek --- */
    const colors = {
      primary: '#1a6aff',
      primaryLight: 'rgba(26,106,255,0.15)',
      success: '#10b981',
      successLight: 'rgba(16,185,129,0.15)',
      warning: '#f59e0b',
      warningLight: 'rgba(245,158,11,0.15)',
      danger: '#ef4444',
      dangerLight: 'rgba(239,68,68,0.15)',
      muted: '#64748b',
      grid: 'rgba(148,163,184,0.15)',
      text: '#94a3b8'
    };

    const commonOpts = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f1f5f9',
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(148,163,184,0.2)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          displayColors: false
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: colors.text, font: { size: 11 } } },
        y: { grid: { color: colors.grid }, ticks: { color: colors.text, font: { size: 11 }, callback: v => '₡' + Number(v).toLocaleString('es-CR') } }
      }
    };

    /* 1. Ventas mensuales (últimos 6 meses) */
    const byMonth = {};
    docs.filter(d => d.estado !== 'borrador').forEach(d => {
      const key = String(d.fechaEmision || '').slice(0, 7);
      if (!/^\d{4}-\d{2}$/.test(key)) return;
      byMonth[key] = (byMonth[key] || 0) + Store.docTotal(d);
    });
    const meses = Object.keys(byMonth).sort().slice(-6);
    const labelsMeses = meses.map(m => {
      const [y, mm] = m.split('-');
      const n = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      return `${n[Number(mm)-1]} ${y.slice(2)}`;
    });
    const dataMeses = meses.map(m => byMonth[m]);

    chartInstances.ventasMensuales = window.chartInstances.ventasMensuales = new Chart(document.getElementById('chart-ventas-mensuales'), {
      type: 'bar',
      data: { labels: labelsMeses, datasets: [{ label: 'Ventas (₡)', data: dataMeses, backgroundColor: colors.primaryLight, borderColor: colors.primary, borderWidth: 2, borderRadius: 6, borderSkipped: false }] },
      options: { ...commonOpts, plugins: { ...commonOpts.plugins, tooltip: { ...commonOpts.plugins.tooltip, callbacks: { label: ctx => `₡${ctx.parsed.y.toLocaleString('es-CR')}` } } } }
    });

    /* 2. Top 5 clientes por facturación */
    const clientTotals = clients.map(c => {
      const cDocs = docs.filter(d => d.clientId === c.id && d.estado !== 'borrador');
      const total = cDocs.reduce((s, d) => s + Store.docTotal(d), 0);
      return { nombre: c.nombre, total };
    }).filter(c => c.total > 0).sort((a,b) => b.total - a.total).slice(0,5);

    if (clientTotals.length) {
      chartInstances.topClientes = window.chartInstances.topClientes = new Chart(document.getElementById('chart-top-clientes'), {
        type: 'doughnut',
        data: { labels: clientTotals.map(c => c.nombre), datasets: [{ data: clientTotals.map(c => c.total), backgroundColor: [colors.primary, colors.success, colors.warning, colors.danger, colors.muted].slice(0, clientTotals.length), borderWidth: 0, hoverOffset: 8 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { ...commonOpts.plugins, legend: { display: true, position: 'right', labels: { color: colors.text, font: { size: 11 }, padding: 12, usePointStyle: true, pointStyle: 'circle' } }, tooltip: { ...commonOpts.plugins.tooltip, callbacks: { label: ctx => `${ctx.label}: ₡${ctx.parsed.toLocaleString('es-CR')}` } } } }
      });
    }

    /* 3. Estado de documentos */
    const estados = ['borrador', 'enviada', 'pagada'];
    const estadoLabels = { borrador: 'Borrador', enviada: 'Enviada', pagada: 'Pagada' };
    const estadoCounts = estados.map(e => docs.filter(d => d.estado === e).length);
    const estadoColors = { borrador: colors.muted, enviada: colors.warning, pagada: colors.success };
    const estadoBg = estados.map(e => estadoColors[e] + '33');
    const estadoBorder = estados.map(e => estadoColors[e]);

    chartInstances.estadoDocs = window.chartInstances.estadoDocs = new Chart(document.getElementById('chart-estado-docs'), {
      type: 'doughnut',
      data: { labels: estados.map(e => estadoLabels[e]), datasets: [{ data: estadoCounts, backgroundColor: estadoBg, borderColor: estadoBorder, borderWidth: 2, hoverOffset: 8 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { ...commonOpts.plugins, legend: { display: true, position: 'right', labels: { color: colors.text, font: { size: 11 }, padding: 12, usePointStyle: true, pointStyle: 'circle' } }, tooltip: { ...commonOpts.plugins.tooltip, callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed}` } } } }
    });

    /* 4. Leads por estado */
    const leads = Store.getLeads() || [];
    const leadEstados = Store.LEAD_ESTADOS || ['nuevo','contactado','cotizado','ganado','perdido'];
    const leadLabels = leadEstados.map(e => e.charAt(0).toUpperCase() + e.slice(1));
    const leadCounts = leadEstados.map(e => leads.filter(l => (l.estado || 'nuevo') === e).length);
    const leadColors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#64748b'];

    chartInstances.leadsEstado = window.chartInstances.leadsEstado = new Chart(document.getElementById('chart-leads-estado'), {
      type: 'bar',
      data: { labels: leadLabels, datasets: [{ label: 'Leads', data: leadCounts, backgroundColor: leadColors.map(c => c + '33'), borderColor: leadColors, borderWidth: 2, borderRadius: 6, indexAxis: 'y' }] },
      options: { ...commonOpts, indexAxis: 'y', scales: { x: { ...commonOpts.scales.x, grid: { color: colors.grid }, ticks: { color: colors.text, font: { size: 11 }, callback: v => v } }, y: { ...commonOpts.scales.y, grid: { display: false } } }, plugins: { ...commonOpts.plugins, tooltip: { ...commonOpts.plugins.tooltip, callbacks: { label: ctx => `${ctx.parsed.x} leads` } } } }
    });
  }

  /* ═══════════ CLIENTES ═══════════ */

  function renderClientes() {
    const clients = Store.getClients();
    const docs = Store.getDocs();

    const rows = clients.map(c => {
      const cDocs = docs.filter(d => d.clientId === c.id);
      const total = cDocs.reduce((s, d) => s + Store.docTotal(d), 0);
      const productos = (c.productos || []).slice(0, 2).join(', ');
      const moreCount = (c.productos || []).length > 2 ? ` +${c.productos.length - 2}` : '';
      const estado = c.estado || 'activo';
      const estadoChip = estado === 'activo'
        ? '<span class="chip chip--pagada">activo</span>'
        : '<span class="chip chip--borrador">inactivo</span>';
      return `
        <tr>
          <td><b>${esc(c.nombre)}</b></td>
          <td>${esc(c.contacto) || '<span style="color:var(--muted)">—</span>'}</td>
          <td>${esc(c.telefono) || '<span style="color:var(--muted)">—</span>'}</td>
          <td>${estadoChip}</td>
          <td><span style="font-size:12.5px">${esc(productos) || '<span style="color:var(--muted)">—</span>'}${moreCount ? '<span style="color:var(--faint)">'+esc(moreCount)+'</span>' : ''}</span></td>
          <td>${cDocs.length}</td>
          <td class="num money">${fmt(total)}</td>
          <td class="num">
            <button class="btn--icon btn" data-edit-client="${c.id}">Editar</button>
            <button class="btn--icon btn" data-del-client="${c.id}">Eliminar</button>
          </td>
        </tr>`;
    }).join('');

    main.innerHTML = `
      <div class="view-head">
        <div>
          <span class="view-head__kicker">Atlantek · Gestión</span>
          <h1>Clientes</h1>
        </div>
        <div class="view-head__actions">
          <button class="btn btn--slate" id="btn-export-clientes" title="Exportar a Excel">📤 Exportar</button>
          <button class="btn btn--red" id="btn-new-client">+ Nuevo cliente</button>
        </div>
      </div>

      <div class="panel">
        <table class="table">
          <thead>
            <tr>
              <th>Cliente</th><th>Contacto</th><th>Teléfono</th>
              <th>Estado</th><th>Productos / Servicios</th>
              <th>Docs</th><th class="num">Total histórico</th><th class="num"></th>
            </tr>
          </thead>
          <tbody>${rows || ''}</tbody>
        </table>
        ${clients.length ? '' : '<div class="empty">Sin clientes todavía. Agregá el primero.</div>'}
      </div>
    `;

    $('#btn-new-client').addEventListener('click', () => openClientModal(null));
    $('#btn-export-clientes').addEventListener('click', () => {
      const filename = Store.exportClientesToExcel();
      if (!filename) { alert('No hay clientes para exportar'); return; }
      alert(`Clientes exportados: ${filename}`);
    });
    $$('[data-edit-client]').forEach(b =>
      b.addEventListener('click', () => openClientModal(b.dataset.editClient)));
    $$('[data-del-client]').forEach(b =>
      b.addEventListener('click', () => {
        const c = Store.getClient(b.dataset.delClient);
        if (!c) return;
        if (!confirm(`¿Eliminar a ${c.nombre}?`)) return;
        if (!Store.deleteClient(c.id)) {
          alert('Este cliente tiene documentos asociados. Eliminá primero sus documentos.');
          return;
        }
        renderClientes();
      }));
  }

  /* prefill: datos iniciales (ej. desde un lead) · onSaved: qué hacer al guardar
     (por defecto re-renderiza Clientes) */
  function openClientModal(id, prefill = null, onSaved = null) {
    const c = id
      ? Store.getClient(id)
      : Object.assign({ nombre: '', contacto: '', telefono: '', email: '', direccion: '', pais: 'Costa Rica', notas: '', productos: [], estado: 'activo' }, prefill || {});

    const productosText = (c.productos || []).join('\n');

    modalPanel.innerHTML = `
      <div class="modal__title">${id ? 'Editar cliente' : 'Nuevo cliente'}</div>
      <form class="modal__form" id="client-form">
        <div class="field">
          <label class="field__label">Nombre / Razón social *</label>
          <input class="input" name="nombre" required value="${esc(c.nombre)}">
        </div>
        <div class="field">
          <label class="field__label">Persona de contacto</label>
          <input class="input" name="contacto" value="${esc(c.contacto)}">
        </div>
        <div class="field">
          <label class="field__label">Teléfono</label>
          <input class="input" name="telefono" value="${esc(c.telefono)}">
        </div>
        <div class="field">
          <label class="field__label">Email</label>
          <input class="input" type="email" name="email" value="${esc(c.email)}">
        </div>
        <div class="field">
          <label class="field__label">Dirección</label>
          <input class="input" name="direccion" value="${esc(c.direccion)}">
        </div>
        <div class="field">
          <label class="field__label">País</label>
          <input class="input" name="pais" value="${esc(c.pais)}">
        </div>
        <div class="field">
          <label class="field__label">Estado</label>
          <select class="input input--select" name="estado">
            <option value="activo" ${c.estado === 'activo' ? 'selected' : ''}>Activo</option>
            <option value="inactivo" ${c.estado === 'inactivo' ? 'selected' : ''}>Inactivo</option>
          </select>
        </div>
        <div class="field">
          <label class="field__label">Productos / Servicios <i>(uno por línea)</i></label>
          <textarea class="input" name="productos" placeholder="Ej: CCTV 4 cámaras Dahua&#10;Grabador DVR">${esc(productosText)}</textarea>
        </div>
        <div class="field">
          <label class="field__label">Notas internas</label>
          <textarea class="input" name="notas" placeholder="Info relevante sobre el cliente…">${esc(c.notas)}</textarea>
        </div>
        <div class="modal__actions">
          <button type="button" class="btn btn--ghost" data-close>Cancelar</button>
          <button type="submit" class="btn btn--red">Guardar</button>
        </div>
      </form>
    `;
    modal.hidden = false;

    $('#client-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const productosRaw = fd.get('productos').trim();
      const productos = productosRaw ? productosRaw.split('\n').map(s => s.trim()).filter(Boolean) : [];
      const saved = Store.saveClient({
        id: id || null,
        nombre: fd.get('nombre').trim(),
        contacto: fd.get('contacto').trim(),
        telefono: fd.get('telefono').trim(),
        email: fd.get('email').trim(),
        direccion: fd.get('direccion').trim(),
        pais: fd.get('pais').trim(),
        estado: fd.get('estado'),
        productos,
        notas: fd.get('notas').trim()
      });
      closeModal();
      if (onSaved) onSaved(saved); else renderClientes();
    });

    $$('[data-close]', modalPanel).forEach(b => b.addEventListener('click', closeModal));
  }

  function closeModal() {
    modal.hidden = true;
    modalPanel.innerHTML = '';
  }
  $('.modal__backdrop').addEventListener('click', closeModal);

  /* ═══════════ DOCUMENTOS (lista) ═══════════ */

  function tablaDocs(docs) {
    if (!docs.length) return '<div class="empty">Sin documentos todavía.</div>';
    const rows = docs.map(d => {
      const c = Store.getClient(d.clientId);
      const dias = d.estado === 'enviada' ? daysSince(d.fechaEmision) : 0;
      const due = dias > 0
        ? `<span class="due ${dias > 7 ? 'due--red' : dias > 3 ? 'due--amber' : ''}">hace ${dias} d</span>`
        : '';
      return `
        <tr class="row-link" data-open-doc="${d.id}">
          <td class="doc-num">Nº ${numDoc(d.numero)}</td>
          <td>${chipTipo(d.tipo)}</td>
          <td><b>${esc(c ? c.nombre : '—')}</b></td>
          <td>${fmtDate(d.fechaEmision)}</td>
          <td>${chipEstado(d.estado)}${due}</td>
          <td class="num money money--red">${fmt(Store.docTotal(d))}</td>
          <td class="num">
            <button class="btn--icon btn" data-edit-doc="${d.id}">Editar</button>
            <button class="btn--icon btn" data-del-doc="${d.id}">Eliminar</button>
          </td>
        </tr>`;
    }).join('');
    return `
      <table class="table">
        <thead>
          <tr>
            <th>Número</th><th>Tipo</th><th>Cliente</th>
            <th>Emisión</th><th>Estado</th><th class="num">Total (CRC)</th><th class="num"></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  function bindDocRows() {
    $$('[data-open-doc]').forEach(tr =>
      tr.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        location.hash = `#/doc/${tr.dataset.openDoc}`;
      }));
    $$('[data-edit-doc]').forEach(b =>
      b.addEventListener('click', () => { location.hash = `#/editor/${b.dataset.editDoc}`; }));
    $$('[data-del-doc]').forEach(b =>
      b.addEventListener('click', () => {
        const d = Store.getDoc(b.dataset.delDoc);
        if (!d) return;
        if (!confirm(`¿Eliminar ${d.tipo} Nº ${numDoc(d.numero)}?`)) return;
        Store.deleteDoc(d.id);
        route();
      }));
  }

  function renderDocumentos() {
    main.innerHTML = `
      <div class="view-head">
        <div>
          <span class="view-head__kicker">Atlantek · Gestión</span>
          <h1>Proformas / Facturas</h1>
        </div>
        <div class="view-head__actions">
          <button class="btn btn--slate" id="btn-export-documentos" title="Exportar a Excel">📤 Exportar</button>
          <a href="#/editor" class="btn btn--red">+ Nuevo documento</a>
        </div>
      </div>
      <div class="filters">
        <input class="input" id="f-q" type="search" placeholder="Buscar por cliente o número…">
        <select class="input input--select" id="f-tipo">
          <option value="">Tipo: todos</option>
          <option value="proforma">Proformas</option>
          <option value="factura">Facturas</option>
        </select>
        <select class="input input--select" id="f-estado">
          <option value="">Estado: todos</option>
          ${ESTADOS.map(e => `<option value="${e}">${e[0].toUpperCase() + e.slice(1)}</option>`).join('')}
        </select>
      </div>
      <div class="panel" id="docs-panel">${tablaDocs(Store.getDocs())}</div>
    `;
    bindDocRows();

    const applyFilters = () => {
      const q   = $('#f-q').value.trim().toLowerCase();
      const t   = $('#f-tipo').value;
      const est = $('#f-estado').value;
      const docs = Store.getDocs().filter(d => {
        if (t && d.tipo !== t) return false;
        if (est && d.estado !== est) return false;
        if (q) {
          const c = Store.getClient(d.clientId);
          const hay = `${numDoc(d.numero)} ${c ? c.nombre : ''}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });
      $('#docs-panel').innerHTML = (q || t || est) && !docs.length
        ? '<div class="empty">Sin resultados con esos filtros.</div>'
        : tablaDocs(docs);
      bindDocRows();
    };
    ['f-q', 'f-tipo', 'f-estado'].forEach(id =>
      $('#' + id).addEventListener('input', applyFilters));

    $('#btn-export-documentos').addEventListener('click', () => {
      const filename = Store.exportDocumentosToExcel();
      if (!filename) { alert('No hay documentos para exportar'); return; }
      alert(`Documentos exportados: ${filename}`);
    });
  }

  /* ═══════════ LEADS DEL SITIO ═══════════ */

  function renderLeads() {
    const leads = Store.getLeads();

    const rows = leads.map(l => {
      const opts = Store.LEAD_ESTADOS.map(e =>
        `<option value="${e}" ${e === l.estado ? 'selected' : ''}>${e.toUpperCase()}</option>`).join('');
      const meta = [l.distrito, l.tipo].filter(Boolean).map(esc).join(' · ');
      const waMsg = `Hola ${l.nombre}, le saluda Atlantek. Recibimos su consulta por ${l.servicio || 'nuestros servicios'} y con gusto le preparamos una cotización. ¿Cuándo podemos coordinar una visita?`;
      return `
        <tr class="${l.estado === 'nuevo' ? 'lead-row--nuevo' : ''}">
          <td class="lead-fecha">${fmtLeadFecha(l.fecha)}</td>
          <td>
            <b>${esc(l.nombre)}</b>
            ${meta ? `<div class="lead-meta">${meta}</div>` : ''}
          </td>
          <td class="mono-cell">${esc(l.telefono)}</td>
          <td>${esc(l.servicio) || '<span style="color:var(--faint)">—</span>'}</td>
          <td class="lead-msg" title="${esc(l.mensaje)}">${esc(l.mensaje) || '<span style="color:var(--faint)">—</span>'}</td>
          <td>
            <select class="input input--sm input--select lead-estado" data-lead-estado="${l.id}">${opts}</select>
          </td>
          <td class="num lead-actions">
            <a class="btn btn--icon lead-wa" target="_blank" rel="noopener" href="${waHref(l.telefono, waMsg)}">WhatsApp</a>
            <button class="btn btn--icon" data-lead-cliente="${l.id}">→ Cliente</button>
          </td>
        </tr>`;
    }).join('');

    main.innerHTML = `
      <div class="view-head">
        <div>
          <span class="view-head__kicker">Atlantek · Gestión</span>
          <h1>Leads del sitio</h1>
        </div>
        <div class="view-head__actions">
          <button class="btn btn--slate" id="btn-export-leads" title="Exportar a Excel">📤 Exportar</button>
          <span class="lead-count">${Store.leadsNuevos()} nuevos · ${leads.length} en total</span>
        </div>
      </div>

      <div class="panel">
        ${leads.length ? `
        <table class="table">
          <thead>
            <tr>
              <th>Fecha</th><th>Nombre</th><th>Teléfono</th>
              <th>Servicio</th><th>Mensaje</th><th>Estado</th><th class="num"></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>` : '<div class="empty">Sin leads todavía. Los que entren por el formulario del sitio aparecen aquí.</div>'}
      </div>
    `;

    $$('[data-lead-estado]').forEach(sel =>
      sel.addEventListener('change', async () => {
        await Store.setLeadStatus(sel.dataset.leadEstado, sel.value);
        updateLeadsBadge();
      }));

    $$('[data-lead-cliente]').forEach(b =>
      b.addEventListener('click', () => {
        const l = Store.getLead(b.dataset.leadCliente);
        if (!l) return;
        openClientModal(null, { nombre: l.nombre, telefono: l.telefono }, () => {
          Store.setLeadStatus(l.id, 'cotizado');
          renderLeads();
        });
      }));

    $('#btn-export-leads').addEventListener('click', () => {
      const filename = Store.exportLeadsToExcel();
      if (!filename) { alert('No hay leads para exportar'); return; }
      alert(`Leads exportados: ${filename}`);
    });
  }

  /* ═══════════ CATÁLOGO ═══════════ */

  function renderCatalogo() {
    const items = Store.getCatalogo();
    const cats = [...new Set(items.map(p => p.categoria))].sort();

    const rows = items.map(p => {
      const estado = p.estado || 'disponible';
      const chip = estado === 'disponible'
        ? '<span class="chip chip--pagada">disponible</span>'
        : '<span class="chip chip--borrador">agotado</span>';
      const imgHtml = p.imagen
        ? `<img src="${esc(p.imagen)}" alt="" style="width:40px;height:40px;object-fit:cover;border-radius:6px;border:1px solid var(--line)">`
        : '<span style="color:var(--faint);font-size:11px">Sin imagen</span>';
      return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px">
              ${imgHtml}
              <b>${esc(p.nombre)}</b>
            </div>
          </td>
          <td><span class="chip chip--proforma">${esc(p.categoria)}</span></td>
          <td class="num money">${fmt(p.precio)}</td>
          <td>${chip}</td>
          <td style="max-width:280px;font-size:12.5px;color:var(--muted)">${esc(p.descripcion) || '—'}</td>
          <td class="num">
            <button class="btn--icon btn" data-edit-item="${p.id}">Editar</button>
            <button class="btn--icon btn" data-del-item="${p.id}">Eliminar</button>
          </td>
        </tr>`;
    }).join('');

    main.innerHTML = `
      <div class="view-head">
        <div>
          <span class="view-head__kicker">Atlantek · Gestión</span>
          <h1>Catálogo de Productos</h1>
        </div>
        <div class="view-head__actions">
          <button class="btn btn--slate" id="btn-export-catalogo" title="Exportar a Excel">📤 Exportar</button>
          <label class="btn btn--slate" id="btn-import-catalogo-label" title="Importar desde Excel">
            📥 Importar
            <input type="file" id="btn-import-catalogo" accept=".xlsx,.xls" hidden>
          </label>
          <button class="btn btn--red" id="btn-new-item">+ Nuevo producto</button>
        </div>
      </div>

      <div class="filters">
        <input class="input" id="f-cat-q" type="search" placeholder="Buscar por nombre o categoría…">
        <select class="input input--select" id="f-cat-categoria">
          <option value="">Categoría: todas</option>
          ${cats.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}
        </select>
      </div>

      <div class="panel" id="catalogo-panel">
        ${items.length ? `
        <table class="table">
          <thead>
            <tr>
              <th>Producto</th><th>Categoría</th><th class="num">Precio (₡)</th>
              <th>Estado</th><th>Descripción</th><th class="num"></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>` : '<div class="empty">Sin productos en el catálogo. Agregá el primero.</div>'}
      </div>
    `;

    $('#btn-new-item').addEventListener('click', () => openCatalogoModal(null));
    $('#btn-export-catalogo').addEventListener('click', () => {
      const filename = Store.exportCatalogoToExcel();
      if (!filename) { alert('El catálogo está vacío'); return; }
      alert(`Catálogo exportado: ${filename}`);
    });
    $('#btn-import-catalogo').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const result = await Store.importCatalogoFromExcel(file);
        let msg = `Importación completada: ${result.creados} creados, ${result.actualizados} actualizados`;
        if (result.errores?.length) msg += `\nErrores: ${result.errores.join('; ')}`;
        alert(msg);
        renderCatalogo();
      } catch (err) {
        alert(`Error al importar: ${err.message}`);
      } finally {
        e.target.value = '';
      }
    });
    $$('[data-edit-item]').forEach(b =>
      b.addEventListener('click', () => openCatalogoModal(b.dataset.editItem)));
    $$('[data-del-item]').forEach(b =>
      b.addEventListener('click', () => {
        const p = Store.getCatalogoItem(b.dataset.delItem);
        if (!p) return;
        if (!confirm(`¿Eliminar "${p.nombre}" del catálogo?`)) return;
        Store.deleteCatalogoItem(p.id);
        renderCatalogo();
      }));

    const applyFilters = () => {
      const q = $('#f-cat-q').value.trim().toLowerCase();
      const cat = $('#f-cat-categoria').value;
      const filtered = items.filter(p => {
        if (cat && p.categoria !== cat) return false;
        if (q) {
          const hay = `${p.nombre} ${p.categoria} ${p.descripcion}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });
      $('#catalogo-panel').innerHTML = (q || cat) && !filtered.length
        ? '<div class="empty">Sin resultados con esos filtros.</div>'
        : `<table class="table">
            <thead>
              <tr>
                <th>Producto</th><th>Categoría</th><th class="num">Precio (₡)</th>
                <th>Estado</th><th>Descripción</th><th class="num"></th>
              </tr>
            </thead>
            <tbody>${filtered.map(p => {
              const estado = p.estado || 'disponible';
              const chip = estado === 'disponible'
                ? '<span class="chip chip--pagada">disponible</span>'
                : '<span class="chip chip--borrador">agotado</span>';
              const imgHtml = p.imagen
                ? `<img src="${esc(p.imagen)}" alt="" style="width:40px;height:40px;object-fit:cover;border-radius:6px;border:1px solid var(--line)">`
                : '<span style="color:var(--faint);font-size:11px">Sin imagen</span>';
              return `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px">
                      ${imgHtml}
                      <b>${esc(p.nombre)}</b>
                    </div>
                  </td>
                  <td><span class="chip chip--proforma">${esc(p.categoria)}</span></td>
                  <td class="num money">${fmt(p.precio)}</td>
                  <td>${chip}</td>
                  <td style="max-width:280px;font-size:12.5px;color:var(--muted)">${esc(p.descripcion) || '—'}</td>
                  <td class="num">
                    <button class="btn--icon btn" data-edit-item="${p.id}">Editar</button>
                    <button class="btn--icon btn" data-del-item="${p.id}">Eliminar</button>
                  </td>
                </tr>`;
            }).join('')}</tbody>
          </table>`;
      $$('[data-edit-item]').forEach(b =>
        b.addEventListener('click', () => openCatalogoModal(b.dataset.editItem)));
      $$('[data-del-item]').forEach(b =>
        b.addEventListener('click', () => {
          const p = Store.getCatalogoItem(b.dataset.delItem);
          if (!p) return;
          if (!confirm(`¿Eliminar "${p.nombre}" del catálogo?`)) return;
          Store.deleteCatalogoItem(p.id);
          renderCatalogo();
        }));
    };
    ['f-cat-q', 'f-cat-categoria'].forEach(id =>
      $('#' + id).addEventListener('input', applyFilters));
  }

  function openCatalogoModal(id) {
    const p = id
      ? Store.getCatalogoItem(id)
      : { nombre: '', categoria: '', precio: 0, descripcion: '', unidad: 'pieza', estado: 'disponible', imagen: '' };

    const categorias = ['Cámaras', 'Grabadores', 'Almacenamiento', 'Accesorios', 'Cableado', 'Redes', 'Acceso', 'Servicios', 'Otros'];

    modalPanel.innerHTML = `
      <div class="modal__title">${id ? 'Editar producto' : 'Nuevo producto'}</div>
      <form class="modal__form" id="item-form">
        <div class="field">
          <label class="field__label">Nombre *</label>
          <input class="input" name="nombre" required value="${esc(p.nombre)}" placeholder="Ej: Cámara Domo Dahua 2MP">
        </div>
        <div class="field">
          <label class="field__label">Categoría</label>
          <input class="input" name="categoria" value="${esc(p.categoria)}" list="cat-list" placeholder="Seleccionar o escribir">
          <datalist id="cat-list">
            ${categorias.map(c => `<option value="${esc(c)}">`).join('')}
          </datalist>
        </div>
        <div class="field">
          <label class="field__label">Precio unitario (₡)</label>
          <input class="input" type="number" name="precio" min="0" step="100" value="${esc(p.precio)}">
        </div>
        <div class="field">
          <label class="field__label">Unidad</label>
          <select class="input input--select" name="unidad">
            <option value="pieza" ${p.unidad === 'pieza' ? 'selected' : ''}>Pieza</option>
            <option value="metro" ${p.unidad === 'metro' ? 'selected' : ''}>Metro</option>
            <option value="servicio" ${p.unidad === 'servicio' ? 'selected' : ''}>Servicio</option>
            <option value="kit" ${p.unidad === 'kit' ? 'selected' : ''}>Kit</option>
          </select>
        </div>
        <div class="field">
          <label class="field__label">Estado</label>
          <select class="input input--select" name="estado">
            <option value="disponible" ${p.estado === 'disponible' ? 'selected' : ''}>Disponible</option>
            <option value="agotado" ${p.estado === 'agotado' ? 'selected' : ''}>Agotado</option>
          </select>
        </div>
        <div class="field">
          <label class="field__label">Imagen del producto</label>
          <div class="image-upload">
            <input type="file" name="imagen" id="item-imagen" accept="image/*" hidden>
            <label for="item-imagen" class="btn btn--slate btn--block" id="btn-select-image">
              ${p.imagen ? '🔄 Cambiar imagen' : '📷 Subir imagen'}
            </label>
            <div class="image-preview" id="image-preview" style="${p.imagen ? '' : 'display:none'}">
              <img src="${esc(p.imagen)}" alt="Preview" style="max-width:100%;max-height:150px;border-radius:8px;border:1px solid var(--line)">
              <button type="button" class="btn btn--ghost btn--sm" id="btn-remove-image" style="margin-top:8px">✕ Quitar imagen</button>
            </div>
            <small style="color:var(--muted);margin-top:4px;display:block">Formatos: JPG, PNG, WebP · Máx. 500KB</small>
          </div>
        </div>
        <div class="field">
          <label class="field__label">Descripción</label>
          <textarea class="input" name="descripcion" placeholder="Especificaciones, notas…">${esc(p.descripcion)}</textarea>
        </div>
        <div class="modal__actions">
          <button type="button" class="btn btn--ghost" data-close>Cancelar</button>
          <button type="submit" class="btn btn--red">Guardar</button>
        </div>
      </form>
    `;
    modal.hidden = false;

    // Image upload handling
    const imagenInput = $('#item-imagen');
    const previewDiv = $('#image-preview');
    const btnRemove = $('#btn-remove-image');
    let imagenBase64 = p.imagen || '';

    imagenInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 500 * 1024) {
        alert('La imagen supera 500KB. Reducí el tamaño.');
        imagenInput.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        imagenBase64 = ev.target.result;
        previewDiv.querySelector('img').src = imagenBase64;
        previewDiv.style.display = 'block';
        $('#btn-select-image').textContent = '🔄 Cambiar imagen';
      };
      reader.readAsDataURL(file);
    });

    btnRemove?.addEventListener('click', () => {
      imagenBase64 = '';
      imagenInput.value = '';
      previewDiv.style.display = 'none';
      $('#btn-select-image').textContent = '📷 Subir imagen';
    });

    $('#item-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      Store.saveCatalogoItem({
        id: id || null,
        nombre: fd.get('nombre').trim(),
        categoria: fd.get('categoria').trim(),
        precio: Number(fd.get('precio')) || 0,
        unidad: fd.get('unidad'),
        estado: fd.get('estado'),
        descripcion: fd.get('descripcion').trim(),
        imagen: imagenBase64
      });
      closeModal();
      renderCatalogo();
    });

    $$('[data-close]', modalPanel).forEach(b => b.addEventListener('click', closeModal));
  }

  /* ═══════════ DOCUMENTOS LEGALES ═══════════ */

  function renderLegal() {
    const docs = [
      { file: 'terminos.html', label: 'Términos de Servicio', desc: 'Condiciones generales de servicio, garantías, pagos y limitación de responsabilidad', updated: '12/07/2026' },
      { file: 'politica-privacidad.html', label: 'Política de Privacidad', desc: 'Tratamiento de datos personales conforme a la Ley N.° 8968 de Costa Rica', updated: '12/07/2026' },
      { file: 'contrato-servicio.html', label: 'Contrato de Servicio CTR-2026-INT-001', desc: 'Contrato personal Garett Barrantes / Atlantek — desarrollo web + panel + dominio', updated: '12/07/2026' },
      { file: 'proforma.html', label: 'Proforma PRF-2026-INT-001', desc: 'Proforma de cobro: sitio web + panel + documentos legales + dominio .com', updated: '12/07/2026' },
      { file: 'acta-entrega.html', label: 'Acta de Entrega ACT-2026-INT-001', desc: 'Entrega formal de sitio, panel, base de datos, accesos y garantía 30 días', updated: '[DD/MM/AAAA]' }
    ];

    const rows = docs.map(d => `
      <tr class="row-link" data-open-legal="${d.file}">
        <td><b>${esc(d.label)}</b></td>
        <td style="color:var(--muted);font-size:12.5px">${esc(d.desc)}</td>
        <td class="mono-cell">${d.updated}</td>
        <td class="num">
          <a class="btn btn--icon btn--sm" href="legal/${d.file}" target="_blank" rel="noopener">Abrir</a>
        </td>
      </tr>`).join('');

    main.innerHTML = `
      <div class="view-head">
        <div>
          <span class="view-head__kicker">Atlantek · Gestión</span>
          <h1>Documentos Legales</h1>
        </div>
        <p style="color:var(--muted);font-size:13px;margin-top:4px">Documentos internos — acceso restringido al panel de gestión</p>
      </div>

      <div class="panel">
        <table class="table">
          <thead>
            <tr>
              <th>Documento</th>
              <th>Descripción</th>
              <th class="mono-cell">Última actualización</th>
              <th class="num"></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;

    $$('[data-open-legal]').forEach(tr =>
      tr.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        window.open('legal/' + tr.dataset.openLegal, '_blank', 'noopener');
      }));
  }

  /* ═══════════ EDITOR ═══════════ */

  function renderEditor(docId) {
    const existing = docId ? Store.getDoc(docId) : null;
    const d = existing ? JSON.parse(JSON.stringify(existing)) : {
      id: null,
      tipo: 'proforma',
      clientId: '',
      fechaEmision: hoy(),
      fechaEntrega: hoy(),
      estado: 'borrador',
      notas: Store.GARANTIA_DEFAULT,
      items: [{ desc: '', qty: 1, precio: 0 }]
    };

    const clients = Store.getClients();
    const clientOpts = clients.map(c =>
      `<option value="${c.id}" ${c.id === d.clientId ? 'selected' : ''}>${esc(c.nombre)}</option>`).join('');

    const isFactura = d.tipo === 'factura';
    const cotLabel = isFactura ? 'Factura Nº' : 'Cotización Nº';
    const cotValue = existing ? (d.cotizacion || (isFactura ? `FAC-${String(d.numero).padStart(3, '0')}` : `PRF-${String(d.numero).padStart(3, '0')}`)) : '';
    const numeroLabel = existing ? `Nº ${numDoc(existing.numero)}` : `Nº ${numDoc(Store.nextNumber())} (auto)`;

    main.innerHTML = `
      <div class="view-head">
        <div>
          <span class="view-head__kicker">${existing ? 'Editar documento' : 'Nuevo documento'} · ${numeroLabel}</span>
          <h1>${existing ? 'Editar' : 'Crear'} ${d.tipo}</h1>
        </div>
      </div>

      <div class="editor">
        <div class="editor__grid">
          <div class="field">
            <label class="field__label">Cliente *</label>
            <select class="input input--select" id="ed-client" required>
              <option value="">— Seleccionar —</option>
              ${clientOpts}
            </select>
          </div>
          <div class="field">
            <label class="field__label">Tipo</label>
            <select class="input input--select" id="ed-tipo">
              <option value="proforma" ${d.tipo === 'proforma' ? 'selected' : ''}>Proforma</option>
              <option value="factura"  ${d.tipo === 'factura'  ? 'selected' : ''}>Factura</option>
            </select>
          </div>
          <div class="field">
            <label class="field__label">${cotLabel}</label>
            <input class="input" type="text" id="ed-cotizacion" value="${esc(cotValue)}" placeholder="Auto-generado al guardar" ${existing ? '' : 'readonly'}>
          </div>
          <div class="field">
            <label class="field__label">Fecha emisión</label>
            <input class="input" type="date" id="ed-emision" value="${esc(d.fechaEmision)}">
          </div>
          <div class="field">
            <label class="field__label">Fecha entrega</label>
            <input class="input" type="date" id="ed-entrega" value="${esc(d.fechaEntrega)}">
          </div>
        </div>

        <div class="panel editor__items">
          <div class="panel__head">
            <span class="panel__title">Líneas del documento</span>
            <button class="btn btn--slate btn--sm" id="ed-add-item">+ Agregar línea</button>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th style="width:52%">Descripción</th>
                <th style="width:12%" class="num">Cantidad</th>
                <th style="width:16%" class="num">Precio unit. (₡)</th>
                <th style="width:16%" class="num">Monto (₡)</th>
                <th style="width:4%"></th>
              </tr>
            </thead>
            <tbody id="ed-items"></tbody>
          </table>
        </div>

        <div class="field">
          <label class="field__label">Notas / Garantía (pie del documento)</label>
          <textarea class="input" id="ed-notas">${esc(d.notas)}</textarea>
        </div>

        <div class="editor__totalbar">
          <span class="label">Total (CRC)</span>
          <span class="value" id="ed-total">₡0.00</span>
        </div>

        <div class="editor__actions">
          <a href="#/documentos" class="btn btn--ghost">Cancelar</a>
          <button class="btn btn--navy" id="ed-save">Guardar ${existing ? 'cambios' : 'documento'}</button>
        </div>
      </div>
    `;

    if (d.clientId) $('#ed-client').value = d.clientId;

    const tbody = $('#ed-items');

    function renderItems() {
      tbody.innerHTML = d.items.map((it, i) => `
        <tr>
          <td><input class="input" data-f="desc" data-i="${i}" value="${esc(it.desc)}" placeholder="Descripción del producto o servicio"></td>
          <td><input class="input num" type="number" min="0" step="1" data-f="qty" data-i="${i}" value="${esc(it.qty)}"></td>
          <td><input class="input num" type="number" min="0" step="0.01" data-f="precio" data-i="${i}" value="${esc(it.precio)}"></td>
          <td class="num money" data-amount="${i}">${fmt((Number(it.qty) || 0) * (Number(it.precio) || 0))}</td>
          <td class="num"><button class="btn btn--icon" data-rm="${i}" title="Quitar línea">✕</button></td>
        </tr>`).join('');

      $$('input[data-f]', tbody).forEach(inp => {
        inp.addEventListener('input', () => {
          const i = Number(inp.dataset.i);
          const f = inp.dataset.f;
          d.items[i][f] = f === 'desc' ? inp.value : Number(inp.value);
          $(`[data-amount="${i}"]`).textContent =
            fmt((Number(d.items[i].qty) || 0) * (Number(d.items[i].precio) || 0));
          updateTotal();
        });
      });

      $$('[data-rm]', tbody).forEach(b => {
        b.addEventListener('click', () => {
          d.items.splice(Number(b.dataset.rm), 1);
          if (!d.items.length) d.items.push({ desc: '', qty: 1, precio: 0 });
          renderItems();
          updateTotal();
        });
      });
    }

    function updateTotal() {
      $('#ed-total').textContent = fmt(Store.docTotal(d));
    }

    $('#ed-add-item').addEventListener('click', () => {
      d.items.push({ desc: '', qty: 1, precio: 0 });
      renderItems();
    });

    $('#ed-save').addEventListener('click', () => {
      const clientId = $('#ed-client').value;
      if (!clientId) { alert('Seleccioná un cliente (o creálo primero en Clientes).'); return; }

      const items = d.items.filter(it => it.desc.trim());
      if (!items.length) { alert('Agregá al menos una línea con descripción.'); return; }

      const saved = Store.saveDoc({
        id: existing ? existing.id : null,
        numero: existing ? existing.numero : undefined,
        tipo: $('#ed-tipo').value,
        clientId,
        fechaEmision: $('#ed-emision').value,
        fechaEntrega: $('#ed-entrega').value,
        estado: d.estado,
        notas: $('#ed-notas').value.trim(),
        cotizacion: $('#ed-cotizacion').value.trim() || undefined,
        items
      });
      location.hash = `#/doc/${saved.id}`;
    });

    renderItems();
    updateTotal();
  }

  /* ═══════════ VISTA DOCUMENTO — réplica del PDF ═══════════ */

  function renderDocView(docId) {
    const d = Store.getDoc(docId);
    if (!d) { location.hash = '#/documentos'; return; }
    const c = Store.getClient(d.clientId) || { nombre: '—', direccion: '', pais: '', contacto: '', telefono: '' };
    const E = Store.EMPRESA;
    const total = Store.docTotal(d);

    const isFactura = d.tipo === 'factura';
    const titulo = isFactura ? 'Factura' : 'Pro forma\ninvoice';
    const labelNo = isFactura ? 'INVOICE NO.' : 'PRO FORMA INVOICE NO.';
    const cotLabel = isFactura ? 'FACTURA NO.' : 'COTIZACIÓN NO.';
    const cotNumero = d.cotizacion || (isFactura ? `FAC-${String(d.numero).padStart(3, '0')}` : `PRF-${String(d.numero).padStart(3, '0')}`);

    const rows = d.items.map(it => `
      <tr>
        <td>${esc(it.desc)}</td>
        <td class="num">${esc(it.qty)}</td>
        <td class="num">${fmtPlain(it.precio)}</td>
        <td class="num">${fmtPlain((Number(it.qty) || 0) * (Number(it.precio) || 0))}</td>
      </tr>`).join('');

    sheet.innerHTML = `
      <div class="sheet__band">
        <div class="sheet__logo">
          <img src="assets/img/logo-atlantek-dark.png" alt="ATLANTEK Systems" class="sheet__logo-img">
          <span class="logo__word">ATLANTEK</span>
        </div>
        <div class="sheet__doctitle">
          <h2>${titulo}</h2>
          <span class="mail">${esc(E.email)}</span>
        </div>
      </div>

      <div class="sheet__meta">
        <div class="sheet__meta-item"><b>${cotLabel}</b> ${cotNumero}</div>
        <div class="sheet__meta-item"><b>${labelNo}</b> ${numDoc(d.numero)}</div>
        <div class="sheet__meta-item"><b>Issue date</b> ${fmtDate(d.fechaEmision)}</div>
        <div class="sheet__meta-item"><b>Delivery date</b> ${fmtDate(d.fechaEntrega)}</div>
        <div class="sheet__meta-item"><b>Estado</b> <span class="status-badge status-${d.estado}">${d.estado.toUpperCase()}</span></div>
      </div>

      <div class="sheet__parties">
        <div class="sheet__party">
          <b>FROM</b>
          ${esc(E.nombre)}<br>
          ${esc(E.linea2)}<br>
          ${esc(E.direccion)}<br>
          ${esc(E.pais)}
        </div>
        <div class="sheet__party">
          <b>TO</b>
          ${esc(c.nombre)}<br>
          ${c.direccion ? esc(c.direccion) + '<br>' : ''}
          ${esc(c.pais)}
        </div>
        <div class="sheet__party sheet__party--total">
          <b>Total due</b>
          <div class="sheet__totaldue">${fmt(total)}</div>
        </div>
      </div>

      <div class="sheet__intro">Te facturamos:</div>

      <div class="sheet__items">
        <table class="sheet__table">
          <thead>
            <tr>
              <th style="width:52%">Description</th>
              <th style="width:12%" class="num">Quantity</th>
              <th style="width:18%" class="num">Unit price (₡)</th>
              <th style="width:18%" class="num">Amount (₡)</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="sheet__total-row">
          <span class="label">Total (CRC):</span>
          <span class="value">${fmt(total)}</span>
        </div>
      </div>

      <div class="sheet__notes">${esc(d.notas)}</div>
    `;

    /* barra de acciones */
    const sel = $('#doc-status');
    sel.innerHTML = ESTADOS.map(e =>
      `<option value="${e}" ${e === d.estado ? 'selected' : ''}>${e.toUpperCase()}</option>`).join('');
    sel.onchange = () => {
      Store.setDocStatus(d.id, sel.value);
      d.estado = sel.value;
      btnCobro.hidden = d.estado !== 'enviada';
    };

    /* Recordatorio de cobro por WhatsApp — solo documentos enviados */
    const btnCobro = $('#doc-cobro');
    btnCobro.hidden = d.estado !== 'enviada';
    btnCobro.onclick = () => {
      const dias = daysSince(d.fechaEmision);
      const msg = [
        `Hola${c.contacto ? ' ' + c.contacto : ''}, le saluda Atlantek 👋`,
        '',
        `Le recordamos el pago pendiente de la ${d.tipo} Nº ${numDoc(d.numero)}` +
          (dias > 0 ? ` (emitida hace ${dias} día${dias === 1 ? '' : 's'})` : '') + ':',
        `Total: ${fmt(total)}`,
        '',
        'SINPE Móvil o transferencia — con gusto le confirmamos al recibirlo.',
        'Atlantek · Seguridad · CCTV · Redes · 7231-2225'
      ].join('\n');
      window.open(waHref(c.telefono, msg), '_blank');
    };

    $('#doc-back').onclick  = () => { location.hash = '#/documentos'; };
    $('#doc-edit').onclick  = () => { location.hash = `#/editor/${d.id}`; };

    /* Imprimir con nombre de archivo útil: Atlantek-Proforma-027-CLIENTE */
    $('#doc-print').onclick = () => {
      const prev = document.title;
      const cliente = String(c.nombre || '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
      document.title = `Atlantek-${d.tipo === 'factura' ? 'Factura' : 'Proforma'}-${numDoc(d.numero)}${cliente ? '-' + cliente : ''}`;
      window.print();
      setTimeout(() => { document.title = prev; }, 500);
    };

    /* Convertir proforma → factura (crea documento nuevo, la proforma queda) */
    const btnFactura = $('#doc-to-factura');
    btnFactura.hidden = d.tipo !== 'proforma';
    btnFactura.onclick = () => {
      if (!confirm(`¿Crear la factura Nº ${numDoc(Store.nextNumber())} a partir de la proforma Nº ${numDoc(d.numero)}?`)) return;
      const f = Store.saveDoc({
        id: null,
        tipo: 'factura',
        clientId: d.clientId,
        fechaEmision: hoy(),
        fechaEntrega: d.fechaEntrega,
        estado: 'borrador',
        notas: d.notas,
        items: JSON.parse(JSON.stringify(d.items))
      });
      location.hash = `#/doc/${f.id}`;
    };

    /* Compartir por WhatsApp al teléfono del cliente */
    $('#doc-wa').onclick = () => {
      const msg = [
        `*Atlantek* — ${d.tipo === 'factura' ? 'Factura' : 'Proforma'} Nº ${numDoc(d.numero)}`,
        `Cliente: ${c.nombre}`,
        `Fecha: ${fmtDate(d.fechaEmision)}`,
        `Total: ${fmt(total)}`,
        '',
        'Le compartimos el detalle del documento. Cualquier consulta, con gusto.',
        'Atlantek · Seguridad · CCTV · Redes · 7231-2225'
      ].join('\n');
      window.open(waHref(c.telefono, msg), '_blank');
    };

    /* Enviar por Email — usa Apps Script backend */
    $('#doc-email').onclick = async () => {
      const btn = $('#doc-email');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = '⏳ Enviando...';
      
      try {
        const res = await fetch(CONFIG.SHEETS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            token: CONFIG.TOKEN,
            action: 'send-doc-email',
            docId: d.id,
            clientEmail: c.email,
            clientName: c.nombre
          })
        });
        const out = await res.json();
        if (!out.ok) throw new Error(out.error || 'Error al enviar email');
        alert('✅ Email enviado correctamente');
      } catch (err) {
        console.error('Error sending email:', err);
        alert(`❌ Error al enviar email: ${err.message}`);
      } finally {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    };

    docview.hidden = false;
    docview.scrollTop = 0;
  }

  /* ═══════════ SINCRONIZACIÓN (badge + re-render) ═══════════ */

  const badge = $('#sync-badge');

  document.addEventListener('store:sync', (e) => {
    const { status } = e.detail;

    if (badge) {
      const map = {
        local:   ['● Local (sin Sheets)', ''],
        syncing: ['⟳ Sincronizando…', 'sync-badge--busy'],
        ok:      ['● Google Sheets ✓', 'sync-badge--ok'],
        pulled:  ['● Google Sheets ✓', 'sync-badge--ok'],
        error:   ['● Error de sync — datos locales OK', 'sync-badge--err']
      };
      const [txt, cls] = map[status] || map.local;
      badge.textContent = txt;
      badge.className = 'sync-badge ' + cls;
    }

    /* Si llegaron datos de Sheets, re-render de vistas de lista
       (nunca el editor, para no pisar lo que se está escribiendo) */
    if (status === 'pulled') {
      const view = (location.hash || '#/dashboard').split('/')[1];
      if (['dashboard', 'clientes', 'documentos', 'leads', ''].includes(view || '')) route();
      else updateLeadsBadge();
    }
  });

  /* ═══════════ INIT ═══════════ */
  route();
})();
   
 