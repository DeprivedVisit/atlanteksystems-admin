/* ═══════════════════════════════════════════════════════════════
   Atlantek · config.js — SITIO PÚBLICO (formulario de cotización)

   SEGURIDAD (2026-09-15):
   Este TOKEN es PÚBLICO y SOLO permite al backend registrar leads
   (action: 'lead'). NO puede leer clientes/proformas ni borrar nada.

   El panel admin/dashboard NO se sirve desde este sitio:
   vive en 02-Privado/panel-admin/ con su propio config.js (token admin).

   1. URL del Apps Script /exec (deploy "Ejecutar como: yo, Acceso: cualquiera")
   2. TOKEN_PUBLICO igual al de Code.gs (02-Privado/apps-script/Code.gs)
   ═══════════════════════════════════════════════════════════════ */

const CONFIG = {
  SHEETS_URL: 'https://script.google.com/macros/s/AKfycbzi7pA9lse-inBVtNP4Rtz_Z-GjUzzxhyjaWAkULxt0zZJo2N0cztbQSHwj_2FNfc4-0g/exec',
  TOKEN: 'atlantek-pub-cs0v95l7ae'
};