function getSheet(nombre) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(nombre);
  if (!sheet) {
    sheet = ss.insertSheet(nombre);
    if (nombre === 'Usuarios') {
      sheet.appendRow(['Fecha','Nombre','Correo','Telefono','Password','Token']);
      sheet.getRange(1,1,1,6).setFontWeight('bold');
    }
    if (nombre === 'EcoPollo Leads') {
      sheet.appendRow(['Fecha','Nombre','Zona','Telefono','Total','Fuente','X','Productos','Comentario','Segmento','X','X','Correo','FechaEntrega','HoraEntrega','Estado']);
      sheet.getRange(1,1,1,16).setFontWeight('bold');
    }
  }
  return sheet;
}

function hashSimple(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + c;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    var accion = e.parameter.accion || '';
    if (accion === 'login')     return loginUsuario((e.parameter.correo || '').toLowerCase().trim(), e.parameter.password || '');
    if (accion === 'historial') return getHistorial((e.parameter.correo || '').toLowerCase().trim());
    if (accion === 'precios')   return getPreciosCatalogo(e);

    return responder({ success: false, error: 'Accion no reconocida' });
  } catch (err) {
    return responder({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var accion = data.accion || '';
    if (accion === 'registro') return registrarUsuario(data);
    if (accion === 'guardar')  return guardarLead(data.lead || data);
    if (accion === 'estado')   return actualizarEstado(data);
    return responder({ success: false, error: 'Accion no reconocida' });
  } catch (err) {
    return responder({ success: false, error: err.toString() });
  }
}

function guardarLead(lead) {
  var sheet = getSheet('EcoPollo Leads');
  sheet.appendRow([
    new Date(lead.fecha || new Date()),
    lead.nombre   || '',
    lead.zona     || '',
    lead.telefono || '',
    lead.total    || 0,
    lead.fuente   || 'web',
    '',
    lead.productos || '',
    '', '', '', '',
    lead.correo   || '',
    '', '',
    'En proceso'
  ]);
  return responder({ success: true });
}

function actualizarEstado(data) {
  var sheet = getSheet('EcoPollo Leads');
  var rows = sheet.getDataRange().getValues();
  var nombre = (data.nombre || '').trim();
  for (var i = rows.length - 1; i >= 1; i--) {
    if (rows[i][1] === nombre) {
      sheet.getRange(i + 1, 16).setValue(data.estado || 'En proceso');
      return responder({ success: true });
    }
  }
  return responder({ success: false, error: 'Lead no encontrado' });
}

function registrarUsuario(data) {
  var correo   = (data.correo   || '').toLowerCase().trim();
  var nombre   = (data.nombre   || '').trim();
  var telefono = (data.telefono || '').trim();
  var password = data.password  || '';
  if (!correo || !password || !nombre)
    return responder({ success: false, error: 'Faltan campos' });
  var sheet = getSheet('Usuarios');
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][2] === correo)
      return responder({ success: false, error: 'Correo ya registrado' });
  }
  var hash  = hashSimple(password);
  var token = hashSimple(correo + password + Date.now());
  sheet.appendRow([new Date(), nombre, correo, telefono, hash, token]);
  try {
    MailApp.sendEmail(correo, 'Bienvenido a EcoPollo Cartago',
      'Hola ' + nombre + ', tu cuenta fue creada.\nWhatsApp: +506 6314 4171');
  } catch(e) {}
  return responder({ success: true, usuario: { nombre: nombre, correo: correo, token: token } });
}

function loginUsuario(correo, password) {
  var sheet = getSheet('Usuarios');
  var rows = sheet.getDataRange().getValues();
  var hash = hashSimple(password);
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][2] === correo && rows[i][4] === hash)
      return responder({ success: true, usuario: { nombre: rows[i][1], correo: rows[i][2], telefono: rows[i][3], token: rows[i][5] } });
  }
  return responder({ success: false, error: 'Correo o contrasena incorrectos' });
}

function getHistorial(correo) {
  var sheet = getSheet('EcoPollo Leads');
  var leads = sheet.getDataRange().getValues();
  var pedidos = [];
  for (var j = 1; j < leads.length; j++) {
    if ((leads[j][12] || '').toLowerCase() === correo) {
      pedidos.push({
        fecha: leads[j][0] ? leads[j][0].toString() : '',
        nombre: leads[j][1], zona: leads[j][2],
        productos: leads[j][7], comentario: leads[j][8],
        fechaEntrega: leads[j][13] || '', horaEntrega: leads[j][14] || '',
        estado: leads[j][15] || 'En proceso'
      });
    }
  }
  pedidos.sort(function(a,b){ return new Date(b.fecha) - new Date(a.fecha); });
  return responder({ success: true, pedidos: pedidos });
}

function getPreciosCatalogo(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var sheet = ss.getSheetByName('Precios');
    if (!sheet) return responder({ success: false, error: 'Hoja Precios no encontrada' });

    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return responder({ success: false, error: 'Hoja Precios vacia' });

    var headers = data[0].map(function(h){ return String(h).trim().toUpperCase(); });
    var iCod=headers.indexOf('COD'), iProd=headers.indexOf('PRODUCTO'),
        iPrecio=headers.indexOf('PRECIO UNITARIO'), iUnidad=headers.indexOf('UNIDAD DETALLE'),
        iVersion=headers.indexOf('VERSION'), iCateg=headers.indexOf('CATEG.');

    // Soportar historico por fecha o por semana.
    // Como el sheet varía entre versiones, intentamos encontrar columnas típicas.
    var iFecha = headers.indexOf('FECHA');
    var iSemana = headers.indexOf('SEMANA');
    var iDesde = headers.indexOf('FECHA DESDE');
    var iHasta = headers.indexOf('FECHA HASTA');
    if (iHasta < 0) iHasta = headers.indexOf('HASTA');
    if (iDesde < 0) iDesde = headers.indexOf('DESDE');

    if (iCod<0||iProd<0||iPrecio<0||iVersion<0)
      return responder({ success: false, error: 'Faltan columnas' });

    // Recibir filtro opcional desde querystring
    var desdeParam = (e && e.parameter && e.parameter.desde) ? String(e.parameter.desde) : '';
    var hastaParam = (e && e.parameter && e.parameter.hasta) ? String(e.parameter.hasta) : '';
    var semanaParam = (e && e.parameter && e.parameter.semana) ? String(e.parameter.semana) : '';



    var catalogos = { 'ND-LOCAL':[], 'CARNICERIA':[], 'MAYORISTA':[] };

    for (var i=1; i<data.length; i++) {
      var version = String(data[i][iVersion]||'').trim().toUpperCase();
      if (!catalogos[version]) continue;

      // Filtrado histórico (si hay columnas y params)
      if (semanaParam) {
        if (iSemana >= 0) {
          var s = String(data[i][iSemana]||'').trim();
          if (!s) continue;
          if (String(s) !== String(semanaParam)) continue;
        }
      } else if (desdeParam || hastaParam) {
        // Caso rango
        if (iDesde >= 0 && iHasta >= 0) {
          var fD = parseFechaToTime(data[i][iDesde]);
          var fH = parseFechaToTime(data[i][iHasta]);
          if (fD == null || fH == null) continue;
          var dT = parseFechaToTime(desdeParam);
          var hT = parseFechaToTime(hastaParam);
          if (dT != null && fH < dT) continue;
          if (hT != null && fD > hT) continue;
        } else if (iFecha >= 0) {
          var f = parseFechaToTime(data[i][iFecha]);
          if (f == null) continue;
          var dT2 = parseFechaToTime(desdeParam);
          var hT2 = parseFechaToTime(hastaParam);
          if (dT2 != null && f < dT2) continue;
          if (hT2 != null && f > hT2) continue;
        }
      }

      var precio = parseFloat(String(data[i][iPrecio]||'0').replace(/,/g,''));
      if (!precio||isNaN(precio)) continue;

      catalogos[version].push({
        cod: String(data[i][iCod]||'').replace('.0','').trim(),
        nombre: String(data[i][iProd]||'').trim(),
        precio: Math.round(precio),
        unidad: String(data[i][iUnidad]||'KG').trim(),
        categ: iCateg>=0 ? String(data[i][iCateg]||'').trim() : ''
      });
    }

    return responder({ success: true, catalogos: catalogos });
  } catch(err) {
    return responder({ success: false, error: err.toString() });
  }
}

function parseFechaToTime(v) {
  if (v === null || v === undefined || v === '') return null;
  try {
    // Si ya es Date
    if (Object.prototype.toString.call(v) === '[object Date]') {
      return v.getTime();
    }
    // Normalizar string YYYY-MM-DD o DD/MM/YYYY
    var s = String(v).trim();
    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return new Date(s + 'T12:00:00').getTime();
    }
    // DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
      var p = s.split('/');
      return new Date(p[2] + '-' + p[1] + '-' + p[0] + 'T12:00:00').getTime();
    }
    var t = new Date(s);
    if (!isNaN(t.getTime())) return t.getTime();
  } catch(e) {}
  return null;
}

