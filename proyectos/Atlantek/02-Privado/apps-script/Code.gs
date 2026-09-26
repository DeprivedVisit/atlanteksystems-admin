/**
 * Atlantek · Gestión de Clientes y Facturación — backend Google Sheets
 * Apps Script Web App.
 *
 * Hojas que crea/usa en el spreadsheet vinculado:
 *   - Clientes    (una fila por cliente)
 *   - Documentos  (una fila por proforma/factura, items en JSON)
 *   - Config      (nextNumber)
 *
 * API:
 *   GET  ?action=load&token=TOKEN_ADMIN        → estado completo (JSON)
 *   POST body JSON {token, action:'save', data} → solo TOKEN_ADMIN
 *   POST body JSON {token, action:'lead', lead} → solo TOKEN_PUBLICO
 *
 * SEGURIDAD (2026-09-15):
 *   - TOKEN_PUBLICO: solo permite escribir leads y usuarios desde el sitio público.
 *   - TOKEN_ADMIN:   permite load / save / lead-status (datos de clientes y facturación).
 *   - Ningún token vive en el repositorio público / sitio publico — el Code.gs
 *     se deploya solo desde Google (copiar a 02-Privado/apps-script/ si se re-deploya).
 *
 * Deploy: Implementar → Nueva implementación → App web
 *   Ejecutar como: yo · Acceso: cualquier persona
 *   Pegar la URL /exec en assets/js/config.js (site público, token público)
 *   y en 02-Privado/panel-admin/assets/js/config.js (panel admin, token admin).
 */

var TOKEN_PUBLICO = 'atlantek-pub-cs0v95l7ae'; // solo acción 'lead' y 'user'
var TOKEN_ADMIN   = 'atlantek-adm-vemsw0y4ugh5r691'; // load / save / lead-status

/* ══════════ NOTIFICACIONES AL CEO ══════════
   Daniel Pérez Jiménez — dueño de la web.
   · EMAIL: llega por MailApp (cuota gratis: ~100 correos/día).
   · CEL (WhatsApp): vía CallMeBot. Activación única desde el celular
     de Daniel: agregar +34 644 44 21 48 a contactos y enviarle por
     WhatsApp "I allow callmebot to send me messages" → responde con
     el apikey → pegarlo en CALLMEBOT_KEY. Si queda vacío, solo email. */
var NOTIFY = {
  NOMBRE: 'Daniel Pérez Jiménez',
  EMAIL: 'soporte@atlanteksystems.com',
  CEL: '50672312225',
  CALLMEBOT_KEY: ''
};

function notify_(asunto, lineas) {
  var texto = lineas.join('\n');
  try {
    MailApp.sendEmail({
      to: NOTIFY.EMAIL,
      subject: asunto,
      body: 'Hola ' + NOTIFY.NOMBRE.split(' ')[0] + ',\n\n' + texto +
            '\n\n— Notificación automática del sitio Atlantek'
    });
  } catch (e) { /* sin cuota o mail inválido: no romper el guardado */ }

  if (NOTIFY.CALLMEBOT_KEY) {
    try {
      UrlFetchApp.fetch(
        'https://api.callmebot.com/whatsapp.php' +
        '?phone=' + encodeURIComponent(NOTIFY.CEL) +
        '&apikey=' + encodeURIComponent(NOTIFY.CALLMEBOT_KEY) +
        '&text=' + encodeURIComponent(asunto + '\n' + texto),
        { muteHttpExceptions: true }
      );
    } catch (e) { /* idem */ }
  }
}

function waLink_(tel) {
  var d = String(tel || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.length === 8) d = '506' + d;
  return 'https://wa.me/' + d;
}

var SHEET_CLIENTES = 'Clientes';
var SHEET_DOCS = 'Documentos';
var SHEET_CONFIG = 'Config';

var SHEET_LEADS = 'Leads';
var SHEET_USERS = 'Usuarios';

var HEAD_CLIENTES = ['id', 'nombre', 'contacto', 'telefono', 'email', 'direccion', 'pais'];
var HEAD_DOCS = ['id', 'numero', 'tipo', 'clientId', 'cliente', 'fechaEmision', 'fechaEntrega', 'estado', 'total', 'itemsJson', 'notas'];
var HEAD_LEADS = ['id', 'fecha', 'nombre', 'telefono', 'distrito', 'tipo', 'servicio', 'mensaje', 'estado'];
var HEAD_USERS = ['id', 'fecha', 'nombre', 'telefono', 'email'];

/* Fecha de celda (Date o texto) → 'yyyy-MM-dd' para que el panel
   no reciba el formato largo de Date de Sheets */
function isoDate_(v) {
  if (v && typeof v.getTime === 'function') {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(v || '').slice(0, 10);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function sheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#37424C').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
  }
  return sh;
}

/* ══════════ GET → load ══════════ */

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.token !== TOKEN_ADMIN) return json_({ ok: false, error: 'token inválido' });
  if (p.action !== 'load') return json_({ ok: false, error: 'acción desconocida' });

  var shC = sheet_(SHEET_CLIENTES, HEAD_CLIENTES);
  var shD = sheet_(SHEET_DOCS, HEAD_DOCS);
  var shF = sheet_(SHEET_CONFIG, ['clave', 'valor']);

  var clients = [];
  var rowsC = shC.getDataRange().getValues();
  for (var i = 1; i < rowsC.length; i++) {
    var r = rowsC[i];
    if (!r[0]) continue;
    clients.push({
      id: String(r[0]), nombre: String(r[1]), contacto: String(r[2]),
      telefono: String(r[3]), email: String(r[4]),
      direccion: String(r[5]), pais: String(r[6])
    });
  }

  var docs = [];
  var rowsD = shD.getDataRange().getValues();
  for (var j = 1; j < rowsD.length; j++) {
    var d = rowsD[j];
    if (!d[0]) continue;
    var items = [];
    try { items = JSON.parse(d[9] || '[]'); } catch (err) {}
    docs.push({
      id: String(d[0]), numero: Number(d[1]), tipo: String(d[2]),
      clientId: String(d[3]),
      fechaEmision: isoDate_(d[5]), fechaEntrega: isoDate_(d[6]),
      estado: String(d[7]), items: items, notas: String(d[10])
    });
  }

  var nextNumber = 28;
  var rowsF = shF.getDataRange().getValues();
  for (var k = 1; k < rowsF.length; k++) {
    if (rowsF[k][0] === 'nextNumber') nextNumber = Number(rowsF[k][1]) || 28;
  }

  var shL = sheet_(SHEET_LEADS, HEAD_LEADS);
  var leads = [];
  var rowsL = shL.getDataRange().getValues();
  for (var m = 1; m < rowsL.length; m++) {
    var L = rowsL[m];
    if (!L[0]) continue;
    leads.push({
      id: String(L[0]), fecha: String(L[1]), nombre: String(L[2]),
      telefono: String(L[3]), distrito: String(L[4]), tipo: String(L[5]),
      servicio: String(L[6]), mensaje: String(L[7]), estado: String(L[8])
    });
  }

  return json_({ ok: true, data: { clients: clients, docs: docs, nextNumber: nextNumber, leads: leads } });
}

/* ══════════ POST → save (sobrescribe todo el estado) ══════════ */

function doPost(e) {
  var body;
  try { body = JSON.parse(e.postData.contents); }
  catch (err) { return json_({ ok: false, error: 'JSON inválido' }); }

  /* ──── ACCIONES PÚBLICAS (TOKEN_PUBLICO) ──── */

  /* Lead del formulario público del sitio → append a hoja Leads */
  if (body.action === 'lead' && body.lead) {
    if (body.token !== TOKEN_PUBLICO) return json_({ ok: false, error: 'token inválido' });
    var l = body.lead;
    if (!String(l.nombre || '').trim() || !String(l.telefono || '').trim()) {
      return json_({ ok: false, error: 'nombre y teléfono requeridos' });
    }
    var shLead = sheet_(SHEET_LEADS, HEAD_LEADS);
    shLead.appendRow([
      'l' + Date.now().toString(36),
      new Date().toISOString(),
      String(l.nombre).slice(0, 120),
      String(l.telefono).slice(0, 40),
      String(l.distrito || '').slice(0, 60),
      String(l.tipo || '').slice(0, 60),
      String(l.servicio || '').slice(0, 80),
      String(l.mensaje || '').slice(0, 500),
      'nuevo'
    ]);

    notify_('🔔 Nuevo lead del sitio — ' + String(l.nombre).slice(0, 60), [
      'Nombre:    ' + l.nombre,
      'Teléfono:  ' + l.telefono + (waLink_(l.telefono) ? '  →  ' + waLink_(l.telefono) : ''),
      'Distrito:  ' + (l.distrito || '—'),
      'Propiedad: ' + (l.tipo || '—'),
      'Servicio:  ' + (l.servicio || '—'),
      'Mensaje:   ' + (l.mensaje || '—')
    ]);

    return json_({ ok: true });
  }

  /* Usuario creado desde el gate de entrada → append a hoja Usuarios */
  if (body.action === 'user' && body.user) {
    if (body.token !== TOKEN_PUBLICO) return json_({ ok: false, error: 'token inválido' });
    var u = body.user;
    if (!String(u.nombre || '').trim() || !String(u.telefono || '').trim()) {
      return json_({ ok: false, error: 'nombre y teléfono requeridos' });
    }
    var shU = sheet_(SHEET_USERS, HEAD_USERS);
    shU.appendRow([
      'u' + Date.now().toString(36),
      new Date().toISOString(),
      String(u.nombre).slice(0, 120),
      String(u.telefono).slice(0, 40),
      String(u.email || '').slice(0, 120)
    ]);

    notify_('👤 Usuario nuevo en el sitio — ' + String(u.nombre).slice(0, 60), [
      'Nombre:   ' + u.nombre,
      'Teléfono: ' + u.telefono + (waLink_(u.telefono) ? '  →  ' + waLink_(u.telefono) : ''),
      'Correo:   ' + (u.email || '—')
    ]);

    return json_({ ok: true });
  }

  /* ──── ACCIONES ADMIN (TOKEN_ADMIN) ──── */
  if (body.token !== TOKEN_ADMIN) return json_({ ok: false, error: 'token inválido' });

  /* Cambio de estado de un lead desde el panel admin.
     Solo toca la columna estado de la fila del lead — nunca borra ni
     sobreescribe la hoja Leads (los leads no viajan en action:'save'). */
  if (body.action === 'lead-status') {
    var ESTADOS_LEAD = ['nuevo', 'contactado', 'cotizado', 'ganado', 'perdido'];
    if (ESTADOS_LEAD.indexOf(body.estado) < 0) return json_({ ok: false, error: 'estado inválido' });
    if (!body.id) return json_({ ok: false, error: 'id requerido' });

    var shLs = sheet_(SHEET_LEADS, HEAD_LEADS);
    var rows = shLs.getDataRange().getValues();
    for (var li = 1; li < rows.length; li++) {
      if (String(rows[li][0]) === String(body.id)) {
        shLs.getRange(li + 1, 9).setValue(body.estado); // col 9 = estado
        return json_({ ok: true });
      }
    }
    return json_({ ok: false, error: 'lead no encontrado' });
  }

  /* Enviar documento por email */
  if (body.action === 'send-doc-email') {
    if (!body.docId) return json_({ ok: false, error: 'docId requerido' });
    if (!body.clientEmail) return json_({ ok: false, error: 'clientEmail requerido' });

    var shD = sheet_(SHEET_DOCS, HEAD_DOCS);
    var rowsD = shD.getDataRange().getValues();
    var doc = null;
    for (var j = 1; j < rowsD.length; j++) {
      var d = rowsD[j];
      if (!d[0]) continue;
      if (String(d[0]) === String(body.docId)) {
        var items = [];
        try { items = JSON.parse(d[9] || '[]'); } catch (err) {}
        doc = {
          id: String(d[0]), numero: Number(d[1]), tipo: String(d[2]),
          clientId: String(d[3]),
          fechaEmision: isoDate_(d[5]), fechaEntrega: isoDate_(d[6]),
          estado: String(d[7]), items: items, notas: String(d[10])
        };
        break;
      }
    }
    if (!doc) return json_({ ok: false, error: 'documento no encontrado' });

    var shC = sheet_(SHEET_CLIENTES, HEAD_CLIENTES);
    var rowsC = shC.getDataRange().getValues();
    var client = null;
    for (var i = 1; i < rowsC.length; i++) {
      var r = rowsC[i];
      if (!r[0]) continue;
      if (String(r[0]) === String(doc.clientId)) {
        client = {
          id: String(r[0]), nombre: String(r[1]), contacto: String(r[2]),
          telefono: String(r[3]), email: String(r[4]),
          direccion: String(r[5]), pais: String(r[6])
        };
        break;
      }
    }

    var empresaNombre = 'Atlantek';
    var empresaEmail = 'soporte@atlanteksystems.com';
    var empresaTel = '7231-2225';

    var total = doc.items.reduce(function(s, it) {
      return s + (Number(it.qty) || 0) * (Number(it.precio) || 0);
    }, 0);

    var tipoLabel = doc.tipo === 'factura' ? 'Factura' : 'Proforma';
    var asunto = '[' + empresaNombre + '] ' + tipoLabel + ' Nº ' + String(doc.numero).padStart(3, '0');

    var htmlBody = 
      '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">' +
      '  <div style="background:#0a1628;color:#fff;padding:20px;border-radius:8px 8px 0 0;">' +
      '    <h1 style="margin:0;font-size:24px;">' + empresaNombre + '</h1>' +
      '    <p style="margin:5px 0 0;color:#8E9AA4;">Seguridad · CCTV · Redes</p>' +
      '  </div>' +
      '  <div style="background:#122338;color:#E9EDF0;padding:20px;border:1px solid #1a6aff;border-top:none;">' +
      '    <h2 style="margin-top:0;">' + tipoLabel + ' Nº ' + String(doc.numero).padStart(3, '0') + '</h2>' +
      '    <p><strong>Fecha emisión:</strong> ' + doc.fechaEmision + '</p>' +
      '    <p><strong>Fecha entrega:</strong> ' + doc.fechaEntrega + '</p>' +
      '    <p><strong>Estado:</strong> <span style="color:' + (doc.estado === 'pagada' ? '#10b981' : doc.estado === 'enviada' ? '#f59e0b' : '#64748b') + ';">' + doc.estado + '</span></p>' +
      '  </div>' +
      '  <div style="background:#fff;padding:20px;border:1px solid #e2e8f0;border-top:none;">' +
      '    <p>Estimado/a ' + (client?.contacto || client?.nombre || 'cliente') + ',</p>' +
      '    <p>Le compartimos el detalle de su ' + tipoLabel.toLowerCase() + '.</p>' +
      '    <table style="width:100%;border-collapse:collapse;margin:16px 0;">' +
      '      <thead><tr style="background:#f1f5f9;">' +
      '        <th style="padding:8px;text-align:left;border:1px solid #e2e8f0;">Descripción</th>' +
      '        <th style="padding:8px;text-align:right;border:1px solid #e2e8f0;">Cant.</th>' +
      '        <th style="padding:8px;text-align:right;border:1px solid #e2e8f0;">Precio (₡)</th>' +
      '        <th style="padding:8px;text-align:right;border:1px solid #e2e8f0;">Monto (₡)</th>' +
      '      </tr></thead>' +
      '      <tbody>' +
      doc.items.map(function(it) {
        return '<tr>' +
          '<td style="padding:8px;border:1px solid #e2e8f0;">' + (it.desc || '') + '</td>' +
          '<td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">' + (Number(it.qty) || 0) + '</td>' +
          '<td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">₡' + (Number(it.precio) || 0).toLocaleString('es-CR') + '</td>' +
          '<td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">₡' + ((Number(it.qty) || 0) * (Number(it.precio) || 0)).toLocaleString('es-CR') + '</td>' +
        '</tr>';
      }).join('') +
      '      </tbody>' +
      '    </table>' +
      '    <div style="text-align:right;font-size:18px;font-weight:bold;color:#1a6aff;">' +
      '      Total: ₡' + total.toLocaleString('es-CR') +
      '    </div>' +
      '    <p style="color:#64748b;font-size:14px;">' + (doc.notas || 'Garantía: Equipos con 12 meses de garantía...') + '</p>' +
      '  </div>' +
      '  <div style="background:#0a1628;color:#8E9AA4;padding:16px;border-radius:0 0 8px 8px;text-align:center;font-size:13px;">' +
      '    ' + empresaNombre + ' · ' + empresaEmail + ' · ' + empresaTel + '<br>' +
      '    70201 Guápiles · Costa Rica' +
      '  </div>' +
      '</div>';

    var textBody = 
      empresaNombre + ' — ' + tipoLabel + ' Nº ' + String(doc.numero).padStart(3, '0') + '\n\n' +
      'Fecha emisión: ' + doc.fechaEmision + '\n' +
      'Fecha entrega: ' + doc.fechaEntrega + '\n' +
      'Estado: ' + doc.estado + '\n\n' +
      'Cliente: ' + (client?.nombre || '—') + '\n' +
      (client?.direccion ? 'Dirección: ' + client.direccion + '\n' : '') +
      '\n' +
      'Detalle:\n' +
      doc.items.map(function(it) {
        return '  - ' + (it.desc || '') + ' x' + (Number(it.qty) || 0) + ' @ ₡' + (Number(it.precio) || 0).toLocaleString('es-CR') + ' = ₡' + ((Number(it.qty) || 0) * (Number(it.precio) || 0)).toLocaleString('es-CR');
      }).join('\n') +
      '\n\nTotal: ₡' + total.toLocaleString('es-CR') + '\n\n' +
      (doc.notas || 'Garantía: Equipos con 12 meses de garantía...') + '\n\n' +
      empresaNombre + ' · ' + empresaEmail + ' · ' + empresaTel;

    try {
      MailApp.sendEmail({
        to: body.clientEmail,
        subject: asunto,
        htmlBody: htmlBody,
        body: textBody
      });
      return json_({ ok: true, message: 'Email enviado a ' + body.clientEmail });
    } catch (e) {
      return json_({ ok: false, error: 'Error al enviar email: ' + e.toString() });
    }
  }

  if (body.action !== 'save' || !body.data) return json_({ ok: false, error: 'acción desconocida' });

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var data = body.data;

    var shC = sheet_(SHEET_CLIENTES, HEAD_CLIENTES);
    clear_(shC);
    var byId = {};
    (data.clients || []).forEach(function (c) {
      byId[c.id] = c.nombre;
      shC.appendRow([c.id, c.nombre, c.contacto, c.telefono, c.email, c.direccion, c.pais]);
    });

    var shD = sheet_(SHEET_DOCS, HEAD_DOCS);
    clear_(shD);
    (data.docs || []).forEach(function (d) {
      var total = (d.items || []).reduce(function (s, it) {
        return s + (Number(it.qty) || 0) * (Number(it.precio) || 0);
      }, 0);
      shD.appendRow([
        d.id, d.numero, d.tipo, d.clientId, byId[d.clientId] || '',
        d.fechaEmision, d.fechaEntrega, d.estado, total,
        JSON.stringify(d.items || []), d.notas
      ]);
    });

    var shF = sheet_(SHEET_CONFIG, ['clave', 'valor']);
    clear_(shF);
    shF.appendRow(['nextNumber', data.nextNumber || 28]);
    shF.appendRow(['ultimaSync', new Date().toISOString()]);

    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function clear_(sh) {
  var last = sh.getLastRow();
  if (last > 1) sh.getRange(2, 1, last - 1, sh.getLastColumn()).clearContent();
}
