/**
 * Divinas Slim — Apps Script para Google Sheets
 * 1. Crea un Google Sheet nuevo
 * 2. Extensiones > Apps Script > pega este código
 * 3. Implementar > Nueva implementación > Web app
 * 4. Ejecutar como: Yo, Quién tiene acceso: Cualquiera
 * 5. Copia la URL del Web App y pégala en assets/js/script.js
 */

const SHEET_NAME = 'Pedidos';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();

    const row = [
      new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' }),
      data.id || '',
      data.name || '',
      data.phone || '',
      data.address || '',
      data.product || '',
      data.quantity || 1,
      data.total || 0,
      data.notes || '',
      data.email || '',
      'pendiente'
    ];

    sheet.appendRow(row);

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
    .createTextOutput(JSON.stringify({ ok: true, message: 'Divinas Slim Web App activo' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (sheet) return sheet;

  sheet = ss.insertSheet(SHEET_NAME);
  sheet.appendRow([
    'Fecha', 'ID Pedido', 'Nombre', 'Teléfono', 'Dirección',
    'Producto', 'Cantidad', 'Total', 'Notas', 'Email', 'Estado'
  ]);
  sheet.setFrozenRows(1);
  const headerRange = sheet.getRange(1, 1, 1, 11);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#2d2428');
  headerRange.setFontColor('#f0e4e6');
  return sheet;
}
