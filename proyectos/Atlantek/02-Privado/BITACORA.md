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

### 2026-09-15 10:10 — Inicio de bitácora

**Baseline del proyecto:**

- Último commit: `acf4cc3` — "INTEC: hero con imagen de fondo tech + colores actualizados"
- Rama: `main`
- **Cambios SIN commitear** (worktree vs HEAD):
  - Eliminados de raíz (movidos a `assets/img/`): `1.png`, `1.svg`, `2.svg`, `ATLANTEK MAIN (BACKGROUND).png`, `ATLANTEK MAIN W.png`, `ATLANTEK REVERSE.png`, `LOGO1.svg`, `LOGO2.svg`, `WhatsApp Image ...jpeg`, `favicon.svg`, `p.png`
  - Modificados: `Auditoria/AUDITORIA_INTEGRAL_INTEC.md`, `Auditoria/index.html`, `admin.html`, `dashboard.html`, `assets/css/admin.css`, `assets/css/dashboard.css`, `assets/css/style.css`, `assets/js/app.js`, `assets/js/script.js`, `assets/js/ver-proforma.js`, `index.html`, `ver-proforma.html`
  - Nuevos (untracked): `assets/img/back`, `assets/img/favicon.svg`, `assets/img/p.png`, etc.

**Notas del flujo:**
- Getentidad: "INTEC" en docs/commits ↔ marca **Atlantek** en código/landing (rebranding en curso).
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