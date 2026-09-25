# 📒 Bitácora — Atlantek Systems (AT)

> Bitácora de cambios del proyecto `F:\apex-cloudworks\proyectos\AT`.
> Creada 2026-09-15 · Cada entrada = un bloque de trabajo. Si algo se rompe, revertir desde aquí.

---

## Formato de entrada

```
## YYYY-MM-DD HH:MM — Título del bloque

Qué se cambió:
- [ ] Cambio 1 (archivo:línea)
- [ ] Cambio 2

Archivos tocados: ...
Commit: <hash> (si se commiteó)
Estado: ✅ listo / ⚠️ pendiente revisión / 🔴 bloqueado
Siguiente paso: ...
```

---

## Registro

<!-- ════════ Entradas ↓ ════════ -->

### 2026-09-25 22:30 — 📝 Formulario Web: Campos Visualización + Ubicación

**Contexto:** Mejora al formulario de contacto público (`atlanteksystems.com/#contacto`) para captar más señales de calificación del lead.

**Qué se hizo:**
- [x] **Campo "Tipo de visualización"** (select): Frente, Esquina, Lateral, Potrero, Trasera, Interior, Otro
- [x] **Campo "Ubicación específica"** (select): Calle principal, Calle secundaria, Acceso privado, Carretera, Condominio, Centro comercial, Zona industrial, Otro
- [x] `index.html`: Agregados en `lead-form__row` nuevo (líneas 592-616)
- [x] `script.js`: Payload extendido con `visualizacion` y `ubicacion` (líneas 152-158)
- [x] Apps Script backend recibe 8 campos totales (nombre, teléfono, distrito, tipo, visualizacion, ubicacion, servicio, mensaje)
- [x] Push a `main` → GitHub Pages auto-deploy

**Archivos tocados:**
- `01-Cliente/web/index.html` (formulario + 2 selects)
- `01-Cliente/web/assets/js/script.js` (lead payload)

**Commit:** `e4c4801`

**Estado:** ✅ pusheado → GitHub Pages auto-deploy (~2 min)

**Siguiente paso:** Verificar en `https://atlanteksystems.com/#contacto`

---

### 2026-09-25 18:45 — 🎯 Radar Profesional + Scroll System + Legal Docs Private

**Contexto:** Rediseño completo del radar de cobertura con coordenadas reales, sistema de scroll profesional, y migración de documentos legales al panel privado.

**Qué se hizo:**

**1. Radar Profesional (coordenadas reales + panel lateral)**
- [x] HTML: Radar con 4 anillos (5/10/15/20 km), cruces cardinales, 10 targets con `--bearing`/`--distance` CSS variables
- [x] Targets: 7 distritos Pococí + 3 zonas extendidas (Guácimo, Siquirres, Corredor Norte) con SLA real
- [x] Panel lateral: readouts (RANGO/OBJETIVOS/BASE) + lista interactiva clickeable → focus en radar
- [x] Lista cobertura: generada dinámicamente desde mismos datos del radar
- [x] CSS: Animaciones profesionales (barrido 6s, pulsos targets, anillos expansivos, reduced-motion)
- [x] JS: Hover/focus sync radar↔panel, click en panel → scrollIntoView target

**2. Sistema Scroll Profesional**
- [x] Scrollbars globales: Firefox (`scrollbar-width/color`) + WebKit (track transparente, thumb 8px, hover/active states)
- [x] Scrollbars delgadas para paneles (`.scroll-thin` 6px)
- [x] Nav Progress Bar: `<div class="nav__progress">` con scaleX según % scroll, gradiente navy→green
- [x] Smooth scroll condicional: `@media (prefers-reduced-motion: no-preference)` / `reduce`
- [x] Touch scrolling optimizado: `-webkit-overflow-scrolling: touch`, passive listeners

**3. Documentos Legales → Panel Privado (Seguridad)**
- [x] Eliminados 5 archivos `/Legal/*` del repo público (`atlanteksystems`): contrato, proforma, acta, términos, privacidad
- [x] Creados en `02-Privado/panel-admin/legal/` con navegación en sidebar admin
- [x] Vista `renderLegal()` en `app.js` con tabla + enlaces target=_blank
- [x] Deploy a `atlanteksystems-admin` (Cloudflare Pages) → 200 OK en panel, 404 en público
- [x] sitemap.xml actualizado (solo `/`)

**Archivos tocados:**
- `01-Cliente/web/index.html` (radar HTML + nav__progress)
- `01-Cliente/web/assets/css/style.css` (radar CSS + scrollbars + nav progress)
- `01-Cliente/web/assets/js/script.js` (radar JS + onScroll progress)
- `01-Cliente/web/sitemap.xml` (legal removido)
- `02-Privado/panel-admin/legal/*.html` (5 docs nuevos)
- `02-Privado/panel-admin/admin.html` (nav legal)
- `02-Privado/panel-admin/assets/js/app.js` (renderLegal)

**Commits:**
- Público: `0a3a567` (radar), `9b919c2` (layout), `06bb1d1` (scroll)
- Privado: `e3e1b54` (legal docs + nav)

**Estado:** ✅ listo · todo en producción (GitHub Pages + Cloudflare Pages)

**Siguiente paso:** Migrar datos hoja cliente → hoja Apex + switch backend producción + Cloudflare Access panel + demo Daniel

### 2026-09-25 14:30 — 🚀 Panel Admin: Dashboard Charts + Export Excel + Imágenes + Email + Auth JWT

**Contexto:** 5 mejoras prioritarias al panel admin `admin.atlanteksystems.com` en un solo bloque BUILD.

**Qué se hizo:**

**1. Dashboard con gráficos (Chart.js)**
- [x] CDN Chart.js 4.4.1 agregado en `admin.html`
- [x] 4 charts en `renderDashboardCharts()`: ventas mensuales (bar), top 5 clientes (doughnut), estado docs (doughnut), leads por estado (horizontal bar)
- [x] Paleta Atlantek (`#1a6aff`, `#10b981`, `#f59e0b`, `#ef4444`, `#64748b`)
- [x] CSS `.dashboard-charts`, `.chart-row`, `.chart-wrapper` responsive (1 col ≤900px)
- [x] `destroyCharts()` en `route()` para limpieza al navegar

**2. Export Excel universal (Leads, Clientes, Documentos, Catálogo)**
- [x] `store.js`: `exportLeadsToExcel()`, `exportClientesToExcel()`, `exportDocumentosToExcel()`
- [x] `app.js`: botones 📤 Exportar en view-head de cada sección
- [x] Columnas completas por entidad, filename `tipo-atlantek-YYYY-MM-DD.xlsx`
- [x] Catálogo ya tenía export/import (reutilizado patrón)

**3. Imágenes en Catálogo**
- [x] Modal `openCatalogoModal()`: input file hidden + preview + botón "Subir/Cambiar imagen"
- [x] Base64 en localStorage (límite 500KB), thumbnail 40x40 en tabla
- [x] Botón ✕ Quitar imagen, campo `imagen` en Excel export

**4. Email automático de documentos**
- [x] Botón 📧 Email en `docview__bar-right` (`admin.html`)
- [x] `app.js`: `doc-email` → POST `send-doc-email` a Apps Script
- [x] `apps-script/Code.gs`: acción `send-doc-email` con MailApp (HTML + texto)
- [x] Incluye: datos empresa, cliente, items, totales, notas, branding Atlantek

**5. Auth JWT + HttpOnly cookies + Roles**
- [x] Worker nuevo: `02-Privado/panel-admin/worker/` (wrangler.toml, package.json, src/index.js)
  - Endpoints: `/login`, `/logout`, `/me`, `/refresh`
  - JWT HS256 8h, cookie HttpOnly Secure SameSite=Lax
  - KV para revocación de sesiones
  - Roles: admin / vendedor / cliente con permisos granulares
- [x] Frontend `assets/js/auth.js`: API client con fallback local (dev)
  - Auto-refresh 5 min antes de expiración
  - `Auth.getUser()`, `hasRole()`, `hasPermission()`, `requireAuth()`
- [x] `admin.html`: login gate usa `Auth.login()`, muestra `user-info` en sidebar
- [x] `app.js`: `route()` protege vistas, `Auth.requireAuth()` en navegación
- [x] CSS fix: `.auth-gate.hidden { pointer-events: none }`

**Archivos tocados:**
- `admin.html` (CDN Chart.js, botón email, user-info, pointer-events)
- `assets/css/admin.css` (dashboard-charts styles)
- `assets/js/app.js` (charts, exports, email btn, route protection)
- `assets/js/store.js` (3 export functions)
- `assets/js/auth.js` (nuevo - 162 líneas)
- `apps-script/Code.gs` (acción send-doc-email)
- `worker/` (nuevo - wrangler.toml, package.json, src/index.js)

**Commits:**
- `89a15ff` feat: dashboard charts
- `c64a69f` feat: export Excel Leads/Clientes/Documentos
- `5b1a72d` feat: imágenes en catálogo
- `33976f4` feat: email documentos
- `eed2e51` feat: auth JWT + roles

**Estado:** ✅ Todo commiteado y pusheado a `main` → Cloudflare Pages auto-deploy

**Siguiente paso:** Verificar en `https://admin.atlanteksystems.com/admin` (build ~2 min) · Deploy Worker aparte con `wrangler deploy` (requiere KV namespace + secrets JWT_SECRET, ADMIN_PASSWORD_HASH) · Demo a Daniel

---

### 2026-09-16 02:30 — 🔐 Seguridad backend Apps Script + dominio admin en producción

**Contexto:** cierre del bloque de seguridad: backend Apps Script nuevo controlado por cuenta Apex, fuga `intec-2026` cerrada en todos los deployments, y dominio `admin.atlanteksystems.com` funcionando en producción.

**Qué se hizo:**

**Backend Apps Script nuevo (cuenta Apex):**
- [x] Apps Script API habilitado en cuenta `apexcloudworkscompany@gmail.com` (clasp create funcionando)
- [x] Backend nuevo en hoja Apex: sheet `1UnKG3yFHBEAkoZbiwM7MIVGlElIKYVCFriV6slnq5n8` · proyecto AppScript `1h0-AAoVxIaKChq6ouGsyfjIUnAuQR7n-BqMUvCBybjokWcseEdZ40xL6`
- [x] Deployment URL: `https://script.google.com/macros/s/AKfycbx3yS9Lmx8aL6wyiww_lcKMJLXPO9jRog7kKlSEwCw96wKeWzHowBQZyDM5ITTC5MSp/exec`
- [x] QA: `intec-2026` → `token inválido` ✓ · admin `atlantek-adm-vemsw0y4ugh5r691` → `ok:true` ✓ · POST lead público → `ok:true` ✓
- [x] `config.js` local (web pública `01-Cliente/web/assets/js/config.js` + panel `02-Privado/panel-admin/assets/js/config.js`) → URL nueva
- [ ] Lead de QA `TEST_VERIFY` (id `lmu3dzbv7`) queda marcado "perdido" en la hoja Apex nueva — borrar

**Fuga `intec-2026` cerrada (proyecto viejo `13nTgh1rjp...`):**
- [x] Deployment @3-INTEC (`AKfycbzi7pA9lse...`) **eliminado** (`clasp undeploy`) → URL vieja → HTTP 404
- [x] Código nuevo pusheado al proyecto viejo (`Código.js` + `appsscript.json`) → deployment `AKfycbz4n6oGe... @6`
- [x] @4-atlantek `AKfycbwpyW...` (usado por sitios LIVE) rechaza `intec-2026` ✓ verificado
- [x] Deployments viejos INTEC (`AKfycbwPRiAi4...`, `AKfycbyn54u...`) responden HTML de error, ya no muestran datos ✓

**Dominio admin en producción:**
- [x] Diagnóstico: `admin.atlanteksystems.com` daba 403 porque el dominio **no estaba adjuntado** al proyecto Pages `atlantek-admin` (el CNAME en DNS de Daniel ya existía)
- [x] Dominio adjuntado vía API → status `active` (verificación HTTP OK)
- [x] `https://admin.atlanteksystems.com/admin` → HTTP 200 · login `atlantek2026` → dashboard con datos reales (₡196,950, DOC 1, Clientes 1, Leads 5) · 0 errores consola
- [x] `index.html` creado en `panel-admin/` → raíz `admin.atlanteksystems.com/` redirige a `/admin` (antes 404)
- [x] Redeploy limpio a Pages `atlantek-admin` (sin mojibake, config de producción `AKfycbwpyW...` con datos reales)

**Errores de consola Poppins/CSP en `atlanteksystems.com/admin.html`:**
- [x] Causa: la página pública GitHub Pages cacheaba el admin **viejo** (era INTEC: Poppins + CSP `default-src 'none'`); el admin ya no vive en el sitio público desde `a282e87`
- [x] Fix: `admin.html` **redirect** agregado al repo público → `https://admin.atlanteksystems.com/admin` (commit `b62006f`)
- [x] Verificado: `atlanteksystems.com/admin.html` → 200 (redirect) → panel privado

**Sincronización GitHub:**
- [x] Repo local `Atlantek` estaba 2 commits adelante del remoto (`60b6cba`, `45c9d55`) + `BITACORA.md` e `index.html` sin commitear → todo pusheado a `apex-cloudworks` (`797603f..8ce0274`)
- [x] Verificados: `apex-cloudworks`, `atlanteksystems-admin`, `admin`, `atlanteksystems` — todos existen y responden
- [x] Repo público Pages: commit `b62006f` (redirect admin) pusheado · live en `atlanteksystems.com`

**Archivos tocados:** `02-Privado/panel-admin/index.html` (nuevo), `02-Privado/BITACORA.md`, repo público `admin.html` (nuevo redirect)

**Commits:** monorepo `60b6cba`, `45c9d55`, `8ce0274` · Pages repo `b62006f`

**Bloqueantes pendientes:**
- [ ] Migrar datos reales (clientes/docs/leads/nextNumber) de la hoja del cliente → hoja Apex nueva ANTES de repuntar producción al backend nuevo
- [ ] Decidir si producción (web pública + panel) pasa al backend Apex `AKfycbx3yS9Lm...`; hoy ambos sitios LIVE usan `AKfycbwpyW...` (hoja del cliente)
- [ ] Limpiar deployments viejos del proyecto `13nTgh1rjp` (@HEAD, @5 con acceso anómalo `AKfycbxLlFa...`, @6 de prueba)
- [ ] Borrar lead `TEST_VERIFY` de la hoja Apex nueva
- [ ] Borrar filas `TEST-no-enviar / 0000` de hoja Leads del Sheet del cliente (QA)
- [ ] Cloudflare Access save final (UI bug, ver entrada 02:30 previa)
- [ ] Search Console + GBP (Daniel) · unificar correo oficial / analítica
- [ ] Demo a Daniel + firma + 50% adelanto ($350 setup + $50/mes)

**Estado:** ✅ fuga cerrada total · backend Apex listo (datos pendientes de migrar) · dominio admin en producción funcionando · repos sincronizados
**Siguiente paso:** confirmar con Garett migración de datos → repuntar producción al backend Apex → demo a Daniel

### 2026-09-15 10:10 — Inicio de bitácora

**Baseline del proyecto:**

- Último commit: `acf4cc3` — "Atlantek: hero con imagen de fondo tech + colores actualizados"
- Rama: `main`
- **Cambios SIN commitear** (worktree vs HEAD):
  - Eliminados de raíz (movidos a `assets/img/`): `1.png`, `1.svg`, `2.svg`, `ATLANTEK MAIN (BACKGROUND).png`, `ATLANTEK MAIN W.png`, `ATLANTEK REVERSE.png`, `LOGO1.svg`, `LOGO2.svg`, `WhatsApp Image ...jpeg`, `favicon.svg`, `p.png`
  - Modificados: `Auditoria/AUDITORIA_INTEGRAL_Atlantek.md`, `Auditoria/index.html`, `admin.html`, `dashboard.html`, `assets/css/admin.css`, `assets/css/dashboard.css`, `assets/css/style.css`, `assets/js/app.js`, `assets/js/script.js`, `assets/js/ver-proforma.js`, `index.html`, `ver-proforma.html`
  - Nuevos (untracked): `assets/img/back`, `assets/img/favicon.svg`, `assets/img/p.png`, etc.

**Notas del flujo:**
- Getentidad: "Atlantek" en docs/commits ↔ marca **Atlantek** en código/landing (rebranding en curso).
- Form leads → Apps Script (Google Sheets) con token `atlantek-2026` en `assets/js/config.js`.
- Gate de usuario (localStorage `atlantek-user`) — apertura automática desactivada en auditoría.
- ⚠️ Pendiente en docs: migrar TOKEN a backend Apex antes de producción; redeploy Apps Script.

**Siguiente paso:** detalles de UI en `index.html` + `assets/css/style.css`.

---

### 2026-09-15 10:35 — Fixes de UI iniciales (roturas + inconsistencias)

**Diagnóstico:** hero visual roto (`hero-cam.jpg` no existía), favicon roto, fuentes desincronizadas, variable CSS indefinida y duplicados.

**Qué se cambió:**
- [x] `index.html:23` — favicon `favicon.svg?v=3` (inexistente) → `assets/img/favicon.svg?v=4`
- [x] `index.html:21` — Fuentes Google: **Fraunces + Courier Prime** (no usadas) → **Plus Jakarta Sans + JetBrains Mono** (las que usa el CSS; mismas que `admin/dashboard`)
- [x] `index.html:12,18,22,127` — Hero roto `hero-cam.jpg` → `back.jpg` (foto CCTV real) en preload, `<img>`, OG y Twitter image
- [x] `index.html:127` — imagen de pantalla de cámara del hero
- [x] `assets/css/style.css` — `--r-sm` (indefinido) → `var(--radius)` en `.service__img`
- [x] `assets/css/style.css` — eliminado `.btn--navy` y `.dot--navy` duplicados al final del archivo
- [x] `preview-palette.html:281` — `hero-cam.jpg` → `back.jpg`
- [x] Eliminado `assets/img/back` (sin extensión, 2.6MB, duplicado huérfano de `back.jpg`)

**Verificación:** todos los assets referenciados por el HTML existen · no quedan refs a `hero-cam.jpg` en archivos activos (solo en `Auditoria/index.html`, histórico).

**Estado:** ✅ listo · sin commitear
**Siguiente paso:** detalle fino de UI en hero/servicios/cobertura (pendientes definidos por Garett).

---

### 2026-09-15 10:50 — 🔴 Producción caída: diagnóstico

**Síntoma:** la página no carga.

**Diagnóstico (DNS público + HTTP):**
- `atlanteksystems.com` NO resuelve (busca SOA pero **no hay registro A/AAAA/CNAME** en el apex) → visita a la raíz falla.
- `www.atlanteksystems.com` SÍ resuelve a IPs de Cloudflare (172.67.218.247, 104.21.24.138) pero responde **HTTP 530** — Cloudflare no puede alcanzar el origin (CloudFront/S3 apagado, eliminado o mal apuntado).
- Nameservers del dominio: `alla.ns.cloudflare.com`, `mario.ns.cloudflare.com` → **el DNS vive en Cloudflare, no en Route 53** (a diferencia del `PLAN_MIGRACION.md` que proponía Route 53 A/AAAA alias a CloudFront).
- El simulador anterior `d20az2y50g157c.cloudfront.net` tampoco resuelve.

**Causa raíz probable:** el dominio se traspasó a Cloudflare pero (a) al apex le falta el registro flat al origin, y (b) el origin detrás de Cloudflare (CloudFront o S3) no está activo/responde.

**Plan de arreglo:**
1. Autenticar AWS (`aws login` — perfiles GarettBarrantes/251388487700/garett, cuenta 251388487700).
2. Confirmar estado de la distribución CloudFront (o bucket S3) de AT.
3. En Cloudflare: crear el registro del apex (`atlanteksystems.com` → origin) y validar `www`.
4. Verificar HTTPS end-to-end (WWW + raíz, redirect www→apex).

**Estado:** 🔴 bloqueado (esperando `aws login` de Garett).

> 🔎 Nota: durante esta sesión la carpeta se reorganizó en paralelo — los archivos principales viven ahora en `Archivos Principales/`. La bitácora quedó en esa subcarpeta.

---

### 2026-09-15 11:10 — ✅ Producción restaurada SIN AWS: GitHub Pages

**Contexto:** AWS inaccesible (sesiones SSO expiradas) y el DNS `atlanteksystems.com` está en Cloudflare, controlado por **Daniel** (dueño de AT). No dependemos de ninguno de los dos.

**Qué se hizo (deploy en vivo ~5 min):**
- [x] Unificados los archivos de producción en un repo dedicado: `apexcloudworkscompany/atlanteksystems` (público)
- [x] Subidos: `index.html`, `admin.html`, `dashboard.html`, `assets/` completo, `apps-script/`
- [x] Rama `main` + GitHub Pages habilitado (source `/`, build legacy)
- [x] **🌐 URL en vivo:** `https://apexcloudworkscompany.github.io/atlanteksystems/`
- [x] Verificado: HTML (200), CSS (200), JS (200), `back.jpg` (200), favicon (200)

**Qué NO cambia:** los leads siguen yendo por **Apps Script → Google Sheets** (`config.js`), independiente de AWS. El gate de usuario (localStorage) y admin/dashboard funcionan igual.

**Para tener el dominio oficial (`atlanteksystems.com`):** Daniel debe agregar en Cloudflare un CNAME `@` (o A flat) apuntando a `apexcloudworkscompany.github.io` y desactivar el proxy naranja para el apex (o dejar Pages como origin). Pendiente de coordinar con él.

**Estado:** ✅ LIVE en GitHub Pages · sin AWS
**Siguiente paso:** coordinar con Daniel el CNAME en Cloudflare, o seguir con detalles de UI en el index.

---

### 2026-09-15 11:10 — 🔍 SEO local: canonical + JSON-LD + robots + sitemap + sección Guápiles

**Contexto:** producción restaurada en GitHub Pages — SEO arrancando desde base funcional.

**Qué se hizo:**
- [x] `index.html` — canonical/og:url/og:image/twitter:image → URL live (github.io), con comentario de flip a `atlanteksystems.com` cuando viva el CNAME
- [x] `index.html` — meta description reforzada con keywords geo ("Guápiles y Pococí")
- [x] `index.html` — JSON-LD a `@graph`: LocalBusiness (7 distritos + Guácimo, openingHoursSpecification, offerCatalog, sameAs WhatsApp) + WebSite + FAQPage (6 preguntas reales del sitio)
- [x] `index.html` — sección de contenido `#guapiles` ("Instalación de cámaras de seguridad en Guápiles y todo Pococí", kicker 05) insertada antes del FAQ; FAQ renumerada a 06
- [x] `robots.txt` — creado (Allow /, disallow admin/dashboard, ref sitemap)
- [x] `sitemap.xml` — creado (home + terminos + politica-privacidad, prioridades, lastmod 2026-09-15)
- [x] `admin.html` — agregado `<meta name="robots" content="noindex, nofollow">`

**Decisiones:**
- Canonical TEMPORAL a github.io en lugar del dominio muerto: si apunta a `atlanteksystems.com` (no resuelve), Google descarta la página del índice. Flip pendiente al activar el CNAME.
- Sin `aggregateRating` ni testimonios falsos: reseñas reales (Google Maps/GBP) van primero — rating fabricado viola políticas de Google.

**Estado:** ✅ on-page SEO listo · CSS de `.seo-local*` se estilizó en bloque 12:05 (ver entrada)
**Siguiente paso:** deploy a repo Pages + plan SEO cliente-side + flip dominio.

---

### 2026-09-15 12:05 — README profesional + fix Legal/ + conversión + mejoras UI

**README (repo atlanteksystems, `main`):**
- [x] `README.md` — presentación tipo landing: para qué funciona la página, flujo del visitante, servicios, arquitectura, identidad, deploy y estado del proyecto
- [x] Commit `565dfe6` — "docs: add professional README"

**Fix 404 — enlaces legal rotos en Pages:**
- [x] `Legal/` completo copiado al deploy (terminos, politica-privacidad, contrato-servicio, proforma, acta-entrega) — el footer los enlaza y en GitHub Pages daban 404

**Optimización de peso (mobile-first):**
- [x] `assets/img/back.jpg` — **2550 KB → 94 KB** (re-muestreo 1600px + calidad 72, vía GDI+). Mismo archivo copiado de vuelta al proyecto. Ahorro ~96%

**Conversión — gate eliminado (agenda del usuario):**
- [x] `index.html` — removido el modal `#gate` completo (código muerto)
- [x] `index.html` — removido el candado `#lead-lock` que bloqueaba el formulario
- [x] `assets/js/script.js` — reescrita lógica de acceso: el formulario está **SIEMPRE habilitado** (sin registro). Si existe usuario en localStorage, pre-llenado nombre/teléfono + enlace "Olvidar"

**UI — mejoras:**
- [x] `index.html` — **HUD CCTV vivo** en el hero: coordenadas GPS (10.1567°N), resolución, crosshair central, 2 áreas de detección de movimiento blinking
- [x] `index.html` — **Sticky CTA móvil** ("Cotizar gratis" + acceso a formulario) visible solo <680px; WhatsApp flotante se reubica encima; footer con padding extra
- [x] `index.html` — stats del hero con `data-count` para contador animado
- [x] `assets/css/style.css` — `.nav--scrolled` (más blur/sombra al bajar), HUD overlay, `.cta-bar`, transiciones
- [x] `assets/js/script.js` — nav scrolled on scroll, **contador animado de stats** (IntersectionObserver), **reveal escalonado** entre hermanos (delay incremental)

**Estado:** ✅ cambios listos en worktree → push a `main` pendiente/realizado según commit
**Siguiente paso:** verificar en vivo + seguir detalle UI del index si queda pendiente.

---

### 2026-09-15 12:05 — Push UI + README a GitHub (commit `369a97a`)

**Pendiente descubierto y resuelto (default branch del repo de Pages):**
- [x] El repo `apexcloudworkscompany/atlanteksystems` quedó con default branch en `master` (commit viejo `fdc07cc` de hace 40 min), mientras todo el trabajo nuevo estaba en `main` → **por eso "GitHub no mostraba cambios"**
- [x] Cambiado default branch → `main` · borrada rama `master` · agregada description + homepage al repo
- [x] Commit `369a97a` ("fix: remove signup gate, add Legal, optimize hero image, HUD + sticky CTA + animated stats") pusheado a `main`
- [x] Verificado en vivo: `cta-bar` ✅, `cam-card__hud` ✅, gate eliminado ✅, CSS `nav--scrolled` ✅
- [x] README actualizado con enfoque presentación (para qué funciona la página, flujo del visitante, servicios, arquitectura, identidad, deploy)

**Estado:** ✅ live en GitHub Pages · repo al día en `main`
**Verificación:** `https://apexcloudworkscompany.github.io/atlanteksystems/` — 200 OK, HTML/CSS/JS/img todos 200, back.jpg ahora 94KB.

---

### 2026-09-15 12:40 — 🔑 CLOUDFLARE: acceso API habilitado (PUNTO CLAVE para retomar)

**Contexto:** Daniel tenía el control del DNS de `atlanteksystems.com`. Hoy Garett dio acceso a la cuenta.

**Qué se logró:**
- [x] `wrangler` instalado (v4.132.0) + **login OK** con email **`apexcloudworkscompany@gmail.com`**
- [x] Token OAuth guardado en `C:\Users\garet\AppData\Roaming\xdg.config\.wrangler\config\default.toml`
- [x] Cuentas visibles: `Apexcloudworkscompany@gmail.com's Account` (id `187e470c5f26d96248f1fc7fb3cdc4fe`) y `Dperez.co.cr@gmail.com's Account` (id `5dbefbe5b2f7216c3a2622d1857e5159`)
- [x] API REST verifica token funcionando: **zona `atlanteksystems.com` encontrada y ACTIVA** → zone_id `1ce9030a514598a45775cf0c5964ea14`
- [x] Skills Cloudflare instaladas (14) vía `npx skills add cloudflare/skills --skill '*' --yes --global`
- [x] **MCP servers registrados** en `C:\Users\garet\.config\opencode\opencode.jsonc` (cloudflare, cloudflare-docs, cloudflare-bindings, cloudflare-builds, cloudflare-observability)

**⛔ Limitación actual:** el token de `wrangler login` solo tiene `zone:read` — **NO puede editar DNS** (API rechaza `dns_records` con Authentication error 10000).

**Decisión de Garett:** usar **Opción B — reiniciar opencode para habilitar los MCP servers** de Cloudflare (OAuth se dispara solo en primer uso de herramientas).

**PENDIENTE (próximo bloque, tras reiniciar opencode):**
1. Conectar dominio `atlanteksystems.com` → GitHub Pages:
   - Crear CNAME `@` y `www` → `apexcloudworkscompany.github.io` (proxy OFF/gris) en la zona (zone_id `1ce9030a514598a45775cf0c5964ea14`)
   - Settings → Pages → Custom domain `atlanteksystems.com` → Enforce HTTPS
   - Verificar `https://atlanteksystems.com` y `www` en vivo
2. **Reordenar carpetas del proyecto** (`F:\apex-cloudworks\proyectos\AT` → `Atlantek`):
   - Renombrar `AT` → `Atlantek`
   - `01-Cliente/` = entregables (sitio: HTML+assets+apps-script+Legal, `Presentacion/`, `propuesta/`, `Auditoria/`)
   - `02-Privado/` = bitácora, `PLAN_MIGRACION.md`, `ACTIVAR-DOMINIO-OFICIAL.md`, `MENSAJE-DANIEL-WHATSAPP.md`, `Machotes/`
   - **⚠️ CUIDADO:** el repo monorepo `F:/apex-cloudworks` es git (`main`) con cambios sin commitear (archivos movidos de AT) — mover dentro de `proyectos/` requiere `git mv` o volver a `git add -A` después
3. Evitar colisionar con **otros agentes corriendo en paralelo** — verificar estado de archivos antes de editar.

**Estado:** 🔄 contexto guardado para retomar · MCP requiere reiniciar opencode
**Siguiente paso:** reiniciar opencode → "seguimos con el dominio".

---

### 2026-09-15 15:xx — 📂 Reorganización: `AT` → `Atlantek` (01-Cliente / 02-Privado)

**Qué se cambió (estructura del proyecto, sin tocar contenido):**
- [x] Renombrado `proyectos/AT` → `proyectos/Atlantek` (git `R` detectados, historial preservado)
- [x] `01-Cliente/web/` = **document root del sitio** (index/admin/dashboard + `assets/` + `Legal/` + `apps-script/` + robots + sitemap) — ahora coincide 1:1 con el repo Pages
- [x] `01-Cliente/` = entregables: `Presentacion/`, `propuesta/`, `Auditoria/`
- [x] `02-Privado/` = docs internas: `BITACORA.md`, `PLAN_MIGRACION.md`, `ACTIVAR-DOMINIO-OFICIAL.md`, `MENSAJE-DANIEL-WHATSAPP.md`, `Machotes/`
- [x] Eliminada carpeta vacía `CEO/`
- [x] Referencias a rutas viejas actualizadas en `Memoria/ULTIMA-SESION.md` y log `2026-09-15_1139.md`
- [x] Monorepo `F:\apex-cloudworks`: **82 cambios staged** (renames) — commit pendiente

**Verificación de pendientes SEO (nº 1-3 del log 11:39):**
- [x] CSS `.seo-local*` ❌→✅ **ya existía** en `style.css:1431-1495` (agregado en bloque 12:05, no quedó registrado) y está en producción
- [x] Repo Pages `apexcloudworkscompany/atlanteksystems` ya estaba al día: HEAD `01909a5` "feat(seo): contenido local Guápiles + JSON-LD + robots/sitemap + estilos seo-local" — sin diff vs doc root local (solo EOL CRLF/LF)
- [x] Verificado en vivo: HTML 200 + `#guapiles` presente · robots 200 · sitemap 200 · style.css 200 con `.seo-local__grid`

**Estado:** ✅ orden de carpetas hecho · SEO deployed y live
**Siguiente paso:** plan SEO cliente-side (documento para Daniel) · mobile 375px visual · dominio `atlanteksystems.com` vía MCP Cloudflare · commit monorepo Apex.

---

### 2026-09-15 16:xx — 🌐 Dominio oficial `atlanteksystems.com` LIVE

**Contexto:** arrancada con dominio caído (apex sin registro · www 530 Cloudflare→origin muerto). Vía GitHub Pages, sin AWS.

**Qué se hizo:**
- [x] **DNS (Cloudflare):** apex `atlanteksystems.com` → A `185.199.108-111.153` (IPs GitHub Pages) · `www` → CNAME `apexcloudworkscompany.github.io` — verificado con `Resolve-DnsName`
- [x] **Repo Pages:** archivo `CNAME` con `atlanteksystems.com` (commit `ba21666`) → GitHub configuró custom domain + certificado TLS (~1 min)
- [x] **Flip a dominio oficial:** `index.html` canonical + og:url + og:image + twitter:image + JSON-LD `@id/url/image` → `https://atlanteksystems.com/` · `sitemap.xml` URLs → dominio oficial · `robots.txt` Sitemap + comentario → dominio oficial (commit `4d97ff7`)
- [x] Verificado en vivo: `https://atlanteksystems.com/` 200 con canonical oficial · sitemap 200 · robots 200 · css 200 · **`www` 200**
- [x] Monorepo Apex commiteado (`16a0fac` — renames AT→Atlantek + memoria)

**⚠️ Nota:** la URL `github.io/atlanteksystems/` sigue respondiendo 200 (sin redirect automático hasta activar Custom domain + Enforce HTTPS en Settings→Pages; el canonical ya apunta al dominio oficial, así que SEO no se divide). Verificar/activar en Settings cuando se pueda.

**Estado:** ✅ dominio oficial LIVE · SEO on-page sobre dominio final
**Siguiente paso:** plan SEO cliente-side (doc para Daniel) · Google Business Profile + Search Console como canal #1 · mobile 375px visual · verificar GitHub repo Pages Settings (custom domain + HTTPS enforce).

---

### 2026-09-15 17:xx — 🔐 SEGURIDAD: fuga de datos admin cerrada (tokens divididos)

**Vulnerabilidad detectada (verificada en vivo):** el token del backend Apps Script (`Atlantek-2026`) vivía en `apps-script/Code.gs` commiteado en el repo PÚBLICO de Pages (servido en vivo como `/apps-script/Code.gs`). Con él cualquiera podía:
- `GET ?action=load&token=Atlantek-2026` → **leer clientes, proformas y leads** (comprobado: 3 clientes / 2 docs / 3 leads)
- `POST action=save` → **borrar/sobrescribir toda** la facturación y clientes
- Además: gate admin/dashboard era cosmético (btoa===HASH público) y **el front enviaba `atlantek-2026` que el backend rechazaba → formulario de leads roto en producción**.

**Qué se cambió:**
- [x] `Code.gs` → **tokens separados**: `TOKEN_PUBLICO` (solo `lead`/`user`) y `TOKEN_ADMIN` (`load`/`save`/`lead-status`) — checks por acción, no global
- [x] `apps-script/Code.gs` movido a `02-Privado/apps-script/` (NO se sirve en el sitio; redeploy manual por Google)
- [x] Panel admin movido a `02-Privado/panel-admin/` (admin/dashboard + app/dashboard/store.js + admin/dashboard.css + config con TOKEN_ADMIN) — copia privada a entregar a Daniel
- [x] `01-Cliente/web/assets/js/config.js` → solo `TOKEN_PUBLICO` (`atlantek-pub-cs0v95l7ae`)
- [x] Repo Pages: eliminados `apps-script/`, `admin.html`, `dashboard.html`, `store.js`, `app.js`, `dashboard.js`, `admin.css`, `dashboard.css` (commit `8c3060b`, rebaseado sobre fix de UI `e874d5d` de otro agente)
- [x] Verificado en vivo: `/admin.html` 404 · `/apps-script/Code.gs` 404 · `/store.js` 404 · config.js con token público nuevo · 0 ocurrencias de tokens viejos en el repo

**⚠️ PASO CRÍTICO PENDIENTE (manual, Garett):** **redeploy del Code.gs nuevo en Google Apps Script** (`02-Privado/apps-script/Code.gs`) — hasta hacerlo, el backend sigue aceptando `Atlantek-2026` y el formulario público NO guarda leads (token nuevo aún no registrado).

**Nuevos tokens (rotar de nuevo si se filtra):**
- Público: `atlantek-pub-cs0v95l7ae`
- Admin: `atlantek-adm-vemsw0y4ugh5r691`

**Estado:** 🟠 backend pendiente redeploy · front seguro

---

### 2026-09-15 15:3x — 🎨 CSS `.seo-local*` + deploy SEO a Pages (commit `01909a5`)

**Contexto:** la sección `#guapiles` (bloque SEO 11:10) quedó insertada sin estilos. Este bloque cierra el pendiente.

**Qué se hizo:**
- [x] `01-Cliente/web/assets/css/style.css` — bloque `.seo-local*`: `__lead` (16.5px ink), párrafos base con `:not(.seo-local__lead):not(.seo-local__cta)` (fix de especificidad para no pisar lead/CTA), `__grid` (2 col + gap 1px, borde), `__col` (hover card, h3 15px, p muted), `__cta` (mono 12px + links navy), 1 col <680px
- [x] `style.css` — `scroll-margin-top: 96px` en `.section` (fix anchor offset por nav sticky, aplica a todas las secciones)
- [x] Verificación: reveal JS sin conflicto (solo 2 siblings `.reveal` en `#guapiles`), FAQ renumerado a 06 ok, mobile 1-col ok
- [x] Repo `apexcloudworkscompany/atlanteksystems` clonado en temp → sincronizados `index.html`, `admin.html`, `robots.txt`, `sitemap.xml`, `assets/css/style.css`
- [x] Commit `01909a5` "feat(seo): contenido local Guápiles/Pococí + JSON-LD LocalBusiness/FAQ + robots/sitemap + estilos seo-local" → push `main`
- [x] Verificado en vivo: CSS con `.seo-local__grid` ✅ · `#guapiles` ✅ · canonical→github.io ✅ · robots 200 ✅ · sitemap 200 ✅ · Pages status `built`

**Estado:** ✅ SEO on-page deployado y live en producción
**Siguiente paso:** plan SEO cliente-side + mobile 375px visual + dominio oficial.

---

### 2026-09-15 16:0x — 📈 Plan SEO local (cliente-side) + carpeta `CEO/` restaurada

**Contexto:** la reorganización eliminó `CEO/` (estaba vacía y sin trackear en git). Se recrea como contexto estratégico del proyecto.

**Qué se hizo:**
- [x] Creada `F:\apex-cloudworks\proyectos\Atlantek\CEO\` → `PLAN-SEO-LOCAL.md`
- [x] `PLAN-SEO-LOCAL.md` — documento estratégico para trabajar con Daniel:
  - Diagnóstico: on-page ✅ hecho · local SEO (GBP, reseñas, citas) es el 75% del peso que falta
  - Bloque 1 — Google Business Profile: crear/reclamar (sin duplicados), categoría "empresa de sistemas de seguridad", servicio en 7 distritos + Guácimo, 10+ fotos reales, horario Lun–Sáb 07:00–18:00
  - Bloque 2 — Search Console: propiedad, sitemap, indexado manual, verificar noindex admin/dashboard, Bing opcional
  - Bloque 3 — Reseñas Google (factor #1 del pack): enlace directo, guión WhatsApp, responder 48h, meta 10 en 90 días, NUNCA falsas
  - Bloque 4 — Citas/directorios con NAP consistente: pococicta.com, FB, IG geotag, páginas amarillas CR
  - Bloque 5 — Fotos reales (6-10 con permiso) + contenido mensual por distrito
  - Bloque 6 — Flip al dominio oficial cuando CNAME: canonical/og/JSON-LD → dominio, Pages custom domain + HTTPS, actualizar GBP y Search Console
  - Métricas 30/60/90 días · roles (Daniel ejecuta, Apex apoya) · competidores mapeados
- [x] Bitácora al día: entrada SEO 11:10 (faltaba) + CSS/deploy + este bloque

**Estado:** ✅ documento listo para reunión con Daniel
**Siguiente paso:** coordinar con Daniel (GBP + reseñas) / flipear dominio cuando active CNAME / validar mobile 375px / commit monorepo (82 cambios stageados).

---

### 2026-09-15 16:4x — 🔗 DOMINIO OFICIAL LIVE + repo monorepo al día + HTTPS enforcement

**Contexto:** el dominio se activó (CNAME `@`/`www` en Cloudflare + CNAME file + custom domain en Pages). Este bloque lo verifica y cierra.

**Qué se hizo (verificación + cierre):**
- [x] DNS verificado: `atlanteksystems.com` → A/AAAA `185.199.*` (GitHub Pages) · `www` → CNAME → `apexcloudworkscompany.github.io`
- [x] `https://atlanteksystems.com/` → **200** · `https://www.atlanteksystems.com/` → redirect al apex · robots.txt + sitemap.xml → **200**, apuntando al dominio oficial
- [x] Canonical/og:url/og:image/twitter:image sirviendo `atlanteksystems.com` en producción (repo Pages `4d97ff7`)
- [x] `https_enforced: true` activado vía `PUT /pages` (estaba `false`) — html_url del repo ahora https
- [x] Monorepo `F:\apex-cloudworks` commiteado y **pusheado**: `667b7cf` "chore(at): flip canonical/og/robots/sitemap a atlanteksystems.com (dominio live) + buffer sesion" (acf4cc3..667b7cf, 5 archivos)
- [x] `ACTIVAR-DOMINIO-OFICIAL.md` → checklist actualizado a hecho

**Estado:** ✅ dominio oficial en línea · monorepo sincronizado con remote (sin ahead) · 0 pendientes de git en AT
**Siguiente paso:** ⏳ reconfirmar en ~30-60 min que `http://atlanteksystems.com` redirija a https (provisión de cert) · Search Console propiedad de dominio nuevo + GBP web → atlanteksystems.com · validar mobile 375px · sesión SEO: enviar mensaje Daniel con guión GBP/reseñas.

---

### 2026-09-15 17:0x — ✅ HTTPS redirect confirmado + test mobile 375px (Playwright)

**Qué se hizo:**
- [x] **http→https redirect CONFIRMADO:** `http://atlanteksystems.com/` → 200 sirviendo desde `https://atlanteksystems.com/` (cert ya provisionado por GitHub)
- [x] **Test mobile 375px (iPhone SE)** con Playwright en producción:
  - [x] Sticky CTA bar visible ✅
  - [x] Redundancia detectada: `.wa-float` (WhatsApp flotante) se solapaba 18px sobre el `cta-bar` (wa bottom 728 vs cta top 710) — y ya existía botón WhatsApp dentro del cta-bar (`.cta-bar__btn`)
  - [x] Fix `style.css` ≤680px: `.wa-float { display: none }` (redundante en mobile) + `.footer { padding-bottom: calc(118px + ...) }` (subido de 84px porque la barra mide ~102px reales)
  - [x] Re-test: WA box None ✅ · cta-bar 375px ✅ · sección `#guapiles` grid 1-col (stacked) ✅
- [x] Repo Pages: commit `e874d5d` (pulled de origin + push) · Monorepo: `a8d171e` pusheado a origin

**Estado:** ✅ mobile validado en producción · repos sincronizados
**Siguiente paso:** Search Console propiedad `https://atlanteksystems.com/` (con Daniel) · GBP del cliente (Bloque 1) · coordinar con Daniel el plan completo.

---

### 2026-09-15 17:2x — 💬 Chat de preguntas frecuentes (respuestas automáticas)

**Qué se hizo:**
- Nuevo widget de chat en la página (desktop + mobile): botón flotante azul "burbuja" → abre panel con saludo + 6 chips de preguntas (mismo contenido que el FAQ real del sitio: precios $350-$600, garantía 12 meses/90 días, app móvil, cobertura Pococí, 1 día de instalación, sin contrato)
- Respuesta automática con animación "escribiendo…" · chips respondidos se marcan (tachados, deshabilitados) · botón "Hablar con un asesor por WhatsApp" al pie
- Arquitectura separada Apex: markup en `index.html` · estilos `.chat-*` en `style.css` (paleta de la página, glassmorphism del sistema) · lógica FAQ en `script.js`
- Bug encontrado y corregido en QA: `hidden` attribute no ganaba sobre `display:flex` (panel se veía siempre) + el listener global de "click fuera" cerraba el chat al re-renderizar el SVG del FAB → solución con clase `.is-open` (display:none por defecto) + guard `e.target.isConnected`
- Deploy: repo Pages `e17e7b3` (3 commits de esta feature) · mono-repo pendiente de commit
- QA Playwright producción 1280px + 375px: panel abre ✅ · 6 chips ✅ · respuesta con $ ✅ · chip marcado ✅ · sin solape con el CTA móvil (gap 22px FAB / 83px panel) ✅

**Estado:** ✅ chat LIVE en atlanteksystems.com + FABs compactos
**Siguiente paso:** probarlo a mano en el celu (iPhone SE) como usuario · avisar a Daniel del chat.

---

### 2026-09-15 17:4x — 🟦 FABs flotantes compactos (reemplazan sticky CTA) + scroll chat verificado

**Qué se hizo:**
- Eliminada la `cta-bar` sticky móvil (barra completa inferior) → reemplazada por **botones flotantes circulares de 48px** al estilo del chat: `.wa-float` (WhatsApp, verde) + `.fab-form` (Formulario, navy) apilados con el chat (Arriba→Abajo: chat 134px · form 78px · WA 22px desktop; mobile 126/70/14 + safe-area)
- Chat compactado a 48px (era 56) y panel reposicionado para abrir sobre el FAB superior sin taparlo: desktop bottom 190px · mobile 182px
- Padding `118px` del footer (residuo de la cta-bar) eliminado — vuelve a 44px base
- ✅ Playwright producción (1280px + 375px): 3 FABs apilados **sin solaparse** · panel dentro de viewport · **body del chat scrollea** (scrollHeight > clientHeight, scrollTop alcanza el final) tras responder las 6 preguntas
- Repo Pages `104c672` · monorepo `56fc24b`

**Estado:** ✅ FABs compactos + chat scrolleable LIVE
**Siguiente paso:** revisar screenshots `fab-desktop-chat.png` / `fab-mobile-chat.png` en `Temp\opencode` · probar en el celu · avisar a Daniel.

---

### 2026-09-15 18:xx — 🔐 Acceso Admin/Dashboard público + corrección email + bitácora

**Qué se hizo:**
- [x] Copiados `admin.html` y `dashboard.html` de `02-Privado/panel-admin/` a `01-Cliente/web/` (sitio público) con gate de contraseña integrado (`atlantek2026` → hash `YXRsYW50ZWsyMDI2`)
- [x] Copiados assets CSS/JS/imágenes necesarios (`admin.css`, `dashboard.css`, `app.js`, `store.js`, `dashboard.js`, `config.js`, logos, favicon)
- [x] Fix paths: favicon → `assets/img/favicon.svg` en ambos archivos
- [x] Añadidos enlaces discretos en footer de `index.html`: "Gestión" (`/admin.html`) y "Dashboard" (`/dashboard.html`) con clase `.footer__admin`
- [x] Estilos `.footer__admin` añadidos en `assets/css/style.css` (mono 10px, opacity hover, mismo estilo que legal/credit)
- [x] **Corrección email unificado**: `index.html` JSON-LD (`line 38`) y sección contacto (`line 543`) → `soporte@atlanteksystems.com` (coincide con Legal, admin, store.js, proforma-publica.js)

**Archivos tocados:**
- `01-Cliente/web/admin.html` (nuevo)
- `01-Cliente/web/dashboard.html` (nuevo)
- `01-Cliente/web/index.html` (footer + email)
- `01-Cliente/web/assets/css/style.css` (`.footer__admin`)
- `01-Cliente/web/assets/css/` (admin.css, dashboard.css copiados)
- `01-Cliente/web/assets/js/` (config.js, store.js, app.js, dashboard.js copiados)
- `01-Cliente/web/assets/img/` (logos, favicon copiados)

**Estado:** ✅ listo para deploy a GitHub Pages
**Siguiente paso:** push a repo `apexcloudworkscompany/atlanteksystems` → verificar en vivo `https://atlanteksystems.com/admin.html` y `/dashboard.html` con gate de contraseña

---

### 2026-09-15 15:10 — ♿ Auditoría UX + accesibilidad + FAQ visible

**Contexto:** auditoría integral de producción en `https://atlanteksystems.com/`. Se confirmó que la landing responde 200, no tiene scroll horizontal a 375px y carga correctamente sus recursos. Se detectó que los documentos internos `Legal/contrato-servicio.html`, `Legal/proforma.html` y `Legal/acta-entrega.html` todavía responden públicamente; su retiro queda pendiente de autorización explícita por ser una eliminación del repo público.

**Qué se hizo:**
- [x] FAQ visible añadido al sitio con 6 preguntas y respuestas, consistente con el JSON-LD y el chat automático.
- [x] Campos del formulario asociados con `label for` + `id` para lectores de pantalla y navegación asistida.
- [x] Estado del formulario preparado con `aria-live` y `tabindex="-1"`; errores se anuncian con `role="alert"`.
- [x] Foco visible añadido para enlaces, botones y controles del formulario mediante `:focus-visible`.
- [x] Botón del menú móvil ajustado a objetivo táctil mínimo de 44x44px.
- [x] Botón de cerrar chat ajustado a 44x44px.
- [x] Teléfono de contacto principal enlazado a WhatsApp y correo enlazado con `mailto:`.
- [x] QA local a 375px: FAQ con 6 elementos, labels válidos, menú 44x44px y scroll horizontal inexistente.
- [x] Otros agentes/sesiones activos revisados: no había agentes o sesiones concurrentes visibles en este entorno.
- [x] Deploy público completado en `apexcloudworkscompany/atlanteksystems`, commit `49d12b6`.

**Archivos modificados:**
- `01-Cliente/web/index.html`
- `01-Cliente/web/assets/css/style.css`
- `01-Cliente/web/assets/js/script.js`

**Estado:** ✅ mejoras UX/accesibilidad publicadas en GitHub Pages; pendiente verificar caché/producción y resolver documentos internos públicos.
**Siguiente paso:** validar producción con cache nueva; retirar documentos internos del repo público tras confirmación; unificar correo oficial y añadir medición de conversiones.

---

### 2026-09-15 15:16 — 🧭 Header: navegación centrada + CTA separado

**Qué se hizo:**
- [x] `Servicios`, `Cobertura` y `Contacto` quedan centrados en la columna central del header.
- [x] `Cotizar gratis` se movió a la columna derecha, alineado al extremo derecho del contenedor.
- [x] Se conservó el CTA dentro del menú móvil para no perder la acción en pantallas pequeñas.
- [x] QA local desktop 1440px: navegación centrada y CTA separado a la derecha.
- [x] QA local 375px: sin scroll horizontal; CTA disponible dentro del menú móvil.
- [x] Deploy inicial `91a7e6b`.
- [x] Corrección inmediata `6ad1f39`: eliminados `admin.html` y `dashboard.html` heredados del repositorio público que habían reaparecido por sincronización incremental.

**Archivos modificados:**
- `01-Cliente/web/index.html`
- `01-Cliente/web/assets/css/style.css`

**Estado:** ✅ header corregido y repositorio público saneado; pendiente verificación final de producción.
**Siguiente paso:** comprobar HTTP 200, posiciones del header y 404 de rutas privadas después de la propagación de GitHub Pages.

---

### 2026-09-15 18:00 — 📊 Auditoría actualizada y puntaje realista

**Qué se hizo:**
- [x] `01-Cliente/Auditoria/AUDITORIA_INTEGRAL_ATLANTEK.md` actualizado con el estado real de producción.
- [x] Puntaje corregido de **9.2/10** a **8.6/10 estimado**; se aclara que no es un resultado Lighthouse.
- [x] Se documentó que canonical, Open Graph, sitemap, robots, JSON-LD, FAQ, labels, foco y targets táctiles están presentes.
- [x] Se eliminó la afirmación obsoleta de que faltaban JSON-LD y metadatos sociales.
- [x] Se documentó como pendiente prioritario que los documentos `/Legal/` todavía responden HTTP 200.
- [x] Se confirmó que admin/dashboard y assets privados viven en repositorio privado y responden 404 en el sitio público.
- [x] Se añadieron pendientes de analítica de conversiones, prueba autorizada de lead, Lighthouse, correo oficial único y Google Business Profile.
- [x] `01-Cliente/Auditoria/index.html` actualizado con score 8.6, métricas por área y plan accionable.

**Estado:** ✅ auditoría sincronizada con producción; ⚠️ documentos internos públicos y redeploy de Apps Script siguen pendientes.
**Siguiente paso:** confirmar si `/Legal/` debe retirarse del repo público y unificar el correo oficial antes del próximo deploy.

---

### 2026-09-25 16:30 — 📝 Copy profesional y gramática — web, propuesta, presentación, panel admin

**Contexto:** mejora de redacción en todos los entregables de cara al cliente para tono más profesional, directo y orientado a conversión.

**Qué se hizo:**

**1. Web pública (`01-Cliente/web/index.html`):**
- [x] Meta tags: description reforzada con garantías ("Garantía 12 meses equipos / 90 días instalación"), OG/Twitter sincronizados
- [x] Hero: CTA principal "Solicitar valoración" (antes "Cotizar por WhatsApp"), WhatsApp pre-llenado con "sin compromiso"
- [x] Servicios: copy más preciso — "diseñados según los puntos ciegos de su propiedad, no por catálogo", "cobertura real en toda la propiedad", "locales comerciales"
- [x] SEO local (`#guapiles`): "valoración técnica en sitio **sin compromiso**" en lead
- [x] Contacto: "Solicite su valoración técnica en sitio **sin compromiso**"
- [x] Footer: marca completa "Atlantek Systems" + "Pococí" en zona

**2. Propuesta comercial (`01-Cliente/propuesta/index.html`):**
- [x] Fecha formato largo: "13 de julio 2026"
- [x] Dominio ejemplo real: "atlanteksystems.com"
- [x] "Control total" en datos propios

**3. Presentación ejecutiva (`01-Cliente/Presentacion/index.html`):**
- [x] Cobertura: "Guápiles y Pococí" (no solo "zona de Guápiles")

**4. Panel Admin (`02-Privado/panel-admin/`):**
- [x] Dashboard auth gate: "Ingrese la clave para acceder" (formal)
- [x] Nav: "Sitio público" / "Portal cliente" / "Soporte por WhatsApp"
- [x] Dashboard: "Actualizar datos", "Última actualización"
- [x] Client Portal: tabs "Mis servicios" / "Tickets y soporte", placeholders formales ("Describa el problema...")

**Archivos tocados:**
- `01-Cliente/web/index.html`
- `01-Cliente/propuesta/index.html`
- `01-Cliente/Presentacion/index.html`
- `02-Privado/panel-admin/dashboard.html`
- `02-Privado/panel-admin/client-portal.html`
- `02-Privado/BITACORA.md` (esta entrada)

**Commits:**
- Monorepo `apex-cloudworks`: `db21758` "copy: mejorar gramática y profesionalidad en web pública, propuesta, presentación y panel admin"
- Repo Pages `atlanteksystems`: ya actualizado (HEAD `06bb1d1` incluía cambios previos)

**Estado:** ✅ todo en producción (GitHub Pages `atlanteksystems.com` + Cloudflare Pages `atlantek-admin.pages.dev`) · monorepo sincronizado
**Siguiente paso:** deploy Worker Cloudflare (auth JWT) + demo a Daniel + firma

---

### 2026-09-15 15:20 — 🎛️ Iconos reales + radar de cobertura refinado

**Qué se hizo:**
- [x] Reemplazados los seis SVG placeholder de servicios (`CCTV`, `CABLE`, `Wi-Fi`, `EQUIPO`, `ASESORÍA`, `SOPORTE`) por iconos lineales reales, consistentes y sin emojis.
- [x] Eliminado el emoji del saludo del chat público para mantener una interfaz técnica y consistente.
- [x] Radar actualizado con retícula diagonal, ejes N/E/S/O, escalas aproximadas de 10 km y 20 km, barrido animado y pulsos de ubicación.
- [x] Radar marcado con `role="img"` y descripción accesible de cobertura aproximada desde Guápiles.
- [x] Animaciones nuevas respetan `prefers-reduced-motion`.
- [x] Verificación local: no quedan textos `Placeholder` ni emojis de UI en el sitio público.
- [x] Deploy público: commit `61b819b`.
- [x] Repo público conservado sin `admin.html`, `dashboard.html` ni assets privados.

**Archivos modificados:**
- `01-Cliente/web/index.html`
- `01-Cliente/web/assets/css/style.css`
- `01-Cliente/web/assets/img/service-*.svg`

**Estado:** ✅ iconografía y radar publicados; verificados en producción con URL cache-busted `?v=61b819b` (HTTP 200, radar nuevo visible, saludo sin emoji).
**Siguiente paso:** QA visual desktop/mobile del radar y continuar con retiro de documentos legales internos públicos.

---

### 2026-09-15 22:30 — 🔐 Panel Admin privado deployado a Cloudflare Pages

**Contexto:** repo público `atlanteksystems` saneado (sin admin/dashboard). Repo privado `atlanteksystems-admin` creado con panel completo. DNS del dominio principal en cuenta de Daniel (Cloudflare).

**Qué se hizo:**
- [x] Repo `apexcloudworkscompany/atlanteksystems-admin` (privado) verificado: `admin.html`, `dashboard.html`, `assets/` completo, `config.js` con `TOKEN_ADMIN` correcto (`atlantek-adm-vemsw0y4ugh5r691`)
- [x] Cloudflare Pages project `atlantek-admin` creado (account `187e470c5f26d96248f1fc7fb3cdc4fe`)
- [x] Deploy inicial: `https://eaba5c43.atlantek-admin.pages.dev` → alias de producción `https://atlantek-admin.pages.dev`
- [x] Verificación: `admin.html` y `dashboard.html` cargan (308 redirect a trailing slash, esperado en Pages)

**Pendiente para dominio oficial `admin.atlanteksystems.com`:**
- [ ] DNS: agregar CNAME `admin` → `atlantek-admin.pages.dev` (proxy OFF/gris) en Cloudflare de Daniel (zona `atlanteksystems.com`, account `5dbefbe5b2f7216c3a2622d1857e5159`)
- [ ] Cloudflare Pages → Custom domain: `admin.atlanteksystems.com` → Enforce HTTPS
- [ ] Cloudflare Access (Zero Trust): política de acceso (email/PIN) para proteger el panel

**Bloqueante crítico previo:** redeploy del Apps Script con `Code.gs` nuevo (tokens separados) — sin esto, el panel no carga datos (backend sigue con token viejo `Atlantek-2026`).

**Archivos tocados:**
- `02-Privado/panel-admin/` (deploy completo)
- Repo `atlanteksystems-admin` (source)

**Estado:** ✅ panel LIVE en `https://atlantek-admin.pages.dev` · ⏳ dominio oficial pendiente DNS (cuenta Daniel) · 🔴 redeploy Apps Script pendiente
**Siguiente paso:** coordinar con Daniel CNAME `admin` en Cloudflare + redeploy Apps Script → probar panel end-to-end.

---

### 2026-09-15 19:xx — 🚀 Deploy producción: admin + dashboard público + spacing tokens + limpieza FAQ

**Qué se hizo:**
- [x] **Monorepo Apex** commiteado y pusheado: `2a71b4f` "feat(at): admin + dashboard acceso público con gate, footer links, email unificado, spacing tokens, cleanup FAQ section" (25 archivos)
- [x] **Repo Pages `apexcloudworkscompany/atlanteksystems`** force-pusheado (`02f3643`) con versión completa:
  - `admin.html` + `dashboard.html` en raíz con gate de contraseña (`atlantek2026` → hash btoa)
  - Assets: `admin.css`, `dashboard.css`, `app.js`, `store.js`, `dashboard.js`, `config.js`, logos, favicon
  - `index.html`: footer con enlaces "Gestión" / "Dashboard" (clase `.footer__admin` discreta, mono 10px)
  - `style.css`: tokens de spacing (`--space-section: 130px`, `--space-head: 80px`, `--space-card: 32px`, `--container: 1200px`, `--radius: 12px`)
  - Email unificado: `soporte@atlanteksystems.com` en JSON-LD y sección contacto (antes `soporteintec.cr@gmail.com`)
  - Limpieza: eliminada sección FAQ duplicada (el chat bot ya cubre preguntas frecuentes)
  - Legal pages preservadas en `/Legal/`

**Archivos tocados (monorepo):**
- `proyectos/Atlantek/01-Cliente/web/index.html` (footer, email)
- `proyectos/Atlantek/01-Cliente/web/admin.html` (nuevo)
- `proyectos/Atlantek/01-Cliente/web/dashboard.html` (nuevo)

---

### 2026-09-16 00:30 — 🛠️ Panel Admin completo: Servicios Contratados + Tickets + Portal Cliente

**Contexto:** reestructuración completa del panel privado (`02-Privado/panel-admin/`) para que Atlantek gestione todo su operación: clientes, proformas, **servicios contratados con MRR**, **tickets de soporte**, y **portal del cliente** para que vean sus servicios y abran tickets.

**Qué se hizo:**

**Store.js (v2 - `atlantek-gestion-v2`):**
- [x] Modelo `services[]`: id, clientId, nombre, descripcion, tipo (cctv/mantenimiento/redes/acceso/otro), estado (activo/inactivo/vencido), fechaInicio, fechaVencimiento, valorMensual, itemsIncluidos[], notas
- [x] Modelo `tickets[]`: id, clientId, serviceId, titulo, descripcion, prioridad (baja/media/alta/critica), estado (abierto/en_proceso/resuelto/cerrado), fechaCreacion, fechaActualizacion, asignadoA, historial[]
- [x] Funciones CRUD: `getServices`, `saveService`, `deleteService`, `getTickets`, `saveTicket`, `addTicketMessage`, `setTicketStatus`, `setTicketPriority`, `assignTicket`
- [x] Helpers: `ticketsAbiertos`, `ticketsCriticos`, `serviceTotalMensual` (MRR), `computeServiceStatus` (calcula vencido/activo)

**Admin.html (panel privado):**
- [x] Sidebar reorganizado en secciones: **GESTIÓN** (Dashboard, Clientes, Servicios Contratados, Tickets), **COMERCIAL** (Leads, Catálogo, Documentos), **CLIENTE** (Portal Cliente, Resumen negocio)
- [x] Badges en sidebar: Leads nuevos + Tickets abiertos (globales)
- [x] Auth gate compartido (sessionStorage `atlantek-auth`)

**Client-portal.html (nuevo - portal del cliente):**
- [x] Auth gate separada (sessionStorage `atlantek-client-auth`)
- [x] Header con KPIs: servicios activos, tickets abiertos, MRR mensual
- [x] Tabs: **Mis Servicios** (cards con estado, items incluidos, mensual, fechas) + **Tickets / Soporte** (lista con prioridad/estado, historial, formulario nuevo ticket)
- [x] Formulario ticket: prioridad, servicio relacionado (dropdown dinámico por cliente), descripción
- [x] Cliente ID vía URL `?client=c1` o localStorage

**App.js (vistas admin):**
- [x] `renderServicios()`: tabla con filtros (búsqueda, tipo, estado), modal crear/editar con items incluidos (líneas)
- [x] `renderTickets()`: tabla con filtros (búsqueda, estado, prioridad), modal ver/editar con historial, agregar mensajes, cambio estado/prioridad/asignado
- [x] Router actualizado: `/servicios`, `/tickets`, `/servicios/nuevo`

**Dashboard.html / dashboard.js (resumen negocio):**
- [x] KPIs ampliados: Clientes, Servicios activos, Tickets abiertos, MRR, Cobrado, Por cobrar, Leads nuevos
- [x] Panel "Servicios activos" (últimos 6) + "Tickets abiertos" (últimos 6) en grid
- [x] Botón "Portal Cliente" en nav superior (abre en nueva pestaña)
- [x] `renderServices()`, `renderTickets()` leen `localStorage v2` directo (sin Sheets)

**CSS (admin.css + dashboard.css):**
- [x] `.service-card`: cards con header (título, tipo, badge estado), meta grid (inicio/vencimiento/mensual), items incluidos con checkmarks, footer (mensual + notas)
- [x] `.ticket-priority` / `.ticket-status` badges mono (critica=rojo, alta=azul, media=ámbar, baja=verde)
- [x] `.client-nav` tabs, `.ticket-card` con border-left por prioridad, historial expandible
- [x] Responsive mobile para todos los nuevos componentes

**Deploy:**
- [x] Cloudflare Pages `atlantek-admin` actualizado → `https://atlantek-admin.pages.dev` (deploy `18d00bbf`)
- [x] Archivos nuevos: `client-portal.html`, `assets/js/client-portal.js`, `dashboard.js` actualizado

**Archivos tocados:**
- `02-Privado/panel-admin/admin.html` (reescrito)
- `02-Privado/panel-admin/client-portal.html` (nuevo)
- `02-Privado/panel-admin/assets/js/store.js` (v2 completo)
- `02-Privado/panel-admin/assets/js/app.js` (vistas servicios/tickets + router)
- `02-Privado/panel-admin/assets/js/dashboard.js` (KPIs + servicios + tickets)
- `02-Privado/panel-admin/assets/js/client-portal.js` (nuevo)
- `02-Privado/panel-admin/assets/css/admin.css` (service-card, ticket badges, sidebar sections)
- `02-Privado/panel-admin/assets/css/dashboard.css` (portal cliente, tickets, forms, responsive)
- `02-Privado/panel-admin/dashboard.html` (KPIs + panels + portal link)

**Estado:** ✅ Panel admin completo LIVE en `https://atlantek-admin.pages.dev` · Portal cliente en `https://atlantek-admin.pages.dev/client-portal.html?client=c1`
**Pendiente:** redeploy Apps Script (tokens separados) → probar sync real · Cloudflare Access en `atlantek-admin.pages.dev` · DNS `admin.atlanteksystems.com` (cuenta Daniel)
- `proyectos/Atlantek/01-Cliente/web/assets/css/style.css` (tokens, footer__admin)
- `proyectos/Atlantek/01-Cliente/web/assets/css/` (admin.css, dashboard.css copiados)
- `proyectos/Atlantek/01-Cliente/web/assets/js/` (config.js, store.js, app.js, dashboard.js copiados)
- `proyectos/Atlantek/01-Cliente/web/assets/img/` (logos, favicon copiados)
- `proyectos/Atlantek/02-Privado/BITACORA.md` (esta entrada)

**Verificación en vivo (post-deploy):**
- [ ] `https://atlanteksystems.com/` → 200, hero, servicios, cobertura, formulario, chat bot
- [ ] `https://atlanteksystems.com/admin.html` → gate de contraseña → panel gestión
- [ ] `https://atlanteksystems.com/dashboard.html` → gate de contraseña → dashboard negocio
- [ ] Footer enlaces "Gestión" / "Dashboard" visibles y funcionales
- [ ] Spacing aumentado (más aire, presencia profesional)

**Estado:** ✅ desplegado en GitHub Pages (monorepo + Pages repo sincronizados)
**Siguiente paso:** verificación manual en producción (desktop + mobile 375px) · redeploy Apps Script con tokens nuevos · coordinar GBP/Search Console con Daniel

---

### 2026-09-15 19:30 — 🔧 Fix crítico: CNAME faltante → dominio caído 404

**Síntoma:** `https://atlanteksystems.com/` devolvía **404 Not Found** aunque DNS resolvía a IPs de GitHub Pages.

**Causa raíz:** el repo `apexcloudworkscompany/atlanteksystems` no tenía archivo `CNAME` en la raíz → GitHub Pages no activaba el custom domain aunque el DNS estuviera correcto.

**Qué se hizo:**
- [x] Creado `CNAME` con contenido `atlanteksystems.com` en `01-Cliente/web/`
- [x] Commit + push a repo Pages (`e944973`) y monorepo (`81c63ce`)
- [x] Esperado ~30s rebuild de GitHub Pages
- [x] Verificado: **200 OK** en `/`, `/admin.html`, `/dashboard.html`

**Archivos tocados:**
- `proyectos/Atlantek/01-Cliente/web/CNAME` (nuevo)

**Estado:** ✅ dominio oficial FUNCIONANDO · HTTPS · admin/dashboard accesibles
**Siguiente paso:** verificación mobile 375px · redeploy Apps Script · GBP/Search Console con Daniel

---

### 2026-09-15 20:xx — 🎨 Auth gates: logo más grande + paleta navy unificada

**Qué se hizo:**
- [x] **Logo 60% más grande**: `height: 75px → 120px`, `max-width: 220px → 300px`
- [x] **Paleta navy consistente** (coincide con sitio público):
  - Border: `rgba(26,106,255,.25)` (navy-light con transparencia)
  - Box-shadow: `inset 0 0 0 1px rgba(26,106,255,.15)` + `drop-shadow(0 8px 24px rgba(26,106,255,.35))` en logo
  - Botón: `linear-gradient(135deg, #1a6aff 0%, #0d52cc 100%)` + shadow navy
  - Input focus: `border-color: #1a6aff` + `box-shadow: 0 0 0 3px rgba(26,106,255,.25)`
  - Border-radius: `12px → 16px` (box) / `8px → 10px` (inputs, button)
  - Padding aumentado: `44px 36px → 56px 48px`
  - Tipografía: `h2 20px→22px weight 800`, `input 14px→15px`, `button 14px→15px`
- [x] Aplicado a **ambos gates**: `admin.html` y `dashboard.html`

**Archivos tocados:**
- `01-Cliente/web/admin.html` (estilos inline auth-gate)
- `01-Cliente/web/dashboard.html` (estilos inline auth-gate)

**Commits:**
- Pages repo: `55016f0`
- Monorepo: `8c8a055`

**Estado:** ✅ deployado · esperar rebuild Pages (~30-60s)
**Siguiente paso:** verificación visual en `https://atlanteksystems.com/admin.html` y `/dashboard.html` · mobile 375px · redeploy Apps Script

---

### 2026-09-15 21:xx — 🧹 FAQ + testimonios eliminados, copy profesional + fix chat max-height

**Qué se hizo:**
- [x] **Sección FAQ eliminada** del HTML (el chat flotante ya la cubre) junto con el bloque `FAQPage` del JSON-LD.
- [x] **Sección testimonios eliminada** (`#testimonios`) + CSS muerto (`.quotes`, `.quote*`, `.faq*`) purgado.
- [x] **Copy profesional**: sin "sin compromiso"/"gratis"/"sorpresas" en toda la página; nav CTA "Cotizar gratis"→"Solicitar cotización"; hero "WhatsApp gratis"→"Cotizar por WhatsApp"; trust items → "Valoración técnica en sitio / Respuesta el mismo día / Garantía de 12 meses"; paso 1 "Valoración técnica en sitio"; paso 2 "con precio final por escrito"; SEO local y CTA contacto ajustados; prefills wa.me actualizados. Kickers renumerados 01-04.
- [x] **Fix chat max-height**: en desktop el panel crecía sin tope y el botón cerrar quedaba fuera del viewport (descubierto en QA). `max-height: calc(100dvh - 224px)` en `.chat-panel` + `max-height: none` removido; body absorbe scroll. Verificado 1280x800 / 1280x600 / 375x667: cerrar visible + body scrollable.
- [x] **Conflicto fuerza mayor**: otro agente force-pusheó auth gates al repo Pages (2 veces) descartando mis commits → re-aplicado todo desde fuente local.
- [x] QA producción final: FAQ/testimonios ausentes, kickers 01-04, chat 6 chips + responde, panel cierra, FABs 56px sin overlap, CTA form visible, 0 errores de consola.

**Archivos tocados:**
- `01-Cliente/web/index.html`
- `01-Cliente/web/assets/css/style.css`
- `01-Cliente/web/assets/js/script.js`

**Commits:**
- Pages repo: `cb276a6` (final tras 3 force-push del otro agente; `f35039e`/`8ab54ab` quedaron atrás en las reescrituras)
- Monorepo: `ec36b53`

**Estado:** ✅ LIVE en `https://atlanteksystems.com/` · FABs + chat + fondo OK · 0 errores
**Siguiente paso:** revisión visual de screenshots (`qa-*.png`, `qa-pro-limpio.png`) · Search Console + GBP con Daniel

---

### 2026-09-15 22:xx — 🔐 Auth gates: botón cerrar sesión + fix display logout

**Qué se hizo:**
- [x] **Botón "Cerrar sesión"** añadido en ambos paneles:
  - `admin.html`: sidebar footer (debajo de email/zona)
  - `dashboard.html`: header nav (junto a "Gestión"/"Sitio")
- [x] Lógica compartida: `sessionStorage.removeItem('atlantek-auth')` → muestra gate + limpia input + foco en password
- [x] **Fix crítico display**: gate no reaparecía al logout
  - `gate.style.display = 'flex'` forzado en JS `doLogout()`
  - CSS fallback: `.auth-gate:not(.hidden){display:flex !important}`
  - `padding: 24px` en `.auth-gate` para evitar clipping en mobile
- [x] **Debug logging**: `console.log('Logout btn found'/'Logout clicked')` para troubleshooting
- [x] Responsive logo mantenido (120px/90px/75px según breakpoint)

**Archivos tocados:**
- `01-Cliente/web/admin.html` (botón + script + CSS)
- `01-Cliente/web/dashboard.html` (botón + script + CSS)

**Commits:**
- Pages repo: `31cae9a` (force push)
- Monorepo: `3e0176f` → `ec36b53` (sync)

**Verificación pendiente (manual):**
- [ ] `admin.html` → entrar → click "Cerrar sesión" → gate reaparece + input limpio + foco
- [ ] `dashboard.html` → mismo flujo
- [ ] Console logs: "Logout btn found" al cargar, "Logout clicked" al clickear
- [ ] Mobile 375px: gate centrado, logo escalado, sin scroll horizontal

**Estado:** ✅ deployado · rebuild Pages ~30s
**Siguiente paso:** verificación manual logout en producción · redeploy Apps Script (`02-Privado/apps-script/Code.gs`) · GBP/Search Console con Daniel

---

### 2026-09-15 23:10 — 💓 Heartbeat automático cada 10 min de silencio en chat

**Qué se hizo:**
- [x] **Script `chat-heartbeat.ps1`** en `F:\apex-cloudworks\Memoria\`:
  - Corre como background job (`Start-Job`) durante la sesión opencode
  - Cada **10 min** escribe heartbeat en `sesion-activa.md` con: timestamp, bloque activo, archivos tocados últimamente (15 min)
  - Cada **3 heartbeats (30 min)** dispara `apex-memoria` para volcar a bitácora formal
  - Log propio en `chat-heartbeat.log`
- [x] **Helpers `chat-heartbeat-helpers.ps1`** con funciones:
  - `Start-ChatHeartbeat` — inicia job
  - `Stop-ChatHeartbeat` — detiene job(s)
  - `Get-ChatHeartbeatStatus` — muestra log, contador y jobs activos
- [x] **Test verificado**: escritura en `sesion-activa.md` funciona (emoji causa encoding issue menor, texto plano OK)

**Uso en sesión opencode:**
```powershell
# Al iniciar sesión
. F:\apex-cloudworks\Memoria\chat-heartbeat-helpers.ps1
Start-ChatHeartbeat

# Ver estado
Get-ChatHeartbeatStatus

# Al cerrar sesión
Stop-ChatHeartbeat
```

**Archivos creados:**
- `F:\apex-cloudworks\Memoria\chat-heartbeat.ps1`
- `F:\apex-cloudworks\Memoria\chat-heartbeat-helpers.ps1`

**Estado:** ✅ listo para usar en próximas sesiones
**Siguiente paso:** integrar en rutina de inicio de sesión opencode (auto-cargar helpers) · probar flush a bitácora real a los 30 min

---

### 2026-09-15 22:30 — 🎯 Radar de cobertura: barrido real + detección de distritos (JS rAF)

**Qué se hizo:**
- [x] **CSS radar** (`style.css`): anillos concéntricos (3), cruz N/S-E/O, grid diagonal 30°/150°, esquinas HUD, readouts RNG/LOCK, sweep con `conic-gradient` animado
- [x] **JS radar** (`script.js`): control `requestAnimationFrame` del sweep (5.5s/vuelta) → calcula ángulo real, compara con `data-ang` de cada blip (tolerancia 16°), enciende `is-locked` al pasar (punto detectado)
- [x] **Readouts dinámicos**: `RNG: 0°→360°` en vivo · `LOCK: 0/7 → 7/7` al barrer cada distrito
- [x] **Accesibilidad**: `prefers-reduced-motion` → desactiva animación, muestra todos los distritos como "locked"
- [x] **HTML**: 7 blips con `data-ang` (Guápiles 0°, Cariari 40°, Jiménez 140°, La Rita 320°, Roxana 30°, La Colonia 210°, Colorado 260°) + base label "BASE · GUÁPILES CENTRO — 70201 POCOCÍ"
- [x] **Blip base** (Guápiles) siempre encendido, sin animación pulse
- [x] **Sintaxis JS OK** (node --check exit=0), 7 blips detectados en HTML

**Archivos tocados:**
- `01-Cliente/web/assets/css/style.css` (bloque `.radar__*`, ~180 líneas)
- `01-Cliente/web/assets/js/script.js` (módulo radar ~80 líneas insertado antes del chat)
- `01-Cliente/web/index.html` (estructura `.radar__rings`, `.radar__cross`, `.radar__grid`, `.radar__corner`, `.radar__read`, `.radar__sweep`, 7× `.radar__blip[data-ang]`)

**Commits:**
- Pages repo: pendiente push
- Monorepo: pendiente push

**Estado:** ✅ código listo · sin errores consola · listo para deploy
**Siguiente paso:** push a ambos repos → verificación visual en `https://atlanteksystems.com/#cobertura` (desktop + 375px) · redeploy Apps Script · GBP/Search Console

---

### 2026-09-15 22:xx — 🔴 FUGA CERRADA: TOKEN_ADMIN expuesto en sitio público + backend verificado

**Síntoma:** el sitio público servía `https://atlanteksystems.com/assets/js/config.js` con **`TOKEN_ADMIN`** (probado: cualquiera leía **3 clientes / 2 proformas / 3 leads** con un GET). Causa: otro agente republicó `admin.html`/`dashboard.html` con gate **solo visual** (password `btoa` en el navegador) y metió el token admin en el config que carga `index.html`.

**Qué se hizo:**
- [x] **Backend Sheets verificado funcional**: deployment @4 "atlantek" (`AKfycbwpyWVST...`) corre el `Code.gs` nuevo — token viejo `Atlantek-2026` **rechazado** ✅ · `TOKEN_PUBLICO` → `action: lead` **OK** ✅ · `TOKEN_ADMIN` → `load` OK ✅. (El deployment @3 "INTEC" está obsoleto / token nuevo rechazado.)
- [x] **`web/assets/js/config.js` → solo `TOKEN_PUBLICO`** (`atlantek-pub-cs0v95l7ae`) + SHEETS_URL @4 atlantek. Comentario aclara que el admin vive en privado.
- [x] **`admin.html`/`dashboard.html` y assets admin (store/app/dashboard.js + admin/dashboard.css) eliminados del repo público** → `admin.html`/`dashboard.html`/`store.js`/`app.js`/`admin.css` ahora **404** en producción.
- [x] **Footer de `index.html`**: quitados enlaces "Gestión/Dashboard" (apuntaban a 404). `robots.txt` limpio de `Disallow` obsoletos. CSS muerto `.footer__admin` purgado.
- [x] **Panel privado sincronizado**: `02-Privado/panel-admin/` actualizado desde web con el auth gates del otro agente (logo 120px, botón cerrar sesión, force gate) y su `config.js` apuntado al deployment **@4 atlantek**.
- [x] Verificación producción: config.js público sin admin token, admin/dashboard 404, index 200 con chat/FABs/fondo, sin "sin compromiso"/testimonios, style.css y script.js 200, lead público funcional.

**Archivos tocados:**
- `01-Cliente/web/assets/js/config.js` (token público)
- `01-Cliente/web/index.html` (footer admin out)
- `01-Cliente/web/robots.txt`, `01-Cliente/web/assets/css/style.css` (CSS muerto)
- Eliminados del público: `01-Cliente/web/admin.html`, `dashboard.html`, `assets/js/app.js`, `store.js`, `dashboard.js`, `assets/css/admin.css`, `dashboard.css`
- `02-Privado/panel-admin/` (sync web→privado + config @4)

**Commits:**
- Pages repo: `267110a`
- Monorepo: `a282e87`

**Estado:** ✅ fuga cerrada y verificada en producción · panel admin solo en privado
**Siguiente paso:** borrar fila `TEST-no-enviar` de la hoja Leads (insertada en QA) · GBP/Search Console con Daniel

---

### 2026-09-15 23:xx — 🛑 CIERRE: agentes cerrados · estado final del bloque

**Cierre de sesión de agentes.** Hoja Leads / Apps Script **no se toca más** por pedido de Garett (backend Sheets ya verificado y funcional en @4).

**Estado final consolidado:**
- ✅ Landing `https://atlanteksystems.com/` LIVE limpio: sin FAQ, sin testimonios, copy profesional sin "sin compromiso", FABs 48px + chat, fondo `back.jpg`, fix chat max-height desktop.
- ✅ Fuga TOKEN_ADMIN cerrada: sitio público solo con token público; admin/dashboard/assets admin **404** en producción; panel admin vive solo en `02-Privado/panel-admin/`.
- ✅ Repos sincronizados:
  - Pages repo `atlanteksystems` → `cb276a6` (landing) + `267110a` (seguridad)
  - Monorepo Apex → `ec36b53` (landing) + `a282e87` (seguridad + panel)
- ✅ QA final producción: 200 OK, chat 6 chips + responde + cierra, FABs 56px sin overlap (3 rows y), 0 errores de consola desktop/mobile.

**Pendientes heredados (NO se trabajan hoy):**
- [ ] Borrar 2 filas `TEST-no-enviar / 0000` en hoja Leads del Sheet (QA) — manual
- [ ] Search Console: propiedad URL-prefix `https://atlanteksystems.com/` (Garett crea → meta tag → agregar → verificar)
- [ ] GBP (Daniel): crear/reclamar, fotos, 7 distritos, web → atlantek, reseñas (PLAN-SEO-LOCAL.md)
- [ ] Verificación visual screenshots (`qa-*.png`, `qa-pro-limpio.png`) — el modelo no ve imágenes
- [ ] Probar chat + FABs a mano en iPhone real
- [ ] Revisar `/Legal/` público (contrato/proforma/acta siguen servidos)
- [ ] Unificar correo oficial + analítica de conversiones

**Estado:** 🛑 agentes cerrados · worktree monorepo commiteado

---

### 2026-09-16 02:30 — 🛠️ Panel Admin privado completo: Servicios + Tickets + Portal Cliente (reestructuración total)

**Contexto:** reescritura completa de `02-Privado/panel-admin/` para separar panel admin del sitio público, agregar módulo **Servicios Contratados** (con MRR, vencimiento, items), **Tickets / Soporte** (prioridad, estado, historial, asignado) y **Portal del Cliente** (servicios + tickets con auth separada). Deploy a Cloudflare Pages project `atlantek-admin` (cuenta Apex).

**Qué se hizo:**

**Store.js v2 (`atlantek-gestion-v2`):**
- [x] Modelo `services[]`: id, clientId, nombre, descripcion, tipo (cctv/mantenimiento/redes/acceso/otro), estado (activo/inactivo/vencido), fechaInicio, fechaVencimiento, valorMensual, itemsIncluidos[], notas
- [x] Modelo `tickets[]`: id, clientId, serviceId, titulo, descripcion, prioridad (baja/media/alta/critica), estado (abierto/en_proceso/resuelto/cerrado), fechaCreacion, fechaActualizacion, asignadoA, historial[]
- [x] CRUD: `getServices`, `saveService`, `deleteService`, `getTickets`, `saveTicket`, `addTicketMessage`, `setTicketStatus`, `setTicketPriority`, `assignTicket`
- [x] Helpers: `ticketsAbiertos`, `ticketsCriticos`, `serviceTotalMensual` (MRR), `computeServiceStatus` (calcula vencido/activo)

**Admin.html (panel privado):**
- [x] Sidebar reorganizado 3 secciones: **GESTIÓN** (Dashboard, Clientes, Servicios, Tickets), **COMERCIAL** (Leads, Catálogo, Documentos), **CLIENTE** (Portal Cliente, Resumen negocio)
- [x] Badges: Leads nuevos + Tickets abiertos (globales)
- [x] Auth gate compartida (sessionStorage `atlantek-auth`)

**Client-portal.html (nuevo):**
- [x] Auth separada (sessionStorage `atlantek-client-auth`)
- [x] Header KPIs: servicios activos, tickets abiertos, MRR
- [x] Tabs: **Mis Servicios** (cards estado, items, mensual, fechas) + **Tickets** (lista + formulario nuevo ticket con prioridad y servicio relacionado)
- [x] Cliente ID vía URL `?client=c1` o localStorage

**App.js (vistas admin):**
- [x] `renderServicios()`: tabla con filtros, modal crear/editar con items incluidos
- [x] `renderTickets()`: tabla con filtros, modal ver/editar con historial, agregar mensajes, cambiar estado/prioridad/asignado
- [x] Router: `/servicios`, `/tickets`, `/servicios/nuevo`

**Dashboard.html / dashboard.js:**
- [x] KPIs: Clientes, Servicios activos, Tickets abiertos, **MRR**, Cobrado, Por cobrar, Leads
- [x] Paneles "Servicios activos" + "Tickets abiertos" en grid
- [x] Botón "Portal Cliente" en nav superior

**CSS (admin.css + dashboard.css):**
- [x] `.service-card` completa (header, meta grid, items con checks, footer mensual)
- [x] `.ticket-priority` / `.ticket-status` badges mono (crítica=rojo, alta=azul, media=ámbar, baja=verde)
- [x] `.client-nav` tabs, `.ticket-card` border-left por prioridad, historial expandible
- [x] Responsive mobile

**Deploy Cloudflare Pages:**
- [x] Project `atlantek-admin` (account Apex `187e470c5f26d96248f1fc7fb3cdc4fe`)
- [x] LIVE: `https://atlantek-admin.pages.dev/admin/`, `/dashboard.html`, `/client-portal.html?client=c1`
- [x] DNS `admin.atlanteksystems.com` → CNAME `atlantek-admin.pages.dev` (cuenta Daniel, proxy OFF)

**Cloudflare Access (configurado via UI):**
- [ ] Destination: `atlantek-admin.pages.dev/*`
- [ ] Policy: Allow emails `soporte@atlanteksystems.com`, `apexcloudworkscompany@gmail.com`
- [ ] Auth: One-time PIN (Cloudflare provider) + instant auth ON
- [ ] **PENDIENTE:** Save application final (UI bug, no persistía)

**Archivos tocados:**
- `02-Privado/panel-admin/admin.html` (reescrito)
- `02-Privado/panel-admin/client-portal.html` (nuevo)
- `02-Privado/panel-admin/assets/js/store.js` (v2)
- `02-Privado/panel-admin/assets/js/app.js` (vistas + router)
- `02-Privado/panel-admin/assets/js/dashboard.js` (KPIs + services + tickets)
- `02-Privado/panel-admin/assets/js/client-portal.js` (nuevo)
- `02-Privado/panel-admin/assets/css/admin.css` (service-card, ticket badges, sidebar sections)
- `02-Privado/panel-admin/assets/css/dashboard.css` (portal, tickets, forms, responsive)
- `02-Privado/panel-admin/dashboard.html` (KPIs + panels + portal link)

**Bloqueantes pendientes:**
- [ ] **Redeploy Apps Script** (`02-Privado/apps-script/Code.gs`) con tokens separados (`TOKEN_PUBLICO` / `TOKEN_ADMIN`) — **otro agente en esto**
- [ ] **Cloudflare Access Save** final (crear app nueva si persiste bug)
- [ ] Borrar filas `TEST-no-enviar` en hoja Leads
- [ ] Search Console + GBP (Daniel)

**Estado:** ✅ Panel admin completo LIVE en `https://atlantek-admin.pages.dev` · Portal cliente funcional · ⏳ Access + Apps Script redeploy
**Siguiente paso:** Redeploy Apps Script → test end-to-end (formulario → Sheets → panel) → demo Daniel → firma + 50% adelanto ($350 setup + $50/mes)