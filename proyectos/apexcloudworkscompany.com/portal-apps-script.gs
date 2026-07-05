// ─────────────────────────────────────────────
//  Apex Cloud Works — Portal Backend
//  Google Apps Script · Conectar con Google Sheets
//
//  SETUP:
//  1. Crear una hoja en drive.google.com
//  2. Copiar el ID de la URL (entre /d/ y /edit)
//  3. Pegarlo en SPREADSHEET_ID abajo
//  4. Deploy → New deployment → Web app → Anyone
// ─────────────────────────────────────────────

const SPREADSHEET_ID = '1d4dVBf8Cb5m8sG72YWrEAUmpuBb7kxhYmrscHDh5cP0';
const ADMIN_TOKEN     = 'apexAdmin2026!';

// ── HEADERS DE CADA HOJA ──
const SHEET_HEADERS = {
  Usuarios:       ['email', 'password_hash', 'nombre', 'tipo', 'servicio_id', 'token', 'activo', 'created_at'],
  Proyectos:      ['id', 'email', 'nombre_proyecto', 'tipo_servicio', 'etapa_actual', 'preview_url', 'fecha_inicio', 'valor'],
  Etapas:         ['proyecto_id', 'etapa', 'orden', 'estado', 'fecha_completado', 'nota'],
  Tickets:        ['id', 'email', 'asunto', 'mensaje', 'estado', 'fecha'],
  Respuestas:     ['ticket_id', 'autor', 'mensaje', 'fecha'],
  ProyectosAdmin: ['id', 'nombre', 'cliente', 'estado', 'valor', 'entrega', 'progreso', 'tech', 'emoji'],
  TicketsAdmin:   ['id', 'proyecto', 'descripcion', 'prioridad', 'estado', 'fecha'],
  Leads:          ['id', 'nombre', 'contacto', 'servicio', 'mensaje', 'estado', 'fecha'],
  Finanzas:       ['id', 'cliente', 'proyecto', 'monto', 'estado', 'fecha_factura', 'fecha_pago', 'nota'],
};

// ── ETAPAS POR TIPO DE SERVICIO ──
const ETAPAS_DEFAULT = {
  landing: ['Brief', 'Diseño', 'Desarrollo', 'Revisión 1', 'Revisión 2', 'Live'],
  plan:    ['Onboarding', 'Setup', 'Activación', 'Primer ciclo', 'Mantenimiento activo']
};

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function initSheets() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  Object.keys(SHEET_HEADERS).forEach(function(name) {
    if (!ss.getSheetByName(name)) {
      var s = ss.insertSheet(name);
      s.appendRow(SHEET_HEADERS[name]);
      s.getRange(1, 1, 1, SHEET_HEADERS[name].length).setFontWeight('bold');
    }
  });
}

function getSheetRows(name) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(name);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  return values.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i] === '' ? null : row[i]; });
    return obj;
  });
}

function findRowIndex(sheetName, key, value) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return -1;
  var data = sheet.getDataRange().getValues();
  var colIdx = data[0].indexOf(key);
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][colIdx]) === String(value)) return i + 1;
  }
  return -1;
}

function findRowIndexMulti(sheetName, conditions) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return -1;
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var keys = Object.keys(conditions);
  for (var i = 1; i < data.length; i++) {
    var match = keys.every(function(k) {
      return String(data[i][headers.indexOf(k)]) === String(conditions[k]);
    });
    if (match) return i + 1;
  }
  return -1;
}

function setCell(sheetName, rowIdx, key, value) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var col = headers.indexOf(key) + 1;
  if (col > 0) sheet.getRange(rowIdx, col).setValue(value);
}

function getUserByToken(token) {
  if (!token) return null;
  var users = getSheetRows('Usuarios');
  for (var i = 0; i < users.length; i++) {
    if (users[i].token === token && users[i].activo) return users[i];
  }
  return null;
}

function makeID(prefix) {
  return prefix + '-' + Date.now().toString(36).toUpperCase();
}

function nowCR() {
  return new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' });
}

function dateCR() {
  return new Date().toLocaleDateString('es-CR', { timeZone: 'America/Costa_Rica' });
}

// ─────────────────────────────────────────────
//  ROUTER
// ─────────────────────────────────────────────

function doGet(e) {
  try {
    initSheets();
    var p = e.parameter;
    var res;
    switch (p.accion) {
      case 'login':        res = login(p.email, p.hash);          break;
      case 'portal':       res = getPortal(p.token);              break;
      case 'tickets':      res = getClientTickets(p.token);       break;
      case 'clientes':      res = getClientes(p.adminToken);                      break;
      case 'adminTickets':  res = getAdminTickets(p.adminToken);                  break;
      case 'adminEtapas':   res = getAdminEtapas(p.adminToken, p.proyectoId);    break;
      case 'adminProyectos':  res = getAdminProyectos(p.adminToken);              break;
      case 'adminLeads':      res = getAdminLeads(p.adminToken);                 break;
      case 'adminTicketsInt': res = getAdminTicketsInt(p.adminToken);            break;
      case 'adminFinanzas':   res = getAdminFinanzas(p.adminToken);              break;
      default:              res = { success: false, error: 'Accion desconocida' };
    }
    return respond(res);
  } catch (err) {
    return respond({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    initSheets();
    var data = JSON.parse(e.postData.contents);
    var res;
    switch (data.accion) {
      case 'addTicket':          res = addTicket(data);          break;
      case 'responderTicket':    res = responderTicket(data);    break;
      case 'updateEtapa':        res = updateEtapa(data);        break;
      case 'crearCliente':       res = crearCliente(data);       break;
      case 'addProyectoAdmin':   res = addProyectoAdmin(data);   break;
      case 'updateProyectoAdmin':res = updateProyectoAdmin(data);break;
      case 'addLead':            res = addLead(data);            break;
      case 'updateLead':         res = updateLead(data);         break;
      case 'addTicketAdmin':     res = addTicketAdmin(data);     break;
      case 'updateTicketAdmin':  res = updateTicketAdmin(data);  break;
      case 'addFinanza':         res = addFinanza(data);         break;
      case 'updateFinanza':      res = updateFinanza(data);      break;
      default:                   res = { success: false, error: 'Accion desconocida' };
    }
    return respond(res);
  } catch (err) {
    return respond({ success: false, error: err.toString() });
  }
}

// ─────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────

function login(email, hash) {
  if (!email || !hash) return { success: false, error: 'Credenciales incompletas' };
  var emailLow = email.toLowerCase().trim();
  var users = getSheetRows('Usuarios');
  var user = null;
  for (var i = 0; i < users.length; i++) {
    if (users[i].email === emailLow && users[i].password_hash === hash) {
      user = users[i]; break;
    }
  }
  if (!user) return { success: false, error: 'Email o contraseña incorrectos' };
  if (!user.activo) return { success: false, error: 'Cuenta desactivada. Contactá a Apex.' };

  var token = Utilities.getUuid();
  var rowIdx = findRowIndex('Usuarios', 'email', emailLow);
  setCell('Usuarios', rowIdx, 'token', token);

  return { success: true, token: token, nombre: user.nombre, tipo: user.tipo, email: user.email };
}

// ─────────────────────────────────────────────
//  PORTAL DATA
// ─────────────────────────────────────────────

function getPortal(token) {
  var user = getUserByToken(token);
  if (!user) return { success: false, error: 'Sesión inválida. Volvé a hacer login.' };

  var proyectos = getSheetRows('Proyectos');
  var proyecto = null;
  for (var i = 0; i < proyectos.length; i++) {
    if (proyectos[i].email === user.email) { proyecto = proyectos[i]; break; }
  }

  var etapas = [];
  if (proyecto) {
    var todasEtapas = getSheetRows('Etapas');
    etapas = todasEtapas.filter(function(e) { return e.proyecto_id === proyecto.id; });
    etapas.sort(function(a, b) { return a.orden - b.orden; });
  }

  var todosTickets = getSheetRows('Tickets');
  var respuestas   = getSheetRows('Respuestas');
  var tickets = todosTickets
    .filter(function(t) { return t.email === user.email; })
    .map(function(t) {
      return Object.assign({}, t, {
        respuestas: respuestas.filter(function(r) { return r.ticket_id === t.id; })
      });
    });

  return {
    success: true,
    user:    { nombre: user.nombre, email: user.email, tipo: user.tipo },
    proyecto: proyecto,
    etapas:  etapas,
    tickets: tickets
  };
}

function getClientTickets(token) {
  var user = getUserByToken(token);
  if (!user) return { success: false, error: 'Sesión inválida' };
  var tickets    = getSheetRows('Tickets').filter(function(t) { return t.email === user.email; });
  var respuestas = getSheetRows('Respuestas');
  return {
    success: true,
    tickets: tickets.map(function(t) {
      return Object.assign({}, t, {
        respuestas: respuestas.filter(function(r) { return r.ticket_id === t.id; })
      });
    })
  };
}

// ─────────────────────────────────────────────
//  TICKET ACTIONS
// ─────────────────────────────────────────────

function addTicket(data) {
  var user = getUserByToken(data.token);
  if (!user) return { success: false, error: 'Sesión inválida' };

  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('Tickets');
  var id    = makeID('TKT');
  sheet.appendRow([id, user.email, data.asunto, data.mensaje, 'abierto', nowCR()]);

  return { success: true, id: id };
}

function responderTicket(data) {
  if (data.adminToken !== ADMIN_TOKEN) return { success: false, error: 'Sin autorización' };

  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('Respuestas');
  sheet.appendRow([data.ticketId, 'Garett · Apex Cloud Works', data.mensaje, nowCR()]);

  var rowIdx = findRowIndex('Tickets', 'id', data.ticketId);
  if (rowIdx > 0) setCell('Tickets', rowIdx, 'estado', 'respondido');

  return { success: true };
}

// ─────────────────────────────────────────────
//  ETAPA ACTIONS (admin)
// ─────────────────────────────────────────────

function updateEtapa(data) {
  if (data.adminToken !== ADMIN_TOKEN) return { success: false, error: 'Sin autorización' };

  var rowIdx = findRowIndexMulti('Etapas', { proyecto_id: data.proyectoId, etapa: data.etapa });
  if (rowIdx < 0) return { success: false, error: 'Etapa no encontrada' };

  setCell('Etapas', rowIdx, 'estado', data.estado);
  if (data.estado === 'completado') setCell('Etapas', rowIdx, 'fecha_completado', dateCR());
  if (data.nota) setCell('Etapas', rowIdx, 'nota', data.nota);

  // Actualizar etapa_actual en Proyectos
  if (data.estado === 'completado') {
    var pRowIdx = findRowIndex('Proyectos', 'id', data.proyectoId);
    if (pRowIdx > 0) setCell('Proyectos', pRowIdx, 'etapa_actual', data.etapa);
  }

  return { success: true };
}

function getAdminEtapas(adminToken, proyectoId) {
  if (adminToken !== ADMIN_TOKEN) return { success: false, error: 'Sin autorización' };
  var etapas = getSheetRows('Etapas').filter(function(e) { return e.proyecto_id === proyectoId; });
  etapas.sort(function(a, b) { return a.orden - b.orden; });
  return { success: true, etapas: etapas };
}

// ─────────────────────────────────────────────
//  CLIENTE ACTIONS (admin)
// ─────────────────────────────────────────────

function crearCliente(data) {
  if (data.adminToken !== ADMIN_TOKEN) return { success: false, error: 'Sin autorización' };

  var email = data.email.toLowerCase().trim();
  if (findRowIndex('Usuarios', 'email', email) > 0) {
    return { success: false, error: 'Este email ya está registrado' };
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Crear usuario
  var usuariosSheet = ss.getSheetByName('Usuarios');
  usuariosSheet.appendRow([
    email, data.password_hash, data.nombre,
    data.tipo, null, null, true, dateCR()
  ]);

  // Crear proyecto si aplica
  if (data.tipo === 'landing' || data.tipo === 'plan') {
    var proyId    = makeID('PRY');
    var proySheet = ss.getSheetByName('Proyectos');
    proySheet.appendRow([
      proyId, email, data.nombre_proyecto, data.tipo,
      null, data.preview_url || null, dateCR(), data.valor || null
    ]);

    // Vincular al usuario
    var uRowIdx = findRowIndex('Usuarios', 'email', email);
    setCell('Usuarios', uRowIdx, 'servicio_id', proyId);

    // Crear etapas por defecto
    var etapasSheet = ss.getSheetByName('Etapas');
    var etapas = ETAPAS_DEFAULT[data.tipo] || ETAPAS_DEFAULT.landing;
    etapas.forEach(function(etapa, i) {
      etapasSheet.appendRow([proyId, etapa, i + 1, 'pendiente', null, null]);
    });
  }

  return { success: true };
}

function getClientes(adminToken) {
  if (adminToken !== ADMIN_TOKEN) return { success: false, error: 'Sin autorización' };

  var usuarios  = getSheetRows('Usuarios');
  var proyectos = getSheetRows('Proyectos');
  var tickets   = getSheetRows('Tickets');

  var clientes = usuarios.map(function(u) {
    var proy = null;
    for (var i = 0; i < proyectos.length; i++) {
      if (proyectos[i].email === u.email) { proy = proyectos[i]; break; }
    }
    var openTkts = tickets.filter(function(t) {
      return t.email === u.email && t.estado === 'abierto';
    }).length;
    return {
      email:        u.email,
      nombre:       u.nombre,
      tipo:         u.tipo,
      activo:       u.activo,
      proyecto:     proy ? proy.nombre_proyecto : null,
      etapa_actual: proy ? proy.etapa_actual    : null,
      proyecto_id:  proy ? proy.id              : null,
      open_tickets: openTkts
    };
  });

  return { success: true, clientes: clientes };
}

function getAdminTickets(adminToken) {
  if (adminToken !== ADMIN_TOKEN) return { success: false, error: 'Sin autorización' };

  var tickets    = getSheetRows('Tickets');
  var respuestas = getSheetRows('Respuestas');
  var usuarios   = getSheetRows('Usuarios');

  return {
    success: true,
    tickets: tickets.map(function(t) {
      var user = null;
      for (var i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email === t.email) { user = usuarios[i]; break; }
      }
      return Object.assign({}, t, {
        nombre_cliente: user ? user.nombre : t.email,
        respuestas: respuestas.filter(function(r) { return r.ticket_id === t.id; })
      });
    })
  };
}

// ─────────────────────────────────────────────
//  ADMIN PANEL — Proyectos, Leads, Tickets internos
// ─────────────────────────────────────────────

function getAdminProyectos(adminToken) {
  if (adminToken !== ADMIN_TOKEN) return { success: false, error: 'Sin autorización' };
  return { success: true, proyectos: getSheetRows('ProyectosAdmin') };
}

function getAdminLeads(adminToken) {
  if (adminToken !== ADMIN_TOKEN) return { success: false, error: 'Sin autorización' };

  var adminLeads = getSheetRows('Leads');

  // Unificar con leads del formulario web (Leads_Web)
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var webSheet = ss.getSheetByName('Leads_Web');
  var webLeads = [];
  if (webSheet && webSheet.getLastRow() > 1) {
    var values = webSheet.getDataRange().getValues();
    // headers: Fecha, Nombre, Contacto, Servicio, Mensaje, Fuente
    values.slice(1).forEach(function(row, i) {
      webLeads.push({
        id:       'WEB-' + (i + 1),
        nombre:   row[1] || '',
        contacto: row[2] || '',
        servicio: row[3] || '',
        mensaje:  row[4] || '',
        estado:   'new',
        fecha:    row[0] ? new Date(row[0]).toLocaleDateString('es-CR') : '',
        fuente:   row[5] || 'Web',
      });
    });
  }

  var todos = adminLeads.concat(webLeads);
  // Ordenar por fecha desc (los sin fecha van al final)
  todos.sort(function(a, b) {
    return (b.fecha || '').localeCompare(a.fecha || '');
  });

  return { success: true, leads: todos };
}

function getAdminTicketsInt(adminToken) {
  if (adminToken !== ADMIN_TOKEN) return { success: false, error: 'Sin autorización' };
  return { success: true, tickets: getSheetRows('TicketsAdmin') };
}

function addProyectoAdmin(data) {
  if (data.adminToken !== ADMIN_TOKEN) return { success: false, error: 'Sin autorización' };
  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('ProyectosAdmin');
  var id    = makeID('PRY');
  sheet.appendRow([id, data.nombre, data.cliente, data.estado || 'pending',
    Number(data.valor) || 0, data.entrega || '', 0, data.tech || '', data.emoji || '📁']);
  return { success: true, id: id };
}

function updateProyectoAdmin(data) {
  if (data.adminToken !== ADMIN_TOKEN) return { success: false, error: 'Sin autorización' };
  var rowIdx = findRowIndex('ProyectosAdmin', 'id', data.id);
  if (rowIdx < 0) return { success: false, error: 'Proyecto no encontrado' };
  var fields = ['nombre', 'cliente', 'estado', 'valor', 'entrega', 'progreso', 'tech', 'emoji'];
  fields.forEach(function(f) {
    if (data[f] !== undefined && data[f] !== null && data[f] !== '')
      setCell('ProyectosAdmin', rowIdx, f, data[f]);
  });
  return { success: true };
}

function addLead(data) {
  if (data.adminToken !== ADMIN_TOKEN) return { success: false, error: 'Sin autorización' };
  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('Leads');
  var id    = makeID('LEAD');
  sheet.appendRow([id, data.nombre, data.contacto, data.servicio, data.mensaje || '', 'new', dateCR()]);
  return { success: true, id: id };
}

function updateLead(data) {
  if (data.adminToken !== ADMIN_TOKEN) return { success: false, error: 'Sin autorización' };
  var rowIdx = findRowIndex('Leads', 'id', data.id);
  if (rowIdx < 0) return { success: false, error: 'Lead no encontrado' };
  if (data.estado) setCell('Leads', rowIdx, 'estado', data.estado);
  return { success: true };
}

function addTicketAdmin(data) {
  if (data.adminToken !== ADMIN_TOKEN) return { success: false, error: 'Sin autorización' };
  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('TicketsAdmin');
  var id    = makeID('TKT');
  sheet.appendRow([id, data.proyecto, data.descripcion, data.prioridad || 'normal', 'open', dateCR()]);
  return { success: true, id: id };
}

function updateTicketAdmin(data) {
  if (data.adminToken !== ADMIN_TOKEN) return { success: false, error: 'Sin autorización' };
  var rowIdx = findRowIndex('TicketsAdmin', 'id', data.id);
  if (rowIdx < 0) return { success: false, error: 'Ticket no encontrado' };
  if (data.estado) setCell('TicketsAdmin', rowIdx, 'estado', data.estado);
  return { success: true };
}

// ─────────────────────────────────────────────
//  FINANZAS
// ─────────────────────────────────────────────

function getAdminFinanzas(adminToken) {
  if (adminToken !== ADMIN_TOKEN) return { success: false, error: 'Sin autorización' };
  return { success: true, finanzas: getSheetRows('Finanzas') };
}

function addFinanza(data) {
  if (data.adminToken !== ADMIN_TOKEN) return { success: false, error: 'Sin autorización' };
  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('Finanzas');
  var id    = makeID('FIN');
  sheet.appendRow([
    id,
    data.cliente,
    data.proyecto,
    Number(data.monto) || 0,
    data.estado || 'pendiente',
    data.fecha_factura || dateCR(),
    '',
    data.nota || '',
  ]);
  return { success: true, id: id };
}

function updateFinanza(data) {
  if (data.adminToken !== ADMIN_TOKEN) return { success: false, error: 'Sin autorización' };
  var rowIdx = findRowIndex('Finanzas', 'id', data.id);
  if (rowIdx < 0) return { success: false, error: 'Registro no encontrado' };
  var fields = ['cliente', 'proyecto', 'monto', 'estado', 'fecha_factura', 'fecha_pago', 'nota'];
  fields.forEach(function(f) {
    if (data[f] !== undefined && data[f] !== null && data[f] !== '')
      setCell('Finanzas', rowIdx, f, data[f]);
  });
  return { success: true };
}
