# ✅ ARREGLAR GOOGLE SHEETS - PASO A PASO

## PROBLEMA: Los datos no se guardan en Google Sheets

La solución es **reemplazar el Google Apps Script antiguo por el nuevo mejorado**.

---

## PASO 1: Abre Google Apps Script

1. Ve a tu hoja **"EcoPollo Leads"** en Google Sheets
2. **Extensiones > Apps Script**
3. Se abre el editor

---

## PASO 2: Borra TODO el código antiguo

1. Selecciona TODO (Ctrl+A)
2. Borra (Delete)
3. El editor debe estar vacío

---

## PASO 3: Copia el script nuevo

1. Abre el archivo: **apps-script-v3-MEJORADO.gs**
2. Copia TODO el contenido
3. Pégalo en Google Apps Script
4. Presiona **Ctrl+S** para guardar

---

## PASO 4: Ejecuta la función de test

1. En el editor, en la lista desplegable (donde dice "Seleccionar función"):
   - Cambia a **"test"**
2. Haz clic en **"Ejecutar"** (botón play)
3. Google te pedirá permisos nuevamente → **Autoriza**

---

## PASO 5: Verifica los logs

1. En el editor, haz clic en **"Registro de ejecución"** (abajo)
2. Deberías ver mensajes como:
   - ✅ "JSON parseado correctamente"
   - ✅ "Fila añadida a Google Sheets"
   - Si ves ❌ errores, cópiame el error

---

## PASO 6: Verifica Google Sheets

1. Abre tu hoja **"EcoPollo Leads"**
2. Presiona **F5** para actualizar
3. Deberías ver una nueva fila con datos de test:
   - Nombre: "Test User"
   - Zona: "Cartago"
   - Segmento: "Sodas / Restaurantes Pequeños"
   - Descuento: "12%"

✅ Si ves la fila → **FUNCIONA**

---

## PASO 7: Implementar (Deploy) nuevamente

1. En el editor, haz clic en **"Implementar"** (azul, arriba)
2. **"Nueva implementación"**
3. Tipo: **"Aplicación web"**
4. Acceso: **"Cualquiera"**
5. Copia la URL que aparece (empieza con `https://script.google.com/macros/s/...`)

---

## PASO 8: Actualizar el HTML con la NUEVA URL

1. Abre **ecopollo-cotizador-FINAL.html** con VS Code
2. Busca: `const GOOGLE_APPS_SCRIPT_URL`
3. Reemplaza con tu nueva URL

---

## PASO 9: Prueba ahora

1. Abre el HTML en el navegador
2. Llena el formulario completo
3. En el Paso 5, deberías ver:
   - ✅ Spinner "Guardando tu información..."
   - ✅ Desaparece después de 2 segundos
4. Abre Google Sheets y F5
5. ✅ Deberías ver la nueva fila con tus datos

---

## Si SIGUE sin funcionar:

1. En Google Apps Script, haz clic en **"Registro de ejecución"**
2. Cópiame EXACTAMENTE el error que aparece
3. También abre la consola del navegador (F12) en tu formulario
4. Ve a **"Console"** y cópiame los errores rojos que ves

---

¿Completaste los pasos? Cuéntame en cuál te quedas o qué errores ves 👇
