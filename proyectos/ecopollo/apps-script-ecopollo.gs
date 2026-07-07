// ═══════════════════════════════════════════════════════════════════
//  EcoPollo — Google Apps Script Backend
//  Sheet ID: 1kRQwAWJFd2FzqADkjLKFRN5Hnzb46uKk4y7hJurBypI
//
//  INSTRUCCIONES DE DEPLOY:
//  1. Abrir el Google Sheet → Extensiones → Apps Script
//  2. Pegar este código completo
//  3. Implementar → Nueva implementación → Aplicación web
//  4. Ejecutar como: Yo  |  Acceso: Cualquier usuario
//  5. Copiar la URL y colocarla en APPS_SCRIPT_URL de script.js y admin.html
//  6. ⚙️ Configuración del proyecto → Propiedades del script → agregar
//     ADMIN_TOKEN con la contraseña real del panel (esa es la que se escribe
//     en el login de admin.html — nunca vive en el código)
// ═══════════════════════════════════════════════════════════════════

// El token real vive en Script Properties (Apps Script → ⚙️ Configuración del proyecto →
// Propiedades del script → agregar ADMIN_TOKEN), nunca en el código fuente.
const ADMIN_TOKEN = PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN');

// ── Helpers ──────────────────────────────────────────────────────────────────
function getSheet(nombre) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(nombre);
  if (!sh) {
    sh = ss.insertSheet(nombre);
    if (nombre === 'Usuarios') {
      sh.appendRow(['Fecha','Nombre','Correo','Telefono','PasswordHash','Token','Zona','Direccion','TipoCliente','Activo']);
      sh.getRange(1,1,1,10).setFontWeight('bold');
    }
    if (nombre === 'Pedidos') {
      sh.appendRow(['Fecha','Nombre','Correo','Telefono','Productos','Total','Zona','Direccion','Estado','Fuente','ID']);
      sh.getRange(1,1,1,11).setFontWeight('bold');
    }
  }
  return sh;
}

function hashStr(str) {
  var h = 0;
  for (var i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h = h & h;
  }
  return Math.abs(h).toString(36);
}

function uid() {
  return 'ep' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
}

function ok(data)  { return ContentService.createTextOutput(JSON.stringify({ success:true,  ...data })).setMimeType(ContentService.MimeType.JSON); }
function err(msg)  { return ContentService.createTextOutput(JSON.stringify({ success:false, error: msg })).setMimeType(ContentService.MimeType.JSON); }

// ── Routing ───────────────────────────────────────────────────────────────────
function doGet(e) {
  try {
    var a = (e.parameter.accion || '').toLowerCase();
    if (a === 'login')          return loginUsuario(e.parameter);
    if (a === 'historial')      return getHistorial(e.parameter);
    if (a === 'admin_pedidos')  return adminPedidos(e.parameter);
    if (a === 'admin_usuarios') return adminUsuarios(e.parameter);
    if (a === 'stats')          return getStats(e.parameter);
    return err('Acción no reconocida');
  } catch(ex) { return err(ex.toString()); }
}

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var a = (d.accion || '').toLowerCase();
    if (a === 'registro')        return registrarUsuario(d);
    if (a === 'guardar_pedido')  return guardarPedido(d);
    if (a === 'update_estado')   return updateEstado(d);
    if (a === 'update_usuario')  return updateUsuario(d);
    return err('Acción no reconocida');
  } catch(ex) { return err(ex.toString()); }
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
function registrarUsuario(d) {
  var correo   = (d.correo   || '').toLowerCase().trim();
  var nombre   = (d.nombre   || '').trim();
  var telefono = (d.telefono || '').trim();
  var pwd      = d.password  || '';
  var zona     = (d.zona     || '').trim();
  var dir      = (d.direccion|| '').trim();
  var tipo     = (d.tipo     || 'Personal').trim();

  if (!correo || !pwd || !nombre) return err('Faltan campos obligatorios');

  var sh   = getSheet('Usuarios');
  var rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if ((rows[i][2]||'').toLowerCase() === correo)
      return err('Correo ya registrado');
  }

  var hash  = hashStr(pwd);
  var token = hashStr(correo + pwd + Date.now());
  sh.appendRow([new Date(), nombre, correo, telefono, hash, token, zona, dir, tipo, 'SI']);

  try {
    MailApp.sendEmail(correo, '¡Bienvenido a EcoPollo! 🐔',
      'Hola ' + nombre + ',\n\nTu cuenta fue creada exitosamente.\n' +
      'Ya podés hacer pedidos en línea.\n\nWhatsApp: +506 8888-0000');
  } catch(ex) {}

  return ok({ usuario:{ nombre:nombre, correo:correo, telefono:telefono, zona:zona, direccion:dir, tipo:tipo, token:token } });
}

function loginUsuario(p) {
  var correo = (p.correo  || '').toLowerCase().trim();
  var pwd    = p.password || '';
  if (!correo || !pwd) return err('Faltan credenciales');

  var sh   = getSheet('Usuarios');
  var rows = sh.getDataRange().getValues();
  var hash = hashStr(pwd);
  for (var i = 1; i < rows.length; i++) {
    if ((rows[i][2]||'').toLowerCase() === correo && rows[i][4] === hash && rows[i][9] !== 'NO') {
      return ok({ usuario:{
        nombre:    rows[i][1],
        correo:    rows[i][2],
        telefono:  rows[i][3],
        zona:      rows[i][6],
        direccion: rows[i][7],
        tipo:      rows[i][8],
        token:     rows[i][5]
      }});
    }
  }
  return err('Correo o contraseña incorrectos');
}

// ── PEDIDOS ───────────────────────────────────────────────────────────────────
function guardarPedido(d) {
  var sh = getSheet('Pedidos');
  var id = uid();
  sh.appendRow([
    new Date(),
    d.nombre    || '',
    (d.correo   || '').toLowerCase(),
    d.telefono  || '',
    d.productos || '',
    d.total     || 0,
    d.zona      || '',
    d.direccion || '',
    'En proceso',
    d.fuente    || 'web',
    id
  ]);
  return ok({ id: id });
}

function updateEstado(d) {
  if (d.adminToken !== ADMIN_TOKEN) return err('No autorizado');
  var sh   = getSheet('Pedidos');
  var rows = sh.getDataRange().getValues();
  for (var i = rows.length - 1; i >= 1; i--) {
    if (rows[i][10] === d.id) {
      sh.getRange(i+1, 9).setValue(d.estado || 'En proceso');
      if (d.notas) sh.getRange(i+1, 10).setValue('fuente:web | '+d.notas);
      return ok({});
    }
  }
  return err('Pedido no encontrado');
}

// ── HISTORIAL USUARIO ─────────────────────────────────────────────────────────
function getHistorial(p) {
  var correo = (p.correo || '').toLowerCase().trim();
  if (!correo) return err('Correo requerido');

  var sh     = getSheet('Pedidos');
  var rows   = sh.getDataRange().getValues();
  var result = [];
  for (var i = 1; i < rows.length; i++) {
    if ((rows[i][2]||'').toLowerCase() === correo) {
      result.push({
        id:         rows[i][10] || '',
        fecha:      rows[i][0]  ? rows[i][0].toString() : '',
        productos:  rows[i][4]  || '',
        total:      rows[i][5]  || 0,
        zona:       rows[i][6]  || '',
        direccion:  rows[i][7]  || '',
        estado:     rows[i][8]  || 'En proceso'
      });
    }
  }
  result.sort(function(a,b){ return new Date(b.fecha) - new Date(a.fecha); });
  return ok({ pedidos: result });
}

// ── ADMIN ─────────────────────────────────────────────────────────────────────
function adminPedidos(p) {
  if (p.adminToken !== ADMIN_TOKEN) return err('No autorizado');
  var sh   = getSheet('Pedidos');
  var rows = sh.getDataRange().getValues();
  var res  = [];
  for (var i = 1; i < rows.length; i++) {
    res.push({
      id:        rows[i][10] || '',
      fecha:     rows[i][0]  ? rows[i][0].toString() : '',
      nombre:    rows[i][1]  || '',
      correo:    rows[i][2]  || '',
      telefono:  rows[i][3]  || '',
      productos: rows[i][4]  || '',
      total:     rows[i][5]  || 0,
      zona:      rows[i][6]  || '',
      direccion: rows[i][7]  || '',
      estado:    rows[i][8]  || 'En proceso',
      fuente:    rows[i][9]  || ''
    });
  }
  res.sort(function(a,b){ return new Date(b.fecha) - new Date(a.fecha); });
  return ok({ pedidos: res });
}

function adminUsuarios(p) {
  if (p.adminToken !== ADMIN_TOKEN) return err('No autorizado');
  var sh   = getSheet('Usuarios');
  var rows = sh.getDataRange().getValues();
  var res  = [];
  for (var i = 1; i < rows.length; i++) {
    res.push({
      fecha:     rows[i][0] ? rows[i][0].toString() : '',
      nombre:    rows[i][1] || '',
      correo:    rows[i][2] || '',
      telefono:  rows[i][3] || '',
      zona:      rows[i][6] || '',
      direccion: rows[i][7] || '',
      tipo:      rows[i][8] || '',
      activo:    rows[i][9] || 'SI'
    });
  }
  return ok({ usuarios: res });
}

function getStats(p) {
  if (p.adminToken !== ADMIN_TOKEN) return err('No autorizado');
  var shP = getSheet('Pedidos');
  var shU = getSheet('Usuarios');
  var rP  = shP.getDataRange().getValues();
  var rU  = shU.getDataRange().getValues();

  var totalPedidos = rP.length - 1;
  var totalUsers   = rU.length - 1;
  var totalRevenue = 0;
  var pendientes   = 0;

  for (var i = 1; i < rP.length; i++) {
    totalRevenue += parseFloat(rP[i][5]) || 0;
    if ((rP[i][8]||'') === 'En proceso') pendientes++;
  }

  return ok({ totalPedidos:totalPedidos, totalUsers:totalUsers, totalRevenue:totalRevenue, pendientes:pendientes });
}

function updateUsuario(d) {
  if (d.adminToken !== ADMIN_TOKEN) return err('No autorizado');
  var sh   = getSheet('Usuarios');
  var rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if ((rows[i][2]||'').toLowerCase() === (d.correo||'').toLowerCase()) {
      if (d.activo !== undefined) sh.getRange(i+1, 10).setValue(d.activo ? 'SI' : 'NO');
      return ok({});
    }
  }
  return err('Usuario no encontrado');
}
