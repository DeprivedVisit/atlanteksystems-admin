# Auditoría completa — apexcloudworkcompany.com
> Fecha: 05 jul 2026 · Alcance: todo el proyecto (`index.html`, `admin.html`, `portal/`, `backend/`, `Legal/`, `Seguridad/`, `.gs`, `sitemap.xml`, `robots.txt`)

---

## 🔴 CRÍTICO — arreglar ya

### 1. El token de Apps Script está commiteado en texto plano en git — y sigue siendo el secreto activo, no un sistema viejo
Corrección respecto a la primera pasada de esta auditoría: `portal-apps-script.gs` **no es un sistema abandonado en paralelo**. Confirmado leyendo `backend/lib/appsScript.js` y `backend/routes/admin.js`/`routes/portal.js`: el backend Node nuevo **sigue llamando a este mismo Apps Script** para leer/escribir el Google Sheet — el login y las sesiones ahora son reales y del lado del servidor (eso sí se arregló), pero la capa de datos detrás sigue siendo este `.gs`.

El problema real es este, en `portal-apps-script.gs` línea 13:
```js
const ADMIN_TOKEN = 'apexAdmin2026!';
```
Esta constante tiene que coincidir con `APPS_SCRIPT_ADMIN_TOKEN` en `backend/.env` para que el proxy funcione — es decir, es el secreto compartido real del sistema en producción, no algo para dar de baja. El problema es que **está en texto plano, en un archivo commiteado a git** (`git log` confirma que `portal-apps-script.gs` está en el historial, commit `54f77db`) — cualquiera con acceso al repo (o a un fork, un colaborador futuro, un backup expuesto) ve la contraseña real del panel admin.
**Acción:** rotar `ADMIN_TOKEN` a un valor largo y aleatorio (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`), actualizarlo a la vez en el `.gs` (Google) y en `backend/.env` (nunca en `.env.example`), y evaluar si vale la pena reescribir el historial de git para sacar el valor viejo o simplemente rotarlo y seguir — dado que ya está expuesto, rotarlo ya lo invalida.

**[RESUELTO 06 jul 2026]** Token rotado a un valor aleatorio de 64 caracteres hex, actualizado en `portal-apps-script.gs` (repo) y `backend/.env` (local, gitignored). **Pendiente manual de Garett:** el nuevo valor del `.gs` solo entra en efecto cuando se actualice/redeploye el Web App en Google Apps Script (Deploy → Manage deployments → editar la versión activa) — editar el archivo fuente en Drive no basta por sí solo. Hasta que eso se haga, el backend y el Apps Script van a estar desincronizados (el backend manda el token nuevo, el deployment viejo de Google todavía espera el viejo) y el proxy `/gs` va a fallar. El valor viejo commiteado en git (`54f77db`) queda inválido desde la rotación, así que no urge reescribir el historial.

### 2. `admin.html` y `portal/*.html` tienen el backend hardcodeado a `localhost`
```html
<script>window.APEX_API_BASE = 'http://localhost:3000';</script>
```
Esto está en `admin.html`, `portal/index.html` y `portal/dashboard.html`. En producción (S3 + CloudFront, sitio estático) esto intenta pegarle al `localhost:3000` **del navegador de quien visite la página** — no existe tal servidor ahí. Resultado: login de admin y del portal **rotos en producción** tal cual está ahorita. Confirmado con Garett: el backend todavía no está deployado, así que el fix queda con un placeholder claro para cuando exista la URL real.

### 3. `sitemap.xml` está roto — XML inválido
Línea 11 real del archivo:
```xml
<url>33
```
Un `<url>33` literal en vez de `<url>`. Google Search Console va a rechazar el sitemap completo por esto, no solo esa entrada.
Además esa misma entrada apunta a `Legal/privacidad.html`, pero el archivo real se llama `Legal/politica-privacidad.html` → 404 aunque se arregle el XML.

### 4. Formulario de contacto público expone la URL de Apps Script en JS client-side
`assets/js/script.js` (función `initContactForm`, constante `CONTACT_AS_URL`):
```js
const CONTACT_AS_URL = 'https://script.google.com/macros/s/AKfycbz.../exec';
```
Visible para cualquiera con "Ver código fuente". El `.gs` en sí (`contact-apps-script.gs`) está bien escrito — bloquea `doGet`, solo permite `doPost` para anotar filas — así que el riesgo real es spam del formulario, no fuga de datos. Prioridad baja/opcional: proxear a través del backend nuevo cuando esté deployado.

### 5. `/api/leads` y `/api/leads/:id` sin autenticación
En `backend/app.js` estas dos rutas estaban montadas directo en `app`, sin pasar por `requireAdminSession` como sí hacen `/api/admin` y `/api/portal`. Cualquiera que tenga la URL del backend podía leer todos los leads de todos los clientes sin login. **Corregido en esta misma pasada** (ver changelog abajo).

---

## 🟠 DESCUBRIMIENTO GRANDE — actualiza el roadmap de CLAUDE.md

Ya existe un backend completo en `backend/`: **Node.js 20 + Express 4.22 + MySQL 8.0 + bcryptjs + express-session (persistente vía express-mysql-session) + Socket.io + Stripe + Nodemailer + PDFKit + Telegram Bot + AWS S3**, con `deploy-ec2.sh`, `nginx.conf` y `ecosystem.config.js` (PM2) listos.

Esto es **mucho más avanzado** que lo que dice el roadmap actual de `CLAUDE.md`:
- CLAUDE.md dice que "Node+Express+PostgreSQL" es la habilidad que **destraba** el tier $800-2k en **Q3 2026** (futuro). Ya está construido — y es **MySQL**, no PostgreSQL.
- El admin y el portal **ya migraron** de localStorage/SHA-256 a sesiones reales del servidor (cookie `apex_sid`, httpOnly, 8h de expiración). Eso resuelve 2 de los 3 críticos de seguridad que CLAUDE.md todavía lista como pendientes (token hardcodeado en `admin.js`, auth localStorage sin expiración). El tercero (URL de Apps Script expuesta) sigue pendiente, solo en la landing pública.
- Confirmado con Garett: el backend **todavía no está deployado** a producción — sigue en desarrollo local. Por eso el `localhost:3000` hardcodeado rompe producción (punto crítico #2).

**Recomendación:** decidir explícitamente cuándo se deploya este backend a EC2, porque cambia la prioridad de los pendientes de seguridad de CLAUDE.md y desbloquea el login real de admin/portal en producción.

### Detalle menor pero revelador
`backend/README.md`, `backend/.env.example`, `backend/nginx.conf` y `backend/deploy-ec2.sh` tenían boilerplate de otro proyecto/plantilla sin adaptar:
```
Migrado desde Loop-Landing.com
Garett Barrantes Benavides · Curridabat, Costa Rica
DOMAIN="apex-cloudworks.com"
```
El negocio es Apex Cloud Work, Cartago — y el dominio real del sitio es `apexcloudworkcompany.com` (sin guion), no `apex-cloudworks.com` (con guion, que aparecía en nginx/deploy). **Corregido en esta misma pasada.**

---

## 🟡 CONTENIDO — decisiones tomadas con Garett

1. **Testimonios**: se dejan tal cual están — instrucción explícita de no tocarlos.
2. **"3 Sistemas N8N en producción"** y demás cifras de la sección Resultados: reformuladas para no depender de un conteo específico que haya que estar actualizando (en vez de inventar o mantener números que se desactualizan rápido).
3. **Portafolio con fotos de stock de Unsplash** bajo el título "Proyectos reales — no demos" — se reemplaza el tratamiento visual por algo propio dentro de la paleta, sin prometer fotos reales que todavía no existen.
4. **Páginas legales huérfanas**: `Legal/terminos.html` y `Legal/politica-privacidad.html` ahora están linkeadas desde el footer.
5. **Link a `admin.html` en el footer público**: se saca — no tiene sentido publicitar la URL del panel admin en la navegación pública de un sitio que busca verse profesional.

---

## 🟢 Qué se agregó

1. Barra de confianza con clientes reales (Skindoctors CR, EcoPollo, VisionaryFilm CR) entre "Stack" y "Testimonios" — badges tipográficos, sin logos inventados.
2. Schema `FAQPage` + `Service` en el `<head>` — reflejo directo del FAQ y precios ya existentes, sin copy nuevo. Gana rich snippets en Google gratis.
3. `assets/js/env.js` — un solo lugar que decide la URL del backend según el dominio, en vez de tener `localhost:3000` copiado y pegado en 3 archivos.
4. Pase de tipografía/espaciado/jerarquía: se detectó y corrigió un problema real de contraste — `--text3` (#5A6A7A) sobre `--bg` (#090B0E) daba ~3.55:1, por debajo del mínimo AA de 4.5:1 para texto chico, y se usa en varias etiquetas pequeñas (`.rc-sub`, `.pr-freq`, `.sc-role`, `.act-date`, etc.). Se aclaró a `#6E7E8E` (~4.73:1) en el token, sin tocar componente por componente. El resto de la jerarquía (escala `.d2`/`.d3`, estados hover/focus) ya estaba consistente — no se tocó de más.

### Nota — pivote de diseño "Apex / propaganda soviética" en curso, no ejecutado todavía en el sitio
Durante este pase encontré que `PRODUCT.md` (fechado hoy, 05 jul 2026) ya describe un pivote de identidad visual deliberado: motivo de montaña dorada + ciudad de circuitos, tipografía Anton en mayúsculas, tokens nuevos `--red2`/`--parchment*` (ya presentes en `tokens.css`), y componentes nuevos `.ribbon-tag`/`.seal`/`.scroll-panel`/`.gear` reemplazando el eyebrow `mono mono-gold` en las 13 secciones. Los tokens ya están cargados y al menos un componente (`.proc-stage-fill`) ya usa `--red2` — pero el `index.html` actual **todavía usa el patrón viejo `mono mono-gold` en las 13 secciones**, incluyendo la nueva sección de confianza agregada en esta pasada. Esto es una decisión de diseño grande y deliberada, separada del alcance de esta auditoría — no la ejecuté para no meterme en un rediseño no pedido. Si es la dirección que seguís, es su propio proyecto (migrar las 13 secciones + el hero + agregar la pieza gráfica de la montaña).

---

## Registro de cambios aplicados en esta pasada (05 jul 2026)

- [x] `sitemap.xml` — XML corregido + ruta de Legal corregida
- [x] `index.html` footer — enlaces legales agregados, link a admin.html quitado
- [x] `backend/app.js` — `/api/leads` y `/api/leads/:id` protegidos con `requireAdminSession`
- [x] `backend/routes/admin.js` / `routes/portal.js` — confirmado que usan el token/URL del `.env` nuevo, no el Apps Script viejo
- [x] Boilerplate "Loop-Landing.com" / "Curridabat" / dominio equivocado limpiado en `backend/`
- [x] `assets/js/env.js` creado, usado por `admin.html`, `portal/index.html`, `portal/dashboard.html`
- [x] Schema FAQPage + Service agregado
- [x] Barra de confianza con clientes agregada
- [x] Portafolio: tratamiento visual propio en vez de fotos de stock
- [x] Sección Resultados reformulada sin cifras a mantener manualmente
- [x] Pase de tipografía/espaciado/jerarquía

## Pendiente — requiere acción manual de Garett (no es código)

- [ ] Rotar `ADMIN_TOKEN` en `portal-apps-script.gs` (Google) y `APPS_SCRIPT_ADMIN_TOKEN` en `backend/.env` a la vez — el valor actual está expuesto en git desde el commit `54f77db`
- [ ] Deployar el backend a EC2 y actualizar `assets/js/env.js` con la URL real de producción (hoy tiene un placeholder claro)
- [ ] Decidir si/cuándo proxear el formulario de contacto público a través del backend en vez de exponer el Apps Script directo en JS
