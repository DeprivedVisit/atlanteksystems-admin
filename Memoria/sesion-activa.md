# 🔄 Sesión activa — buffer de memoria en vivo

> Actualizar **al cerrar cada bloque de trabajo** (BUILD / VENTAS / CLIENTE / AUTOMATIZACIÓN / REMATE).
> Cuando el watchdog AFK o el usuario lo pidan, la skill `apex-memoria` congela esto en
> `sesiones/YYYY-MM-DD_HHmm.md`, actualiza `ULTIMA-SESION.md` e `index.md`, y resetea este archivo.
> Si no hay trabajo en curso, dejá la marca `<!-- SIN-TRABAJO -->` abajo.

- **Fecha:** 2026-09-15

## Bloque: Seguridad Atlantek — fuga de datos admin cerrada

**Proyecto:** Atlantek Systems (CCTV Guápiles)

- 🔴 **Vulnerabilidad cerrada:** token backend (`intec-2026`) estaba en repo público de Pages (servido en vivo) → cualquiera leía clientes/proformas/leads y podía borrar todo (`action=save`)
- [x] **Tokens divididos** en `Code.gs`: `TOKEN_PUBLICO` (solo lead/user) · `TOKEN_ADMIN` (load/save/lead-status)
- [x] `apps-script/` y panel admin (`admin.html`, `dashboard.html`, store/app/dashboard.js, css) → **movidos a `02-Privado/`** (fuera del repo público)
- [x] `config.js` público solo con token público nuevo (`atlantek-pub-cs0v95l7ae`)
- [x] Repo Pages commit `8c3060b` (rebase sobre `e874d5d` de otro agente) · verificado: admin/apps-script/store → 404 · config.php sin tokens viejos
- 🟠 **CRÍTICO PENDIENTE (manual):** **redeploy del Code.gs nuevo en Google Apps Script** — hasta entonces el backend sigue aceptando `intec-2026` y el form no guarda leads
- **Regla respetada:** no se borró nada sin consentimiento; el caso `CEO/PLAN-SEO-LOCAL.md` quedó intacto (creado por otro agente)

**Tokens nuevos:** pub=`atlantek-pub-cs0v95l7ae` · adm=`atlantek-adm-vemsw0y4ugh5r691`
**Ruta backend:** `02-Privado/apps-script/Code.gs` · **panel:** `02-Privado/panel-admin/`

**Siguiente paso:** redeploy Apps Script en Google · commit monorepo local · plan SEO cliente-side · mobile 375px.