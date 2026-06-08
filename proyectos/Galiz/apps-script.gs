// Galiz CR — Google Apps Script Backend
// Implementar como: Aplicación web → Cualquiera → Ejecutar como: Yo

const SHEET_ID = '1Xtb2o4Ww8gP16M4BpmOhZP1AeoPvkrxEU46jdbyt72w';

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

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
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
  sh.autoResizeColumns(1, 15);
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
