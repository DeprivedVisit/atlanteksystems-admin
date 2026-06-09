// ══════════════════════════════════════════════════════
//  EcoPollo Apps Script v4 — Leads + Gestión de Usuarios
// ══════════════════════════════════════════════════════
//
//  Sheets necesarias en el mismo Spreadsheet:
//    · "Leads"    — igual que antes
//    · "Usuarios" — nueva, se crea automáticamente
//
//  Endpoints:
//    POST action=lead      → guarda lead (flujo existente)
//    POST action=register  → crea cuenta nueva
//    GET  action=login     → verifica credenciales
//    GET  action=getUser   → devuelve datos del usuario
// ══════════════════════════════════════════════════════

var SHEET_LEADS    = "Leads";
var SHEET_USUARIOS = "Usuarios";

// ── Utilidades ────────────────────────────────────────

function getOrCreateSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (name === SHEET_USUARIOS) {
      sh.appendRow([
        "ID", "Nombre", "Email", "Telefono",
        "PasswordHash", "Rol", "TipoNegocio",
        "Zona", "Direccion", "FechaRegistro", "Activo"
      ]);
      sh.getRange(1, 1, 1, 11).setFontWeight("bold");
    }
  }
  return sh;
}

function hashPassword(pwd) {
  var bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    pwd,
    Utilities.Charset.UTF_8
  );
  return bytes.map(function(b) {
    return ("0" + (b & 0xFF).toString(16)).slice(-2);
  }).join("");
}

function generateId() {
  return Utilities.getUuid();
}

function corsResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── doGet — login / getUser ───────────────────────────

function doGet(e) {
  var p = e.parameter;
  var action = p.action || "";

  try {
    if (action === "login") {
      return handleLogin(p.email, p.hash);
    }
    if (action === "getUser") {
      return handleGetUser(p.email);
    }
    return corsResponse({ success: false, error: "Acción no reconocida" });
  } catch (err) {
    return corsResponse({ success: false, error: err.toString() });
  }
}

function handleLogin(email, hash) {
  if (!email || !hash) {
    return corsResponse({ success: false, error: "Email y contraseña requeridos" });
  }
  var sh = getOrCreateSheet(SHEET_USUARIOS);
  var data = sh.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[2].toString().toLowerCase() === email.toLowerCase()) {
      if (!row[10]) { // Activo = FALSE
        return corsResponse({ success: false, error: "Cuenta desactivada" });
      }
      if (row[4] !== hash) {
        return corsResponse({ success: false, error: "Contraseña incorrecta" });
      }
      return corsResponse({
        success: true,
        user: {
          id:          row[0],
          nombre:      row[1],
          email:       row[2],
          telefono:    row[3],
          rol:         row[5],
          tipoNegocio: row[6],
          zona:        row[7],
          direccion:   row[8]
        }
      });
    }
  }
  return corsResponse({ success: false, error: "Usuario no encontrado" });
}

function handleGetUser(email) {
  if (!email) return corsResponse({ success: false, error: "Email requerido" });
  var sh = getOrCreateSheet(SHEET_USUARIOS);
  var data = sh.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][2].toString().toLowerCase() === email.toLowerCase()) {
      return corsResponse({
        success: true,
        user: {
          id:          data[i][0],
          nombre:      data[i][1],
          email:       data[i][2],
          telefono:    data[i][3],
          rol:         data[i][5],
          tipoNegocio: data[i][6],
          zona:        data[i][7],
          direccion:   data[i][8]
        }
      });
    }
  }
  return corsResponse({ success: false, error: "Usuario no encontrado" });
}

// ── doPost — lead / register ──────────────────────────

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action || "lead";

    if (action === "register") return handleRegister(data);
    return handleLead(data);

  } catch (err) {
    return corsResponse({ success: false, error: err.toString() });
  }
}

function handleRegister(data) {
  var email = (data.email || "").toLowerCase().trim();
  var nombre = (data.nombre || "").trim();
  var pwd = (data.passwordHash || "").trim();

  if (!email || !nombre || !pwd) {
    return corsResponse({ success: false, error: "Faltan campos obligatorios" });
  }

  var sh = getOrCreateSheet(SHEET_USUARIOS);
  var rows = sh.getDataRange().getValues();

  // Verificar email duplicado
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][2].toString().toLowerCase() === email) {
      return corsResponse({ success: false, error: "Este correo ya está registrado" });
    }
  }

  var id = generateId();
  sh.appendRow([
    id,
    nombre,
    email,
    data.telefono    || "",
    pwd,
    data.rol         || "cliente",
    data.tipoNegocio || "",
    data.zona        || "",
    data.direccion   || "",
    new Date(),
    true
  ]);

  return corsResponse({
    success: true,
    message: "Cuenta creada exitosamente",
    user: { id: id, nombre: nombre, email: email, rol: data.rol || "cliente" }
  });
}

function handleLead(data) {
  var sh = getOrCreateSheet(SHEET_LEADS);
  sh.appendRow([
    new Date(),
    data.nombre                || "",
    data.zona                  || "",
    data.frecuencia            || "",
    data.volumen               || "",
    data.factura               || "",
    data.razonSocial           || "",
    data.productosSeleccionados|| "",
    data.comentario            || "",
    data.segmento              || "",
    data.descuento ? data.descuento + "%" : "",
    data.confianza             || "",
    data.telefono              || "",
    data.tipoNegocio           || "",
    data.direccion             || ""
  ]);

  return corsResponse({
    success: true,
    message: "Lead guardado exitosamente"
  });
}

// ── Test manual ───────────────────────────────────────

function testRegistro() {
  var result = doPost({
    postData: {
      contents: JSON.stringify({
        action: "register",
        nombre: "Test Cliente",
        email: "test@ecopollo.com",
        telefono: "88884444",
        passwordHash: hashPassword("1234"),
        rol: "cliente",
        tipoNegocio: "Restaurante",
        zona: "Cartago",
        direccion: "200m norte del parque"
      })
    }
  });
  console.log("Registro:", result.getContent());
}

function testLogin() {
  var result = doGet({
    parameter: {
      action: "login",
      email: "test@ecopollo.com",
      hash: hashPassword("1234")
    }
  });
  console.log("Login:", result.getContent());
}
