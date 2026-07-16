/**
 * Jiménez Licores — Apps Script para Google Sheets
 * 1. Creá un Google Sheet nuevo
 * 2. Extensiones > Apps Script > pegá este código
 * 3. Implementar > Nueva implementación > Web app
 * 4. Ejecutar como: Yo · Quién tiene acceso: Cualquiera
 * 5. Copiá la URL del Web App y pegala en assets/js/orders.js (APPS_SCRIPT_URL)
 */

const SHEET_NAME = 'Pedidos';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();

    sheet.appendRow([
      new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' }),
      data.id || '',
      data.name || '',
      data.phone || '',
      data.address || '',
      data.product || '',
      data.quantity || 1,
      data.total || 0,
      data.notes || '',
      'pendiente'
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: 'Jiménez Licores Web App activo' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (sheet) return sheet;

  sheet = ss.insertSheet(SHEET_NAME);
  sheet.appendRow([
    'Fecha', 'ID Pedido', 'Nombre', 'WhatsApp', 'Dirección',
    'Producto', 'Cantidad', 'Total', 'Notas', 'Estado'
  ]);
  sheet.setFrozenRows(1);
  const headerRange = sheet.getRange(1, 1, 1, 10);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#0a0a0f');
  headerRange.setFontColor('#f0c040');
  return sheet;
}
