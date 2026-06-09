# 🚀 Activar Google Sheets + Google Apps Script

**Tiempo total: 5-10 minutos**

---

## PASO 1: Crear la hoja de Google Sheets

### 1.1 Crear la hoja

1. Ve a **https://sheets.google.com**
2. Haz clic en el **icono "+"** (crear nueva hoja)
3. Dale un nombre: `EcoPollo Leads`
4. Presiona **Enter**

### 1.2 Agregar los headers (encabezados)

En la **primera fila (fila 1)**, escribe estas 12 columnas. Una en cada celda de izquierda a derecha:

| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Fecha | Nombre | Zona | Frecuencia | Volumen | Factura | Razón Social | Productos | Comentario | Segmento | Descuento | Confianza |

**Exactamente así, en este orden.**

Presiona **Ctrl+S** (o **Cmd+S** en Mac) para guardar.

---

## PASO 2: Conectar Google Apps Script

### 2.1 Abrir el editor de Apps Script

1. En la misma hoja de Google Sheets, ve a: **Extensiones > Apps Script**
2. Se abrirá una ventana nueva con un editor de código
3. **Borra todo** el código que ves (selecciona todo con Ctrl+A, luego Delete)

### 2.2 Copiar el script

1. Abre el archivo `apps-script-v2.gs` (en tu carpeta de descargas)
2. **Copia TODO el contenido** del archivo
3. **Pega** en el editor de Apps Script (en la ventana que abriste)
4. Presiona **Ctrl+S** para guardar el script

### 2.3 Publicar como Web App

Este es el paso crítico:

1. En el editor de Apps Script, arriba a la izquierda busca el menú **"Deploy"** 
2. Haz clic en **"Deploy"** → selecciona **"New deployment"**
3. Se abrirá un modal con opciones. En la ventana:
   - **Type:** Selecciona el ícono de engranaje, luego elige **"Web app"**
   - **Execute as:** Mantén tu email (la cuenta de Google)
   - **Who has access:** Cambia a **"Anyone"** (IMPORTANTE)
4. Haz clic en **"Deploy"**
5. Una ventana mostrará tu URL de deployment, ej:
   ```
   https://script.google.com/macros/d/1ABC2DEF3GHI_JKL4MNO5PQR6STU7VWX8YZ/userweb
   ```

### 2.4 COPIA y GUARDA esta URL

Copia toda la URL y **pégala en un documento de texto** (Bloc de notas, Word, etc.).

**⚠️ IMPORTANTE:** La vas a necesitar en el siguiente paso.

---

## PASO 3: Actualizar el HTML con la URL de Google Apps Script

### 3.1 Editar el HTML

1. Abre el archivo `ecopollo-cotizador-final.html` con VS Code (o Notepad++)
2. Presiona **Ctrl+F** para buscar
3. Busca esta línea:
   ```javascript
   const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/d/YOUR_SCRIPT_ID/userweb";
   ```

### 3.2 Reemplazar con tu URL real

1. Reemplaza TODO el contenido entre las comillas con **tu URL real** del paso 2.4
2. Ej:
   ```javascript
   const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/d/1ABC2DEF3GHI_JKL4MNO5PQR6STU7VWX8YZ/userweb";
   ```
3. Presiona **Ctrl+S** para guardar

### 3.3 Cambiar el número de WhatsApp (si es necesario)

1. En el mismo archivo, busca:
   ```javascript
   const WHATSAPP_NUMERO = "50688887777";
   ```
2. Si tu número es diferente, cámbialo
3. Guarda (**Ctrl+S**)

---

## PASO 4: Probar que funciona (SIN subir a Netlify aún)

### 4.1 Abrir localmente

1. Descarga el archivo `ecopollo-cotizador-final.html`
2. Descarga el logo `ecopollo_logo_mejorado.jpg` (o `ecopollo_logo_mejorado.png`)
3. **Pon ambos archivos en la misma carpeta**
4. Haz doble clic en el `.html` para abrirlo en tu navegador

### 4.2 Llenar el formulario de prueba

1. **Paso 1:** Elige "Semanal"
2. **Paso 2:** Elige "5-20 kg"
3. **Paso 3:** Selecciona 2-3 productos y agrega cantidades
4. **Paso 4:** Llena:
   - Nombre: `Test User`
   - Zona: `Cartago`
   - Factura: `No`
   - Comentario: `Testing` (opcional)
5. **Paso 5:** Verás un spinner "Guardando tu información..."

### 4.3 Verificar en Google Sheets

1. Vuelve a tu hoja de Google Sheets (`EcoPollo Leads`)
2. Actualiza la página (F5 o Cmd+R)
3. **Deberías ver una nueva fila** con todos tus datos de prueba
4. ✅ Si la ves, **¡funciona!**



## ✅ Checklist final

Antes de usar en producción:

- [ ] Google Sheets tiene los 12 headers en la fila 1
- [ ] Google Apps Script está publicado como "Web App"
- [ ] HTML tiene la URL correcta de Google Apps Script
- [ ] Logo está en la misma carpeta que el HTML (local)
- [ ] Probaste el formulario y Google Sheets recibe los datos
- [ ] Subiste a Netlify y la página carga bien

---

## 🚨 Troubleshooting

| Problema | Solución |
|----------|----------|
| "No aparecen datos en Google Sheets" | Verifica que copiaste bien la URL de Apps Script. Abre la consola (F12) y busca errores en "Network". |
| "Google Apps Script no se publica" | Asegúrate de haber elegido "Web App" y "Anyone" en los permisos. |
| "El formulario carga pero no se guarda" | Verifica que la URL en el HTML termina exactamente igual: `...userweb` |
| "El logo no aparece" | El `.jpg` o `.png` debe estar en la MISMA carpeta que el `.html` |
| "Error de CORS en consola" | Significa que la URL del script no es correcta. Cópiala bien. |

---

## 📞 Una vez activo

**Para el cliente:**
- Comparte el link de Netlify (ej: https://friendly-name.netlify.app)
- Llena el formulario → WhatsApp se abre automáticamente

**Para ti (agente):**
- Recibes el mensaje en WhatsApp
- Abres Google Sheets y ves el descuento + segmento (solo tú)
- Cotizas directamente sin que el cliente sepa el descuento

---

*Creado: 27 de abril de 2026*
