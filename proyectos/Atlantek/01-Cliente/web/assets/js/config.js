/* ═══════════════════════════════════════════════════════════════
   Atlantek · config.js — conexión a Google Sheets (Apps Script)

   1. Crear un Google Sheet nuevo (cuenta de Atlantek o Apex)
   2. Extensiones → Apps Script → pegar apps-script/Code.gs
   3. Implementar → Nueva implementación → App web
      · Ejecutar como: yo · Acceso: cualquier persona
   4. Pegar aquí la URL /exec y el mismo TOKEN del Code.gs

   Sin URL configurada, el panel funciona 100% local (localStorage).

   ╔═══════════════════════════════════════════════════════════════╗
   ║ ⚠️ SEGURIDAD: Token visible en JS público.                   ║
   ║ MIGRAR a backend Apex (proxy /api/admin/gs) ANTES de         ║
   ║ producción. Cualquiera con DevTools puede ver el token.      ║
   ║ Ticket: resolver antes de deploy a S3/CloudFront.            ║
   ╚═══════════════════════════════════════════════════════════════╝
   ═══════════════════════════════════════════════════════════════ */

const CONFIG = {
  SHEETS_URL: 'https://script.google.com/macros/s/AKfycbzi7pA9lse-inBVtNP4Rtz_Z-GjUzzxhyjaWAkULxt0zZJo2N0cztbQSHwj_2FNfc4-0g/exec',
  // TODO: migrar TOKEN a backend Apex (session-based auth) antes de producción
  TOKEN: 'atlantek-2026'
};
