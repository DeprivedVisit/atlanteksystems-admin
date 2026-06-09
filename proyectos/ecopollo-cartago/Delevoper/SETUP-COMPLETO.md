# EcoPollo — Setup Completo

## 🎯 Lo que tienes

1. **ecopollo-cotizador-completo.html** — Página web con 5 pasos
2. **apps-script.gs** — Script para Google Sheets
3. **EcoPollo_Catalogo.xlsx** — Hoja de precios editable
4. **EcoPollo_Catalogo.pdf** — Catálogo para imprimir/enviar

---

## ⚙️ PASO 1: Preparar Google Sheets

### 1.1 Crear la hoja de cálculo

1. Ve a https://sheets.google.com
2. Crea una **hoja nueva** llamada `EcoPollo Leads`
3. En la **primera fila**, escribe estos headers (A1 a K1):
   - A1: `Fecha`
   - B1: `Nombre`
   - C1: `Zona`
   - D1: `Frecuencia`
   - E1: `Volumen`
   - F1: `Factura`
   - G1: `Razón Social`
   - H1: `Productos Seleccionados`
   - I1: `Comentario`
   - J1: `Segmento`
   - K1: `Confianza`

4. **Guarda** la hoja (Ctrl+S o Cmd+S)

### 1.2 Agregar el script

1. En la misma hoja, ve a: **Extensiones > Apps Script**
2. Se abrirá una pestaña nueva con el editor de Google Apps Script
3. **Elimina** todo el código que hay por defecto (si hay)
4. **Copia y pega** el contenido de `apps-script.gs` en la ventana principal
5. **Guarda** el script (Ctrl+S o Cmd+S)
6. Dale un nombre al proyecto, ej: "EcoPollo Leads Saver"

### 1.3 Publicar como web app

1. En el editor de Apps Script, haz clic en **"Deploy" > "New deployment"**
2. En la ventana de deploy:
   - **Type:** Selecciona "Web app"
   - **Execute as:** Tu cuenta de Google (ej: tu@gmail.com)
   - **Who has access:** "Anyone" (para que reciba POST requests de la web)
3. Haz clic en **"Deploy"**
4. Una ventana te mostrará la URL de deploy, ej:
   ```
   https://script.google.com/macros/d/1ABC2DEF3GHI_JKL4MNO5PQR6STU7VWX8/userweb
   ```
5. **Copia esta URL** — la necesitarás en el paso siguiente

---

## 🌐 PASO 2: Configurar la página web

### 2.1 Editar el número de WhatsApp

1. Abre `ecopollo-cotizador-completo.html` con un editor de texto (VS Code, Notepad++, etc.)
2. Busca esta línea (casi al inicio, dentro de `<script>`):
   ```js
   const WHATSAPP_NUMERO = "50688887777";
   ```
3. Reemplaza `50688887777` con el número real del agente, pero sin el +
   - Formato: código de país + número
   - Costa Rica: 506 + 8 dígitos
   - Ejemplo: `50688887777`
4. **Guarda** el archivo

### 2.2 Agregar la URL de Google Apps Script

1. En el mismo archivo, busca esta línea:
   ```js
   const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/d/YOUR_SCRIPT_ID/userweb";
   ```
2. Reemplaza `https://script.google.com/macros/d/YOUR_SCRIPT_ID/userweb` con la URL que copiaste en el paso 1.3
3. **Guarda** el archivo nuevamente

---

## 📤 PASO 3: Subir la página web a internet

### Opción A: Netlify Drop (más rápido, sin configuración)

1. Ve a https://netlify.com/drop
2. **Arrastra y suelta** el archivo `ecopollo-cotizador-completo.html`
3. Espera a que suba
4. Netlify te dará una URL como: `https://friendly-name.netlify.app`
5. Esa es tu página web lista 🎉

### Opción B: GitHub Pages

1. Sube el HTML a un repositorio GitHub
2. Activa GitHub Pages en Settings
3. Obtendrás una URL como: `https://tuusuario.github.io/ecopollo`

### Opción C: Tu propio hosting

Si ya tienes un servidor o hosting, sube el archivo HTML a la carpeta `public_html` o equivalente.

---

## 📱 PASO 4: Integrar con WhatsApp Business (opcional)

Si quieres que el link aparezca en tu bio de Instagram, WhatsApp Business, etc.:

1. Tu URL de cotización es: `https://friendly-name.netlify.app` (o la que obtuviste)
2. Comparte ese link en:
   - **Instagram Bio** — lo pones como link de bio
   - **Facebook Business** — en la sección de contacto
   - **Flyers/Tarjetas** — `Cotiza aquí: [URL]`
   - **WhatsApp Business** — auto-respuesta con el link
   - **Email** — firma de email

---

## ✅ PASO 5: Probar que funciona

### 5.1 Prueba la página web

1. Abre tu URL (ej: `https://friendly-name.netlify.app`)
2. Rellena el formulario completo:
   - Frecuencia: "Semanal"
   - Volumen: "5-20 kg"
   - Selecciona 2-3 productos con cantidades
   - Nombre, Zona, Factura: No, Comentario: "Test"
3. Abre WhatsApp → deberías ver el mensaje pre-llenado
4. Vuelve a la página, verás un spinner "Guardando tu información..."

### 5.2 Verifica que guardó en Google Sheets

1. Ve a tu hoja de Google Sheets `EcoPollo Leads`
2. Deberías ver una nueva fila con todos tus datos
3. Si funciona, ¡listo! El sistema está operativo

---

## 📊 Lo que ocurre cuando un cliente completa el formulario

**Timeline:**

1. **Cliente llena 5 pasos** en la página web
2. **Los datos se envían a Google Sheets** (aparecen en tiempo real)
3. **Se abre WhatsApp** con un mensaje pre-armado:
   ```
   🐔 Nueva consulta — EcoPollo
   
   Cliente: Juan Pérez
   Zona: Concepción, Cartago
   
   Frecuencia: Semanal
   Volumen por pedido: 5–20 kg
   Factura electrónica: No
   
   Productos solicitados:
   Pechuga sin Hueso: 5 kg
   Muslos: 3 kg
   
   ━━━━━━━━━━━━━━━
   🏷️ Segmento: Sodas / Restaurantes Pequeños
   💰 Tarifa: 12% descuento
   🟢 Confianza: alta
   ━━━━━━━━━━━━━━━
   
   Hola, vengo del formulario de la página web 👋
   ```

**El agente:**
- Recibe el mensaje en WhatsApp
- **Ya sabe el segmento y los precios** que aplican
- Cota solo lo que pidió el cliente
- Sin ambigüedades ni conversaciones extra

---

## 🎨 Personalización (opcional)

### Cambiar colores
- Abre `ecopollo-cotizador-completo.html` con VS Code
- Busca `:root {` al inicio del `<style>`
- Modifica estos valores (hex colors):
  - `--verde-oscuro: #1B4332;` → cambiar color principal
  - `--amarillo: #F4A261;` → cambiar acentos

### Cambiar productos
- En el mismo archivo, busca: `const productos = [`
- Modifica los 10 productos con tus datos reales
- Ejemplo:
  ```js
  { codigo: "EP-001", nombre: "Mi Producto", precio: 1000 }
  ```

### Cambiar preguntas
- Busca las secciones con `data-step="1"`, `data-step="2"`, etc.
- Modifica los textos según necesites

---

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| "No me aparecen datos en Google Sheets" | Verifica que copiaste bien la URL de Apps Script. Abre la consola del navegador (F12) y busca errores en Network. |
| "El botón de WhatsApp no abre nada" | Verifica que el número de WhatsApp está en formato correcto: 506 + 8 dígitos sin símbolos. |
| "La página carga muy lenta" | Es normal la primera vez (Netlify inicia el servidor). Luego debería ir más rápido. |
| "Algunos productos no se guardan en Sheets" | Asegúrate de llenar cantidad (kg) para cada producto. Si es 0, no se guarda. |
| "Me muestra error de CORS" | Esto significa que Apps Script no está configurado como "Web App - Anyone". Revisa el paso 1.3. |

---

## 📞 Soporte

Si algo no funciona:

1. Abre la consola del navegador (F12)
2. Ve a **Console** y busca mensajes de error en rojo
3. Copia el error exacto
4. Verifica que:
   - La URL de Apps Script es correcta
   - El número de WhatsApp está sin símbolos
   - Google Sheets tiene los headers en la fila 1
   - Apps Script está publicado como "Web App"

---

## 🎉 ¡Listo!

Tu sistema de cotización automática está funcionando. Ahora:

- Comparte el link de la página web con clientes
- Los datos llegan automáticamente a Google Sheets
- El agente recibe mensajes en WhatsApp ya clasificados
- Cierra más rápido porque sabes exactamente a quién estás cotizando

**Próximos pasos opcionales:**
- Integrar con Zapier para notificaciones por email/SMS
- Crear un dashboard en Google Data Studio con los leads
- Agregar más productos o personalizar las preguntas

---

*Creado el 27 de abril de 2026 para EcoPollo*
