/* ═══════════════════════════════════════════════════════════════
   Atlantek · store.js — capa de datos
   Local-first (localStorage) + sincronización con Google Sheets
   vía Apps Script (ver assets/js/config.js y apps-script/Code.gs).
   ═══════════════════════════════════════════════════════════════ */

const Store = (() => {
  const KEY = 'atlantek-gestion-v1';

  const GARANTIA_DEFAULT =
    'Garantía: Equipos con 12 meses de garantía por defectos de fábrica. ' +
    'Instalación con 90 días de garantía sobre mano de obra. No aplica por daños ' +
    'causados por mal uso, terceros, variaciones eléctricas o causas de fuerza mayor.';

  const EMPRESA = {
    nombre: 'Atlantek',
    linea2: 'N/A',
    direccion: '70201 Guápiles',
    pais: 'Costa Rica',
    email: 'soporte@atlanteksystems.com'
  };

  /* ── Datos semilla: cliente y proforma 027 reales ── */
  function seed() {
    return {
      nextNumber: 28,
      leads: [],
      catalogo: [
        { id: 'p1', nombre: 'Grabador DVR Dahua DH-XVR1B04-IT', categoria: 'Grabadores', imagen: 'assets/img/products/dvr-dahua.jpg', precio: 25000, descripcion: 'DVR 4 canales 1080/2MP, H.265+, detección de movimiento', unidad: 'pieza', estado: 'disponible' },
        { id: 'p2', nombre: 'Cámara Domo Dahua 2MP', categoria: 'Cámaras', precio: 12500, descripcion: 'Domo interior, IR 20m, IP67, PoE', unidad: 'pieza', estado: 'disponible' },
        { id: 'p3', nombre: 'Cámara Bullet Dahua 2MP', categoria: 'Cámaras', precio: 12500, descripcion: 'Bullet exterior, IR 30m, IP67, PoE', unidad: 'pieza', estado: 'disponible' },
        { id: 'p4', nombre: 'Disco Duro Toshiba 1TB', categoria: 'Almacenamiento', imagen: 'assets/img/products/disco-duro.jpg', precio: 22000, descripcion: 'Disco surveillance 3.5", 64MB cache, 7200RPM', unidad: 'pieza', estado: 'disponible' },
        { id: 'p5', nombre: 'Fuente de Poder 12V 5A', categoria: 'Accesorios', imagen: 'assets/img/products/fuente-poder.jpg', precio: 1750, descripcion: 'Fuente conmutada para cámaras CCTV', unidad: 'pieza', estado: 'disponible' },
        { id: 'p6', nombre: 'Balun Transceptor 2MP', categoria: 'Accesorios', imagen: 'assets/img/products/balun.jpg', precio: 750, descripcion: 'Balun pasivo analógico video HD', unidad: 'pieza', estado: 'disponible' },
        { id: 'p7', nombre: 'Cable UTP Cat5e', categoria: 'Cableado', imagen: 'assets/img/products/cable-utp.jpg', precio: 800, descripcion: 'Metro de cable UTP Cat5e exterior', unidad: 'metro', estado: 'disponible' },
        { id: 'p8', nombre: 'Canaleleta 200x10x5', categoria: 'Cableado', imagen: 'assets/img/products/canaleleta.jpg', precio: 5500, descripcion: 'Canaleleta ventilada Teklink 2.5m', unidad: 'pieza', estado: 'disponible' },
        { id: 'p9', nombre: 'Instalación y Configuración', categoria: 'Servicios', imagen: 'assets/img/products/instalacion.jpg', precio: 75000, descripcion: 'Instalación, cableado y configuración de sistema completo', unidad: 'servicio', estado: 'disponible' },
        { id: 'p10', nombre: 'Intercom Dahua VTO', categoria: 'Acceso', imagen: 'assets/img/products/intercom.jpg', precio: 85000, descripcion: 'Portalero IP con tarjeta RFID y app móvil', unidad: 'pieza', estado: 'disponible' },
        { id: 'p11', nombre: 'Switch Ruijie 8 puertos PoE', categoria: 'Redes', imagen: 'assets/img/products/switch-ruijie.jpg', precio: 35000, descripcion: 'Switch administrable 8x PoE+ 65W, Gigabit', unidad: 'pieza', estado: 'disponible' },
        { id: 'p12', nombre: 'Access Point Ruijie', categoria: 'Redes', imagen: 'assets/img/products/access-point.jpg', precio: 28000, descripcion: 'AP WiFi 6 dual band, ceiling mount, PoE', unidad: 'pieza', estado: 'disponible' }
      ],
      clients: [
        {
          id: 'c1',
          nombre: 'CLINICA DENTAL ECO CLINIC',
          contacto: '',
          telefono: '',
          email: '',
          direccion: '70201 Guápiles',
          pais: 'Costa Rica',
          notas: '',
          productos: ['CCTV 4 cámaras Dahua', 'Grabador DVR'],
          estado: 'activo'
        }
      ],
      docs: [
        {
          id: 'd27',
          tipo: 'proforma',            // proforma | factura
          numero: 27,
          clientId: 'c1',
          fechaEmision: '2026-07-11',
          fechaEntrega: '2026-07-11',
          estado: 'enviada',           // borrador | enviada | pagada
          notas: GARANTIA_DEFAULT,
          items: [
            { desc: 'GRABADOR DVR DAHUA DH-XVR1B04-IT 1080/2MP', qty: 1, precio: 25000 },
            { desc: 'CAMARA DOMO DAHUA 2MP', qty: 2, precio: 12500 },
            { desc: 'CAMARA BULLET DAHUA 2MP', qty: 2, precio: 12500 },
            { desc: 'DISCO DURO TOSHIBA 1TB', qty: 1, precio: 22000 },
            { desc: 'FUENTE DE PODER 12V 5A', qty: 1, precio: 1750 },
            { desc: 'CONECTOR MACHO/HEMBRA DC', qty: 8, precio: 250 },
            { desc: 'BALUN TRANSCEPTOR 2MP PASIVO ANALÓGICO VIDEO HD BAL2MP', qty: 4, precio: 750 },
            { desc: 'PATCH CORD CAT5E', qty: 1, precio: 1200 },
            { desc: 'INSTALACION/CABLEADO/CONFIGURACION', qty: 1, precio: 75000 },
            { desc: 'BANDEJA VENTILADA 25CM TEKLINK', qty: 1, precio: 11500 },
            { desc: 'CANALETA 200X10X5', qty: 1, precio: 5500 }
          ]
        }
      ]
    };
  }

  let data;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      data = raw ? JSON.parse(raw) : seed();
    } catch (e) {
      data = seed();
    }
    saveLocal();
  }

  function saveLocal() {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function save() {
    saveLocal();
    syncPush();
  }

  const uid = () => 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  /* Cualquier formato de fecha → yyyy-mm-dd (local, sin corrimiento UTC) */
  function isoDate(v) {
    const s = String(v || '');
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    const d = new Date(s);
    if (isNaN(d)) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /* ═══════════ SINCRONIZACIÓN CON GOOGLE SHEETS ═══════════ */

  const hasSheets = () => typeof CONFIG !== 'undefined' && !!CONFIG.SHEETS_URL;

  function emit(status, extra) {
    document.dispatchEvent(new CustomEvent('store:sync', { detail: { status, ...extra } }));
  }

/* Pull inicial: lo que hay en Sheets manda; si Sheets está vacío,
      se sube el estado local (primer uso). */
  async function syncPull() {
    if (!hasSheets()) { emit('local'); return; }
    emit('syncing');
    try {
      // Usar AbortController para timeout de 5s
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`${CONFIG.SHEETS_URL}?action=load&token=${encodeURIComponent(CONFIG.TOKEN)}`, {
        signal: controller.signal,
        redirect: 'follow'
      });
      clearTimeout(timeoutId);
      
      const out = await res.json();
      if (!out.ok) throw new Error(out.error || 'error remoto');

      const remote = out.data;
      const remoteVacio = !remote.clients.length && !remote.docs.length;

      if (remoteVacio) {
        /* Sheets sin clientes/docs: se sube el estado local, pero los
           leads del sitio (si hay) sí se adoptan — el push no los toca. */
        data.leads = Array.isArray(remote.leads) ? remote.leads : [];
        saveLocal();
        await pushNow();
        emit('pulled');
      } else {
        data = remote;
        if (!Array.isArray(data.leads)) data.leads = [];
        /* Google Sheets devuelve las fechas como Date largo
           ("Sat Jul 11 2026 00:00:00 GMT-0600...") — normalizar a yyyy-mm-dd */
        data.docs.forEach(d => {
          d.fechaEmision = isoDate(d.fechaEmision);
          d.fechaEntrega = isoDate(d.fechaEntrega);
        });
        saveLocal();
        emit('pulled');
      }
      emit('ok');
    } catch (e) {
      console.warn('Sheets sync (pull):', e);
      // Si falla por red/CORS/timeout, seguir en modo local
      emit('local');
    }
  }

  /* Push con debounce: agrupa guardados seguidos en un solo POST */
  let pushTimer = null;

  function syncPush() {
    if (!hasSheets()) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(pushNow, 900);
  }

  async function pushNow() {
    if (!hasSheets()) return;
    emit('syncing');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      /* text/plain evita el preflight CORS que Apps Script no responde */
      const res = await fetch(CONFIG.SHEETS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ token: CONFIG.TOKEN, action: 'save', data }),
        signal: controller.signal,
        redirect: 'follow'
      });
      clearTimeout(timeoutId);
      
      const out = await res.json();
      if (!out.ok) throw new Error(out.error || 'error remoto');
      emit('ok');
    } catch (e) {
      console.warn('Sheets sync (push):', e);
      emit('error', { message: String(e) });
    }
  }

  /* ═══════════ CLIENTES ═══════════ */

  const getClients = () => data.clients.slice().sort((a, b) => a.nombre.localeCompare(b.nombre));
  const getClient  = (id) => data.clients.find(c => c.id === id) || null;

  function saveClient(c) {
    if (c.id) {
      const i = data.clients.findIndex(x => x.id === c.id);
      if (i >= 0) data.clients[i] = c;
    } else {
      c.id = uid();
      data.clients.push(c);
    }
    save();
    return c;
  }

  function deleteClient(id) {
    if (data.docs.some(d => d.clientId === id)) return false; // tiene documentos
    data.clients = data.clients.filter(c => c.id !== id);
    save();
    return true;
  }

  /* ═══════════ DOCUMENTOS ═══════════ */

  const getDocs = () => data.docs.slice().sort((a, b) => b.numero - a.numero);
  const getDoc  = (id) => data.docs.find(d => d.id === id) || null;

  function saveDoc(d) {
    if (d.id) {
      const i = data.docs.findIndex(x => x.id === d.id);
      if (i >= 0) data.docs[i] = d;
    } else {
      d.id = uid();
      d.numero = data.nextNumber++;
      /* Cotización: PRF-XXX (proforma) / FAC-XXX (factura) */
      if (!d.cotizacion) {
        const prefix = d.tipo === 'factura' ? 'FAC' : 'PRF';
        const existing = data.docs.filter(x => x.tipo === d.tipo);
        const next = existing.length + 1;
        d.cotizacion = `${prefix}-${String(next).padStart(3, '0')}`;
      }
      data.docs.push(d);
    }
    save();
    return d;
  }

  function deleteDoc(id) {
    data.docs = data.docs.filter(d => d.id !== id);
    save();
  }

  function setDocStatus(id, estado) {
    const d = getDoc(id);
    if (d) { d.estado = estado; save(); }
  }

  /* ═══════════ LEADS DEL SITIO ═══════════
     Los leads NO viajan en action:'save' (el backend los ignora a
     propósito para no pisar leads nuevos del sitio). El estado se
     actualiza fila por fila con action:'lead-status'. */

  const LEAD_ESTADOS = ['nuevo', 'contactado', 'cotizado', 'ganado', 'perdido'];

  const getLeads = () => (data.leads || []).slice().sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
  const getLead  = (id) => (data.leads || []).find(l => l.id === id) || null;
  const leadsNuevos = () => (data.leads || []).filter(l => l.estado === 'nuevo').length;

  /* ═══════════ CATÁLOGO ═══════════ */

  const getCatalogo = () => data.catalogo || [];
  const getCatalogoItem = (id) => (data.catalogo || []).find(p => p.id === id) || null;

  function saveCatalogoItem(p) {
    if (!data.catalogo) data.catalogo = [];
    if (p.id) {
      const i = data.catalogo.findIndex(x => x.id === p.id);
      if (i >= 0) data.catalogo[i] = p;
    } else {
      p.id = uid();
      data.catalogo.push(p);
    }
    save();
    return p;
  }

  function deleteCatalogoItem(id) {
    data.catalogo = (data.catalogo || []).filter(p => p.id !== id);
    save();
  }

  /* ═══════════ EXCEL IMPORT/EXPORT CATÁLOGO ═══════════ */

  function exportCatalogoToExcel() {
    const items = getCatalogo();
    if (!items.length) return null;

    const wsData = [
      ['ID', 'Nombre', 'Categoría', 'Precio (₡)', 'Unidad', 'Estado', 'Descripción', 'Imagen']
    ];

    items.forEach(p => {
      wsData.push([
        p.id || '',
        p.nombre || '',
        p.categoria || '',
        p.precio || 0,
        p.unidad || 'pieza',
        p.estado || 'disponible',
        p.descripcion || '',
        p.imagen || ''
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    const colWidths = [
      { wch: 12 },  // ID
      { wch: 40 },  // Nombre
      { wch: 20 },  // Categoría
      { wch: 16 },  // Precio
      { wch: 12 },  // Unidad
      { wch: 12 },  // Estado
      { wch: 50 },  // Descripción
      { wch: 40 }   // Imagen
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Catálogo');

    const filename = `catalogo-atlantek-${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(wb, filename);
    return filename;
  }

  function importCatalogoFromExcel(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const wb = XLSX.read(data, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(ws, { header: 1 });

          if (json.length < 2) {
            reject(new Error('El archivo está vacío o solo tiene encabezados'));
            return;
          }

          const headers = json[0].map(h => String(h).trim().toLowerCase());
          const expected = ['id', 'nombre', 'categoria', 'precio', 'unidad', 'estado', 'descripcion', 'imagen'];

          const idx = {
            id: headers.indexOf('id'),
            nombre: headers.indexOf('nombre'),
            categoria: headers.indexOf('categoria'),
            precio: headers.indexOf('precio'),
            precio: headers.indexOf('precio (₡)') >= 0 ? headers.indexOf('precio (₡)') : headers.indexOf('precio'),
            unidad: headers.indexOf('unidad'),
            estado: headers.indexOf('estado'),
            descripcion: headers.indexOf('descripcion'),
            descripcion: headers.indexOf('descripción') >= 0 ? headers.indexOf('descripción') : headers.indexOf('descripcion'),
            imagen: headers.indexOf('imagen')
          };

          const imported = [];
          const errors = [];

          for (let r = 1; r < json.length; r++) {
            const row = json[r];
            if (!row || row.every(c => c === '' || c === null || c === undefined)) continue;

            const nombre = String(row[idx.nombre] || '').trim();
            if (!nombre) {
              errors.push(`Fila ${r + 1}: falta nombre`);
              continue;
            }

            const precio = Number(row[idx.precio]) || 0;
            const item = {
              id: idx.id >= 0 && row[idx.id] ? String(row[idx.id]).trim() : uid(),
              nombre,
              categoria: idx.categoria >= 0 ? String(row[idx.categoria] || '').trim() : 'Otros',
              precio,
              unidad: idx.unidad >= 0 ? String(row[idx.unidad] || '').trim() : 'pieza',
              estado: idx.estado >= 0 ? String(row[idx.estado] || '').trim() : 'disponible',
              descripcion: idx.descripcion >= 0 ? String(row[idx.descripcion] || '').trim() : '',
              imagen: idx.imagen >= 0 ? String(row[idx.imagen] || '').trim() : ''
            };

            if (!['disponible', 'agotado'].includes(item.estado)) item.estado = 'disponible';
            if (!['pieza', 'metro', 'servicio', 'kit'].includes(item.unidad)) item.unidad = 'pieza';

            imported.push(item);
          }

          if (!imported.length && !errors.length) {
            reject(new Error('No se importaron productos válidos'));
            return;
          }

          if (!data.catalogo) data.catalogo = [];

          let creados = 0, actualizados = 0;
          imported.forEach(imp => {
            const existingIdx = data.catalogo.findIndex(p => p.id === imp.id);
            if (existingIdx >= 0) {
              data.catalogo[existingIdx] = imp;
              actualizados++;
            } else {
              data.catalogo.push(imp);
              creados++;
            }
          });

          save();
          resolve({ creados, actualizados, errores: errors });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsArrayBuffer(file);
    });
  }

  async function setLeadStatus(id, estado) {
    const l = getLead(id);
    if (!l || !LEAD_ESTADOS.includes(estado)) return false;
    l.estado = estado;
    saveLocal();
    if (!hasSheets()) return true;
    emit('syncing');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(CONFIG.SHEETS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ token: CONFIG.TOKEN, action: 'lead-status', id, estado }),
        signal: controller.signal,
        redirect: 'follow'
      });
      clearTimeout(timeoutId);
      
      const out = await res.json();
      if (!out.ok) throw new Error(out.error || 'error remoto');
      emit('ok');
    } catch (e) {
      console.warn('Sheets sync (lead-status):', e);
      emit('error', { message: String(e) });
    }
    return true;
  }

  /* ═══════════ SERVICIOS Y TICKETS (v2) ═══════════
     Viven en localStorage 'atlantek-gestion-v2' (misma fuente que
     dashboard.js). No viajan a Sheets todavía. */

  const V2_KEY = 'atlantek-gestion-v2';

  const getV2 = () => {
    try {
      const raw = localStorage.getItem(V2_KEY);
      const v2 = raw ? JSON.parse(raw) : null;
      return {
        services: Array.isArray(v2.services) ? v2.services : [],
        tickets: Array.isArray(v2.tickets) ? v2.tickets : []
      };
    } catch (e) {
      return { services: [], tickets: [] };
    }
  };

  const saveV2 = (v2) => {
    localStorage.setItem(V2_KEY, JSON.stringify(v2));
  };

  const getServices = (clientId) => {
    const all = getV2().services;
    return clientId ? all.filter(s => s.clientId === clientId) : all;
  };

  const getService = (id) => getV2().services.find(s => s.id === id) || null;

  const getTickets = (clientId) => {
    const all = getV2().tickets;
    return clientId ? all.filter(t => t.clientId === clientId) : all;
  };

  function saveTicket(t) {
    const v2 = getV2();
    const now = new Date().toISOString();
    if (t.id) {
      const i = v2.tickets.findIndex(x => x.id === t.id);
      if (i >= 0) {
        t.fechaActualizacion = now;
        v2.tickets[i] = t;
      } else {
        t.id = uid();
        t.fechaCreacion = now;
        t.fechaActualizacion = now;
        v2.tickets.push(t);
      }
    } else {
      t.id = uid();
      t.fechaCreacion = now;
      t.fechaActualizacion = now;
      if (!t.historial) t.historial = [];
      v2.tickets.push(t);
    }
    saveV2(v2);
    return t;
  }

  const serviceTotalMensual = (clientId) => {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    return getServices(clientId)
      .filter(s => s.estado === 'activo' && Number(s.valorMensual || 0) > 0 && new Date(s.fechaVencimiento) >= hoy)
      .reduce((sum, s) => sum + Number(s.valorMensual || 0), 0);
  };

  /* ═══════════ CÁLCULOS ═══════════ */

  const docTotal = (d) => d.items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.precio) || 0), 0);

  /* ═══════════ EXCEL EXPORT: LEADS, CLIENTES, DOCUMENTOS ═══════════ */

  function exportLeadsToExcel() {
    const leads = getLeads();
    if (!leads.length) return null;

    const wsData = [
      ['ID', 'Fecha', 'Nombre', 'Teléfono', 'Distrito', 'Servicio', 'Tipo', 'Estado', 'Mensaje']
    ];

    leads.forEach(l => {
      wsData.push([
        l.id || '',
        String(l.fecha || '').slice(0, 19).replace('T', ' '),
        l.nombre || '',
        l.telefono || '',
        l.distrito || '',
        l.servicio || '',
        l.tipo || '',
        l.estado || 'nuevo',
        l.mensaje || ''
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [
      { wch: 12 },  // ID
      { wch: 20 },  // Fecha
      { wch: 30 },  // Nombre
      { wch: 16 },  // Teléfono
      { wch: 20 },  // Distrito
      { wch: 20 },  // Servicio
      { wch: 16 },  // Tipo
      { wch: 14 },  // Estado
      { wch: 40 }   // Mensaje
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');

    const filename = `leads-atlantek-${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(wb, filename);
    return filename;
  }

  function exportClientesToExcel() {
    const clients = getClients();
    const docs = getDocs();
    if (!clients.length) return null;

    const wsData = [
      ['ID', 'Nombre', 'Contacto', 'Teléfono', 'Email', 'Dirección', 'País', 'Estado', 'Productos/Servicios', 'Total Docs', 'Total Facturación (₡)']
    ];

    clients.forEach(c => {
      const cDocs = docs.filter(d => d.clientId === c.id);
      const total = cDocs.reduce((s, d) => s + docTotal(d), 0);
      const productos = (c.productos || []).join('; ');
      wsData.push([
        c.id || '',
        c.nombre || '',
        c.contacto || '',
        c.telefono || '',
        c.email || '',
        c.direccion || '',
        c.pais || 'Costa Rica',
        c.estado || 'activo',
        productos,
        cDocs.length,
        total
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [
      { wch: 12 },  // ID
      { wch: 35 },  // Nombre
      { wch: 25 },  // Contacto
      { wch: 16 },  // Teléfono
      { wch: 30 },  // Email
      { wch: 30 },  // Dirección
      { wch: 16 },  // País
      { wch: 12 },  // Estado
      { wch: 40 },  // Productos
      { wch: 12 },  // Total Docs
      { wch: 22 }   // Total Facturación
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clientes');

    const filename = `clientes-atlantek-${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(wb, filename);
    return filename;
  }

  function exportDocumentosToExcel() {
    const docs = getDocs();
    const clients = getClients();
    if (!docs.length) return null;

    const clientMap = {};
    clients.forEach(c => { clientMap[c.id] = c.nombre; });

    const wsData = [
      ['ID', 'Número', 'Tipo', 'Cliente', 'Fecha Emisión', 'Fecha Entrega', 'Estado', 'Total (₡)', 'Items']
    ];

    docs.forEach(d => {
      const cliente = clientMap[d.clientId] || '—';
      const itemsText = (d.items || []).map(it => `${it.desc} (x${it.qty} @ ₡${it.precio})`).join('; ');
      wsData.push([
        d.id || '',
        String(d.numero || '').padStart(3, '0'),
        d.tipo || '',
        cliente,
        d.fechaEmision || '',
        d.fechaEntrega || '',
        d.estado || '',
        docTotal(d),
        itemsText
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [
      { wch: 12 },  // ID
      { wch: 10 },  // Número
      { wch: 12 },  // Tipo
      { wch: 30 },  // Cliente
      { wch: 14 },  // Fecha Emisión
      { wch: 14 },  // Fecha Entrega
      { wch: 12 },  // Estado
      { wch: 18 },  // Total
      { wch: 60 }   // Items
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Documentos');

    const filename = `documentos-atlantek-${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(wb, filename);
    return filename;
  }

  load();
  // Sync en background, no bloquea renderizado
  setTimeout(syncPull, 100);

  return {
    EMPRESA, GARANTIA_DEFAULT, LEAD_ESTADOS,
    getClients, getClient, saveClient, deleteClient,
    getDocs, getDoc, saveDoc, deleteDoc, setDocStatus,
    getLeads, getLead, leadsNuevos, setLeadStatus,
    getCatalogo, getCatalogoItem, saveCatalogoItem, deleteCatalogoItem,
    exportCatalogoToExcel, importCatalogoFromExcel,
    exportLeadsToExcel, exportClientesToExcel, exportDocumentosToExcel,
    getServices, getService, getTickets, saveTicket, serviceTotalMensual,
    docTotal,
    nextNumber: () => data.nextNumber,
    sync: { pull: syncPull, enabled: hasSheets }
  };
})();
