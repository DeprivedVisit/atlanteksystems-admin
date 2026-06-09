// Google Apps Script v3 - MEJORADO CON DEBUGGEO
// Copia TODO este código en Google Apps Script

function doPost(e) {
  console.log("📨 POST recibido");
  console.log("Raw data:", e.postData.contents);
  
  try {
    const data = JSON.parse(e.postData.contents);
    console.log("✅ JSON parseado correctamente:", data);
    
    const sheet = SpreadsheetApp.getActiveSheet();
    console.log("📊 Sheet activa:", sheet.getName());

    const nuevaFila = [
      new Date(),                                    // A: Fecha
      data.nombre || "",                            // B: Nombre
      data.zona || "",                              // C: Zona
      data.frecuencia || "",                        // D: Frecuencia
      data.volumen || "",                           // E: Volumen
      data.factura || "",                           // F: Factura
      data.razonSocial || "",                       // G: Razón Social
      data.productosSeleccionados || "",            // H: Productos
      data.comentario || "",                        // I: Comentario
      data.segmento || "",                          // J: Segmento
      data.descuento ? data.descuento + "%" : "",  // K: Descuento
      data.confianza || ""                          // L: Confianza
    ];

    console.log("📝 Nueva fila:", nuevaFila);
    
    sheet.appendRow(nuevaFila);
    console.log("✅ Fila añadida a Google Sheets");

    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        timestamp: new Date(),
        message: "Lead guardado exitosamente en Google Sheets"
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error("❌ ERROR:", error.toString());
    console.error("Stack trace:", error.stack);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString(),
        stack: error.stack
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Función para ver los logs (ejecuta desde el editor)
function verLogs() {
  const logs = Logger.getLog();
  console.log("📋 LOGS COMPLETOS:");
  console.log(logs);
}

// Función de test
function test() {
  const testData = {
    nombre: "Test User",
    zona: "Cartago",
    frecuencia: "semanal",
    volumen: "bajo",
    factura: "no",
    razonSocial: "",
    productosSeleccionados: "EP-002 (5); EP-004 (3)",
    comentario: "Test desde Google Apps Script",
    segmento: "Sodas / Restaurantes Pequeños",
    descuento: 12,
    confianza: "alta"
  };

  console.log("🧪 TEST INICIADO");
  const result = doPost({
    postData: {
      contents: JSON.stringify(testData)
    }
  });

  const resultText = result.getContent();
  console.log("📌 Resultado del test:", resultText);
}
