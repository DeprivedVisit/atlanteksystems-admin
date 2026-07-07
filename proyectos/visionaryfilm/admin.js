import {
  db, auth,
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
  collection, doc, addDoc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, onSnapshot, query, orderBy, limit, where
} from './firebase-config.js';

// ===== STATE =====
let activeSection   = 'dashboard';
let clientesCache   = [];
let proyectosCache  = [];
let currentUser     = null; // { email, nombre, rol, uid }

// ===== CONFIG (localStorage) =====
const CFG_KEY = 'vf_config';
function getCfg() {
  try { return JSON.parse(localStorage.getItem(CFG_KEY)) || {}; } catch { return {}; }
}
function saveCfg(obj) { localStorage.setItem(CFG_KEY, JSON.stringify(obj)); }

// El inicio de la app está al final del archivo (después de todas las declaraciones)

function applyRoleUI(rol) {
  const isAdmin = rol === 'admin';
  // Ocultar items admin-only si no es admin
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = isAdmin ? '' : 'none';
  });
  // Si no es admin, arrancar en sección "Mis Proyectos"
  if (!isAdmin) {
    document.querySelectorAll('.nav-item[data-section]').forEach(el => {
      const sec = el.dataset.section;
      const allowed = ['proyectos', 'marketing'];
      el.style.display = allowed.includes(sec) ? '' : 'none';
    });
  }
}

function addDemoBanner() {
  if (!document.querySelector('.demo-banner')) {
    const b = document.createElement('div');
    b.className = 'demo-banner';
    b.textContent = '⚡ MODO DEMO — datos en localStorage · Configurar Firebase para producción';
    document.querySelector('.main').prepend(b);
  }
}

// ===== SIDEBAR NAV =====
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const sec = item.dataset.section;
    switchSection(sec);
    // cerrar sidebar en móvil
    document.getElementById('sidebar').classList.remove('open');
  });
});

document.getElementById('sidebarToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

const SECTION_TITLES = {
  dashboard: 'Dashboard',
  clientes: 'Clientes',
  proyectos: 'Proyectos & Pagos',
  gastos: 'Gastos',
  fondo: 'Fondo de Equipo',
  settings: 'Configuración'
};

function switchSection(sec) {
  activeSection = sec;
  document.querySelectorAll('.nav-item').forEach(i =>
    i.classList.toggle('active', i.dataset.section === sec));
  document.querySelectorAll('.app-section').forEach(s =>
    s.style.display = s.id === `sec-${sec}` ? '' : 'none');
  document.getElementById('topbarTitle').textContent = SECTION_TITLES[sec] || sec;
  document.getElementById('topbarActions').innerHTML = '';
}

// ===== TOAST =====
let toastTimer;
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.className = '', 3000);
}

// ===== MODAL HELPERS =====
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

// ===== UTILS =====
const usd = n => '$' + (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = ts => {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });
};
const today = () => new Date().toISOString().slice(0, 10);

// ===== INIT APP =====
function initApp() {
  const startSection = currentUser?.rol === 'admin' ? 'dashboard' : 'proyectos';
  switchSection(startSection);
  loadDashboard();
  loadClientes();
  loadProyectos();
  loadGastos();
  loadFondo();
  loadSettings();
  loadMarketing();
  loadEquipo();
  setupClientes();
  setupProyectos();
  setupGastos();
  setupFondo();
  setupSettings();
  setupMarketing();
  setupEquipo();
}

// ============================================================
// DASHBOARD
// ============================================================
function loadDashboard() {
  // Últimas 10 transacciones
  const txQ = query(collection(db, 'transactions'), orderBy('fecha', 'desc'), limit(10));
  onSnapshot(txQ, snap => {
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderDashTx(rows);
    calcStats();
  });

  // Proyectos activos
  const pQ = query(collection(db, 'projects'), where('estado', '==', 'activo'));
  onSnapshot(pQ, snap => {
    const activos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderDashProjects(activos);
  });
}

function renderDashTx(rows) {
  const tb = document.getElementById('dashTxBody');
  if (!rows.length) {
    tb.innerHTML = '<tr><td colspan="5"><div class="empty-state"><span class="empty-icon">📋</span><p>No hay transacciones aún</p></div></td></tr>';
    return;
  }
  tb.innerHTML = rows.map(r => `
    <tr>
      <td>${fmtDate(r.fecha)}</td>
      <td class="td-name">${r.descripcion || '—'}</td>
      <td>${r.categoria || '—'}</td>
      <td class="td-mono" style="color:${r.tipo === 'ingreso' ? 'var(--green)' : 'var(--red)'}">
        ${r.tipo === 'ingreso' ? '+' : '-'}${usd(r.monto)}
      </td>
      <td><span class="badge badge-${r.tipo}">${r.tipo}</span></td>
    </tr>`).join('');
}

function renderDashProjects(activos) {
  const el = document.getElementById('dashProjects');
  if (!activos.length) {
    el.innerHTML = '<span style="color:var(--muted);font-size:.88rem;">Sin proyectos activos</span>';
    return;
  }
  el.innerHTML = activos.map(p =>
    `<span class="badge badge-activo" style="font-size:.8rem;padding:.35rem .85rem;">${p.titulo} — ${p.clienteNombre || ''}</span>`
  ).join('');
}

async function calcStats() {
  const [txSnap, fondoSnap] = await Promise.all([
    getDocs(collection(db, 'transactions')),
    getDoc(doc(db, 'equipmentFund', 'main'))
  ]);

  let ingresos = 0, gastos = 0;
  txSnap.forEach(d => {
    const r = d.data();
    if (r.tipo === 'ingreso') ingresos += Number(r.monto) || 0;
    else gastos += Number(r.monto) || 0;
  });
  const balance = ingresos - gastos;

  document.getElementById('statIngresos').textContent = usd(ingresos);
  document.getElementById('statGastos').textContent   = usd(gastos);
  document.getElementById('statBalance').textContent  = usd(balance);
  document.getElementById('statBalance').style.color  = balance >= 0 ? 'var(--green)' : 'var(--red)';

  if (fondoSnap.exists()) {
    const f = fondoSnap.data();
    document.getElementById('statFondo').textContent  = usd(f.saldo || 0);
    document.getElementById('statFondoSub').textContent = f.nombre ? `Meta: ${f.nombre}` : 'Sin meta activa';
  }
}

// ============================================================
// CLIENTES
// ============================================================
function setupClientes() {
  document.getElementById('btnNuevoCliente').addEventListener('click', () => {
    document.getElementById('clienteId').value = '';
    document.getElementById('modalClienteTitle').textContent = 'Nuevo cliente';
    ['cliNombre','cliEmpresa','cliEmail','cliTel','cliNotas'].forEach(id =>
      document.getElementById(id).value = '');
    openModal('modalCliente');
  });

  document.getElementById('btnGuardarCliente').addEventListener('click', guardarCliente);

  document.getElementById('clienteSearch').addEventListener('input', e => {
    renderClientes(filtrarClientes(e.target.value));
  });
}

async function guardarCliente() {
  const id     = document.getElementById('clienteId').value;
  const nombre = document.getElementById('cliNombre').value.trim();
  if (!nombre) { toast('El nombre es obligatorio', 'error'); return; }

  const data = {
    nombre,
    empresa: document.getElementById('cliEmpresa').value.trim(),
    email:   document.getElementById('cliEmail').value.trim(),
    telefono:document.getElementById('cliTel').value.trim(),
    notas:   document.getElementById('cliNotas').value.trim(),
    fechaCreacion: id ? undefined : new Date()
  };
  if (id === '') delete data.fechaCreacion; // new record handled below

  try {
    if (id) {
      await updateDoc(doc(db, 'clients', id), data);
      toast('Cliente actualizado');
    } else {
      data.fechaCreacion = new Date();
      await addDoc(collection(db, 'clients'), data);
      toast('Cliente guardado');
    }
    closeModal('modalCliente');
  } catch (err) {
    toast('Error: ' + err.message, 'error');
  }
}

function loadClientes() {
  onSnapshot(query(collection(db, 'clients'), orderBy('nombre')), snap => {
    clientesCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderClientes(clientesCache);
    populateClienteSelects();
  });
}

function filtrarClientes(q) {
  q = q.toLowerCase();
  return q ? clientesCache.filter(c =>
    (c.nombre||'').toLowerCase().includes(q) ||
    (c.empresa||'').toLowerCase().includes(q)) : clientesCache;
}

function renderClientes(lista) {
  const tb = document.getElementById('clientesTbody');
  if (!lista.length) {
    tb.innerHTML = '<tr><td colspan="6"><div class="empty-state"><span class="empty-icon">👥</span><p>Sin clientes aún</p></div></td></tr>';
    return;
  }
  tb.innerHTML = lista.map(c => {
    const proyCount = proyectosCache.filter(p => p.clienteId === c.id).length;
    return `<tr>
      <td class="td-name">${c.nombre}</td>
      <td>${c.empresa || '—'}</td>
      <td>${c.email || '—'}</td>
      <td>${c.telefono || '—'}</td>
      <td>${proyCount}</td>
      <td style="display:flex;gap:.4rem;">
        <button class="btn-icon" onclick="editCliente('${c.id}')">✏️</button>
        <button class="btn-icon" onclick="verCliente('${c.id}')">👁️</button>
        <button class="btn-icon" onclick="borrarCliente('${c.id}')">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

function populateClienteSelects() {
  const sel = document.getElementById('proyClienteId');
  const val = sel.value;
  sel.innerHTML = '<option value="">Seleccionar cliente...</option>' +
    clientesCache.map(c => `<option value="${c.id}">${c.nombre}${c.empresa ? ' — ' + c.empresa : ''}</option>`).join('');
  sel.value = val;
}

window.editCliente = id => {
  const c = clientesCache.find(x => x.id === id);
  if (!c) return;
  document.getElementById('clienteId').value = id;
  document.getElementById('modalClienteTitle').textContent = 'Editar cliente';
  document.getElementById('cliNombre').value  = c.nombre || '';
  document.getElementById('cliEmpresa').value = c.empresa || '';
  document.getElementById('cliEmail').value   = c.email || '';
  document.getElementById('cliTel').value     = c.telefono || '';
  document.getElementById('cliNotas').value   = c.notas || '';
  openModal('modalCliente');
};

window.verCliente = id => {
  const c = clientesCache.find(x => x.id === id);
  if (!c) return;
  document.getElementById('detClienteNombre').textContent = c.nombre;
  document.getElementById('detClienteInfo').innerHTML = `
    <dt>Empresa</dt><dd>${c.empresa || '—'}</dd>
    <dt>Email</dt><dd>${c.email || '—'}</dd>
    <dt>Teléfono</dt><dd>${c.telefono || '—'}</dd>
    <dt>Notas</dt><dd>${c.notas || '—'}</dd>
  `;
  const proyCliente = proyectosCache.filter(p => p.clienteId === id);
  const detEl = document.getElementById('detClienteProyectos');
  if (!proyCliente.length) {
    detEl.innerHTML = '<p style="color:var(--muted);font-size:.87rem;">Sin proyectos registrados.</p>';
  } else {
    detEl.innerHTML = proyCliente.map(p => `
      <div style="background:var(--bg);border-radius:6px;padding:.75rem 1rem;margin-bottom:.5rem;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-weight:500;font-size:.9rem;">${p.titulo}</div>
          <div style="font-size:.78rem;color:var(--muted);margin-top:.2rem;">${fmtDate(p.fechaEntrega)}</div>
        </div>
        <div style="text-align:right;">
          <div style="color:var(--gold);font-weight:700;">${usd(p.valorTotal)}</div>
          <span class="badge badge-${p.estado}" style="font-size:.68rem;">${p.estado}</span>
        </div>
      </div>`).join('');
  }
  openModal('modalDetalleCliente');
};

window.borrarCliente = async id => {
  if (!confirm('¿Eliminar este cliente? Esta acción no se puede deshacer.')) return;
  try {
    await deleteDoc(doc(db, 'clients', id));
    toast('Cliente eliminado');
  } catch (err) { toast('Error: ' + err.message, 'error'); }
};

// ============================================================
// PROYECTOS & PAGOS
// ============================================================
function setupProyectos() {
  document.getElementById('btnNuevoProyecto').addEventListener('click', () => {
    document.getElementById('proyectoId').value = '';
    document.getElementById('modalProyectoTitle').textContent = 'Nuevo proyecto';
    ['proyTitulo','proyDesc','proyValor'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('proyClienteId').value = '';
    document.getElementById('proyEstado').value = 'activo';
    document.getElementById('proyFecha').value = '';
    openModal('modalProyecto');
  });

  document.getElementById('btnGuardarProyecto').addEventListener('click', guardarProyecto);
  document.getElementById('btnGuardarPago').addEventListener('click', guardarPago);

  document.getElementById('proyectoSearch').addEventListener('input', renderProyectosFiltered);
  document.getElementById('proyectoEstadoFilter').addEventListener('change', renderProyectosFiltered);
}

async function guardarProyecto() {
  const id        = document.getElementById('proyectoId').value;
  const clienteId = document.getElementById('proyClienteId').value;
  const titulo    = document.getElementById('proyTitulo').value.trim();
  const valor     = parseFloat(document.getElementById('proyValor').value);

  if (!clienteId) { toast('Seleccioná un cliente', 'error'); return; }
  if (!titulo)    { toast('El título es obligatorio', 'error'); return; }
  if (!valor || valor <= 0) { toast('Ingresá un valor válido', 'error'); return; }

  const cliente = clientesCache.find(c => c.id === clienteId);
  const data = {
    clienteId,
    clienteNombre: cliente ? cliente.nombre : '',
    titulo,
    descripcion: document.getElementById('proyDesc').value.trim(),
    valorTotal: valor,
    estado: document.getElementById('proyEstado').value,
    fechaEntrega: document.getElementById('proyFecha').value || null,
    ...(id ? {} : { fechaInicio: new Date(), pagado: 0 })
  };

  try {
    if (id) {
      await updateDoc(doc(db, 'projects', id), data);
      toast('Proyecto actualizado');
    } else {
      await addDoc(collection(db, 'projects'), data);
      toast('Proyecto guardado');
    }
    closeModal('modalProyecto');
  } catch (err) { toast('Error: ' + err.message, 'error'); }
}

function loadProyectos() {
  onSnapshot(query(collection(db, 'projects'), orderBy('fechaInicio', 'desc')), snap => {
    proyectosCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderProyectosFiltered();
    // re-render clientes table (proyecto count)
    renderClientes(clientesCache);
  });
}

function renderProyectosFiltered() {
  const q     = document.getElementById('proyectoSearch').value.toLowerCase();
  const estado= document.getElementById('proyectoEstadoFilter').value;
  let lista   = proyectosCache;
  if (q) lista = lista.filter(p =>
    (p.titulo||'').toLowerCase().includes(q) ||
    (p.clienteNombre||'').toLowerCase().includes(q));
  if (estado) lista = lista.filter(p => p.estado === estado);
  renderProyectos(lista);
}

function renderProyectos(lista) {
  const tb = document.getElementById('proyectosTbody');
  if (!lista.length) {
    tb.innerHTML = '<tr><td colspan="7"><div class="empty-state"><span class="empty-icon">🎬</span><p>Sin proyectos</p></div></td></tr>';
    return;
  }
  const isAdmin = currentUser?.rol === 'admin';
  tb.innerHTML = lista.map(p => `
    <tr>
      <td>${p.clienteNombre || '—'}</td>
      <td class="td-name">${p.titulo}</td>
      <td class="td-mono">${usd(p.valorTotal)}</td>
      <td class="td-mono" style="color:var(--green)">${usd(p.pagado || 0)}</td>
      <td><span class="badge badge-${p.estado}">${p.estado}</span></td>
      <td>${p.fechaEntrega ? new Date(p.fechaEntrega).toLocaleDateString('es-CR') : '—'}</td>
      <td style="display:flex;gap:.4rem;flex-wrap:wrap;">
        <button class="btn-icon" title="Tareas" onclick="abrirTareas('${p.id}')">✅</button>
        ${isAdmin ? `
        <button class="btn-icon" title="Registrar pago" onclick="abrirPago('${p.id}')">💰</button>
        <button class="btn-icon" title="WhatsApp" onclick="waProyecto('${p.id}')">📱</button>
        <button class="btn-icon" title="Editar" onclick="editProyecto('${p.id}')">✏️</button>
        <button class="btn-icon" title="Eliminar" onclick="borrarProyecto('${p.id}')">🗑️</button>
        ` : ''}
      </td>
    </tr>`).join('');
}

window.editProyecto = id => {
  const p = proyectosCache.find(x => x.id === id);
  if (!p) return;
  document.getElementById('proyectoId').value = id;
  document.getElementById('modalProyectoTitle').textContent = 'Editar proyecto';
  document.getElementById('proyClienteId').value = p.clienteId || '';
  document.getElementById('proyTitulo').value    = p.titulo || '';
  document.getElementById('proyDesc').value      = p.descripcion || '';
  document.getElementById('proyValor').value     = p.valorTotal || '';
  document.getElementById('proyEstado').value    = p.estado || 'activo';
  document.getElementById('proyFecha').value     = p.fechaEntrega || '';
  openModal('modalProyecto');
};

window.abrirPago = id => {
  const p = proyectosCache.find(x => x.id === id);
  if (!p) return;
  document.getElementById('pagoProyectoId').value = id;
  document.getElementById('pagoProyectoInfo').innerHTML =
    `<strong>${p.titulo}</strong> — ${p.clienteNombre || ''}<br>
     Valor total: ${usd(p.valorTotal)} · Pagado: ${usd(p.pagado || 0)} · Pendiente: ${usd((p.valorTotal||0) - (p.pagado||0))}`;
  document.getElementById('pagoMonto').value = '';
  document.getElementById('pagoNota').value = '';
  openModal('modalPago');
};

async function guardarPago() {
  const proyId = document.getElementById('pagoProyectoId').value;
  const monto  = parseFloat(document.getElementById('pagoMonto').value);
  const metodo = document.getElementById('pagoMetodo').value;
  const nota   = document.getElementById('pagoNota').value.trim();

  if (!monto || monto <= 0) { toast('Ingresá un monto válido', 'error'); return; }

  const proyecto = proyectosCache.find(p => p.id === proyId);

  try {
    await addDoc(collection(db, 'transactions'), {
      tipo: 'ingreso',
      monto,
      descripcion: nota || `Pago — ${proyecto?.titulo || ''}`,
      categoria: 'Proyecto',
      proyectoId: proyId,
      clienteId: proyecto?.clienteId || '',
      metodo,
      fecha: new Date()
    });

    // actualizar pagado en el proyecto
    const nuevoPagado = (proyecto?.pagado || 0) + monto;
    await updateDoc(doc(db, 'projects', proyId), { pagado: nuevoPagado });

    toast('Pago registrado ✓');
    closeModal('modalPago');
    calcStats();
  } catch (err) { toast('Error: ' + err.message, 'error'); }
}

window.waProyecto = id => {
  const p   = proyectosCache.find(x => x.id === id);
  if (!p) return;
  const cfg = getCfg();
  const wa  = cfg.wa || '';
  const pendiente = (p.valorTotal || 0) - (p.pagado || 0);

  const msg = [
    `Hola, le escribo de *VisionaryFilm CR* 🎬`,
    ``,
    `Proyecto: *${p.titulo}*`,
    `Valor total: *${usd(p.valorTotal)}*`,
    p.pagado ? `Pagado: ${usd(p.pagado)}` : '',
    `Pendiente: *${usd(pendiente)}*`,
    ``,
    `Datos para transferencia BAC (USD):`,
    cfg.nombre  ? `Titular: ${cfg.nombre}` : '',
    cfg.cuenta  ? `Cuenta: ${cfg.cuenta}`  : '',
    cfg.iban    ? `IBAN: ${cfg.iban}`       : '',
    ``,
    `Gracias 🙏`
  ].filter(l => l !== null && l !== undefined && !(l === '' && !cfg.nombre)).join('\n');

  const url = `https://wa.me/${wa || ''}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank', 'noopener');
};

window.borrarProyecto = async id => {
  if (!confirm('¿Eliminar este proyecto?')) return;
  try {
    await deleteDoc(doc(db, 'projects', id));
    toast('Proyecto eliminado');
  } catch (err) { toast('Error: ' + err.message, 'error'); }
};

// ============================================================
// GASTOS
// ============================================================
function setupGastos() {
  document.getElementById('btnNuevoGasto').addEventListener('click', () => {
    document.getElementById('gastoId').value = '';
    document.getElementById('gastoDesc').value  = '';
    document.getElementById('gastoMonto').value = '';
    document.getElementById('gastoFecha').value = today();
    openModal('modalGasto');
  });

  document.getElementById('btnGuardarGasto').addEventListener('click', guardarGasto);
  document.getElementById('gastoCategFilter').addEventListener('change', renderGastosFiltered);
}

async function guardarGasto() {
  const id     = document.getElementById('gastoId').value;
  const desc   = document.getElementById('gastoDesc').value.trim();
  const monto  = parseFloat(document.getElementById('gastoMonto').value);
  const categ  = document.getElementById('gastoCateg').value;
  const fecha  = document.getElementById('gastoFecha').value;

  if (!desc)           { toast('La descripción es obligatoria', 'error'); return; }
  if (!monto || monto <= 0) { toast('Ingresá un monto válido', 'error'); return; }

  const data = {
    tipo: 'gasto',
    descripcion: desc,
    categoria: categ,
    monto,
    fecha: fecha ? new Date(fecha + 'T12:00:00') : new Date()
  };

  try {
    if (id) {
      await updateDoc(doc(db, 'transactions', id), data);
      toast('Gasto actualizado');
    } else {
      await addDoc(collection(db, 'transactions'), data);
      toast('Gasto registrado');
    }
    closeModal('modalGasto');
    calcStats();
  } catch (err) { toast('Error: ' + err.message, 'error'); }
}

function loadGastos() {
  onSnapshot(
    query(collection(db, 'transactions'), orderBy('fecha', 'desc')),
    snap => {
      const gastos = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(t => t.tipo === 'gasto');
      renderGastos(gastos);
      calcGastoStats(gastos);
    }
  );
}

function renderGastosFiltered() {
  const categ = document.getElementById('gastoCategFilter').value;
  // rely on onSnapshot cache — re-trigger by reading from DOM isn't ideal;
  // gastos are already rendered; for filtering fetch once more isn't needed
  // since onSnapshot keeps them fresh. Use a simple filter on current render.
  const rows = [...document.querySelectorAll('#gastosTbody tr')];
  // Simple re-render using cached data from snapshot
  getDocs(query(collection(db, 'transactions'), orderBy('fecha', 'desc'))).then(snap => {
    let gastos = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(t => t.tipo === 'gasto');
    if (categ) gastos = gastos.filter(g => g.categoria === categ);
    renderGastos(gastos);
  });
}

function calcGastoStats(gastos) {
  const now   = new Date();
  const mes   = gastos.filter(g => {
    const d = g.fecha?.toDate ? g.fecha.toDate() : new Date(g.fecha);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, g) => s + (g.monto || 0), 0);
  const total = gastos.reduce((s, g) => s + (g.monto || 0), 0);
  document.getElementById('gastosMes').textContent   = usd(mes);
  document.getElementById('gastosTotal').textContent = usd(total);
}

function renderGastos(lista) {
  const tb = document.getElementById('gastosTbody');
  if (!lista.length) {
    tb.innerHTML = '<tr><td colspan="5"><div class="empty-state"><span class="empty-icon">💸</span><p>Sin gastos registrados</p></div></td></tr>';
    return;
  }
  tb.innerHTML = lista.map(g => `
    <tr>
      <td>${fmtDate(g.fecha)}</td>
      <td class="td-name">${g.descripcion}</td>
      <td><span class="badge" style="background:rgba(90,154,224,.1);color:var(--blue)">${g.categoria || '—'}</span></td>
      <td class="td-mono" style="color:var(--red)">${usd(g.monto)}</td>
      <td style="display:flex;gap:.4rem;">
        <button class="btn-icon" onclick="editGasto('${g.id}')">✏️</button>
        <button class="btn-icon" onclick="borrarGasto('${g.id}')">🗑️</button>
      </td>
    </tr>`).join('');
}

window.editGasto = async id => {
  const snap = await getDoc(doc(db, 'transactions', id));
  if (!snap.exists()) return;
  const g = snap.data();
  document.getElementById('gastoId').value    = id;
  document.getElementById('gastoDesc').value  = g.descripcion || '';
  document.getElementById('gastoMonto').value = g.monto || '';
  document.getElementById('gastoCateg').value = g.categoria || 'Otro';
  const d = g.fecha?.toDate ? g.fecha.toDate() : new Date(g.fecha);
  document.getElementById('gastoFecha').value = d.toISOString().slice(0,10);
  openModal('modalGasto');
};

window.borrarGasto = async id => {
  if (!confirm('¿Eliminar este gasto?')) return;
  try {
    await deleteDoc(doc(db, 'transactions', id));
    toast('Gasto eliminado');
    calcStats();
  } catch (err) { toast('Error: ' + err.message, 'error'); }
};

// ============================================================
// FONDO DE EQUIPO
// ============================================================
function setupFondo() {
  document.getElementById('btnDepositar').addEventListener('click', () => {
    document.getElementById('depMonto').value = '';
    document.getElementById('depNota').value  = '';
    openModal('modalDeposito');
  });

  document.getElementById('btnNuevaMeta').addEventListener('click', () => {
    document.getElementById('metaNombre').value = '';
    document.getElementById('metaMonto').value  = '';
    openModal('modalMeta');
  });

  document.getElementById('btnGuardarDeposito').addEventListener('click', guardarDeposito);
  document.getElementById('btnGuardarMeta').addEventListener('click', guardarMeta);
}

function loadFondo() {
  const fondoRef = doc(db, 'equipmentFund', 'main');
  onSnapshot(fondoRef, snap => {
    if (!snap.exists()) {
      renderFondo({ saldo: 0, meta: 0, nombre: '', historial: [] });
      return;
    }
    renderFondo(snap.data());
  });
}

function renderFondo(f) {
  const saldo = f.saldo || 0;
  const meta  = f.meta  || 0;
  const pct   = meta > 0 ? Math.min(100, (saldo / meta) * 100) : 0;

  document.getElementById('fondoNombre').textContent  = f.nombre || 'Sin meta activa';
  document.getElementById('fondoSaldo').textContent   = usd(saldo);
  document.getElementById('fondoMeta').textContent    = meta > 0 ? usd(meta) : '—';
  document.getElementById('fondoBar').style.width     = pct.toFixed(1) + '%';
  document.getElementById('fondoPct').textContent     = pct.toFixed(1) + '%';
  document.getElementById('fondoRestante').textContent = meta > 0
    ? `Faltan ${usd(Math.max(0, meta - saldo))}` : '';

  const hist = (f.historial || []).slice().reverse();
  const tb   = document.getElementById('fondoHistorial');
  if (!hist.length) {
    tb.innerHTML = '<tr><td colspan="4"><div class="empty-state"><span class="empty-icon">🎯</span><p>Sin depósitos aún</p></div></td></tr>';
    return;
  }
  let acum = 0;
  const rows = (f.historial || []).map(h => {
    acum += h.monto || 0;
    return { ...h, acum };
  }).reverse();
  tb.innerHTML = rows.map(h => `
    <tr>
      <td>${h.fecha ? new Date(h.fecha).toLocaleDateString('es-CR') : '—'}</td>
      <td>${h.nota || '—'}</td>
      <td class="td-mono" style="color:var(--gold)">${usd(h.monto)}</td>
      <td class="td-mono">${usd(h.acum)}</td>
    </tr>`).join('');
}

async function guardarDeposito() {
  const monto = parseFloat(document.getElementById('depMonto').value);
  const nota  = document.getElementById('depNota').value.trim();

  if (!monto || monto <= 0) { toast('Ingresá un monto válido', 'error'); return; }

  const fondoRef = doc(db, 'equipmentFund', 'main');
  const snap = await getDoc(fondoRef);
  const data = snap.exists() ? snap.data() : { saldo: 0, meta: 0, nombre: '', historial: [] };

  const historial = [...(data.historial || []), {
    monto,
    nota,
    fecha: new Date().toISOString()
  }];

  try {
    await setDoc(fondoRef, { ...data, saldo: (data.saldo || 0) + monto, historial }, { merge: true });
    toast('Depósito registrado ✓');
    closeModal('modalDeposito');
    calcStats();
  } catch (err) { toast('Error: ' + err.message, 'error'); }
}

async function guardarMeta() {
  const nombre = document.getElementById('metaNombre').value.trim();
  const meta   = parseFloat(document.getElementById('metaMonto').value);

  if (!nombre)          { toast('Poné el nombre de la meta', 'error'); return; }
  if (!meta || meta <= 0) { toast('Ingresá un monto válido', 'error'); return; }

  const fondoRef = doc(db, 'equipmentFund', 'main');
  try {
    await setDoc(fondoRef, { nombre, meta }, { merge: true });
    toast('Meta guardada ✓');
    closeModal('modalMeta');
    calcStats();
  } catch (err) { toast('Error: ' + err.message, 'error'); }
}

// ============================================================
// SETTINGS
// ============================================================
function setupSettings() {
  document.getElementById('btnGuardarCfg').addEventListener('click', () => {
    saveCfg({
      nombre: document.getElementById('cfgNombre').value.trim(),
      cuenta: document.getElementById('cfgCuenta').value.trim(),
      iban:   document.getElementById('cfgIBAN').value.trim(),
      wa:     document.getElementById('cfgWA').value.trim()
    });
    toast('Configuración guardada');
  });
}

function loadSettings() {
  const cfg = getCfg();
  document.getElementById('cfgNombre').value = cfg.nombre || '';
  document.getElementById('cfgCuenta').value = cfg.cuenta || '';
  document.getElementById('cfgIBAN').value   = cfg.iban   || '';
  document.getElementById('cfgWA').value     = cfg.wa     || '';
}

// ============================================================
// EQUIPO
// ============================================================
function setupEquipo() {
  document.getElementById('btnNuevoEmpleado').addEventListener('click', () => {
    document.getElementById('empleadoId').value = '';
    document.getElementById('modalEmpleadoTitle').textContent = 'Nuevo empleado';
    ['empNombre','empEmail','empPass'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('empRol').value = 'employee';
    openModal('modalEmpleado');
  });
  document.getElementById('btnGuardarEmpleado').addEventListener('click', guardarEmpleado);
}

async function guardarEmpleado() {
  const id     = document.getElementById('empleadoId').value;
  const nombre = document.getElementById('empNombre').value.trim();
  const email  = document.getElementById('empEmail').value.trim();
  const pass   = document.getElementById('empPass').value;
  const rol    = document.getElementById('empRol').value;

  if (!nombre) { toast('El nombre es obligatorio', 'error'); return; }
  if (!email)  { toast('El email es obligatorio', 'error');  return; }
  if (!id && pass.length < 6) { toast('La contraseña debe tener al menos 6 caracteres', 'error'); return; }

  const data = { nombre, email, rol, activo: true };
  if (pass) data.password = pass;

  try {
    if (id) {
      await updateDoc(doc(db, '_users', id), data);
      toast('Empleado actualizado');
    } else {
      await addDoc(collection(db, '_users'), data);
      toast('Empleado agregado ✓');
    }
    closeModal('modalEmpleado');
  } catch (err) { toast('Error: ' + err.message, 'error'); }
}

function loadEquipo() {
  onSnapshot(query(collection(db, '_users'), orderBy('nombre')), snap => {
    const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderEquipo(lista);
    populateAsignadoSelect(lista);
  });
}

function renderEquipo(lista) {
  const tb = document.getElementById('equipoTbody');
  if (!lista.length) {
    tb.innerHTML = '<tr><td colspan="5"><div class="empty-state"><span class="empty-icon">🧑‍💼</span><p>Sin empleados aún</p></div></td></tr>';
    return;
  }
  tb.innerHTML = lista.map(e => `
    <tr>
      <td class="td-name">${e.nombre}</td>
      <td>${e.email}</td>
      <td><span class="badge" style="background:rgba(90,154,224,.1);color:var(--blue)">${e.rol||'employee'}</span></td>
      <td><span class="badge ${e.activo!==false ? 'badge-activo' : 'badge-cancelado'}">${e.activo!==false ? 'Activo' : 'Inactivo'}</span></td>
      <td style="display:flex;gap:.4rem;">
        <button class="btn-icon" onclick="editEmpleado('${e.id}')">✏️</button>
        <button class="btn-icon" onclick="toggleEmpleado('${e.id}',${e.activo!==false})">${e.activo!==false?'🚫':'✅'}</button>
      </td>
    </tr>`).join('');
}

function populateAsignadoSelect(lista) {
  const sel = document.getElementById('nuevaTareaAsignado');
  if (!sel) return;
  const val = sel.value;
  sel.innerHTML = '<option value="">Sin asignar</option>' +
    lista.map(e => `<option value="${e.email}">${e.nombre}</option>`).join('');
  sel.value = val;
}

window.editEmpleado = async id => {
  const snap = await getDoc(doc(db, '_users', id));
  if (!snap.exists()) return;
  const e = snap.data();
  document.getElementById('empleadoId').value = id;
  document.getElementById('modalEmpleadoTitle').textContent = 'Editar empleado';
  document.getElementById('empNombre').value = e.nombre || '';
  document.getElementById('empEmail').value  = e.email  || '';
  document.getElementById('empPass').value   = '';
  document.getElementById('empRol').value    = e.rol    || 'employee';
  openModal('modalEmpleado');
};

window.toggleEmpleado = async (id, isActive) => {
  try {
    await updateDoc(doc(db, '_users', id), { activo: !isActive });
    toast(isActive ? 'Empleado desactivado' : 'Empleado activado');
  } catch (err) { toast('Error: ' + err.message, 'error'); }
};

// ============================================================
// TAREAS (dentro de proyectos)
// ============================================================
let tareaProyectoActual = null;

window.abrirTareas = async id => {
  const p = proyectosCache.find(x => x.id === id);
  if (!p) return;
  tareaProyectoActual = id;
  document.getElementById('tareasProyectoNombre').textContent = `Tareas — ${p.titulo}`;
  renderTareas(p.tareas || []);

  const addWrap = document.getElementById('addTareaWrap');
  if (addWrap) addWrap.style.display = currentUser?.rol === 'admin' ? '' : 'none';

  openModal('modalTareas');
};

function renderTareas(tareas) {
  const el = document.getElementById('tareasLista');
  if (!tareas.length) {
    el.innerHTML = '<p style="color:var(--muted);font-size:.87rem;text-align:center;padding:.5rem;">Sin tareas aún</p>';
    return;
  }
  el.innerHTML = tareas.map((t, i) => `
    <div class="task-item">
      <span class="task-title ${t.estado==='completado'?'done':''}">${t.titulo}</span>
      ${t.asignado ? `<span style="font-size:.75rem;color:var(--muted);">${t.asignado}</span>` : ''}
      <select class="task-estado" onchange="updateTareaEstado(${i}, this.value)">
        <option value="pendiente"   ${t.estado==='pendiente'?'selected':''}>Pendiente</option>
        <option value="en-proceso"  ${t.estado==='en-proceso'?'selected':''}>En proceso</option>
        <option value="completado"  ${t.estado==='completado'?'selected':''}>Completado</option>
      </select>
      ${currentUser?.rol==='admin'
        ? `<button class="btn-icon" onclick="borrarTarea(${i})" style="font-size:.8rem;">🗑️</button>`
        : ''}
    </div>`).join('');
}

window.updateTareaEstado = async (idx, nuevoEstado) => {
  const p = proyectosCache.find(x => x.id === tareaProyectoActual);
  if (!p) return;
  const tareas = [...(p.tareas || [])];
  tareas[idx] = { ...tareas[idx], estado: nuevoEstado };
  await updateDoc(doc(db, 'projects', tareaProyectoActual), { tareas });
  toast('Estado actualizado');
};

window.borrarTarea = async idx => {
  const p = proyectosCache.find(x => x.id === tareaProyectoActual);
  if (!p) return;
  const tareas = (p.tareas || []).filter((_, i) => i !== idx);
  await updateDoc(doc(db, 'projects', tareaProyectoActual), { tareas });
  renderTareas(tareas);
};

document.getElementById('btnAddTarea').addEventListener('click', async () => {
  const titulo    = document.getElementById('nuevaTareaTitulo').value.trim();
  const asignado  = document.getElementById('nuevaTareaAsignado').value;
  if (!titulo) { toast('Escribí el título de la tarea', 'error'); return; }
  const p = proyectosCache.find(x => x.id === tareaProyectoActual);
  if (!p) return;
  const tareas = [...(p.tareas || []), { titulo, asignado, estado: 'pendiente' }];
  await updateDoc(doc(db, 'projects', tareaProyectoActual), { tareas });
  document.getElementById('nuevaTareaTitulo').value = '';
  renderTareas(tareas);
  toast('Tarea agregada');
});


// ============================================================
// MARKETING
// ============================================================
function setupMarketing() {
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      ['campanas','leads','contenido','presupuesto'].forEach(t => {
        document.getElementById('mktab-'+t).style.display = t===tab ? '' : 'none';
      });
    });
  });

  // Campañas
  document.getElementById('btnNuevaCampana').addEventListener('click', () => {
    document.getElementById('campanaId').value = '';
    ['campNombre','campInversion','campAlcance','campLeads','campConv','campInicio','campFin'].forEach(id =>
      document.getElementById(id).value = '');
    openModal('modalCampana');
  });
  document.getElementById('btnGuardarCampana').addEventListener('click', guardarCampana);

  // Leads
  document.getElementById('btnNuevoLead').addEventListener('click', () => {
    document.getElementById('leadId').value = '';
    ['leadNombre','leadContacto','leadNota'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('leadFuente').value = 'Instagram';
    document.getElementById('leadEstado').value = 'nuevo';
    openModal('modalLead');
  });
  document.getElementById('btnGuardarLead').addEventListener('click', guardarLead);
  document.getElementById('leadFuenteFilter').addEventListener('change', renderLeadsFiltered);
  document.getElementById('leadEstadoFilter').addEventListener('change', renderLeadsFiltered);

  // Contenido
  document.getElementById('btnNuevoContenido').addEventListener('click', () => {
    document.getElementById('contenidoId').value = '';
    ['contCaption','contAlcance','contLikes','contComents','contGuardados'].forEach(id =>
      document.getElementById(id).value = '');
    document.getElementById('contFecha').value = today();
    openModal('modalContenido');
  });
  document.getElementById('btnGuardarContenido').addEventListener('click', guardarContenido);
  document.getElementById('contTipoFilter').addEventListener('change', renderContenidoFiltered);
  document.getElementById('contPlataformaFilter').addEventListener('change', renderContenidoFiltered);

  // Presupuesto
  document.getElementById('btnSetPresupuesto').addEventListener('click', () => {
    openModal('modalPresupuesto');
  });
  document.getElementById('btnGuardarPresupuesto').addEventListener('click', guardarPresupuesto);
}

// --- CAMPAÑAS ---
async function guardarCampana() {
  const id   = document.getElementById('campanaId').value;
  const nombre = document.getElementById('campNombre').value.trim();
  const inv    = parseFloat(document.getElementById('campInversion').value)||0;
  if (!nombre) { toast('El nombre es obligatorio', 'error'); return; }

  const data = {
    nombre,
    plataforma:  document.getElementById('campPlataforma').value,
    fechaInicio: document.getElementById('campInicio').value || null,
    fechaFin:    document.getElementById('campFin').value || null,
    inversion:   inv,
    alcance:     parseInt(document.getElementById('campAlcance').value)||0,
    leads:       parseInt(document.getElementById('campLeads').value)||0,
    conversiones:parseInt(document.getElementById('campConv').value)||0,
    fecha: new Date()
  };

  try {
    if (id) { await updateDoc(doc(db, 'campaigns', id), data); toast('Campaña actualizada'); }
    else    { await addDoc(collection(db, 'campaigns'), data); toast('Campaña guardada'); }
    closeModal('modalCampana');
  } catch (err) { toast('Error: ' + err.message, 'error'); }
}

function loadMarketing() {
  onSnapshot(query(collection(db, 'campaigns'), orderBy('fecha', 'desc')), snap => {
    const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderCampanas(lista);
    calcMkStats(lista);
  });
  onSnapshot(query(collection(db, 'leads'), orderBy('fecha', 'desc')), snap => {
    const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderLeads(lista);
  });
  onSnapshot(query(collection(db, 'content'), orderBy('fecha', 'desc')), snap => {
    const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderContenido(lista);
  });
  onSnapshot(doc(db, 'marketingBudget', 'main'), snap => {
    renderPresupuesto(snap.exists() ? snap.data() : {});
  });
}

function calcMkStats(campanas) {
  const inv   = campanas.reduce((s,c)=>s+(c.inversion||0),0);
  const leads = campanas.reduce((s,c)=>s+(c.leads||0),0);
  const conv  = campanas.reduce((s,c)=>s+(c.conversiones||0),0);
  const cpl   = leads > 0 ? inv/leads : 0;
  document.getElementById('mkInvertido').textContent = usd(inv);
  document.getElementById('mkLeads').textContent     = leads;
  document.getElementById('mkCPL').textContent       = leads > 0 ? usd(cpl) : '—';
  document.getElementById('mkConv').textContent      = conv;
}

function renderCampanas(lista) {
  const tb = document.getElementById('campanasTbody');
  if (!lista.length) {
    tb.innerHTML = '<tr><td colspan="8"><div class="empty-state"><span class="empty-icon">📣</span><p>Sin campañas aún</p></div></td></tr>';
    return;
  }
  tb.innerHTML = lista.map(c => `
    <tr>
      <td class="td-name">${c.nombre}</td>
      <td>${c.plataforma||'—'}</td>
      <td style="font-size:.8rem;color:var(--muted)">${c.fechaInicio||'—'} → ${c.fechaFin||'—'}</td>
      <td class="td-mono" style="color:var(--red)">${usd(c.inversion)}</td>
      <td>${(c.alcance||0).toLocaleString()}</td>
      <td style="color:var(--gold)">${c.leads||0}</td>
      <td style="color:var(--green)">${c.conversiones||0}</td>
      <td style="display:flex;gap:.4rem;">
        <button class="btn-icon" onclick="editCampana('${c.id}')">✏️</button>
        <button class="btn-icon" onclick="borrarCampana('${c.id}')">🗑️</button>
      </td>
    </tr>`).join('');
}

window.editCampana = async id => {
  const snap = await getDoc(doc(db, 'campaigns', id));
  if (!snap.exists()) return;
  const c = snap.data();
  document.getElementById('campanaId').value   = id;
  document.getElementById('campNombre').value  = c.nombre||'';
  document.getElementById('campPlataforma').value = c.plataforma||'Instagram';
  document.getElementById('campInicio').value  = c.fechaInicio||'';
  document.getElementById('campFin').value     = c.fechaFin||'';
  document.getElementById('campInversion').value = c.inversion||'';
  document.getElementById('campAlcance').value = c.alcance||'';
  document.getElementById('campLeads').value   = c.leads||'';
  document.getElementById('campConv').value    = c.conversiones||'';
  openModal('modalCampana');
};

window.borrarCampana = async id => {
  if (!confirm('¿Eliminar esta campaña?')) return;
  await deleteDoc(doc(db, 'campaigns', id));
  toast('Campaña eliminada');
};

// --- LEADS ---
async function guardarLead() {
  const id = document.getElementById('leadId').value;
  const nombre = document.getElementById('leadNombre').value.trim();
  if (!nombre) { toast('El nombre es obligatorio', 'error'); return; }

  const data = {
    nombre,
    contacto: document.getElementById('leadContacto').value.trim(),
    fuente:   document.getElementById('leadFuente').value,
    estado:   document.getElementById('leadEstado').value,
    nota:     document.getElementById('leadNota').value.trim(),
    fecha: new Date()
  };

  try {
    if (id) { await updateDoc(doc(db, 'leads', id), data); toast('Lead actualizado'); }
    else    { await addDoc(collection(db, 'leads'), data); toast('Lead guardado'); }
    closeModal('modalLead');
  } catch (err) { toast('Error: ' + err.message, 'error'); }
}

function renderLeadsFiltered() {
  const fuente = document.getElementById('leadFuenteFilter').value;
  const estado = document.getElementById('leadEstadoFilter').value;
  getDocs(query(collection(db, 'leads'), orderBy('fecha', 'desc'))).then(snap => {
    let lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (fuente) lista = lista.filter(l => l.fuente === fuente);
    if (estado) lista = lista.filter(l => l.estado === estado);
    renderLeads(lista);
  });
}

function renderLeads(lista) {
  const tb = document.getElementById('leadsTbody');
  if (!lista.length) {
    tb.innerHTML = '<tr><td colspan="7"><div class="empty-state"><span class="empty-icon">🎯</span><p>Sin leads</p></div></td></tr>';
    return;
  }
  tb.innerHTML = lista.map(l => `
    <tr>
      <td class="td-name">${l.nombre}</td>
      <td>${l.contacto||'—'}</td>
      <td><span class="badge" style="background:rgba(90,154,224,.1);color:var(--blue)">${l.fuente||'—'}</span></td>
      <td><span class="badge badge-${l.estado}">${l.estado||'nuevo'}</span></td>
      <td>${fmtDate(l.fecha)}</td>
      <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${l.nota||'—'}</td>
      <td style="display:flex;gap:.4rem;">
        <button class="btn-icon" onclick="editLead('${l.id}')">✏️</button>
        <button class="btn-icon" onclick="borrarLead('${l.id}')">🗑️</button>
      </td>
    </tr>`).join('');
}

window.editLead = async id => {
  const snap = await getDoc(doc(db, 'leads', id));
  if (!snap.exists()) return;
  const l = snap.data();
  document.getElementById('leadId').value       = id;
  document.getElementById('leadNombre').value   = l.nombre||'';
  document.getElementById('leadContacto').value = l.contacto||'';
  document.getElementById('leadFuente').value   = l.fuente||'Instagram';
  document.getElementById('leadEstado').value   = l.estado||'nuevo';
  document.getElementById('leadNota').value     = l.nota||'';
  openModal('modalLead');
};

window.borrarLead = async id => {
  if (!confirm('¿Eliminar este lead?')) return;
  await deleteDoc(doc(db, 'leads', id));
  toast('Lead eliminado');
};

// --- CONTENIDO ---
async function guardarContenido() {
  const id = document.getElementById('contenidoId').value;
  const fecha = document.getElementById('contFecha').value;
  if (!fecha) { toast('La fecha es obligatoria', 'error'); return; }

  const data = {
    tipo:       document.getElementById('contTipo').value,
    plataforma: document.getElementById('contPlataforma').value,
    fecha:      new Date(fecha + 'T12:00:00'),
    caption:    document.getElementById('contCaption').value.trim(),
    alcance:    parseInt(document.getElementById('contAlcance').value)||0,
    likes:      parseInt(document.getElementById('contLikes').value)||0,
    comentarios:parseInt(document.getElementById('contComents').value)||0,
    guardados:  parseInt(document.getElementById('contGuardados').value)||0,
  };

  try {
    if (id) { await updateDoc(doc(db, 'content', id), data); toast('Post actualizado'); }
    else    { await addDoc(collection(db, 'content'), data); toast('Post guardado'); }
    closeModal('modalContenido');
  } catch (err) { toast('Error: ' + err.message, 'error'); }
}

function renderContenidoFiltered() {
  const tipo  = document.getElementById('contTipoFilter').value;
  const plat  = document.getElementById('contPlataformaFilter').value;
  getDocs(query(collection(db, 'content'), orderBy('fecha', 'desc'))).then(snap => {
    let lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (tipo) lista = lista.filter(c => c.tipo === tipo);
    if (plat) lista = lista.filter(c => c.plataforma === plat);
    renderContenido(lista);
  });
}

function renderContenido(lista) {
  const tb = document.getElementById('contenidoTbody');
  if (!lista.length) {
    tb.innerHTML = '<tr><td colspan="9"><div class="empty-state"><span class="empty-icon">📸</span><p>Sin posts</p></div></td></tr>';
    return;
  }
  tb.innerHTML = lista.map(c => `
    <tr>
      <td>${fmtDate(c.fecha)}</td>
      <td><span class="badge badge-activo">${c.tipo}</span></td>
      <td>${c.plataforma||'—'}</td>
      <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted)">${c.caption||'—'}</td>
      <td style="color:var(--red)">❤️ ${(c.likes||0).toLocaleString()}</td>
      <td>💬 ${(c.comentarios||0).toLocaleString()}</td>
      <td style="color:var(--gold)">👁️ ${(c.alcance||0).toLocaleString()}</td>
      <td>🔖 ${(c.guardados||0).toLocaleString()}</td>
      <td style="display:flex;gap:.4rem;">
        <button class="btn-icon" onclick="editContenido('${c.id}')">✏️</button>
        <button class="btn-icon" onclick="borrarContenido('${c.id}')">🗑️</button>
      </td>
    </tr>`).join('');
}

window.editContenido = async id => {
  const snap = await getDoc(doc(db, 'content', id));
  if (!snap.exists()) return;
  const c = snap.data();
  document.getElementById('contenidoId').value   = id;
  document.getElementById('contTipo').value      = c.tipo||'Reel';
  document.getElementById('contPlataforma').value= c.plataforma||'Instagram';
  const d = c.fecha?.toDate ? c.fecha.toDate() : new Date(c.fecha);
  document.getElementById('contFecha').value     = d.toISOString().slice(0,10);
  document.getElementById('contCaption').value   = c.caption||'';
  document.getElementById('contAlcance').value   = c.alcance||'';
  document.getElementById('contLikes').value     = c.likes||'';
  document.getElementById('contComents').value   = c.comentarios||'';
  document.getElementById('contGuardados').value = c.guardados||'';
  openModal('modalContenido');
};

window.borrarContenido = async id => {
  if (!confirm('¿Eliminar este post?')) return;
  await deleteDoc(doc(db, 'content', id));
  toast('Post eliminado');
};

// --- PRESUPUESTO ---
async function guardarPresupuesto() {
  const meta = parseFloat(document.getElementById('prsMonto').value);
  if (!meta || meta <= 0) { toast('Ingresá un monto válido', 'error'); return; }
  try {
    await setDoc(doc(db, 'marketingBudget', 'main'), { meta }, { merge: true });
    toast('Presupuesto actualizado');
    closeModal('modalPresupuesto');
  } catch (err) { toast('Error: ' + err.message, 'error'); }
}

async function renderPresupuesto(data) {
  const meta = data.meta || 0;
  // Sumar inversión de campañas del mes actual
  const now  = new Date();
  const snap = await getDocs(collection(db, 'campaigns'));
  const gastado = snap.docs
    .map(d => d.data())
    .filter(c => {
      const fi = c.fechaInicio ? new Date(c.fechaInicio) : null;
      return fi && fi.getMonth()===now.getMonth() && fi.getFullYear()===now.getFullYear();
    })
    .reduce((s, c) => s + (c.inversion||0), 0);

  const pct = meta > 0 ? Math.min(100, (gastado/meta)*100) : 0;
  document.getElementById('mkPresNombre').textContent  = meta > 0 ? 'Meta mensual definida' : 'Sin meta definida';
  document.getElementById('mkPresGastado').textContent = usd(gastado);
  document.getElementById('mkPresMeta').textContent    = meta > 0 ? usd(meta) : '—';
  document.getElementById('mkPresBar').style.width     = pct.toFixed(1)+'%';
  document.getElementById('mkPresPct').textContent     = pct.toFixed(1)+'%';
  document.getElementById('mkPresRest').textContent    = meta > 0
    ? (gastado > meta ? `⚠️ Excedido en ${usd(gastado-meta)}` : `Disponible ${usd(meta-gastado)}`) : '';
}

// ===== INICIO — login real =====
// (va al final para que todas las declaraciones estén disponibles)
function showApp(user) {
  currentUser = user;
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('logoutBtn').style.display = '';
  document.getElementById('appScreen').style.display = 'flex';
  document.getElementById('appScreen').classList.add('active');
  document.getElementById('sidebarEmail').textContent = `${user.nombre} · VisionaryFilm`;
  applyRoleUI(user.rol);
  addDemoBanner();
  initApp();
}

function showLogin() {
  currentUser = null;
  document.getElementById('appScreen').style.display = 'none';
  document.getElementById('appScreen').classList.remove('active');
  document.getElementById('loginScreen').style.display = '';
}

onAuthStateChanged(auth, user => {
  if (user) showApp(user);
  else showLogin();
});

document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginError');
  errEl.style.display = 'none';
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, pass);
    showApp(user);
  } catch (err) {
    errEl.textContent = 'Email o contraseña incorrectos.';
    errEl.style.display = '';
  }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await signOut(auth);
  showLogin();
});
