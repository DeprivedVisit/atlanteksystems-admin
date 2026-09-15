# 🔄 Sesión activa — buffer de memoria en vivo

> Actualizar **al cerrar cada bloque de trabajo** (BUILD / VENTAS / CLIENTE / AUTOMATIZACIÓN / REMATE).
> Cuando el watchdog AFK o el usuario lo pidan, la skill `apex-memoria` congela esto en
> `sesiones/YYYY-MM-DD_HHmm.md`, actualiza `ULTIMA-SESION.md` e `index.md`, y resetea este archivo.
> Si no hay trabajo en curso, dejá la marca `<!-- SIN-TRABAJO -->` abajo.

- **Fecha:** 2026-09-15

## Bloque: Orden de carpetas + SEO AT/Atlantek (continuación)

**Proyecto:** Atlantek Systems (ex INTEC) — Cliente CCTV Guápiles/Pococí

- [x] **Repos al día (commit `667b7cf`, push OK a origin):** monorepo `F:\apex-cloudworks` sincronizado con remote, 0 ahead.
- [x] **🌐 DOMINIO OFICIAL LIVE:** `atlanteksystems.com` resuelve (GitHub Pages IPs) · `www` → CNAME apex · `https://atlanteksystems.com` → 200 · `www` redirect a apex · robots/sitemap 200 apuntando al dominio
- [x] **Canonical/og/JSON-LD flipeado en producción** (repo Pages `4d97ff7` + `ba21666` CNAME file) — hecho por agente paralelo, verificado por mí y commiteado al monorepo
- [x] **`https_enforced: true` activado** vía `PUT /pages` (estaba en false) — html_url ahora https
- [x] `ACTIVAR-DOMINIO-OFICIAL.md` checklist → hecho · `CEO/PLAN-SEO-LOCAL.md` Bloque 6 → hecho/faltantes marcados · BITACORA.md entrada 16:4x
- [x] Plan SEO + `CEO/PLAN-SEO-LOCAL.md` (creado antes) sigue siendo el documento de trabajo con Daniel

**Pendiente:**
- ⏳ Reconfirmar ~30-60 min: `http://atlanteksystems.com` → redirect a https (cert en provisión)
- **Search Console:** agregar propiedad `https://atlanteksystems.com/` + reenviar sitemap (puente con Daniel)
- **GBP (Daniel):** crear/reclamar perfil, fotos, areaServed 7 distritos, web → atlanteksystems.com · reseñas (guión ready en el plan)
- Validar mobile 375px (iPhone SE) — grid seo-local + sticky CTA
- Wranger/token Cloudflare sigue solo lectura — si hace falta editar DNS en el futuro, pedir edit:zone o MCP