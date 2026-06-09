// Google Apps Script para EcoPollo
// Pega esto en: https://script.google.com/macros/create
// Dentro de una hoja de Google Sheets llamada "EcoPollo Leads"

function doPost(e) {
  try {
    // Obtener datos del POST
    const data = JSON.parse(e.postData.contents);

    // Abrir la hoja activa
    const sheet = SpreadsheetApp.getActiveSheet();

    // Si es la primera fila, crear headers (esto se hace manual, pero como backup aquí va)
    // Headers esperados: Fecha, Nombre, Zona, Frecuencia, Volumen, Factura, Razón Social, Productos, Comentario, Segmento, Confianza

    // Agregar nueva fila con los datos
    const nuevaFila = [
      new Date(),                    // Fecha
      data.nombre || "",             // Nombre
      data.zona || "",               // Zona
      data.frecuencia || "",         // Frecuencia
      data.volumen || "",            // Volumen
      data.factura || "",            // Factura
      data.razonSocial || "",        // Razón Social
      data.productosSeleccionados || "", // Productos
      data.comentario || "",         // Comentario
      data.segmento || "",           // Segmento
      data.confianza || ""           // Confianza
    ];

    // Insertar la fila al final
    sheet.appendRow(nuevaFila);

    // Retornar respuesta exitosa
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, timestamp: new Date() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Retornar error
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Función auxiliar para testing (ejecuta desde el editor)
function test() {
  const testData = {
    nombre: "Juan Pérez",
    zona: "Concepción, Cartago",
    frecuencia: "semanal",
    volumen: "bajo",
    factura: "no",
    razonSocial: "",
    productosSeleccionados: "EP-001 (2), EP-002 (1)",
    comentario: "Test",
    segmento: "Cliente Final",
    confianza: "alta"
  };

  doPost({
    postData: {
      contents: JSON.stringify(testData)
    }
  });

  console.log("Test completado. Revisa la hoja.");
}
