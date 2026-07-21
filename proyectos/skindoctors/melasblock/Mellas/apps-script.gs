// Melasblock BB Cream — Google Apps Script Backend
// Implementar como: Aplicación web → Cualquiera → Ejecutar como: Yo
//
// Esto reemplaza el webhook de N8N (apexcloudworkscompany.app.n8n.cloud). Si ya
// tenés un script deployado en el SHEETS_URL que usa index.html, pegá este código
// completo ahí (mismo Sheet ID que ya tengas) y volvé a hacer "Implementar" →
// "Nueva implementación" manteniendo la misma URL. Después de confirmar con un
// lead real que llega el email, borrá el bloque N8N_WEBHOOK de assets/js/script.js.

const SHEET_ID = 'PEGÁ_TU_SHEET_ID_AQUI';

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
      .setBackground('#c8954a').setFontColor('#ffffff').setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function doGet(e) {
  const action = (e && e.parameter) ? e.parameter.action : '';
  let result;
  try {
    if (action === 'getLeads') result = getLeads();
    else result = { ok: true, message: 'Melasblock API activa' };
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
    addLead(body);
    return ContentService.createTextOutput('OK');
  } catch (err) {
    return ContentService.createTextOutput('Error: ' + err.message);
  }
}

/* ══ Leads ══ */

function getLeads() {
  const sh = getOrCreate('Leads', ['Fecha', 'Nombre', 'Teléfono', 'Email', 'Tono', 'Provincia', 'Contexto', 'Fuente']);
  const data = sh.getDataRange().getValues();
  if (data.length <= 1) return [];
  const h = data[0];
  return data.slice(1).map(row => {
    const o = {};
    h.forEach((k, i) => o[k] = row[i]);
    return o;
  });
}

function addLead(d) {
  const sh = getOrCreate('Leads', ['Fecha', 'Nombre', 'Teléfono', 'Email', 'Tono', 'Provincia', 'Contexto', 'Fuente']);
  sh.appendRow([
    new Date().toLocaleString('es-CR'),
    d.nombre    || '',
    d.telefono  || '',
    d.email     || '',
    d.tono      || 'No especificado',
    d.zona      || '',
    d.contexto  || '',
    'Melasblock Landing'
  ]);
  notifyLead(d);
}

// Reemplaza el nodo Gmail de N8N — mismo contenido, sin costo mensual.
function notifyLead(d) {
  const cuerpo = 'Nuevo lead de Melasblock BB Cream:\n\n'
    + 'Nombre: '    + (d.nombre   || '—') + '\n'
    + 'Teléfono: '  + (d.telefono || '—') + '\n'
    + 'Email: '     + (d.email    || '—') + '\n'
    + 'Tono: '      + (d.tono     || '—') + '\n'
    + 'Provincia: ' + (d.zona     || '—') + '\n'
    + 'Contexto: '  + (d.contexto || '—');
  MailApp.sendEmail('apexcloudworkscompany@gmail.com', 'Nuevo lead — Melasblock', cuerpo);

  if (d.email) {
    MailApp.sendEmail(
      d.email,
      '¡Gracias por tu interés en Melasblock!',
      'Hola ' + (d.nombre || '') + ',\n\n'
      + 'Recibimos tu consulta sobre Melasblock BB Cream. Muy pronto te contactamos por WhatsApp o correo.\n\n'
      + 'Skindoctors CR'
    );
  }
}
