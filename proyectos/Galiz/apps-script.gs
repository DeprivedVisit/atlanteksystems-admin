// Galiz CR — Google Apps Script Backend
// Implementar como: Aplicación web → Cualquiera → Ejecutar como: Yo
// ⚙️ Configuración del proyecto → Propiedades del script → agregar GALIZ_TOKEN
// con la contraseña real del panel de admin (nunca vive en el código).

const SHEET_ID = '1Xtb2o4Ww8gP16M4BpmOhZP1AeoPvkrxEU46jdbyt72w';
const GALIZ_TOKEN = PropertiesService.getScriptProperties().getProperty('GALIZ_TOKEN');

function requireAdmin(token) {
  if (!GALIZ_TOKEN || token !== GALIZ_TOKEN) {
    throw new Error('No autorizado');
  }
}

function getDB() {
  return SpreadsheetApp.openById(SHEET_ID);
}

function getOrCreate(name, headers) {
  const db = getDB();
  let sh = db.getSheetByName(name);
  if (!sh) {
    sh = db.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.getRange(1, 1, 1, headers.length)
      .setBackground('#C9A84C').setFontColor('#ffffff').setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function doGet(e) {
  const action = (e && e.parameter) ? e.parameter.action : '';
  let result;
  try {
    if      (action === 'getBookings') result = getBookings();
    else if (action === 'getClients')  result = getClients();
    else if (action === 'getBlocked')  result = getBlocked();
    else result = { ok: true, message: 'Galiz API activa' };
  } catch (err) {
    result = { error: err.message };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// Acciones administrativas — cambian/cancelan citas ya confirmadas o bloquean
// disponibilidad. addBooking y upsertClient quedan abiertas porque son parte
// del flujo público de reserva (cualquier visitante debe poder agendar).
const ADMIN_ACTIONS = ['cancelBooking', 'completeBooking', 'updateClientNote', 'blockDate', 'unblockDate', 'blockSlot', 'unblockSlot'];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    if (action === 'checkAdminToken') { requireAdmin(body.token); return ContentService.createTextOutput('OK'); }
    if (ADMIN_ACTIONS.indexOf(action) !== -1) requireAdmin(body.token);

    if      (action === 'addBooking')       addBooking(body.booking);
    else if (action === 'cancelBooking')    updateStatus(body.id, 'cancelada');
    else if (action === 'completeBooking')  updateStatus(body.id, 'completada');
    else if (action === 'upsertClient')     upsertClient(body.client);
    else if (action === 'updateClientNote') updateClientNote(body.phone, body.note);
    else if (action === 'blockDate')        blockDate(body.date);
    else if (action === 'unblockDate')      unblockDate(body.date);
    else if (action === 'blockSlot')        blockSlot(body.date, body.slot);
    else if (action === 'unblockSlot')      unblockSlot(body.date, body.slot);
    return ContentService.createTextOutput('OK');
  } catch (err) {
    return ContentService.createTextOutput('Error: ' + err.message);
  }
}

/* ══ Bookings ══ */

function getBookings() {
  const sh = getOrCreate('Citas', ['ID','Fecha','Hora','SlotMinutos','Servicio','Categoría','Duración(min)','Precio','Nombre','WhatsApp','Domicilio','Dirección','Notas','Estado','Creado']);
  const data = sh.getDataRange().getValues();
  if (data.length <= 1) return [];
  const h = data[0];
  return data.slice(1).map(row => {
    const o = {};
    h.forEach((k, i) => o[k] = row[i]);
    return {
      id: o['ID'], date: o['Fecha'], time: o['Hora'],
      slotMinutes: Number(o['SlotMinutos']),
      service: o['Servicio'], category: o['Categoría'],
      durationMinutes: Number(o['Duración(min)']), price: o['Precio'],
      name: o['Nombre'], phone: o['WhatsApp'],
      domicilio: o['Domicilio'] === 'Sí', address: o['Dirección'],
      notes: o['Notas'], status: o['Estado'], createdAt: o['Creado'],
    };
  });
}

function addBooking(b) {
  const sh = getOrCreate('Citas', ['ID','Fecha','Hora','SlotMinutos','Servicio','Categoría','Duración(min)','Precio','Nombre','WhatsApp','Domicilio','Dirección','Notas','Estado','Creado']);
  sh.appendRow([
    b.id, b.date, b.time, b.slotMinutes, b.service, b.category,
    b.durationMinutes, b.price, b.name, b.phone,
    b.domicilio ? 'Sí' : 'No', b.address || '', b.notes || '',
    'confirmada', b.createdAt
  ]);
  notifyNewBooking(b);
}

// Reemplaza el nodo Gmail de N8N que notificaba al instante — ya no hay que
// esperar a que N8N esté "vigilando" la Sheet, se manda apenas se guarda la cita.
function notifyNewBooking(b) {
  const html = '<div style="font-family:Arial,sans-serif;max-width:540px">'
    + '<h2 style="color:#C9A84C;margin-bottom:4px">💛 Nueva cita agendada</h2>'
    + '<table style="border-collapse:collapse;width:100%;margin:16px 0">'
    + '<tr><td style="padding:9px 12px;border:1px solid #eee;background:#f9f9f9;font-weight:bold;width:120px">Clienta</td><td style="padding:9px 12px;border:1px solid #eee">' + b.name + '</td></tr>'
    + '<tr><td style="padding:9px 12px;border:1px solid #eee;background:#f9f9f9;font-weight:bold">WhatsApp</td><td style="padding:9px 12px;border:1px solid #eee">' + b.phone + '</td></tr>'
    + '<tr><td style="padding:9px 12px;border:1px solid #eee;background:#f9f9f9;font-weight:bold">Fecha</td><td style="padding:9px 12px;border:1px solid #eee">' + b.date + '</td></tr>'
    + '<tr><td style="padding:9px 12px;border:1px solid #eee;background:#f9f9f9;font-weight:bold">Hora</td><td style="padding:9px 12px;border:1px solid #eee">' + b.time + '</td></tr>'
    + '<tr><td style="padding:9px 12px;border:1px solid #eee;background:#f9f9f9;font-weight:bold">Servicio</td><td style="padding:9px 12px;border:1px solid #eee">' + b.service + ' (' + b.durationMinutes + ' min)</td></tr>'
    + '<tr><td style="padding:9px 12px;border:1px solid #eee;background:#f9f9f9;font-weight:bold">Domicilio</td><td style="padding:9px 12px;border:1px solid #eee">' + (b.domicilio ? 'Sí' : 'No') + (b.address ? ' — ' + b.address : '') + '</td></tr>'
    + '</table></div>';
  MailApp.sendEmail({
    to: 'apexcloudworkcompany@gmail.com',
    subject: '💛 Nueva cita — ' + b.name + ' · ' + b.date + ' ' + b.time,
    htmlBody: html,
  });
}

// Reemplaza el nodo Wait de N8N (uno por cita, gastaba una ejecución cada vez).
// Se corre una sola vez por hora vía trigger instalable — ver instalarTriggerRecordatorios().
function enviarRecordatorios() {
  const sh = getDB().getSheetByName('Citas');
  if (!sh) return;
  const headers = ['ID','Fecha','Hora','SlotMinutos','Servicio','Categoría','Duración(min)','Precio','Nombre','WhatsApp','Domicilio','Dirección','Notas','Estado','Creado','RecordatorioEnviado'];
  const curHeaders = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const idxRec = curHeaders.indexOf('RecordatorioEnviado');
  if (idxRec === -1) sh.getRange(1, curHeaders.length + 1).setValue('RecordatorioEnviado');
  const iRec = idxRec === -1 ? curHeaders.length : idxRec; // 0-based

  const data = sh.getDataRange().getValues();
  const ahora = new Date();
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const estado = row[13], fecha = row[1], hora = row[2], yaEnviado = row[iRec];
    if (estado !== 'confirmada' || yaEnviado === 'Sí') continue;
    const horaLimpia = String(hora).replace(' PM', '').replace(' AM', '');
    const fechaHora = new Date(fecha + 'T' + horaLimpia);
    if (isNaN(fechaHora.getTime())) continue;
    const horasFaltantes = (fechaHora - ahora) / (1000 * 60 * 60);
    if (horasFaltantes > 0 && horasFaltantes <= 24) {
      const html = '<div style="font-family:Arial,sans-serif;max-width:540px">'
        + '<h2 style="color:#C9A84C">🔔 Cita mañana</h2>'
        + '<p>Recordatorio automático de cita agendada para mañana.</p>'
        + '<table style="border-collapse:collapse;width:100%;margin:16px 0">'
        + '<tr><td style="padding:9px 12px;border:1px solid #eee;background:#f9f9f9;font-weight:bold;width:120px">Clienta</td><td style="padding:9px 12px;border:1px solid #eee">' + row[8] + '</td></tr>'
        + '<tr><td style="padding:9px 12px;border:1px solid #eee;background:#f9f9f9;font-weight:bold">WhatsApp</td><td style="padding:9px 12px;border:1px solid #eee">' + row[9] + '</td></tr>'
        + '<tr><td style="padding:9px 12px;border:1px solid #eee;background:#f9f9f9;font-weight:bold">Hora</td><td style="padding:9px 12px;border:1px solid #eee">' + hora + '</td></tr>'
        + '<tr><td style="padding:9px 12px;border:1px solid #eee;background:#f9f9f9;font-weight:bold">Servicio</td><td style="padding:9px 12px;border:1px solid #eee">' + row[4] + '</td></tr>'
        + '</table></div>';
      MailApp.sendEmail({
        to: 'apexcloudworkcompany@gmail.com',
        subject: '🔔 Recordatorio — Cita mañana: ' + row[8] + ' a las ' + hora,
        htmlBody: html,
      });
      sh.getRange(i + 1, iRec + 1).setValue('Sí');
    }
  }
}

// Ejecutar UNA SOLA VEZ manualmente desde el editor de Apps Script (▶ Ejecutar)
// para instalar el trigger horario. Después de eso queda corriendo solo.
function instalarTriggerRecordatorios() {
  ScriptApp.getProjectTriggers()
    .filter(function(t){ return t.getHandlerFunction() === 'enviarRecordatorios'; })
    .forEach(function(t){ ScriptApp.deleteTrigger(t); }); // evita duplicados si se corre dos veces
  ScriptApp.newTrigger('enviarRecordatorios').timeBased().everyHours(1).create();
}

function updateStatus(id, status) {
  const sh = getDB().getSheetByName('Citas');
  if (!sh) return;
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) { sh.getRange(i + 1, 14).setValue(status); break; }
  }
}

/* ══ Clients ══ */

function getClients() {
  const sh = getOrCreate('Clientas', ['WhatsApp','Nombre','PrimeraVisita','ÚltimaVisita','Visitas','Servicios','LargoCabello','TieneColor','Notas']);
  const data = sh.getDataRange().getValues();
  if (data.length <= 1) return [];
  return data.slice(1).map(row => ({
    phone: row[0], name: row[1], firstVisit: row[2], lastVisit: row[3],
    visits: Number(row[4]) || 0,
    services: row[5] ? String(row[5]).split('|') : [],
    hairLength: row[6], hasColor: row[7], notes: row[8],
  }));
}

function upsertClient(c) {
  if (!c || !c.phone) return;
  const sh = getOrCreate('Clientas', ['WhatsApp','Nombre','PrimeraVisita','ÚltimaVisita','Visitas','Servicios','LargoCabello','TieneColor','Notas']);
  const data = sh.getDataRange().getValues();
  const clean = p => String(p).replace(/\D/g, '');
  for (let i = 1; i < data.length; i++) {
    if (clean(data[i][0]) === clean(c.phone)) {
      sh.getRange(i + 1, 2, 1, 8).setValues([[
        c.name, data[i][2] || c.firstVisit || '', c.lastVisit || '',
        c.visits || 0, (c.services || []).join('|'),
        c.hairLength || data[i][6] || '',
        c.hasColor   || data[i][7] || '',
        data[i][8] || ''
      ]]);
      return;
    }
  }
  sh.appendRow([
    c.phone, c.name, c.firstVisit || '', c.lastVisit || '',
    c.visits || 0, (c.services || []).join('|'),
    c.hairLength || '', c.hasColor || '', c.notes || ''
  ]);
}

function updateClientNote(phone, note) {
  const sh = getDB().getSheetByName('Clientas');
  if (!sh) return;
  const data = sh.getDataRange().getValues();
  const clean = p => String(p).replace(/\D/g, '');
  for (let i = 1; i < data.length; i++) {
    if (clean(data[i][0]) === clean(phone)) { sh.getRange(i + 1, 9).setValue(note); break; }
  }
}

/* ══ Blocked ══ */

function getBlocked() {
  const sh = getOrCreate('Bloqueos', ['Tipo','Valor']);
  const data = sh.getDataRange().getValues();
  const days = [], slots = [];
  data.slice(1).forEach(row => {
    if (row[0] === 'dia')  days.push(row[1]);
    if (row[0] === 'slot') slots.push(row[1]);
  });
  return { days, slots };
}

function blockDate(date) {
  const sh = getOrCreate('Bloqueos', ['Tipo','Valor']);
  const data = sh.getDataRange().getValues();
  if (data.some(r => r[0] === 'dia' && r[1] === date)) return;
  sh.appendRow(['dia', date]);
}

function unblockDate(date) { removeBlocked('dia', date); }

function blockSlot(date, slot) {
  const sh = getOrCreate('Bloqueos', ['Tipo','Valor']);
  const val = date + '|' + slot;
  const data = sh.getDataRange().getValues();
  if (data.some(r => r[0] === 'slot' && r[1] === val)) return;
  sh.appendRow(['slot', val]);
}

function unblockSlot(date, slot) { removeBlocked('slot', date + '|' + slot); }

function removeBlocked(tipo, valor) {
  const sh = getDB().getSheetByName('Bloqueos');
  if (!sh) return;
  const data = sh.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === tipo && data[i][1] === valor) sh.deleteRow(i + 1);
  }
}
