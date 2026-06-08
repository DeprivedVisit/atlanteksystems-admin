const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const SHEET_CITAS = "Citas";
const SHEET_BLOQUEOS = "Bloqueos";

function doGet(e) {
  if (!e || !e.parameter) {
    return ContentService.createTextOutput("Error: No se detectaron parámetros. El script está activo pero debe ser invocado como Aplicación Web.");
  }

  const action = e.parameter.action;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  if (action === 'getBookings') {
    const sheet = ss.getSheetByName(SHEET_CITAS);
    if (!sheet) return JSONResponse([]);
    const data = sheet.getDataRange().getDisplayValues();
    const headers = data.shift();
    if (!headers || data.length === 0) return JSONResponse([]);
    const json = data.map(row => {
      let obj = {};
      headers.forEach((h, i) => obj[h.toLowerCase()] = row[i]);
      return obj;
    });
    return JSONResponse(json);
  }

  if (action === 'getBlocked') {
    const sheet = ss.getSheetByName(SHEET_BLOQUEOS);
    if (!sheet) return JSONResponse({ days: [], slots: [] });
    const data = sheet.getDataRange().getDisplayValues();
    data.shift();
    const days = [];
    const slots = [];
    data.forEach(row => {
      const type = (row[0] || '').toString().trim();
      const value = (row[1] || '').toString().trim();
      if(!type || !value) return;
      if(type === 'day') days.push(value);
      if(type === 'slot') slots.push(value);
    });
    if(days.length === 0 && slots.length === 0) {
      const flat = data.flat().map(v => (v||'').toString().trim()).filter(Boolean);
      return JSONResponse({ days: flat, slots: [] });
    }
    return JSONResponse({ days, slots });
  }
}


function doPost(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const data = JSON.parse(e.postData.contents);
  const action = data.action;

  if (action === 'addBooking') {
    const b = data.booking;
    const sheet = ss.getSheetByName(SHEET_CITAS);
    sheet.appendRow([
      b.id, b.name, b.phone, b.address, b.vehicle, b.service, b.equipment,
      b.date, b.slot, b.time, b.notes, b.status, b.createdAt
    ]);
    return JSONResponse({ ok: true });
  }

  if (action === 'cancelBooking') {
    const sheet = ss.getSheetByName(SHEET_CITAS);
    const vals = sheet.getDataRange().getValues();
    for (let i = 1; i < vals.length; i++) {
      if (vals[i][0] === data.id) {
        sheet.getRange(i + 1, 12).setValue('cancelada');
        break;
      }
    }
    return JSONResponse({ ok: true });
  }

  if (action === 'completeBooking') {
    const sheet = ss.getSheetByName(SHEET_CITAS);
    const vals = sheet.getDataRange().getValues();
    for (let i = 1; i < vals.length; i++) {
      if (vals[i][0] === data.id) {
        sheet.getRange(i + 1, 12).setValue('completada');
        break;
      }
    }
    return JSONResponse({ ok: true });
  }

  if (action === 'blockDate') {
    const sheet = ss.getSheetByName(SHEET_BLOQUEOS);
    sheet.appendRow(['day', data.date]);
    return JSONResponse({ ok: true });
  }

  if (action === 'unblockDate') {
    const sheet = ss.getSheetByName(SHEET_BLOQUEOS);
    const vals = sheet.getDataRange().getValues();
    for (let i = vals.length - 1; i >= 1; i--) {
      const type = (vals[i][0] || '').toString();
      const value = (vals[i][1] || '').toString();
      const legacyDate = (vals[i][0] || '').toString();
      if ((type === 'day' && value == data.date) || legacyDate == data.date) {
        sheet.deleteRow(i + 1);
      }
    }
    return JSONResponse({ ok: true });
  }

  if (action === 'blockSlot') {
    const sheet = ss.getSheetByName(SHEET_BLOQUEOS);
    const slotId = data.date + '|' + data.slot;
    sheet.appendRow(['slot', slotId]);
    return JSONResponse({ ok: true });
  }

  if (action === 'unblockSlot') {
    const sheet = ss.getSheetByName(SHEET_BLOQUEOS);
    const vals = sheet.getDataRange().getValues();
    const slotId = data.date + '|' + data.slot;
    for (let i = vals.length - 1; i >= 1; i--) {
      const type = (vals[i][0] || '').toString();
      const value = (vals[i][1] || '').toString();
      if (type === 'slot' && value == slotId) {
        sheet.deleteRow(i + 1);
      }
    }
    return JSONResponse({ ok: true });
  }
}


function JSONResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
