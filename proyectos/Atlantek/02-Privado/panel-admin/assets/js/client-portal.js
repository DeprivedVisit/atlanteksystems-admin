/* ═══════════════════════════════════════════════════════════════
   Atlantek · client-portal.js — Portal del cliente
   Vista de solo lectura para el cliente: servicios contratados + tickets
   ═══════════════════════════════════════════════════════════════ */

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const esc = (s) => String(s ?? '')
    .replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')
    .replace(/"/g, '"').replace(/'/g, ''');

  const fmtMoney = (n) => '₡' + (Number(n) || 0).toLocaleString('es-CR', {
    minimumFractionDigits: 0, maximumFractionDigits: 0
  });

  const fmtDate = (iso) => {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  const fmtDateTime = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  const getStatusLabel = (estado) => {
    const labels = {
      'activo': 'Activo',
      'inactivo': 'Inactivo',
      'vencido': 'Vencido',
      'abierto': 'Abierto',
      'en_proceso': 'En proceso',
      'resuelto': 'Resuelto',
      'cerrado': 'Cerrado'
    };
    return labels[estado] || estado;
  };

  const getPriorityLabel = (p) => {
    const labels = { 'critica': 'Crítica', 'alta': 'Alta', 'media': 'Media', 'baja': 'Baja' };
    return labels[p] || p;
  };

  /* Determinar estado calculado del servicio */
  function computeServiceStatus(s) {
    if (s.estado === 'inactivo') return 'inactivo';
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const venc = new Date(s.fechaVencimiento);
    if (venc < hoy) return 'vencido';
    return 'activo';
  }

  /* Render header del cliente */
  function renderClientHeader() {
    const client = Store.getClient(CLIENT_ID);
    if (!client) return;

    $('#client-name').textContent = client.nombre;
    const metaParts = [];
    if (client.contacto) metaParts.push(client.contacto);
    if (client.telefono) metaParts.push(client.telefono);
    if (client.email) metaParts.push(client.email);
    if (client.direccion) metaParts.push(client.direccion);
    $('#client-meta').textContent = metaParts.join(' · ') || 'Sin datos de contacto';

    const services = Store.getServices(CLIENT_ID);
    const activeServices = services.filter(s => computeServiceStatus(s) === 'activo');
    const tickets = Store.getTickets(CLIENT_ID);
    const openTickets = tickets.filter(t => t.estado === 'abierto' || t.estado === 'en_proceso');
    const monthly = Store.serviceTotalMensual(CLIENT_ID);

    $('#kpi-services').textContent = activeServices.length;
    $('#kpi-tickets-open').textContent = openTickets.length;
    $('#kpi-monthly').textContent = fmtMoney(monthly);

    // Poblar select de servicios en formulario ticket
    const selServicio = $('#ticket-servicio');
    if (selServicio) {
      const current = selServicio.value;
      selServicio.innerHTML = '<option value="">— Ninguno (general) —</option>' +
        activeServices.map(s => `<option value="${s.id}">${esc(s.nombre)}</option>`).join('');
      selServicio.value = current;
    }
  }

  /* Render lista de servicios */
  function renderServices() {
    const services = Store.getServices(CLIENT_ID);
    const container = $('#services-list');

    if (!services.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">📋</div>
          <h3>No hay servicios contratados</h3>
          <p>Cuando contrates un servicio con Atlantek, aparecerá aquí con todos sus detalles.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = services.map(s => {
      const status = computeServiceStatus(s);
      const statusLabels = { 'activo': 'Activo', 'vencido': 'Vencido', 'inactivo': 'Inactivo' };
      const statusClass = status;

      const itemsHtml = (s.itemsIncluidos || []).map(item => `<li>${esc(item)}</li>`).join('');

      return `
        <article class="service-card ${s.estado === 'inactivo' ? 'inactivo' : ''}">
          <div class="service-card__head">
            <div>
              <h3 class="service-card__title">${esc(s.nombre)}</h3>
              <span class="service-card__type">${esc(s.tipo)}</span>
            </div>
            <span class="service-card__status ${statusClass}">${statusLabels[status]}</span>
          </div>
          <p class="service-card__desc">${esc(s.descripcion)}</p>
          <div class="service-card__meta">
            <div class="service-card__meta-item">
              <span class="service-card__meta-label">Inicio</span>
              <span class="service-card__meta-value">${fmtDate(s.fechaInicio)}</span>
            </div>
            <div class="service-card__meta-item">
              <span class="service-card__meta-label">Vencimiento</span>
              <span class="service-card__meta-value">${fmtDate(s.fechaVencimiento)}</span>
            </div>
            <div class="service-card__meta-item">
              <span class="service-card__meta-label">Valor mensual</span>
              <span class="service-card__meta-value">${fmtMoney(s.valorMensual || 0)}</span>
            </div>
          </div>
          ${itemsHtml ? `
          <div class="service-card__items">
            <div class="service-card__items-title">Incluye</div>
            <ul class="service-card__items-list">${itemsHtml}</ul>
          </div>
          ` : ''}
          <div class="service-card__footer">
            <span class="service-card__monthly">Mensual: <b>${fmtMoney(s.valorMensual || 0)}</b></span>
            ${s.notas ? `<span class="service-card__notes">${esc(s.notas)}</span>` : ''}
          </div>
        </article>
      `;
    }).join('');
  }

  /* Render lista de tickets */
  function renderTickets() {
    const tickets = Store.getTickets(CLIENT_ID);
    const container = $('#tickets-list');

    if (!tickets.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">🎫</div>
          <h3>Sin tickets de soporte</h3>
          <p>Usá el botón "Nuevo ticket" para reportar un problema o solicitar algo.</p>
        </div>
      `;
      return;
    }

    // Ordenar: abiertos/en_proceso primero, luego por fecha desc
    tickets.sort((a, b) => {
      const aOpen = a.estado === 'abierto' || a.estado === 'en_proceso';
      const bOpen = b.estado === 'abierto' || b.estado === 'en_proceso';
      if (aOpen !== bOpen) return bOpen - aOpen;
      return new Date(b.fechaCreacion) - new Date(a.fechaCreacion);
    });

    container.innerHTML = tickets.map(t => {
      const service = t.serviceId ? Store.getService(t.serviceId) : null;
      const historial = (t.historial || []).slice(-5); // últimos 5 mensajes

      return `
        <article class="ticket-card prioridad-${t.prioridad}">
          <div class="ticket-card__head">
            <h3 class="ticket-card__title">${esc(t.titulo)}</h3>
            <div class="ticket-card__meta">
              <span class="ticket-card__status ${t.estado}">${getStatusLabel(t.estado)}</span>
              <span class="ticket-card__priority ${t.prioridad}">${getPriorityLabel(t.prioridad)}</span>
            </div>
          </div>
          <p class="ticket-card__desc">${esc(t.descripcion)}</p>
          <div class="ticket-card__info">
            <span class="ticket-card__info-item"><span class="ticket-card__info-label">Creado:</span> <span class="ticket-card__info-value">${fmtDateTime(t.fechaCreacion)}</span></span>
            <span class="ticket-card__info-item"><span class="ticket-card__info-label">Actualizado:</span> <span class="ticket-card__info-value">${fmtDateTime(t.fechaActualizacion)}</span></span>
            ${t.asignadoA ? `<span class="ticket-card__info-item"><span class="ticket-card__info-label">Asignado a:</span> <span class="ticket-card__info-value">${esc(t.asignadoA)}</span></span>` : ''}
            ${service ? `<span class="ticket-card__info-item"><span class="ticket-card__info-label">Servicio:</span> <span class="ticket-card__info-value">${esc(service.nombre)}</span></span>` : ''}
          </div>
          ${historial.length ? `
          <div class="ticket-card__historial">
            <div class="ticket-card__historial-title">Últimas actualizaciones</div>
            <div class="ticket-card__historial-list">
              ${historial.map(h => `
                <div class="ticket-card__historial-item">
                  <span class="msg-author">${esc(h.autor)}</span>
                  <span class="msg-time">${fmtDateTime(h.fecha)}</span>
                  <div style="margin-top: 4px;">${esc(h.mensaje)}</div>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}
        </article>
      `;
    }).join('');
  }

  /* Formulario nuevo ticket */
  const newTicketForm = $('#new-ticket-form');
  const btnNewTicket = $('#btn-new-ticket');
  const cancelTicket = $('#cancel-ticket');

  if (btnNewTicket && newTicketForm) {
    btnNewTicket.addEventListener('click', () => {
      newTicketForm.hidden = false;
      btnNewTicket.hidden = true;
      $('#ticket-titulo').focus();
    });
  }

  if (cancelTicket && newTicketForm) {
    cancelTicket.addEventListener('click', () => {
      newTicketForm.hidden = true;
      btnNewTicket.hidden = false;
      newTicketForm.reset();
    });
  }

  if (newTicketForm) {
    newTicketForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const titulo = $('#ticket-titulo').value.trim();
      const descripcion = $('#ticket-descripcion').value.trim();
      const prioridad = $('#ticket-prioridad').value;
      const serviceId = $('#ticket-servicio').value || null;

      if (!titulo || !descripcion) return;

      const ticket = {
        clientId: CLIENT_ID,
        serviceId,
        titulo,
        descripcion,
        prioridad,
        estado: 'abierto',
        asignadoA: '',
        historial: [{ fecha: new Date().toISOString(), autor: 'Cliente', mensaje: descripcion }]
      };

      Store.saveTicket(ticket);
      newTicketForm.hidden = true;
      btnNewTicket.hidden = false;
      newTicketForm.reset();
      renderTickets();
    });
  }

  /* Init */
  document.addEventListener('store:sync', (e) => {
    if (e.detail.status === 'pulled' || e.detail.status === 'ok') {
      renderClientHeader();
      renderServices();
      renderTickets();
    }
  });

  // Esperar a que Store esté listo
  const waitForStore = () => {
    if (window.Store && Store.getServices) {
      renderClientHeader();
      renderServices();
      renderTickets();
    } else {
      setTimeout(waitForStore, 50);
    }
  };
  waitForStore();
})();