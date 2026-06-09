// Google Apps Script para EcoPollo v2
// Con descuentos (SOLO visible para agente en Sheets)

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSheet();

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
      data.segmento || "",           // Segmento (CLASIFICADO)
      data.descuento ? data.descuento + "%" : "", // DESCUENTO (OCULTO para cliente)
      data.confianza || ""           // Confianza de clasificación
    ];

    sheet.appendRow(nuevaFila);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, timestamp: new Date() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function test() {
  const testData = {
    nombre: "Juan Pérez",
    zona: "Concepción, Cartago",
    frecuencia: "semanal",
    volumen: "bajo",
    factura: "no",
    razonSocial: "",
    productosSeleccionados: "EP-001 (2), EP-002 (1)",
    comentario: "Test desde Google Apps Script",
    segmento: "Sodas / Restaurantes Pequeños",
    descuento: 12,
    confianza: "alta"
  };

  doPost({
    postData: {
      contents: JSON.stringify(testData)
    }
  });

  console.log("Test completado. Revisa la hoja.");
}
