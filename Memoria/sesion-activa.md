# 🔄 Sesión activa — buffer de memoria en vivo

> Actualizar **al cerrar cada bloque de trabajo** (BUILD / VENTAS / CLIENTE / AUTOMATIZACIÓN / REMATE).
> Cuando el watchdog AFK o el usuario lo pidan, la skill `apex-memoria` congela esto en
> `sesiones/YYYY-MM-DD_HHmm.md`, actualiza `ULTIMA-SESION.md` e `index.md`, y resetea este archivo.
> Si no hay trabajo en curso, dejá la marca `<!-- SIN-TRABAJO -->` abajo.

- **Fecha:** 2026-09-15

## Bloque: Atlantek — dominio oficial + mobile fix + chat FAQ

**Proyecto:** Atlantek Systems (CCTV Guápiles) — `atlanteksystems.com`

### Completado hoy
- [x] 🔴 **Vulnerabilidad cerrada** (temprano): token backend en repo público → dividido pub/adm; admin/apps-script movidos a `02-Privado/`
- [x] **Dominio oficial LIVE:** `https://atlanteksystems.com/` → 200, www redirect, https_enforced, cert provisionado
- [x] **Mobile 375px (Playwright):** `.wa-float` oculto ≤680px (redundante con cta-bar), footer padding 118px
- [x] **💬 Chat FAQ** — botón flotante → panel 6 preguntas + respuesta automática + CTA WhatsApp. Desktop + mobile probado. Pages `e17e7b3`
- [x] Repos Pages al día · bitácora al día

### Pendiente
- 🔴 **CRÍTICO (manual):** Redeploy `02-Privado/apps-script/Code.gs` en Google Apps Script (token viejo `intec-2026` sigue activo en backend)
- **Search Console:** propiedad `https://atlanteksystems.com/` (Garett crea URL-prefix → trae meta tag → lo agrego → verifico)
- **GBP (Daniel):** crear/reclamar, fotos, 7 distritos, web → atlantek, reseñas (PLAN-SEO-LOCAL.md Bloque 3)
- Commit monorepo (chat + bitácora + buffer) pendiente
- Probar chat a mano en iPhone real
- WhatsApp a Daniel con plan completo