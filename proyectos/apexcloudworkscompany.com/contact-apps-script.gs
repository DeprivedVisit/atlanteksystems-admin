// ─────────────────────────────────────────────
//  Apex Cloud Works — Contact Form Backend
//  Google Apps Script · Tab: Leads
//
//  SETUP:
//  1. Abrir sheet: drive.google.com → Extensions → Apps Script
//  2. Pegar este código
//  3. Deploy → New deployment → Web app → Anyone
//  4. Copiar la URL generada
//  5. Pegarla en script.js → CONTACT_AS_URL
// ─────────────────────────────────────────────

var SPREADSHEET_ID = '1d4dVBf8Cb5m8sG72YWrEAUmpuBb7kxhYmrscHDh5cP0';

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function initLeadsSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('Leads_Web');
  if (!sheet) {
    sheet = ss.insertSheet('Leads_Web');
    sheet.appendRow(['Fecha', 'Nombre', 'Contacto', 'Servicio', 'Mensaje', 'Fuente']);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
  }
  return sheet;
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = initLeadsSheet();
    var fecha = new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' });
    sheet.appendRow([
      fecha,
      data.nombre   || '',
      data.contacto || '',
      data.servicio || '',
      data.mensaje  || '',
      'Landing apexcloudworkscompany.com'
    ]);
    return respond({ success: true });
  } catch (err) {
    return respond({ success: false, error: err.toString() });
  }
}

// GET no hace nada (seguridad)
function doGet(e) {
  return respond({ success: false, error: 'GET no soportado' });
}
