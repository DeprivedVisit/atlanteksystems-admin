# 🔄 Sesión activa — buffer de memoria en vivo

> Actualizar **al cerrar cada bloque de trabajo** (BUILD / VENTAS / CLIENTE / AUTOMATIZACIÓN / REMATE).
> Cuando el watchdog AFK o el usuario lo pidan, la skill `apex-memoria` congela esto en
> `sesiones/YYYY-MM-DD_HHmm.md`, actualiza `ULTIMA-SESION.md` e `index.md`, y resetea este archivo.
> Si no hay trabajo en curso, dejá la marca `<!-- SIN-TRABAJO -->` abajo.

- **Fecha:** 2026-09-15

## Bloque: DNS + dominio + commits · Atlantek

**Proyecto:** Atlantek Systems (CCTV Guápiles/Pococí)

- [x] **DNS `atlanteksystems.com` LIVE:** apex A → IPs GitHub Pages (185.199.108-111.153) · www CNAME → `apexcloudworkscompany.github.io` ✓
- [x] Repo Pages: archivo `CNAME` (`ba21666`) → custom domain + TLS activado por GitHub
- [x] **Flip a dominio oficial** (`4d97ff7`): canonical/og/twitter/JSON-LD + sitemap.xml + robots.txt → `https://atlanteksystems.com/`
- [x] Verificado live: `https://atlanteksystems.com/` 200 + canonical oficial · sitemap 200 · robots 200 · **www 200**
- [x] **Commits:** monorepo `F:\apex-cloudworks` `16a0fac` (renames AT→Atlantek + memoria SEO) · repo Pages `ba21666` (CNAME) + `4d97ff7` (flip dominio)
- [x] Estructura: `proyectos/Atlantek/01-Cliente/web` (sitio) + `02-Privado` (docs) — ver BITACORA
- ⚠️ Nota colisión: `proyectos/Atlantek/CEO/PLAN-SEO-LOCAL.md` creado por OTRO agente en paralelo (CEO ya no estaba vacía cuando se movió) → NO se borró, quedó intacto
- ⚠️ Regla aceptada de Garett: **nunca borrar carpetas/archivos sin consentimiento**

**Pendiente:**
- repo Pages Settings → verificar Custom domain `atlanteksystems.com` + Enforce HTTPS (github.io aún 200 sin redirect; canonical ya salva SEO)
- Plan SEO cliente-side (doc para Daniel): Google Business Profile · Search Console · reviews · citas locales (pococicta.com) · fotos instalaciones
- Mobile 375px visual
- Skindoctors: cobro $450 vencido (sigue heredado)