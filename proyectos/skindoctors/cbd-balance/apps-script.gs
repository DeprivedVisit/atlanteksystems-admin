// CBD Oil Balance — Google Apps Script Backend
// Implementar como: Aplicación web → Cualquiera → Ejecutar como: Yo

const SHEET_ID = '1mNEzqy17t41N3SvRlNqvQOKqilOH_8PUzXFi0fUeaAI';

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
      .setBackground('#1b7343').setFontColor('#ffffff').setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function doGet(e) {
  const action = (e && e.parameter) ? e.parameter.action : '';
  let result;
  try {
    if (action === 'getLeads') result = getLeads();
    else result = { ok: true, message: 'CBD Oil Balance API activa' };
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
  const sh = getOrCreate('Leads', ['Fecha', 'Nombre', 'Teléfono', 'Email', 'Tipo de Piel', 'Provincia', 'Contexto', 'Fuente']);
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
  const sh = getOrCreate('Leads', ['Fecha', 'Nombre', 'Teléfono', 'Email', 'Tipo de Piel', 'Provincia', 'Contexto', 'Fuente']);
  sh.appendRow([
    new Date().toLocaleString('es-CR'),
    d.nombre    || '',
    d.telefono  || '',
    d.email     || '',
    d.piel      || 'No especificado',
    d.zona      || '',
    d.contexto  || '',
    'CBD Balance Landing'
  ]);
  notifyLead(d);
}

// Reemplaza el nodo Gmail de N8N — mismo contenido, sin costo mensual.
function notifyLead(d) {
  const cuerpo = 'Nuevo lead de CBD Oil Balance:\n\n'
    + 'Nombre: '    + (d.nombre   || '—') + '\n'
    + 'Teléfono: '  + (d.telefono || '—') + '\n'
    + 'Email: '     + (d.email    || '—') + '\n'
    + 'Piel: '      + (d.piel     || '—') + '\n'
    + 'Provincia: ' + (d.zona     || '—') + '\n'
    + 'Contexto: '  + (d.contexto || '—');
  MailApp.sendEmail('apexcloudworkscompany@gmail.com', 'Nuevo lead — CBD Oil Balance', cuerpo);

  if (d.email) {
    MailApp.sendEmail(
      d.email,
      '¡Gracias por tu interés en CBD Oil Balance!',
      'Hola ' + (d.nombre || '') + ',\n\n'
      + 'Recibimos tu consulta sobre CBD Oil Balance. Muy pronto te contactamos por WhatsApp o correo.\n\n'
      + 'Skindoctors CR'
    );
  }
}
