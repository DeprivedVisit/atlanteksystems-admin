# 🔄 Sesión activa — buffer de memoria en vivo

> Actualizar **al cerrar cada bloque de trabajo** (BUILD / VENTAS / CLIENTE / AUTOMATIZACIÓN / REMATE).
> Cuando el watchdog AFK o el usuario lo pidan, la skill `apex-memoria` congela esto en
> `sesiones/YYYY-MM-DD_HHmm.md`, actualiza `ULTIMA-SESION.md` e `index.md`, y resetea este archivo.
> Si no hay trabajo en curso, dejá la marca `<!-- SIN-TRABAJO -->` abajo.

- **Fecha:** 2026-09-25

## Bloque: Atlantek Admin — 5 features + Web form + Email fix

**Proyecto:** Atlantek Systems — Panel admin `admin.atlanteksystems.com` + Sitio `atlanteksystems.com`

### Completado hoy (2026-09-25)

**Panel Admin (5 features):**
- [x] **Dashboard Charts (Chart.js):** 4 gráficos — ventas mensuales (bar), top 5 clientes (doughnut), estado docs (doughnut), leads por estado (horizontal bar) — paleta Atlantek, responsive, limpieza al navegar
- [x] **Export Excel universal:** botones 📤 en Leads, Clientes, Documentos, Catálogo — `store.js` + `app.js` — columnas completas, filename con fecha
- [x] **Imágenes en Catálogo:** input file + preview base64 (500KB máx), thumbnail 40x40 en tabla, botón quitar, campo en Excel
- [x] **Email documentos:** botón 📧 en vista documento → Apps Script `send-doc-email` (MailApp HTML + texto, branding Atlantek)
- [x] **Auth JWT + HttpOnly + Roles:** Pages Functions (`functions/api/auth/`) con login/me/logout/refresh, JWT 8h, cookie segura, KV revocación, roles admin/vendedor/cliente — Frontend `auth.js` con fallback local, `route()` protege vistas, user-info en sidebar

**Sitio Web Público:**
- [x] **Formulario contacto:** campos "Tipo de visualización" (Frente/Esquina/Lateral/Potrero/Trasera/Interior/Otro) y "Ubicación específica" (Calle principal/Calle secundaria/Acceso privado/Carretera/Condominio/Centro comercial/Zona industrial/Otro) — payload 8 campos a Apps Script
- [x] **Email notificaciones:** NOTIFY.EMAIL actualizado a `soporte@atlanteksystems.com` en Apps Script (leads + usuarios nuevos)

### Archivos tocados
- `admin.html`, `assets/css/admin.css`, `assets/js/app.js`, `assets/js/store.js`, `assets/js/auth.js` (nuevo)
- `apps-script/Code.gs` + `Código.js` (NOTIFY.EMAIL + empresaEmail)
- `functions/api/auth/[...path].js` (Pages Functions auth)
- `01-Cliente/web/index.html` + `assets/js/script.js` (formulario visualizacion + ubicacion)

### Commits (main → auto-deploy)
- `89a15ff` feat: dashboard charts
- `c64a69f` feat: export Excel
- `5b1a72d` feat: imágenes catálogo
- `33976f4` feat: email documentos
- `eed2e51` feat: auth JWT + roles
- `0080fce` feat: auth as Pages Functions
- `e4c4801` feat: formulario visualizacion + ubicacion
- `f8d15f2` fix: email notificaciones soporte@atlanteksystems.com

### 🛑 Cierre (2026-09-25 ~23:00)
- Repos al día: monorepo `f8d15f2` → Pages auto-deploy (`atlantek-admin` + `atlanteksystems` GitHub Pages)
- Pages Functions pendiente config en Dashboard: KV binding `AUTH_KV` + secrets `JWT_SECRET`, `ADMIN_PASSWORD_HASH`
- Verificar live: `https://admin.atlanteksystems.com/admin` + `https://atlanteksystems.com/#contacto`

### Pendiente
- Config Pages Functions en Cloudflare Dashboard (KV binding + secrets)
- Demo a Daniel + firma + 50% adelanto ($350 setup + $50/mes)
- Migrar datos hoja cliente → hoja Apex antes de switch backend producción
- Search Console + GBP (Daniel)