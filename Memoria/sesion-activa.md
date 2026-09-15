# 🔄 Sesión activa — buffer de memoria en vivo

> Actualizar **al cerrar cada bloque de trabajo** (BUILD / VENTAS / CLIENTE / AUTOMATIZACIÓN / REMATE).
> Cuando el watchdog AFK o el usuario lo pidan, la skill `apex-memoria` congela esto en
> `sesiones/YYYY-MM-DD_HHmm.md`, actualiza `ULTIMA-SESION.md` e `index.md`, y resetea este archivo.
> Si no hay trabajo en curso, dejá la marca `<!-- SIN-TRABAJO -->` abajo.

- **Fecha:** 2026-09-15

## Bloque: Orden de carpetas + SEO AT/Atlantek

**Proyecto:** Atlantek Systems (ex INTEC) — Cliente CCTV Guápiles/Pococí

- [x] **Renombre + orden de carpetas:** `proyectos/AT` → `proyectos/Atlantek`
  - `01-Cliente/web/` = sitio (document root: index/admin/dashboard, assets/, Legal/, apps-script/, robots, sitemap) — coincide 1:1 con repo Pages
  - `01-Cliente/` = entregables (Presentacion/, propuesta/, Auditoria/)
  - `02-Privado/` = docs internas (BITACORA, PLAN_MIGRACION, ACTIVAR-DOMINIO-OFICIAL, MENSAJE-DANIEL, Machotes/)
  - `CEO/` (vacía) eliminada
- [x] Monorepo `F:\apex-cloudworks`: 82 cambios staged (renames) — **commit pendiente de aprobación**
- [x] **Pendiente SEO #1 resuelto:** CSS `.seo-local*` ya existía en style.css (bloque 12:05) → validado en producción
- [x] Repo Pages al día (HEAD `01909a5` feat seo) — sin diff vs doc root local
- [x] Verificado live: HTML 200 + `#guapiles` + style.css con `seo-local__grid` + robots 200 + sitemap 200
- **Dominio `atlanteksystems.com`:** sigue caído (apex no resuelve · www 530). Acceso Cloudflare vía wrangler OK (token solo lectura). MCP servers configurados para reiniciar opencode — no disponibles en esta sesión → siguiente bloque.

**Siguiente paso:** plan SEO cliente-side (doc para Daniel) · mobile 375px visual · dominio via MCP Cloudflare · commit monorepo.